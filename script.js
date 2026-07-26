const API_KEY = 'YOUR_TMDB_API_KEY'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

let currentType = 'movies'; // 'movies' أو 'series'
let currentSeriesId = null;

// تشغيل جلب الأفلام افتراضياً عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  getPopularMovies();
});

// التنقل بين الأفلام والمسلسلات
function switchTab(type) {
  currentType = type;
  const controls = document.getElementById('series-controls');
  const title = document.getElementById('section-title');

  if (type === 'movies') {
    controls.style.display = 'none';
    title.textContent = 'الأفلام الشائعة';
    getPopularMovies();
  } else {
    title.textContent = 'المسلسلات الشائعة';
    getPopularSeries();
  }
}

/* ==================== الأفلام ==================== */

async function getPopularMovies() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    renderCards(data.results, 'movie');
  } catch (error) {
    console.error('خطأ في جلب الأفلام:', error);
  }
}

function playMovie(movieId) {
  document.getElementById('series-controls').style.display = 'none';
  const iframe = document.getElementById('player-iframe');
  iframe.src = `https://vidsrc.to/embed/movie/${movieId}`;
}

/* ==================== المسلسلات ==================== */

async function getPopularSeries() {
  try {
    const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    renderCards(data.results, 'tv');
  } catch (error) {
    console.error('خطأ في جلب المسلسلات:', error);
  }
}

async function loadSeriesDetails(seriesId) {
  currentSeriesId = seriesId;
  document.getElementById('series-controls').style.display = 'flex';

  try {
    const res = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=ar-SA`);
    const series = await res.json();
    setupSeasonSelector(series);
  } catch (error) {
    console.error('خطأ في جلب تفاصيل المسلسل:', error);
  }
}

function setupSeasonSelector(series) {
  const seasonSelect = document.getElementById('season-select');
  seasonSelect.innerHTML = '';

  series.seasons.forEach(season => {
    if (season.season_number > 0) {
      const option = document.createElement('option');
      option.value = season.season_number;
      option.textContent = `الموسم ${season.season_number}`;
      seasonSelect.appendChild(option);
    }
  });

  seasonSelect.onchange = () => fetchEpisodes(series.id, seasonSelect.value);

  if (series.seasons.length > 0) {
    const firstSeason = seasonSelect.value || 1;
    fetchEpisodes(series.id, firstSeason);
  }
}

async function fetchEpisodes(seriesId, seasonNumber) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    
    const episodeSelect = document.getElementById('episode-select');
    episodeSelect.innerHTML = '';

    data.episodes.forEach(ep => {
      const option = document.createElement('option');
      option.value = ep.episode_number;
      option.textContent = `الحلقة ${ep.episode_number}: ${ep.name}`;
      episodeSelect.appendChild(option);
    });

    episodeSelect.onchange = () => playEpisode(seriesId, seasonNumber, episodeSelect.value);

    if (data.episodes.length > 0) {
      playEpisode(seriesId, seasonNumber, data.episodes[0].episode_number);
    }
  } catch (error) {
    console.error('خطأ في جلب الحلقات:', error);
  }
}

function playEpisode(seriesId, seasonNum, episodeNum) {
  const iframe = document.getElementById('player-iframe');
  iframe.src = `https://vidsrc.to/embed/tv/${seriesId}/${seasonNum}/${episodeNum}`;
}

/* ==================== بناء الواجهة ==================== */

function renderCards(list, type) {
  const container = document.getElementById('content-container');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const title = item.title || item.name;

    card.innerHTML = `
      <img src="${IMG_PATH}${item.poster_path}" alt="${title}">
      <h3>${title}</h3>
      <p>⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
    `;

    card.onclick = () => {
      if (type === 'movie') {
        playMovie(item.id);
      } else {
        loadSeriesDetails(item.id);
      }
    };

    container.appendChild(card);
  });
}
