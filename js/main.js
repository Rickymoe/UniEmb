document.addEventListener('DOMContentLoaded', async () => {
  const partials = [
    loadPartial('partials/header.html', 'site-header'),
    loadPartial('partials/footer.html', 'site-footer')
  ];
  if (document.getElementById('lightbox-root')) {
    partials.push(loadPartial('partials/lightbox.html', 'lightbox-root'));
  }
  await Promise.all(partials);
  initNav();
  initReveal();
  initLightbox();
  initHeroCarousel();
});

async function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const res = await fetch(url);
    // outerHTML (not innerHTML) so the placeholder div doesn't wrap the
    // result — a wrapper exactly the height of .nav leaves position:sticky
    // with no room to stick, so .nav must become a direct child of body.
    target.outerHTML = await res.text();
  } catch (err) {
    console.error('Kunne ikke laste ' + url, err);
  }
}

const PRODUCT_PAGES = ['displayemballasje', 'transportemballasje', 'kasser-og-aesker', 'digital-print'];

function initNav() {
  const currentPage = document.body.dataset.page;

  document.querySelectorAll('.nav a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });

  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  if (dropdown && dropdownToggle) {
    if (PRODUCT_PAGES.includes(currentPage)) dropdownToggle.classList.add('active');
    dropdownToggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const hamburger = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
}

function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img) open(img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.hero-carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
  const prevBtn = carousel.querySelector('.hero-carousel-prev');
  const nextBtn = carousel.querySelector('.hero-carousel-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
  }
  function next() { show(index + 1); }
  function prev() { show(index - 1); }
  function startAuto() {
    if (reduceMotion) return;
    stopAuto();
    timer = setInterval(next, 4500);
  }
  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); startAuto(); }));
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);

  show(0);
  startAuto();
}

function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
