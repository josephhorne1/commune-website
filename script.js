import {
  featuredRecords,
  portfolioRecords,
  practiceGroups,
  recordHref,
  recordsForPractice
} from "./data/portfolio.js";

const story = document.querySelector("[data-scroll-story]");
const overviewPanel = document.querySelector("[data-overview-panel]");
const timelinePanel = document.querySelector("[data-timeline-panel]");
const practiceDeck = document.querySelector("[data-practice-deck]");
const shortcutContainer = document.querySelector("[data-practice-shortcuts]");
const compactTimeline = document.querySelector("[data-featured-timeline]");
const timelineYears = document.querySelector("[data-timeline-years]");
const timelineRecords = document.querySelector("[data-timeline-records]");
const mobileTimeline = document.querySelector("[data-mobile-timeline]");
const folderStage = document.querySelector("[data-folder-stage]");
const practiceStatus = document.querySelector("[data-practice-status]");
const previousFolder = document.querySelector("[data-folder-previous]");
const nextFolder = document.querySelector("[data-folder-next]");
const navigationLinks = [...document.querySelectorAll(".bottom-navigation a")];
const timelineNavigationLinks = [
  ...document.querySelectorAll('a[href="#timeline"]')
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const narrowViewport = window.matchMedia("(max-width: 767px)");

const timelineStartYear = 2019;
const timelineEndYear = 2026;
const timelineSpan = timelineEndYear - timelineStartYear;

let activePracticeIndex = 0;
let currentStoryProgress = 0;
let scrollFrame = 0;
let pointerStartX = null;
let practiceResultsRevealed = false;

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(start, end, value) {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );
}

function recordEndYear(record) {
  return record.ongoing ? timelineEndYear : record.endYear;
}

function recordDateLabel(record) {
  if (record.ongoing) return `${record.startYear}—ongoing`;
  if (record.startYear === record.endYear) return String(record.startYear);
  return `${record.startYear}—${record.endYear}`;
}

function primaryPracticeLabel(record) {
  if (record.overviewLabel) return record.overviewLabel;

  const group = practiceGroups.find((candidate) =>
    record.practices.some((tag) => candidate.tags.includes(tag))
  );

  return group?.label || record.kind;
}

function chronologicalRecords() {
  return [...portfolioRecords].sort((a, b) => {
    const endDifference = recordEndYear(b) - recordEndYear(a);
    if (endDifference !== 0) return endDifference;

    const startDifference = b.startYear - a.startYear;
    if (startDifference !== 0) return startDifference;

    const featuredA = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
    const featuredB = b.featuredRank ?? Number.MAX_SAFE_INTEGER;
    if (featuredA !== featuredB) return featuredA - featuredB;

    return a.title.localeCompare(b.title);
  });
}

function updateCurrentDate() {
  const target = document.querySelector("[data-current-date]");
  if (!target) return;

  target.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Toronto",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());
}

function renderPracticeShortcuts() {
  shortcutContainer.innerHTML = practiceGroups
    .map(
      (practice) => `
        <button
          class="practice-shortcut"
          type="button"
          aria-controls="practices"
          aria-expanded="false"
          data-practice-shortcut="${escapeHtml(practice.id)}"
        >
          <span>${escapeHtml(practice.label)}</span>
          <small>View projects</small>
        </button>
      `
    )
    .join("");

  shortcutContainer
    .querySelectorAll("[data-practice-shortcut]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = practiceGroups.findIndex(
          (practice) => practice.id === button.dataset.practiceShortcut
        );
        setActivePractice(index, { announce: true, reveal: true });

        if (window.location.hash !== "#practices") {
          history.pushState(null, "", "#practices");
        }

        scrollToPracticeDeck();
      });
    });
}

function renderCompactTimeline() {
  compactTimeline.innerHTML = featuredRecords
    .map(
      (record, index) => `
        <a class="compact-record" href="${recordHref(record)}">
          <span class="compact-year">${recordEndYear(record)}</span>
          <span class="compact-number">${String(index + 1).padStart(2, "0")}</span>
          <span class="compact-copy">
            <span class="compact-title">${escapeHtml(record.title)}</span>
            <span class="compact-meta">${escapeHtml(primaryPracticeLabel(record))}</span>
          </span>
        </a>
      `
    )
    .join("");
}

