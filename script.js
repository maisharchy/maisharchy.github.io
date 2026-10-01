const root = document.documentElement;

/* Smooth anchor scrolling */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Flip cards */
const flipCards = document.querySelectorAll('.flip-card');

function setFlipped(card, flipped) {
  card.classList.toggle('is-flipped', flipped);
  card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
}

function closeAllFlipCards(except) {
  flipCards.forEach(c => { if (c !== except) setFlipped(c, false); });
}

flipCards.forEach(card => {
  card.addEventListener('click', () => {
    const willOpen = !card.classList.contains('is-flipped');
    closeAllFlipCards(card);   // only one card open at a time
    setFlipped(card, willOpen);
  });
});

/* Close any open card once the whole grid has scrolled out of view */
const flipGrid = document.querySelector('.flip-grid');
if (flipGrid) {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) closeAllFlipCards();
  }, { threshold: 0 }).observe(flipGrid);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scroll reveal */
const revealItems = document.querySelectorAll('.research-card, .project-card, .timeline-item, .related-work');

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(18px)';
    /* includes color properties so cards also fade smoothly when the theme changes */
    item.style.transition =
      'opacity .6s ease, transform .6s ease, background-color .35s ease, border-color .35s ease, color .35s ease';
    observer.observe(item);
  });
}

/* Theme toggle */
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

/* Scroll-linked background: --p goes 0 -> 1 down the page, eased for a smooth feel */
let targetP = 0, currentP = 0;

function updateTarget() {
  const max = root.scrollHeight - window.innerHeight;
  targetP = max > 0 ? window.scrollY / max : 0;
}

window.addEventListener('scroll', updateTarget, { passive: true });
window.addEventListener('resize', updateTarget);
updateTarget();

if (prefersReducedMotion) {
  const setNow = () => root.style.setProperty('--p', targetP.toFixed(4));
  window.addEventListener('scroll', setNow, { passive: true });
  setNow();
} else {
  (function tick() {
    currentP += (targetP - currentP) * 0.08;
    root.style.setProperty('--p', currentP.toFixed(4));
    requestAnimationFrame(tick);
  })();
}
