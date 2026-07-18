(() => {
  "use strict";

  const body = document.body;
  const entry = document.querySelector(".entry-gate");
  const enterControl = document.querySelector("#enter-control");
  const skipLink = document.querySelector(".skip-link");
  const siteShell = document.querySelector("#site-shell");
  const indexSections = [...document.querySelectorAll(".index-section")];
  const indexLinks = [...document.querySelectorAll('.site-identity[href="#index"], .index-return[href="#index"]')];
  const projectsIndex = document.querySelector(".projects-index");
  const timeline = document.querySelector("[data-timeline]");
  const volumeLayer = document.querySelector(".volume-layer");
  const volumeLauncher = document.querySelector(".volume-launcher");
  const garmentField = document.querySelector("#garment-field");
  const projectLayer = document.querySelector(".project-layer");
  const projectFrame = document.querySelector(".project-frame");
  const objectDialog = document.querySelector(".object-dialog");
  let currentChapter = "GROUND ZERO";
  let returnFocus = null;
  let coordinatingSections = false;

  function updateClock() {
    const target = document.querySelector("[data-clock]");
    if (!target) return;
    const time = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
    target.textContent = `Toronto / ${time}`;
  }

  function enterSite({ immediate = false } = {}) {
    if (body.classList.contains("is-entered")) return;
    body.classList.remove("is-locked");
    body.classList.add("is-entered");
    if (immediate) body.classList.add("skip-entry-motion");
    siteShell.inert = false;
    siteShell.setAttribute("aria-hidden", "false");
    entry.setAttribute("aria-hidden", "true");
    window.setTimeout(() => document.querySelector(".site-identity")?.focus(), immediate ? 0 : 900);
  }

  function setIndexLocation(hash) {
    const nextHash = hash || "#index";
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  }

  function closeIndexSections({ move = true } = {}) {
    coordinatingSections = true;
    indexSections.forEach((section) => { section.open = false; });
    coordinatingSections = false;
    setIndexLocation("#index");
    if (move) document.querySelector("#index")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function coordinateSection(section) {
    if (coordinatingSections) return;
    if (!section.open) {
      if (window.location.hash === `#${section.id}`) setIndexLocation("#index");
      return;
    }

    coordinatingSections = true;
    indexSections.forEach((candidate) => {
      if (candidate !== section) candidate.open = false;
    });
    coordinatingSections = false;

    setIndexLocation(`#${section.id}`);
    window.setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function restartTimeline() {
    if (!timeline) return;
    timeline.classList.remove("is-drawing");
    void timeline.offsetWidth;
    timeline.classList.add("is-drawing");
  }

  function setLayerState(layer, open) {
    if (!layer) return;
    layer.classList.toggle("is-open", open);
    layer.inert = !open;
    layer.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("has-layer", open || document.querySelectorAll(".is-open").length > 0);
  }

  function setChapter(chapter) {
    currentChapter = chapter;
    document.querySelector("[data-volume-chapter]").textContent = chapter;
    document.querySelector("[data-launch-chapter]").textContent = chapter;
    document.querySelectorAll("[data-chapter]").forEach((button) => {
      button.classList.toggle("is-current", button.dataset.chapter === chapter);
    });
    volumeLayer.classList.remove("is-expanded");
    volumeLauncher.setAttribute("aria-expanded", "false");
    garmentField.inert = true;
  }

  function openVolume(chapter, opener) {
    returnFocus = opener;
    setChapter(chapter || "GROUND ZERO");
    setLayerState(volumeLayer, true);
    window.setTimeout(() => volumeLauncher.focus(), 50);
  }

  function closeVolume() {
    setLayerState(volumeLayer, false);
    volumeLayer.classList.remove("is-expanded");
    garmentField.inert = true;
    volumeLauncher.setAttribute("aria-expanded", "false");
    returnFocus?.focus();
    returnFocus = null;
  }

  function toggleGarmentField() {
    const open = !volumeLayer.classList.contains("is-expanded");
    volumeLayer.classList.toggle("is-expanded", open);
    volumeLauncher.setAttribute("aria-expanded", String(open));
    garmentField.inert = !open;
  }

  function openObject(objectId, opener) {
    returnFocus = opener;
    objectDialog.querySelector("[data-object-id]").textContent = `OBJ-${objectId}`;
    objectDialog.querySelector("[data-object-chapter]").textContent = currentChapter;
    objectDialog.showModal();
  }

  function closeObject() {
    if (!objectDialog.open) return;
    objectDialog.close();
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function recordDocument(button) {
    const title = escapeHTML(button.dataset.recordTitle || "Project record");
    const date = escapeHTML(button.dataset.recordDate || "Date forthcoming");
    const role = escapeHTML(button.dataset.recordRole || "Role forthcoming");
    const description = escapeHTML(button.dataset.recordDescription || "Full project content forthcoming.");
    return `<!doctype html>
      <html lang="en-CA">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title} / Direction and Design</title>
          <style>
            @font-face{font-family:ConsolasLocal;src:url("assets/fonts/CONSOLA.TTF") format("truetype");font-display:swap}
            *{box-sizing:border-box}body{margin:0;background:#f3f0e3;color:#1b1a17;font-family:ConsolasLocal,Consolas,monospace;font-size:11px;line-height:1.5}
            main{min-height:100vh;padding:clamp(1rem,3vw,3rem);display:grid;grid-template-rows:auto 1fr auto}
            .eyebrow,.foot{text-transform:uppercase;font-size:10px;color:#74726a}h1{align-self:center;max-width:24ch;margin:clamp(8rem,20vh,15rem) 0;font-size:clamp(1.5rem,3vw,3.5rem);font-weight:400;line-height:1;text-transform:uppercase}
            .record{display:grid;grid-template-columns:1fr 2fr;gap:clamp(2rem,8vw,9rem);border-top:1px solid #151515;padding-top:12px}.record p{max-width:55ch;margin:0}
            dl{margin:0;border-top:1px solid rgba(27,26,23,.32)}dl div{display:grid;grid-template-columns:9rem 1fr;gap:1rem;padding:8px 0;border-bottom:1px solid rgba(27,26,23,.32)}dt,dd{margin:0;font-weight:400}dt{text-transform:uppercase;color:#74726a}
            .pending{margin-top:4rem;padding:1rem 0;border-top:1px solid rgba(27,26,23,.32);border-bottom:1px solid rgba(27,26,23,.32);text-transform:uppercase;color:#74726a}.foot{display:flex;justify-content:space-between;margin-top:6rem;padding-top:8px;border-top:1px solid #1b1a17}
            @media(max-width:650px){.record{grid-template-columns:1fr}h1{margin:4rem 0}.foot{display:grid;gap:.5rem}}
          </style>
        </head>
        <body><main>
          <p class="eyebrow">Direction and Design / Project record / Case study forthcoming</p>
          <h1>${title}</h1>
          <section class="record"><p>${description}</p><div><dl><div><dt>Date</dt><dd>${date}</dd></div><div><dt>Role</dt><dd>${role}</dd></div><div><dt>Status</dt><dd>Framework only</dd></div></dl><div class="pending">Project imagery / process / outcomes / credits reserved for future development</div></div></section>
          <footer class="foot"><span>${title}</span><span>Joseph Horne / Direction and Design</span></footer>
        </main></body>
      </html>`;
  }

  function openProject(button) {
    returnFocus = button;
    const title = button.dataset.projectTitle || button.dataset.recordTitle || "Project record";
    document.querySelector("[data-project-name]").textContent = title;
    projectFrame.title = `${title} case study`;
    if (button.dataset.projectSrc) {
      projectFrame.removeAttribute("srcdoc");
      projectFrame.src = button.dataset.projectSrc;
    } else {
      projectFrame.src = "about:blank";
      projectFrame.srcdoc = recordDocument(button);
    }
    setLayerState(projectLayer, true);
    window.setTimeout(() => document.querySelector("[data-close-project]")?.focus(), 50);
  }

  function closeProject() {
    setLayerState(projectLayer, false);
    projectFrame.src = "about:blank";
    projectFrame.removeAttribute("srcdoc");
    returnFocus?.focus();
    returnFocus = null;
  }

  enterControl?.addEventListener("click", enterSite);
  skipLink?.addEventListener("click", () => enterSite({ immediate: true }));
  updateClock();
  window.setInterval(updateClock, 30000);

  projectsIndex?.addEventListener("toggle", () => {
    if (projectsIndex.open) restartTimeline();
  });

  indexSections.forEach((section) => {
    section.addEventListener("toggle", () => coordinateSection(section));
  });

  indexLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeIndexSections();
    });
  });

  document.querySelectorAll("[data-open-volume]").forEach((button) => {
    button.addEventListener("click", () => openVolume(button.dataset.openVolume, button));
  });
  document.querySelector("[data-close-volume]")?.addEventListener("click", closeVolume);
  document.querySelectorAll("[data-chapter]").forEach((button) => {
    button.addEventListener("click", () => setChapter(button.dataset.chapter));
  });
  volumeLauncher?.addEventListener("click", toggleGarmentField);

  document.querySelectorAll("[data-object]").forEach((button) => {
    button.addEventListener("click", () => openObject(button.dataset.object, button));
  });
  document.querySelector("[data-close-object]")?.addEventListener("click", closeObject);
  objectDialog?.addEventListener("close", () => {
    returnFocus?.focus();
    returnFocus = null;
  });
  objectDialog?.addEventListener("click", (event) => {
    if (event.target === objectDialog) closeObject();
  });

  document.querySelectorAll(".record-label").forEach((button) => {
    button.addEventListener("click", () => openProject(button));
  });
  document.querySelector("[data-close-project]")?.addEventListener("click", closeProject);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (projectLayer.classList.contains("is-open")) closeProject();
    else if (volumeLayer.classList.contains("is-open") && !objectDialog.open) closeVolume();
  });

  const requestedSection = document.querySelector(`.index-section${window.location.hash || "#none"}`);
  if (requestedSection) {
    enterSite({ immediate: true });
    requestedSection.open = true;
  }
})();
