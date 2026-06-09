// ===== localStorage dan filmlarni olish =====
function getMovies() {
  const saved = localStorage.getItem('shofilm_movies');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  // Birinchi ochilganda default MOVIES ni saqlaymiz
  localStorage.setItem('shofilm_movies', JSON.stringify(MOVIES));
  return MOVIES;
}

document.addEventListener('DOMContentLoaded', () => {

  // Filmlarni bir marta olamiz
  const ALL_MOVIES = getMovies();

  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    const st = document.getElementById('scrollTop');
    if (st) st.classList.toggle('visible', window.scrollY > 400);
  });
  const st = document.getElementById('scrollTop');
  if (st) st.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ===== BURGER =====
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.innerHTML = nav.classList.contains('open')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        nav.classList.remove('open');
        burger.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }

  // ===== SEARCH =====
  const searchToggle = document.getElementById('searchToggle');
  const searchBar    = document.getElementById('searchBar');
  const searchClose  = document.getElementById('searchClose');
  const searchInput  = document.getElementById('searchInput');

  if (searchToggle) searchToggle.addEventListener('click', () => {
    searchBar.classList.add('active');
    setTimeout(() => searchInput && searchInput.focus(), 100);
  });
  if (searchClose) searchClose.addEventListener('click', () => {
    searchBar.classList.remove('active');
    if (searchInput) searchInput.value = '';
    const el = document.getElementById('searchResults');
    if (el) el.innerHTML = '';
  });
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q  = this.value.trim().toLowerCase();
      const el = document.getElementById('searchResults');
      if (!el) return;
      if (!q) { el.innerHTML = ''; return; }
      const found = getMovies()
        .filter(m => m.title.toLowerCase().includes(q) || m.genreLabel.toLowerCase().includes(q))
        .slice(0, 7);
      el.innerHTML = !found.length
        ? `<div class="search-result-item"><div class="search-result-info"><h4>Hech narsa topilmadi</h4></div></div>`
        : found.map(m => `
            <div class="search-result-item" onclick="location.href='player.html?id=${m.id}'">
              <img src="${m.poster}" onerror="this.src='https://placehold.co/46x66/1a1a1a/666?text=?'"/>
              <div class="search-result-info">
                <h4>${m.title}</h4>
                <span>${m.genreLabel} &middot; ${m.year} &middot; <i class="fas fa-star" style="color:var(--gold)"></i> ${m.rating}</span>
              </div>
            </div>`).join('');
    });
  }

  // ===== HERO SLIDER =====
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.hero__dot');
  let cur = 0, sliderTimer;
  function goTo(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    cur = (n + slides.length) % slides.length;
    if (slides[cur]) slides[cur].classList.add('active');
    if (dots[cur])   dots[cur].classList.add('active');
  }
  function resetTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => goTo(cur + 1), 5000);
  }
  if (slides.length) {
    const prev = document.getElementById('heroPrev');
    const next = document.getElementById('heroNext');
    if (prev) prev.addEventListener('click', () => { goTo(cur - 1); resetTimer(); });
    if (next) next.addEventListener('click', () => { goTo(cur + 1); resetTimer(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetTimer(); }));
    resetTimer();
  }

  // ===== CATEGORY FILTER =====
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      const movies = getMovies();
      const newData = cat === 'all' ? [...movies].sort((a,b) => b.year - a.year)   : movies.filter(m => m.genre === cat || m.type === cat);
      const topData = cat === 'all' ? [...movies].sort((a,b) => b.rating - a.rating): movies.filter(m => m.genre === cat || m.type === cat);
      renderGrid('newMoviesGrid', newData, 8);
      renderGrid('topMoviesGrid', topData, 8);
      renderGrid('animeGrid',
        cat === 'all'
          ? movies.filter(m => m.type === 'anime')
          : movies.filter(m => m.type === 'anime' && (m.genre === cat || m.type === cat)),
        8);
    });
  });

  // ===== CARD BUILDER =====
  window.buildCard = function (m) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const badge    = m.isNew ? 'new' : m.quality === 'UHD' ? 'uhd' : '';
    const badgeText= m.isNew ? 'YANGI' : m.quality;
    const typeIcon = m.type === 'serial' ? '📺 Serial' : m.type === 'cartoon' ? '🎠 Multfilm' : '🎬 Film';
    card.innerHTML = `
      <div class="movie-card__poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy"
             onerror="this.src='https://placehold.co/175x260/1a1a1a/444?text=${encodeURIComponent(m.title)}'"/>
        <div class="movie-card__overlay"><div class="movie-card__play"><i class="fas fa-play"></i></div></div>
        <span class="movie-card__badge ${badge}">${badgeText}</span>
        <span class="movie-card__rating"><i class="fas fa-star"></i> ${m.rating}</span>
      </div>
      <div class="movie-card__info">
        <div class="movie-card__title">${m.title}</div>
        <div class="movie-card__meta">
          <span class="movie-card__year">${m.year}</span>
          <span class="movie-card__genre">${typeIcon}</span>
        </div>
      </div>`;
    card.addEventListener('click', () => openModal(m));
    return card;
  };

  // ===== RENDER GRID =====
  window.renderGrid = function (id, data, limit) {
    const grid = document.getElementById(id);
    if (!grid) return;
    grid.innerHTML = '';
    const list = limit ? data.slice(0, limit) : data;
    if (!list.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted)">Ma'lumot topilmadi</p>`;
      return;
    }
    list.forEach(m => grid.appendChild(buildCard(m)));
  };

  // ===== MODAL =====
  window.openModal = function (m) {
    const modal = document.getElementById('movieModal');
    if (!modal) return;
    document.getElementById('modalPoster').src = m.poster;
    document.getElementById('modalPoster').alt = m.title;
    document.getElementById('modalTitle').textContent = m.title;
    document.getElementById('modalDesc').textContent  = m.desc;
    document.getElementById('modalMeta').innerHTML = `
      <span><i class="fas fa-star"></i> ${m.rating}</span>
      <span><i class="fas fa-calendar"></i> ${m.year}</span>
      <span><i class="fas fa-film"></i> ${m.genreLabel}</span>
      <span><i class="fas fa-clock"></i> ${m.duration}</span>
      <span><i class="fas fa-globe"></i> ${m.language}</span>
      <span><i class="fas fa-flag"></i> ${m.country}</span>
      <span><i class="fas fa-eye"></i> ${m.views}</span>`;
    const playLink = document.getElementById('modalPlayLink');
    const watchBtn = document.getElementById('modalWatchBtn');
    if (playLink) playLink.href = `player.html?id=${m.id}`;
    if (watchBtn) watchBtn.href = `player.html?id=${m.id}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  function closeModal() {
    const modal = document.getElementById('movieModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  const mo = document.getElementById('modalOverlay');
  const mc = document.getElementById('modalClose');
  if (mo) mo.addEventListener('click', closeModal);
  if (mc) mc.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ===== INIT HOME GRIDS =====
  const movies = getMovies();
  renderGrid('newMoviesGrid',  [...movies].sort((a,b) => b.year - a.year),    8);
  renderGrid('topMoviesGrid',  [...movies].sort((a,b) => b.rating - a.rating),8);
  renderGrid('serialsGrid',    movies.filter(m => m.type === 'serial'),        8);
  renderGrid('cartoonsGrid',   movies.filter(m => m.type === 'cartoon'),       8);
  renderGrid('animeGrid',      movies.filter(m => m.type === 'anime'),         8);
});
