const API_KEY = 'a50ab4b3eb439e4bd6fc3c0f80556063'; // استبدل هذا بالمفتاح الخاص بك
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  getPopularMovies();
});

function switchTab(type) {
  const controls = document.getElementById('series-controls');
  const title = document.getElementById('section-title');

  if (type === 'movies') {
    if (controls) controls.style.display = 'none';
    if (title) title.textContent = 'الأفلام الشائعة';
    getPopularMovies();
  } else {
    if (title) title.textContent = 'المسلسلات الشائعة';
    getPopularSeries();
  }
}

async function getPopularMovies() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    if (data.results) {
      renderCards(data.results, 'movie');
    } else {
      console.error('تنبيه: لم يتم جلب أي أفلام، تحقق من الـ API Key', data);
    }
  } catch (error) {
    console.error('خطأ في الاتصال بالسيرفر:', error);
  }
}

async function getPopularSeries() {
  try {
    const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    if (data.results) {
      renderCards(data.results, 'tv');
    } else {
      console.error('تنبيه: لم يتم جلب أي مسلسلات، تحقق من الـ API Key', data);
    }
  } catch (error) {
    console.error('خطأ في الاتصال بالسيرفر:', error);
  }
}

function renderCards(list, type) {
  const container = document.getElementById('content-container');
  if (!container) {
    console.error('لم يتم العثور على العنصر content-container في الـ HTML');
    return;
  }
  container.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const title = item.title || item.name;
    const poster = item.poster_path ? `${IMG_PATH}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

    card.innerHTML = `
      <img src="${poster}" alt="${title}">
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

function playMovie(movieId) {
  const controls = document.getElementById('series-controls');
  if (controls) controls.style.display = 'none';
  const iframe = document.getElementById('player-iframe');
  if (iframe) iframe.src = `https://vidsrc.to/embed/movie/${movieId}`;
}

async function loadSeriesDetails(seriesId) {
  const controls = document.getElementById('series-controls');
  if (controls) controls.style.display = 'flex';

  try {
    const res = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=ar-SA`);
    const series = await res.json();
    setupSeasonSelector(series);
  } catch (error) {
    console.error('خطأ في تفاصيل المسلسل:', error);
  }
}

function setupSeasonSelector(series) {
  const seasonSelect = document.getElementById('season-select');
  if (!seasonSelect) return;
  seasonSelect.innerHTML = '';

  if (!series.seasons) return;

  series.seasons.forEach(season => {
    if (season.season_number > 0) {
      const option = document.createElement('option');
      option.value = season.season_number;
      option.textContent = `الموسم ${season.season_number}`;
      seasonSelect.appendChild(option);
    }
  });

  seasonSelect.onchange = () => fetchEpisodes(series.id, seasonSelect.value);

  if (seasonSelect.value) {
    fetchEpisodes(series.id, seasonSelect.value);
  }
}

async function fetchEpisodes(seriesId, seasonNumber) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    
    const episodeSelect = document.getElementById('episode-select');
    if (!episodeSelect) return;
    episodeSelect.innerHTML = '';

    if (data.episodes) {
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
    }
  } catch (error) {
    console.error('خطأ في جلب الحلقات:', error);
  }
}

function playEpisode(seriesId, seasonNum, episodeNum) {
  const iframe = document.getElementById('player-iframe');
  if (iframe) {
    iframe.src = `https://vidsrc.to/embed/tv/${seriesId}/${seasonNum}/${episodeNum}`;
  }
}
