// الإعدادات الأساسية
const apiKey = 'a50ab4b3eb439e4bd6fc3c0f80556063';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// العناصر الأساسية في الصفحة
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sectionTitle = document.getElementById('sectionTitle');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

// 1. دالة جلب الأشهر اليوم عند فتح الموقع
async function getPopularMovies() {
    try {
        const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=ar`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأفلام:', error);
    }
}

// 2. دالة عرض شبكة الأفلام
function displayMovies(movies) {
    moviesGrid.innerHTML = ''; // تفريغ الصفحة أولاً

    movies.forEach(movie => {
        // إذا لم يكن هناك بوستر للفيلم، استخدم صورة افتراضية
        const poster = movie.poster_path ? imageBaseUrl + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</div>
            </div>
        `;

        // عند النقر على الفيلم -> افتح النافذة المنبثقة للفيلم
        card.addEventListener('click', () => openMovieModal(movie));

        moviesGrid.appendChild(card);
    });
}

// 3. دالة فتح الفيلم وعرض المشغل
function openMovieModal(movie) {
    modalBody.innerHTML = `
        <h2>${movie.title}</h2>
        <p style="margin: 10px 0; font-size: 0.9rem; color: #ccc;">${movie.overview || 'لا يوجد وصف متوفر لهذا الفيلم.'}</p>
        
        <h4>📺 اختر السيرفر:</h4>
        <div>
            <button class="server-btn" onclick="switchServer('vidsrc_pm', ${movie.id})">سيرفر 1 (VidSrc)</button>
            <button class="server-btn" onclick="switchServer('embedsu', ${movie.id})">سيرفر 2 (EmbedSu)</button>
            <button class="server-btn" onclick="switchServer('2embed', ${movie.id})">سيرفر 3 (2Embed)</button>
        </div>

        <!-- السيرفر الافتراضي هو VidSrc PM -->
        <iframe id="playerIframe" src="https://vidsrc.pm/embed/movie/${movie.id}" allowfullscreen></iframe>
    `;

    movieModal.style.display = 'flex';
}

// 4. دالة التبديل بين السيرفرات داخل المشغل
function switchServer(serverType, movieId) {
    const iframe = document.getElementById('playerIframe');
    if (serverType === 'vidsrc_pm') {
        iframe.src = `https://vidsrc.pm/embed/movie/${movieId}`;
    } else if (serverType === 'embedsu') {
        iframe.src = `https://embed.su/embed/movie/${movieId}`;
    } else if (serverType === '2embed') {
        iframe.src = `https://www.2embed.cc/embed/${movieId}`;
    }
}

// 5. دالة البحث عن أفلام
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&language=ar&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        sectionTitle.textContent = `🔍 نتائج البحث عن: "${query}"`;
        displayMovies(data.results);
    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// أحداث الأزرار والبحث
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});

// إغلاق النافذة المنبثقة
closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
    modalBody.innerHTML = ''; // إيقاف الفيديو عند الإغلاق
});

window.addEventListener('click', (e) => {
    if (e.target === movieModal) {
        movieModal.style.display = 'none';
        modalBody.innerHTML = '';
    }
});

// تشغيل جلب الأفلام فور فتح الصفحة
getPopularMovies();