document.addEventListener("DOMContentLoaded", () => {
  setupLockedSlideshow();
  setupBackgroundAudio();
  setupEmailForm();
  setupPasswordModal();
  setupLockedNavigation();
});

function setupLockedSlideshow() {
  const slides = Array.from(document.querySelectorAll(".ll-slide"));
  const frame = document.getElementById("llFrame");
  const autoplayMs = 3500;
  let index = 0;
  let timer;

  if (!slides.length) return;

  function show(nextIndex) {
    slides[index].classList.remove("is-active");
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add("is-active");
  }

  function next() {
    show(index + 1);
  }

  function start() {
    stop();
    timer = setInterval(next, autoplayMs);
  }

  function stop() {
    clearInterval(timer);
  }

  start();

  frame?.addEventListener("mouseenter", stop);
  frame?.addEventListener("mouseleave", start);
}

function setupBackgroundAudio() {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;

  audio.volume = 0.3;
  audio.play().catch(() => {
    document.addEventListener("click", () => {
      audio.play().catch(() => {});
    }, { once: true });
  });
}

function setupEmailForm() {
  const form = document.getElementById("emailForm");
  const responseMsg = document.getElementById("formResponse");
  if (!form || !responseMsg) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      const response = await fetch("https://formspree.io/f/mwpngzko", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      form.reset();
      responseMsg.textContent = response.ok
        ? "Thanks - you're on the list."
        : "Something went wrong. Try again?";
      responseMsg.style.display = "block";
    } catch (error) {
      responseMsg.textContent = "Error sending form";
      responseMsg.style.display = "block";
    }
  });
}

function setupPasswordModal() {
  const lockButton = document.getElementById("lockBtn");
  const modal = document.getElementById("pwModal");
  const cancelButton = document.getElementById("pwCancel");
  const form = document.getElementById("pwForm");
  const passwordInput = document.getElementById("pwInput");
  const message = document.getElementById("pwMsg");

  if (!lockButton || !modal || !cancelButton || !form || !passwordInput || !message) return;

  function openModal() {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => passwordInput.focus(), 60);
  }

  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    passwordInput.value = "";
    message.style.display = "none";
  }

  lockButton.addEventListener("click", openModal);
  cancelButton.addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    message.style.display = "none";

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value })
      });
      const result = await response.json();

      if (result && result.ok) {
        window.location.href = result.redirect || "/";
      } else {
        message.textContent = "Incorrect password";
        message.style.display = "block";
      }
    } catch (error) {
      message.textContent = "Error checking password";
      message.style.display = "block";
    }
  });
}

function setupLockedNavigation() {
  const operaButton = document.getElementById("opera-button");
  operaButton?.addEventListener("click", () => {
    window.location.href = "opera.html";
  });
}