function renderExpandedTimeline() {
  timelineYears.innerHTML = Array.from(
    { length: timelineSpan + 1 },
    (_, index) => timelineStartYear + index
  )
    .map(
      (year) =>
        `<span class="expanded-year"><span>${year}</span></span>`
    )
    .join("");

  const records = chronologicalRecords();
  const recordsByStartYear = new Map();

  records.forEach((record) => {
    if (!recordsByStartYear.has(record.startYear)) {
      recordsByStartYear.set(record.startYear, []);
    }
    recordsByStartYear.get(record.startYear).push(record);
  });

  timelineRecords.innerHTML = records
    .map((record) => {
      const yearGroup = recordsByStartYear.get(record.startYear);
      const yearIndex = yearGroup.indexOf(record);
      const yearPosition =
        yearGroup.length === 1 ? 0.08 : (yearIndex / (yearGroup.length - 1)) * 0.68;
      const start = clamp(
        (record.startYear - timelineStartYear + yearPosition) / timelineSpan
      );
      const end = clamp(
        (recordEndYear(record) - timelineStartYear) / timelineSpan
      );
      const width = Math.max((end - start) * 100, 1.25);
      const lane =
        yearGroup.length === 1
          ? 12 + (((record.startYear - timelineStartYear) * 37) % 76)
          : 7 + (yearIndex / (yearGroup.length - 1)) * 86;
      const stateClass = record.featuredRank
        ? "is-featured"
        : "is-secondary";

      return `
        <a
          class="expanded-record ${stateClass}"
          href="${recordHref(record)}"
          style="
            --record-x:${(start * 100).toFixed(3)}%;
            --record-width:${width.toFixed(3)}%;
            --record-y:${lane.toFixed(3)}%;
          "
          aria-label="${escapeHtml(record.title)}, ${escapeHtml(recordDateLabel(record))}"
        >
          <span class="expanded-label">${escapeHtml(record.title)}</span>
        </a>
      `;
    })
    .join("");
}

