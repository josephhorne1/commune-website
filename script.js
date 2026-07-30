import {
  contextLabels,
  featuredRecords,
  portfolioRecords,
  practiceGroups,
  practiceHref,
  recordContext,
  recordHref,
  recordKind,
  recordPeriod,
  recordsForPractice,
  templateForRecord
} from "./data/portfolio.js";

document.documentElement.classList.add("has-js");

const ICON_ROOT = "/assets/ui";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileViewport = window.matchMedia("(max-width: 767px)");
const coarsePointer = window.matchMedia("(pointer: coarse)");
const body = document.body;
const STORY_HEIGHT_FINE = 245;
const STORY_HEIGHT_COARSE = 225;

function initialiseInputModality() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") body.classList.add("is-keyboard-navigation");
    },
    true
  );

  document.addEventListener(
    "pointerdown",
    () => body.classList.remove("is-keyboard-navigation"),
    { passive: true }
  );
}

const chronologicalRecords = [...portfolioRecords].sort(
  (a, b) =>
    a.startYear - b.startYear ||
    (a.endYear ?? Number.POSITIVE_INFINITY) -
      (b.endYear ?? Number.POSITIVE_INFINITY) ||
    a.title.localeCompare(b.title)
);

const newestRecords = [...portfolioRecords].sort(
  (a, b) =>
    (b.endYear ?? Number.POSITIVE_INFINITY) -
      (a.endYear ?? Number.POSITIVE_INFINITY) ||
    b.startYear - a.startYear ||
    a.title.localeCompare(b.title)
);

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

function icon(name, className = "ui-icon") {
  return `<img class="${className}" src="${ICON_ROOT}/${name}.svg" alt="" aria-hidden="true" />`;
}

function formatIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function clamp(value, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function recordPracticeGroups(record) {
  return practiceGroups.filter((practice) =>
    record.practices.some((tag) => practice.tags.includes(tag))
  );
}

function recordMatchesFilter(record, filter) {
  if (!filter || filter === "all") return true;
  if (filter === "featured") return Number.isInteger(record.featuredRank);
  if (Object.hasOwn(contextLabels, filter)) return record.contexts.includes(filter);

  const practice = practiceGroups.find((candidate) => candidate.id === filter);
  return practice
    ? record.practices.some((tag) => practice.tags.includes(tag))
    : true;
}

function recordRow(record, index, options = {}) {
  const groups = recordPracticeGroups(record);
  const practiceLabels = groups
    .slice(0, options.practiceLimit ?? 2)
    .map((practice) => practice.shortLabel)
    .join(" / ");
  const className = options.className || "registry-row";

  return `
    <article class="${className}" data-record="${escapeHtml(record.id)}" data-contexts="${escapeHtml(record.contexts.join(" "))}">
      <a class="${className}__link" href="${recordHref(record)}">
        <span class="${className}__index" aria-hidden="true">${formatIndex(index)}</span>
        <span class="${className}__title">${escapeHtml(record.title)}</span>
        <span class="${className}__period">${escapeHtml(recordPeriod(record))}</span>
        <span class="${className}__context">${escapeHtml(recordContext(record))}</span>
        <span class="${className}__kind">${escapeHtml(practiceLabels || recordKind(record))}</span>
        <span class="${className}__open">
          <span class="visually-hidden">Open ${escapeHtml(record.title)}</span>
          ${icon("arrow-up-right")}
        </span>
      </a>
    </article>
  `;
}

function filterControls(container, options = {}) {
  if (!container) return [];

  let buttons = options.buttons?.length
    ? [...options.buttons]
    : [
        ...(container.matches("[data-filter]")
          ? [container]
          : container.querySelectorAll("[data-filter]"))
      ];

  if (!buttons.length && container.tagName !== "BUTTON") {
    const controls = options.controls || [
      ["all", "All"],
      ["featured", "Selected"],
      ["industry", "Industry"],
      ["self-directed", "Independent"],
      ["education", "Academic"]
    ];

    container.innerHTML = controls
      .map(
        ([value, label], index) => `
          <button
            class="filter-control"
            type="button"
            data-filter="${escapeHtml(value)}"
            aria-pressed="${index === 0 ? "true" : "false"}"
          >${escapeHtml(label)}</button>
        `
      )
      .join("");
    buttons = [...container.querySelectorAll("[data-filter]")];
  }

  buttons.forEach((button) => {
    button.dataset.filter =
      button.dataset.filter ||
      button.dataset.registryFilter ||
      button.dataset.timelineFilter ||
      "all";
  });

  return buttons;
}

function setPressedControl(buttons, activeValue, datasetKey) {
  buttons.forEach((button) => {
    const isActive = button.dataset[datasetKey] === activeValue;
    button.setAttribute("aria-pressed", String(isActive));
    button.classList.toggle("is-active", isActive);
  });
}

function renderHomeSelectedRecord(container, record) {
  if (!container || !record) return;

  const featuredIndex = featuredRecords.findIndex(
    (candidate) => candidate.id === record.id
  );
  const practices = recordPracticeGroups(record)
    .map((practice) => practice.shortLabel)
    .join(" / ");

  if (container.dataset.recordView !== "ready") {
    container.innerHTML = `
      <article class="active-record">
        <header class="active-record__header">
          <p class="section-label" data-active-index></p>
          <p data-active-period></p>
        </header>
        <div class="active-record__body">
          <p class="active-record__type" data-active-type></p>
          <h2 data-active-title></h2>
          <dl class="record-metadata">
            <div>
              <dt>Context</dt>
              <dd data-active-context></dd>
            </div>
            <div>
              <dt>Practice</dt>
              <dd data-active-practices></dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd data-active-format></dd>
            </div>
          </dl>
        </div>
        <a class="record-link" data-active-link>
          <span>Open record</span>
          ${icon("arrow-up-right")}
        </a>
      </article>
    `;
    container.dataset.recordView = "ready";
  }

  const values = {
    "[data-active-index]": `Active record / ${formatIndex(
      featuredIndex < 0 ? 0 : featuredIndex
    )}`,
    "[data-active-period]": recordPeriod(record),
    "[data-active-type]": record.overviewLabel || recordKind(record),
    "[data-active-title]": record.title,
    "[data-active-context]": recordContext(record),
    "[data-active-practices]": practices,
    "[data-active-format]": recordKind(record)
  };

  Object.entries(values).forEach(([selector, value]) => {
    const element = container.querySelector(selector);
    if (element && element.textContent !== value) element.textContent = value;
  });

  const activeLink = container.querySelector("[data-active-link]");
  if (activeLink) activeLink.href = recordHref(record);
  container.dataset.recordId = record.id;
}

function renderHomeTimeline(container, selectedId) {
  if (!container) return;

  const firstYear = Math.min(...featuredRecords.map((record) => record.startYear));
  const finalYear = Math.max(
    2026,
    ...featuredRecords.map((record) => record.endYear ?? 2026)
  );
  const yearSpan = Math.max(1, finalYear - firstYear);

  container.innerHTML = `
    <div class="home-timeline__axis" aria-hidden="true">
      ${Array.from({ length: finalYear - firstYear + 1 }, (_, index) => {
        const year = firstYear + index;
        return `<span style="--year-position: ${
          ((year - firstYear) / yearSpan) * 100
        }%">${year}</span>`;
      }).join("")}
    </div>
    <div class="home-timeline__records" role="list" aria-label="Selected work">
      ${featuredRecords
        .map((record, index) => {
          const start = ((record.startYear - firstYear) / yearSpan) * 100;
          const isSelected = record.id === selectedId;
          return `
            <button
              class="home-timeline-record${isSelected ? " is-active" : ""}"
              type="button"
              role="listitem"
              data-record-select="${escapeHtml(record.id)}"
              aria-pressed="${String(isSelected)}"
              style="--record-position: ${start}%; --record-lane: ${index % 3}"
            >
              <span class="home-timeline-record__marker" aria-hidden="true"></span>
              <span class="home-timeline-record__label">
                <span>${formatIndex(index)}</span>
                ${escapeHtml(record.title)}
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderHomePractices(container) {
  if (!container) return;

  const items = practiceGroups
    .map((practice, index) => {
      const count = recordsForPractice(practice.id).length;
      return `
        <a class="home-practice-link" href="${practiceHref(practice)}">
          <span class="home-practice-link__index">${formatIndex(index)}</span>
          <span class="home-practice-link__label">${escapeHtml(
            practice.shortLabel || practice.label
          )}</span>
          <span class="home-practice-link__count">${count}</span>
          ${icon("arrow-up-right")}
        </a>
      `;
    })
    .join("");

  container.innerHTML = ["OL", "UL"].includes(container.tagName)
    ? practiceGroups
        .map((practice, index) => {
          const count = recordsForPractice(practice.id).length;
          return `
            <li>
              <a class="home-practice-link" href="${practiceHref(practice)}">
                <span class="home-practice-link__index">${formatIndex(
                  index
                )}</span>
                <span class="home-practice-link__label">${escapeHtml(
                  practice.shortLabel || practice.label
                )}</span>
                <span class="home-practice-link__count">${count}</span>
                ${icon("arrow-up-right")}
              </a>
            </li>
          `;
        })
        .join("")
    : items;
}

function initialiseHome() {
  const story = document.querySelector("[data-home-story]");
  const timeline = document.querySelector("[data-home-timeline]");
  const selectedWork = document.querySelector("[data-selected-work]");
  const practices = document.querySelector("[data-home-practices]");

  if (!story && !timeline && !selectedWork && !practices) return;

  let selectedId = featuredRecords[0]?.id;
  let scrollFrame = 0;
  let resizeFrame = 0;
  let storyTop = 0;
  let storyDistance = 1;
  let storyIsActive = false;
  let lastProgress = -1;
  let lastTimelineProgress = -1;
  let lastPracticeProgress = -1;
  let lastPhase = "";

  const selectRecord = (recordId, options = {}) => {
    const record = featuredRecords.find((candidate) => candidate.id === recordId);
    if (!record) return;
    selectedId = record.id;

    timeline?.querySelectorAll("[data-record-select]").forEach((button) => {
      const isActive = button.dataset.recordSelect === record.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderHomeSelectedRecord(selectedWork, record);

    if (options.focus) {
      timeline
        ?.querySelector(`[data-record-select="${CSS.escape(record.id)}"]`)
        ?.focus();
    }
  };

  renderHomeTimeline(timeline, selectedId);
  renderHomeSelectedRecord(selectedWork, featuredRecords[0]);
  renderHomePractices(practices);

  timeline?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-record-select]");
    if (button) selectRecord(button.dataset.recordSelect);
  });

  timeline?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const currentIndex = featuredRecords.findIndex(
      (record) => record.id === selectedId
    );
    let nextIndex = currentIndex;

    if (event.key === "ArrowLeft") nextIndex -= 1;
    if (event.key === "ArrowRight") nextIndex += 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = featuredRecords.length - 1;

    nextIndex = Math.max(0, Math.min(featuredRecords.length - 1, nextIndex));
    if (nextIndex === currentIndex) return;
    event.preventDefault();
    selectRecord(featuredRecords[nextIndex].id, { focus: true });
  });

  const writeProgressValue = (property, value, previousValue) => {
    if (Math.abs(value - previousValue) < 0.0005) return previousValue;
    story.style.setProperty(property, value.toFixed(4));
    return value;
  };

  const updateStory = () => {
    scrollFrame = 0;
    if (!story || !storyIsActive) return;

    const progress = clamp((window.scrollY - storyTop) / storyDistance);
    const timelineProgress = clamp((progress - 0.1) / 0.54);
    const practiceProgress = clamp((progress - 0.72) / 0.28);
    const phase =
      progress < 0.18
        ? "index"
        : progress < 0.54
          ? "timeline"
          : progress < 0.76
            ? "expanded"
            : "practices";

    lastProgress = writeProgressValue(
      "--story-progress",
      progress,
      lastProgress
    );
    lastTimelineProgress = writeProgressValue(
      "--story-timeline-progress",
      timelineProgress,
      lastTimelineProgress
    );
    lastPracticeProgress = writeProgressValue(
      "--story-practice-progress",
      practiceProgress,
      lastPracticeProgress
    );

    if (phase !== lastPhase) {
      story.dataset.storyPhase = phase;
      lastPhase = phase;
    }

    if (progress >= 0.22 && progress <= 0.72) {
      const localProgress = (progress - 0.22) / 0.5;
      const nextIndex = Math.min(
        featuredRecords.length - 1,
        Math.floor(localProgress * featuredRecords.length)
      );
      const nextRecord = featuredRecords[nextIndex];
      if (nextRecord && nextRecord.id !== selectedId) {
        selectRecord(nextRecord.id);
      }
    }
  };

  const queueStoryUpdate = () => {
    if (!storyIsActive || scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateStory);
  };

  const measureStory = () => {
    resizeFrame = 0;
    if (!story || !storyIsActive) return;
    const rect = story.getBoundingClientRect();
    storyTop = rect.top + window.scrollY;
    storyDistance = Math.max(1, story.offsetHeight - window.innerHeight);
    queueStoryUpdate();
  };

  const queueStoryMeasure = () => {
    if (!storyIsActive || resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(measureStory);
  };

  const setStoryProgressImmediately = () => {
    story.style.setProperty("--story-progress", "0");
    story.style.setProperty("--story-timeline-progress", "0");
    story.style.setProperty("--story-practice-progress", "0");
    story.dataset.storyPhase = "index";
    lastProgress = 0;
    lastTimelineProgress = 0;
    lastPracticeProgress = 0;
    lastPhase = "index";
  };

  const syncStoryMode = () => {
    const nextActive = !mobileViewport.matches && !reducedMotion.matches;
    const wasActive = storyIsActive;
    storyIsActive = nextActive;

    if (storyIsActive) {
      story.style.height = `${
        coarsePointer.matches ? STORY_HEIGHT_COARSE : STORY_HEIGHT_FINE
      }svh`;
      if (!wasActive) {
        window.addEventListener("scroll", queueStoryUpdate, { passive: true });
        window.addEventListener("resize", queueStoryMeasure, {
          passive: true
        });
      }
      queueStoryMeasure();
    } else {
      story.style.removeProperty("height");
      if (wasActive) {
        window.removeEventListener("scroll", queueStoryUpdate);
        window.removeEventListener("resize", queueStoryMeasure);
      }
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      scrollFrame = 0;
      resizeFrame = 0;
      setStoryProgressImmediately();
    }
  };

  if (story) {
    reducedMotion.addEventListener("change", syncStoryMode);
    mobileViewport.addEventListener("change", syncStoryMode);
    coarsePointer.addEventListener("change", syncStoryMode);
    window.addEventListener("load", queueStoryMeasure, { once: true });
    document.fonts?.ready.then(queueStoryMeasure);
    syncStoryMode();
  }
}

function initialiseWorkRegistry() {
  const registry = document.querySelector("[data-work-registry]");
  if (!registry) return;

  const filterRoot = document.querySelector("[data-work-filter]");
  const viewRoot = document.querySelector("[data-work-view]");
  const filterButtons = filterControls(filterRoot, {
    buttons: [...document.querySelectorAll("[data-registry-filter]")]
  });
  let viewButtons = [
    ...(viewRoot?.matches("[data-view]") ? [viewRoot] : []),
    ...(viewRoot?.querySelectorAll("[data-view]") || [])
  ];

  if (viewRoot && !viewButtons.length && viewRoot.tagName !== "BUTTON") {
    viewRoot.innerHTML = `
      <button type="button" data-view="index" aria-pressed="true">Index</button>
      <button type="button" data-view="cards" aria-pressed="false">Cards</button>
    `;
    viewButtons = [...viewRoot.querySelectorAll("[data-view]")];
  }

  let activeFilter = "all";
  let activeView = "index";

  const render = () => {
    const records = newestRecords.filter((record) =>
      recordMatchesFilter(record, activeFilter)
    );
    registry.dataset.view = activeView;
    registry.dataset.filter = activeFilter;
    registry.innerHTML = records.length
      ? records
          .map((record, index) =>
            recordRow(record, index, {
              className:
                activeView === "cards" ? "registry-card" : "registry-row"
            })
          )
          .join("")
      : `<p class="empty-filter-result">No indexed records match this view.</p>`;

    const status = document.querySelector(
      "[data-work-status], [data-registry-count]"
    );
    if (status) {
      status.textContent = `${records.length} ${
        records.length === 1 ? "record" : "records"
      }`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      setPressedControl(filterButtons, activeFilter, "filter");
      render();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view || "index";
      setPressedControl(viewButtons, activeView, "view");
      render();
    });
  });

  setPressedControl(filterButtons, activeFilter, "filter");
  setPressedControl(viewButtons, activeView, "view");
  render();
}

function assignTimelineLanes(records, finalYear) {
  const laneEnds = [];

  return records.map((record) => {
    const recordEnd = record.endYear ?? finalYear;
    let lane = laneEnds.findIndex((endYear) => endYear < record.startYear);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = recordEnd;
    return { record, lane };
  });
}

function renderTimelineCanvas(container, records) {
  if (!container) return;

  const firstYear = Math.min(...portfolioRecords.map((record) => record.startYear));
  const finalYear = Math.max(
    2026,
    ...portfolioRecords.map((record) => record.endYear ?? 2026)
  );
  const yearSpan = Math.max(1, finalYear - firstYear);
  const placedRecords = assignTimelineLanes(records, finalYear);
  const laneCount =
    Math.max(0, ...placedRecords.map(({ lane }) => lane)) + 1;

  container.style.setProperty("--timeline-lanes", String(laneCount));
  container.innerHTML = `
    <div class="timeline-canvas__years" aria-hidden="true">
      ${Array.from({ length: finalYear - firstYear + 1 }, (_, index) => {
        const year = firstYear + index;
        const position = ((year - firstYear) / yearSpan) * 100;
        return `<span style="--year-position: ${position}%">${year}</span>`;
      }).join("")}
    </div>
    <div class="timeline-canvas__records">
      ${placedRecords
        .map(({ record, lane }, index) => {
          const endYear = record.endYear ?? finalYear;
          const start = ((record.startYear - firstYear) / yearSpan) * 100;
          const width = Math.max(
            1.75,
            ((endYear - record.startYear + 0.22) / yearSpan) * 100
          );
          return `
            <a
              class="timeline-record"
              href="${recordHref(record)}"
              data-record="${escapeHtml(record.id)}"
              data-contexts="${escapeHtml(record.contexts.join(" "))}"
              style="--record-start: ${start}%; --record-width: ${width}%; --record-lane: ${lane}"
              aria-label="${escapeHtml(record.title)}, ${escapeHtml(
                recordPeriod(record)
              )}"
            >
              <span class="timeline-record__node" aria-hidden="true"></span>
              <span class="timeline-record__duration" aria-hidden="true"></span>
              <span class="timeline-record__label">
                <span>${formatIndex(index)}</span>
                ${escapeHtml(record.title)}
              </span>
            </a>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTimelineList(container, records) {
  if (!container) return;
  container.innerHTML = records
    .map((record, index) =>
      recordRow(record, index, {
        className: "timeline-list-row",
        practiceLimit: 1
      })
    )
    .join("");
}

function initialiseTimeline() {
  const canvas = document.querySelector("[data-timeline-view]");
  const list = document.querySelector("[data-timeline-list]");
  if (!canvas && !list) return;

  const filterRoot = document.querySelector("[data-timeline-filter]");
  const toggleRoot = document.querySelector("[data-timeline-toggle]");
  const timelineFilterButtons = [
    ...document.querySelectorAll("[data-timeline-filter]")
  ];
  const filterButtons = filterControls(
    filterRoot?.parentElement || filterRoot,
    { buttons: timelineFilterButtons }
  );
  let toggleButtons = [
    ...(toggleRoot?.matches("[data-view]") ? [toggleRoot] : []),
    ...(toggleRoot?.querySelectorAll("[data-view]") || [])
  ];
  const singleToggle =
    toggleRoot?.tagName === "BUTTON" && toggleButtons.length === 0
      ? toggleRoot
      : null;

  if (toggleRoot && !toggleButtons.length && toggleRoot.tagName !== "BUTTON") {
    toggleRoot.innerHTML = `
      <button type="button" data-view="canvas" aria-pressed="true">Timeline</button>
      <button type="button" data-view="list" aria-pressed="false">
        ${icon("list")}
        <span>List</span>
      </button>
    `;
    toggleButtons = [...toggleRoot.querySelectorAll("[data-view]")];
  }

  let activeFilter = "all";
  let activeView =
    mobileViewport.matches || reducedMotion.matches ? "list" : "canvas";
  let visibleRecordCount = 0;

  const applyView = () => {
    if (canvas) {
      canvas.hidden = activeView !== "canvas";
      canvas.setAttribute("aria-hidden", String(activeView !== "canvas"));
    }
    if (list) {
      list.hidden = activeView !== "list";
      list.setAttribute("aria-hidden", String(activeView !== "list"));
    }

    setPressedControl(filterButtons, activeFilter, "filter");
    setPressedControl(toggleButtons, activeView, "view");
    if (singleToggle) {
      const listIsActive = activeView === "list";
      singleToggle.setAttribute("aria-pressed", String(listIsActive));
      singleToggle.dataset.activeView = activeView;
      const label = singleToggle.querySelector("span");
      if (label) {
        label.textContent = listIsActive ? "Timeline view" : "List view";
      }
    }

    const status = document.querySelector("[data-timeline-status]");
    if (status) {
      status.textContent = `${visibleRecordCount} ${
        visibleRecordCount === 1 ? "record" : "records"
      }, ${activeView} view`;
    }
  };

  const renderRecords = () => {
    const records = chronologicalRecords.filter((record) =>
      recordMatchesFilter(record, activeFilter)
    );
    visibleRecordCount = records.length;
    renderTimelineCanvas(canvas, records);
    renderTimelineList(list, records);
    applyView();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      renderRecords();
    });
  });

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view || "canvas";
      applyView();
    });
  });

  singleToggle?.addEventListener("click", () => {
    activeView = activeView === "canvas" ? "list" : "canvas";
    applyView();
  });

  mobileViewport.addEventListener("change", (event) => {
    if (event.matches) {
      activeView = "list";
      applyView();
    }
  });

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      activeView = "list";
      applyView();
    }
  });

  renderRecords();
}

function renderPracticeSummary(container, practice, activeIndex) {
  if (!container || !practice) return;
  const records = recordsForPractice(practice.id);

  container.innerHTML = `
    <article class="practice-summary">
      <p class="section-label">Practice / ${formatIndex(activeIndex)}</p>
      <h2>${escapeHtml(practice.label)}</h2>
      <p>${escapeHtml(practice.description)}</p>
      <p class="practice-summary__count">${records.length} ${
        records.length === 1 ? "record" : "records"
      }</p>
      <a class="record-link" href="${practiceHref(practice)}">
        <span>Open collection</span>
        ${icon("arrow-up-right")}
      </a>
    </article>
    <ol class="practice-index">
      ${practiceGroups
        .map(
          (candidate, index) => `
            <li class="${candidate.id === practice.id ? "is-active" : ""}">
              <a href="${practiceHref(candidate)}">
                <span>${formatIndex(index)}</span>
                ${escapeHtml(candidate.label)}
              </a>
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function initialisePracticeDeck() {
  const stage = document.querySelector("[data-practice-folders]");
  const list = document.querySelector("[data-practice-list]");
  if (!stage) return;

  const previous = document.querySelector("[data-folder-previous]");
  const next = document.querySelector("[data-folder-next]");
  const status = document.querySelector("[data-practice-status]");
  const initialHash = window.location.hash.slice(1);
  let activeIndex = Math.max(
    0,
    practiceGroups.findIndex((practice) => practice.id === initialHash)
  );
  let pointerStart = null;
  let pointerId = null;
  let suppressFolderClick = false;
  let hasSelectedPractice = false;

  stage.innerHTML = practiceGroups
    .map(
      (practice, index) => `
        <button
          class="practice-folder"
          type="button"
          data-practice-select="${escapeHtml(practice.id)}"
          aria-pressed="${String(index === activeIndex)}"
          aria-label="${escapeHtml(practice.label)}"
        >
          ${icon("folder-fill", "practice-folder__shape")}
          <span class="practice-folder__tab">${formatIndex(index)}</span>
          <span class="practice-folder__label">${escapeHtml(
            practice.shortLabel
          )}</span>
        </button>
      `
    )
    .join("");
  const folderButtons = [...stage.querySelectorAll("[data-practice-select]")];

  const syncFolderMotion = () => {
    const transformDuration = reducedMotion.matches
      ? "0.01ms"
      : coarsePointer.matches
        ? "260ms"
        : "320ms";
    const opacityDuration = reducedMotion.matches ? "0.01ms" : "150ms";

    folderButtons.forEach((button) => {
      button.style.transitionDuration = `${transformDuration}, ${opacityDuration}`;
      button.style.transitionTimingFunction =
        "cubic-bezier(0.25, 0.8, 0.25, 1), ease-out";
    });
  };

  const selectPractice = (nextIndex, options = {}) => {
    const normalizedIndex =
      (nextIndex + practiceGroups.length) % practiceGroups.length;
    const selectionChanged =
      !hasSelectedPractice || normalizedIndex !== activeIndex;
    activeIndex = normalizedIndex;
    const practice = practiceGroups[activeIndex];

    if (selectionChanged) {
      folderButtons.forEach((button, index) => {
        const delta = index - activeIndex;
        const isActive = delta === 0;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        button.dataset.position =
          delta < 0 ? "left" : delta > 0 ? "right" : "active";
        button.style.setProperty("--folder-distance", String(Math.abs(delta)));
        button.style.setProperty("--folder-order", String(index));
      });

      renderPracticeSummary(list, practice, activeIndex);
      document.querySelectorAll("[data-practice-count]").forEach((element) => {
        element.textContent = String(recordsForPractice(practice.id).length);
      });
      if (status) {
        status.textContent = `${activeIndex + 1} of ${
          practiceGroups.length
        }. ${practice.label}.`;
      }
      hasSelectedPractice = true;
    }

    if (options.updateHash) {
      history.replaceState(null, "", `#${practice.id}`);
    }
    if (options.focus) {
      stage
        .querySelector(
          `[data-practice-select="${CSS.escape(practice.id)}"]`
        )
        ?.focus();
    }
  };

  stage.addEventListener("click", (event) => {
    if (suppressFolderClick) {
      event.preventDefault();
      suppressFolderClick = false;
      return;
    }
    const button = event.target.closest("[data-practice-select]");
    if (!button) return;
    const index = practiceGroups.findIndex(
      (practice) => practice.id === button.dataset.practiceSelect
    );
    if (index >= 0) selectPractice(index, { updateHash: true });
  });

  stage.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    if (event.key === "ArrowLeft") {
      selectPractice(activeIndex - 1, { updateHash: true, focus: true });
    } else if (event.key === "ArrowRight") {
      selectPractice(activeIndex + 1, { updateHash: true, focus: true });
    } else if (event.key === "Home") {
      selectPractice(0, { updateHash: true, focus: true });
    } else {
      selectPractice(practiceGroups.length - 1, {
        updateHash: true,
        focus: true
      });
    }
  });

  stage.addEventListener("pointerdown", (event) => {
    pointerStart = event.clientX;
    pointerId = event.pointerId;
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener("pointerup", (event) => {
    if (pointerStart === null || event.pointerId !== pointerId) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;
    pointerId = null;
    if (stage.hasPointerCapture?.(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    const swipeThreshold = coarsePointer.matches ? 28 : 36;
    if (Math.abs(distance) < swipeThreshold) return;
    suppressFolderClick = true;
    window.setTimeout(() => {
      suppressFolderClick = false;
    }, 0);
    selectPractice(activeIndex + (distance < 0 ? 1 : -1), {
      updateHash: true
    });
  });

  stage.addEventListener("pointercancel", (event) => {
    if (stage.hasPointerCapture?.(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    pointerStart = null;
    pointerId = null;
    suppressFolderClick = false;
  });

  previous?.addEventListener("click", () => {
    selectPractice(activeIndex - 1, { updateHash: true });
  });
  next?.addEventListener("click", () => {
    selectPractice(activeIndex + 1, { updateHash: true });
  });

  reducedMotion.addEventListener("change", syncFolderMotion);
  coarsePointer.addEventListener("change", syncFolderMotion);
  syncFolderMotion();
  selectPractice(activeIndex);
}

function initialisePracticeCollection() {
  const container = document.querySelector("[data-practice-records]");
  if (!container) return;

  const pathPracticeId = window.location.pathname
    .split("/")
    .filter(Boolean)
    .at(-1);
  const practiceId = body.dataset.practiceId || pathPracticeId;
  const practice = practiceGroups.find(
    (candidate) => candidate.id === practiceId
  );
  if (!practice) return;

  const records = [...recordsForPractice(practice.id)].sort(
    (a, b) =>
      (b.endYear ?? Number.POSITIVE_INFINITY) -
        (a.endYear ?? Number.POSITIVE_INFINITY) ||
      b.startYear - a.startYear ||
      a.title.localeCompare(b.title)
  );

  container.innerHTML = records
    .map((record, index) =>
      recordRow(record, index, {
        className: "practice-record-row",
        practiceLimit: 1
      })
    )
    .join("");

  document.querySelectorAll("[data-practice-count]").forEach((element) => {
    element.textContent = String(records.length);
  });
}

function updateNavigation() {
  const page = body.dataset.page || "index";
  const currentSection =
    page === "practice"
      ? "practices"
      : page === "project"
        ? "index"
        : page;
  const links = document.querySelectorAll(".site-navigation a, .project-navigation a");

  links.forEach((link) => {
    const declaredSection = link.dataset.nav;
    const pathname = new URL(link.href, window.location.origin).pathname;
    const inferredSection =
      pathname === "/"
        ? "index"
        : pathname.split("/").filter(Boolean)[0] || "index";
    const isCurrent =
      (declaredSection || inferredSection) === currentSection;

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initialiseNavigationPrefetch() {
  if (navigator.connection?.saveData) return;

  const prefetched = new Set();
  const currentUrl = new URL(window.location.href);

  const prefetch = (event) => {
    const eventTarget =
      event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = eventTarget?.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.target === "_blank") return;

    const url = new URL(link.href, window.location.href);
    if (
      url.origin !== currentUrl.origin ||
      !["http:", "https:"].includes(url.protocol) ||
      (url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search) ||
      /\.(?:avif|gif|jpe?g|mov|mp3|mp4|pdf|png|svg|webm|webp)$/i.test(
        url.pathname
      )
    ) {
      return;
    }

    const key = `${url.pathname}${url.search}`;
    if (prefetched.has(key)) return;
    prefetched.add(key);

    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = key;
    hint.as = "document";
    hint.setAttribute("fetchpriority", "low");
    document.head.append(hint);
  };

  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
}

function initialiseDepthReveals() {
  const targets = [
    ...document.querySelectorAll(
      [
        ".identity-copy",
        ".fashion-procession",
        ".capability-index",
        ".identity-meta",
        ".system-object",
        ".home-timeline",
        ".active-record-slot",
        ".selected-register",
        ".page-introduction",
        ".registry-layout",
        ".timeline-workspace",
        ".timeline-legend",
        ".folder-workspace",
        ".practice-results",
        ".document-title",
        ".document-lead",
        ".document-facts",
        ".document-actions",
        ".contact-register",
        ".contact-note",
        ".project-name-shell > *",
        ".error-page > *"
      ].join(",")
    )
  ];

  if (!targets.length) return;

  targets.forEach((target) => target.classList.add("depth-reveal"));

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "4% 0px -8% 0px",
      threshold: 0.06
    }
  );

  targets.forEach((target) => observer.observe(target));
}

updateNavigation();
initialiseInputModality();
initialiseNavigationPrefetch();
initialiseHome();
initialiseWorkRegistry();
initialiseTimeline();
initialisePracticeDeck();
initialisePracticeCollection();
initialiseDepthReveals();

window.directionDesign = Object.freeze({
  portfolioRecords,
  practiceGroups,
  featuredRecords
});
