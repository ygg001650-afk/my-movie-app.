const API_KEY = 'a50ab4b3eb439e4bd6fc3c0f80556063'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
  loadContent('movie');
});

function switchCategory(type) {
  const title = document.getElementById('section-title');
  if (type === 'movie') {
    title.textContent = 'الأفلام الشائعة';
  } else {
    title.textContent = 'المسلسلات الشائعة';
  }
  loadContent(type);
}

async function loadContent(type) {
  try {
    const res = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    renderCards(data.results, type);
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
  }
}

function renderCards(items, type) {
  const container = document.getElementById('content-container');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const title = item.title || item.name;

    card.innerHTML = `
      <img src="${IMG_PATH}${item.poster_path}" alt="${title}">
      <h3>${title}</h3>
      <p>⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
    `;

    card.onclick = () => playContent(item.id, type);
    container.appendChild(card);
  });
}

function playContent(id, type) {
  const iframe = document.getElementById('player-iframe');
  if (!iframe) return;

  if (type === 'movie') {
    iframe.src = `https://vidsrc.to/embed/movie/${id}`;
  } else {
    iframe.src = `https://vidsrc.to/embed/tv/${id}/1/1`;
  }
}