function renderMobileTimeline() {
  const records = chronologicalRecords();
  const groupedRecords = new Map();

  records.forEach((record) => {
    const year = recordEndYear(record);
    if (!groupedRecords.has(year)) groupedRecords.set(year, []);
    groupedRecords.get(year).push(record);
  });

  mobileTimeline.innerHTML = [...groupedRecords.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(
      ([year, yearRecords]) => `
        <section class="mobile-year-group" aria-labelledby="mobile-year-${year}">
          <h3 id="mobile-year-${year}">${year}</h3>
          <ul>
            ${yearRecords
              .map(
                (record, index) => `
                  <li>
                    <a href="${recordHref(record)}">
                      <span>${String(index + 1).padStart(2, "0")}</span>
                      <strong>${escapeHtml(record.title)}</strong>
                      <small>${escapeHtml(record.contexts.join(" / "))}</small>
                    </a>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>
      `
    )
    .join("");
}

function renderPracticeFolders() {
  folderStage.innerHTML = practiceGroups
    .map((practice, index) => {
      const records = recordsForPractice(practice.id).sort((a, b) => {
        const featuredA = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
        const featuredB = b.featuredRank ?? Number.MAX_SAFE_INTEGER;
        if (featuredA !== featuredB) return featuredA - featuredB;

        const yearDifference = recordEndYear(b) - recordEndYear(a);
        if (yearDifference !== 0) return yearDifference;

        return a.title.localeCompare(b.title);
      });

      return `
        <article
          class="folder-card"
          data-folder-card="${escapeHtml(practice.id)}"
          data-folder-index="${index}"
        >
          <span class="folder-shape" aria-hidden="true"></span>
          <button
            class="folder-select"
            type="button"
            aria-pressed="false"
            data-folder-select="${escapeHtml(practice.id)}"
          >
            <span>${escapeHtml(practice.label)}</span>
            <small>${records.length} indexed projects</small>
          </button>
          <ul class="folder-project-list" hidden>
            ${records
              .map(
                (record, recordIndex) => `
                  <li>
                    <a href="${recordHref(record)}">
                      <span>${String(recordIndex + 1).padStart(2, "0")}</span>
                      <strong>${escapeHtml(record.title)}</strong>
                      <small>${escapeHtml(recordDateLabel(record))}</small>
                    </a>
                  </li>
                `
              )
              .join("")}
          </ul>
        </article>
      `;
    })
    .join("");

  folderStage.querySelectorAll("[data-folder-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = practiceGroups.findIndex(
        (practice) => practice.id === button.dataset.folderSelect
      );
      setActivePractice(index, { announce: true });
    });
  });

  updateFolderLayout();
}

function folderOffset(index) {
  let offset = index - activePracticeIndex;
  const half = practiceGroups.length / 2;

  if (offset > half) offset -= practiceGroups.length;
  if (offset < -half) offset += practiceGroups.length;

  return offset;
}

function updateFolderLayout({ announce = false } = {}) {
  const cards = [...folderStage.querySelectorAll("[data-folder-card]")];
  const baseOffset = clamp(folderStage.clientWidth * 0.17, 170, 245);
  const stepOffset = clamp(folderStage.clientWidth * 0.1, 95, 145);

  cards.forEach((card, index) => {
    const offset = folderOffset(index);
    const distance = Math.abs(offset);
    const direction = Math.sign(offset);
    const x =
      direction *
      (distance === 0 ? 0 : baseOffset + (distance - 1) * stepOffset);
    const y = distance * 15;
    const scale = Math.max(1 - distance * 0.035, 0.88);
    const isActive = index === activePracticeIndex;
    const projectList = card.querySelector(".folder-project-list");
    const selectButton = card.querySelector(".folder-select");

    card.style.setProperty("--folder-x", `${x}px`);
    card.style.setProperty("--folder-y", `${y}px`);
    card.style.setProperty("--folder-scale", String(scale));
    card.style.setProperty(
      "--folder-opacity",
      distance > 3 ? "0" : String(1 - distance * 0.16)
    );
    card.style.setProperty("--folder-z", String(20 - distance));
    card.style.setProperty(
      "--folder-fill",
      isActive ? "var(--paper)" : "var(--paper-folder)"
    );
    card.dataset.folderSide =
      direction < 0 ? "left" : direction > 0 ? "right" : "center";
    card.classList.toggle("is-active", isActive);
    projectList.hidden = !isActive;
    selectButton.setAttribute("aria-pressed", String(isActive));
    selectButton.tabIndex = isActive ? 0 : -1;
  });

  const activePractice = practiceGroups[activePracticeIndex];
  const count = recordsForPractice(activePractice.id).length;
  practiceStatus.textContent = `${activePractice.label} / ${count} indexed projects`;

  shortcutContainer
    .querySelectorAll("[data-practice-shortcut]")
    .forEach((button) => {
      button.setAttribute(
        "aria-expanded",
        String(
          practiceResultsRevealed &&
            button.dataset.practiceShortcut === activePractice.id
        )
      );
    });

  if (announce) {
    window.setTimeout(() => {
      practiceStatus.textContent = `${activePractice.label} selected. ${count} related projects.`;
    }, 10);
  }

  if (narrowViewport.matches) {
    const activeCard = cards[activePracticeIndex];
    activeCard?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  }
}

function setActivePractice(index, options = {}) {
  const count = practiceGroups.length;
  activePracticeIndex = ((index % count) + count) % count;
  if (options.reveal || options.announce) practiceResultsRevealed = true;
  updateFolderLayout(options);
}

function storyScrollRange() {
  return Math.max(story.offsetHeight - window.innerHeight, 1);
}

function scrollToStoryProgress(progress, { updateHash = true } = {}) {
  if (reducedMotion.matches || narrowViewport.matches) {
    const target =
      progress >= 0.72
        ? practiceDeck
        : progress >= 0.4
          ? timelinePanel
          : story;
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    return;
  }

  const top =
    story.getBoundingClientRect().top +
    window.scrollY +
    storyScrollRange() * clamp(progress);

  window.scrollTo({
    top,
    behavior: reducedMotion.matches ? "auto" : "smooth"
  });

  if (updateHash && progress >= 0.4 && progress < 0.72) {
    history.pushState(null, "", "#timeline");
  }
}

function scrollToPracticeDeck() {
  if (reducedMotion.matches || narrowViewport.matches) {
    practiceDeck.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    return;
  }

  scrollToStoryProgress(0.92, { updateHash: false });
}

function setNavigationState(sectionId) {
  navigationLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${sectionId}`;
    if (isCurrent) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateStaticNavigation() {
  const contactTop = document
    .querySelector("#contact")
    .getBoundingClientRect().top;
  const aboutTop = document
    .querySelector("#about")
    .getBoundingClientRect().top;
  const timelineTop = timelinePanel.getBoundingClientRect().top;
  const threshold = window.innerHeight * 0.48;

  if (contactTop <= threshold) {
    setNavigationState("contact");
  } else if (aboutTop <= threshold) {
    setNavigationState("about");
  } else if (timelineTop <= threshold) {
    setNavigationState("timeline");
  } else {
    setNavigationState("home");
  }
}

function updateStory() {
  scrollFrame = 0;

  if (reducedMotion.matches || narrowViewport.matches) {
    story.dataset.stage = "static";
    story.style.setProperty("--story-progress", "1");
    practiceDeck.inert = false;
    overviewPanel.inert = false;
    timelinePanel.classList.add("is-detailed");
    updateStaticNavigation();
    return;
  }

  const storyTop = story.getBoundingClientRect().top + window.scrollY;
  const progress = clamp(
    (window.scrollY - storyTop) / storyScrollRange()
  );
  currentStoryProgress = progress;

  const expansion = smoothstep(0.15, 0.45, progress);
  const detail = smoothstep(0.4, 0.65, progress);
  const secondary = smoothstep(0.5, 0.72, progress);
  const practice = smoothstep(0.72, 1, progress);
  const overviewOpacity = 1 - smoothstep(0.12, 0.36, progress);
  const compactOpacity = 1 - smoothstep(0.18, 0.48, progress);

  story.style.setProperty("--story-progress", progress.toFixed(4));
  story.style.setProperty(
    "--timeline-left",
    `${(65 * (1 - expansion)).toFixed(3)}%`
  );
  story.style.setProperty(
    "--timeline-width",
    `${(35 + 65 * expansion).toFixed(3)}%`
  );
  story.style.setProperty(
    "--overview-opacity",
    overviewOpacity.toFixed(3)
  );
  story.style.setProperty("--compact-opacity", compactOpacity.toFixed(3));
  story.style.setProperty("--detail-opacity", detail.toFixed(3));
  story.style.setProperty("--secondary-opacity", secondary.toFixed(3));
  story.style.setProperty(
    "--practice-translate",
    `${((1 - practice) * 100).toFixed(3)}%`
  );

  const stage =
    progress < 0.15
      ? "overview"
      : progress < 0.45
        ? "expansion"
        : progress < 0.72
          ? "chronology"
          : "practices";

  const nextPracticeReveal = progress >= 0.72;
  if (nextPracticeReveal !== practiceResultsRevealed) {
    practiceResultsRevealed = nextPracticeReveal;
    updateFolderLayout();
  }

  story.dataset.stage = stage;
  overviewPanel.inert = overviewOpacity < 0.08;
  practiceDeck.inert = practice < 0.82;
  timelinePanel.classList.toggle("is-detailed", detail > 0.55);

  const contact = document.querySelector("#contact");
  const about = document.querySelector("#about");
  const viewportMidpoint = window.scrollY + window.innerHeight * 0.45;
  const contactTop = contact.offsetTop;
  const aboutTop = about.offsetTop;

  if (viewportMidpoint >= contactTop) {
    setNavigationState("contact");
  } else if (viewportMidpoint >= aboutTop) {
    setNavigationState("about");
  } else if (progress >= 0.16) {
    setNavigationState("timeline");
  } else {
    setNavigationState("home");
  }
}

function queueStoryUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateStory);
}

function handleTimelineNavigation(event) {
  event.preventDefault();
  if (window.location.hash !== "#timeline") {
    history.pushState(null, "", "#timeline");
  }
  scrollToStoryProgress(0.5, { updateHash: false });
}

function handleHashDestination() {
  const hash = window.location.hash;

  if (hash === "#timeline") {
    scrollToStoryProgress(0.5, { updateHash: false });
  } else if (hash === "#practices") {
    scrollToPracticeDeck();
  } else if (hash === "#home") {
    story.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }
}

previousFolder.addEventListener("click", () => {
  setActivePractice(activePracticeIndex - 1, { announce: true });
});

nextFolder.addEventListener("click", () => {
  setActivePractice(activePracticeIndex + 1, { announce: true });
});

folderStage.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }

  event.preventDefault();

  if (event.key === "ArrowLeft") {
    setActivePractice(activePracticeIndex - 1, { announce: true });
  } else if (event.key === "ArrowRight") {
    setActivePractice(activePracticeIndex + 1, { announce: true });
  } else if (event.key === "Home") {
    setActivePractice(0, { announce: true });
  } else {
    setActivePractice(practiceGroups.length - 1, { announce: true });
  }

  folderStage
    .querySelector(".folder-card.is-active .folder-select")
    ?.focus();
});

