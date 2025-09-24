// locked-script.js
// This script powers the locked landing page. It is separate from the
// main site script.js so the landing page can run independently without
// interfering with the rest of the site’s JavaScript.

document.addEventListener('DOMContentLoaded', () => {
  // ===== Auto‑play slideshow =====
  const slides = Array.from(document.querySelectorAll('.ll-slide'));
  let index = 0;
  const AUTOPLAY_MS = 3500;
  let timer;

  function show(i) {
    slides[index].classList.remove('is-active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('is-active');
  }

  function next() { show(index + 1); }
  function start() { timer = setInterval(next, AUTOPLAY_MS); }
  function pause() { clearInterval(timer); }

  // Start autoplay
  if (slides.length > 0) {
    start();
  }

  // Pause/resume on hover
  const frame = document.getElementById('llFrame');
  if (frame) {
    frame.addEventListener('mouseenter', pause);
    frame.addEventListener('mouseleave', start);
  }

  // ===== Background audio =====
  const audio = document.getElementById('bg-audio');
  if (audio) {
    audio.volume = 0.3;
    audio.play().catch(() => {
      document.addEventListener('click', () => {
        audio.play().catch(() => {});
      }, { once: true });
    });
  }

  // ===== Email form (Formspree AJAX) =====
  const form = document.getElementById('emailForm');
  const responseMsg = document.getElementById('formResponse');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      try {
        const res = await fetch('https://formspree.io/f/mwpngzko', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        form.reset();
        if (res.ok) {
          responseMsg.textContent = 'Thanks — you’re on the list.';
        } else {
          responseMsg.textContent = 'Something went wrong. Try again?';
        }
        responseMsg.style.display = 'block';
      } catch (err) {
        responseMsg.textContent = 'Error sending form';
        responseMsg.style.display = 'block';
      }
    });
  }
});