folderStage.addEventListener("pointerdown", (event) => {
  pointerStartX = event.clientX;
});

folderStage.addEventListener("pointerup", (event) => {
  if (pointerStartX === null) return;
  const distance = event.clientX - pointerStartX;
  pointerStartX = null;

  if (Math.abs(distance) < 48) return;
  setActivePractice(
    activePracticeIndex + (distance < 0 ? 1 : -1),
    { announce: true }
  );
});

timelineNavigationLinks.forEach((link) => {
  link.addEventListener("click", handleTimelineNavigation);
});

window.addEventListener("scroll", queueStoryUpdate, { passive: true });
window.addEventListener("resize", () => {
  queueStoryUpdate();
  updateFolderLayout();
});
window.addEventListener("hashchange", handleHashDestination);
reducedMotion.addEventListener("change", queueStoryUpdate);
narrowViewport.addEventListener("change", queueStoryUpdate);

updateCurrentDate();
renderPracticeShortcuts();
renderCompactTimeline();
renderExpandedTimeline();
renderMobileTimeline();
renderPracticeFolders();
updateStory();

window.requestAnimationFrame(() => {
  if (window.location.hash) handleHashDestination();
});

window.directionDesign = Object.freeze({
  get progress() {
    return currentStoryProgress;
  },
  get activePractice() {
    return practiceGroups[activePracticeIndex].id;
  },
  scrollToStoryProgress
});
