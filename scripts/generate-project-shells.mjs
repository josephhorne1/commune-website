import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  portfolioRecords,
  practiceGroups,
  recordContext,
  recordHref,
  recordKind,
  recordPeriod,
  recordsForPractice,
  templateForRecord
} from "../data/portfolio.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const projectsDirectory = path.join(projectRoot, "projects");
const practicesDirectory = path.join(projectRoot, "practices");

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

function formatIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function renderIdentity(className = "wordmark") {
  return `<a class="${className}" href="/">
        <img
          src="/assets/identity/direction-design-master-logo.svg"
          alt="Direction and Design"
          width="36"
          height="24"
        />
        <span aria-hidden="true">Direction and Design</span>
      </a>`;
}

function renderTerminalIdentity() {
  return `<footer class="terminal-identity" aria-hidden="true">
      <img
        src="/assets/identity/direction-design-master-logo.svg"
        alt=""
        width="52"
        height="35"
      />
    </footer>`;
}

function renderNavigation(currentSection) {
  const links = [
    ["index", "/", "Index", "00"],
    ["timeline", "/timeline/", "Timeline", "01"],
    ["practices", "/practices/", "Practices", "02"],
    ["about", "/about/", "About", "03"],
    ["contact", "/contact/", "Contact", "04"]
  ];
  const linkMarkup = links
    .map(
      ([section, href, label, number]) =>
        `      <a href="${href}"${
          section === currentSection ? ' aria-current="page"' : ""
        }>\n` +
        `        <span>${label}</span><small>${number}</small>\n` +
        "      </a>"
    )
    .join("\n");

  return (
    '<nav class="site-navigation project-navigation" aria-label="Primary">\n' +
    `${linkMarkup}\n` +
    "    </nav>"
  );
}

function renderProjectShell(record, index) {
  const title = escapeHtml(record.title);
  const number = formatIndex(index);

  return `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${title} / Direction and Design" />
    <meta name="robots" content="noindex,follow" />
    <meta name="theme-color" content="#f2f0e9" />
    <title>${title} / Direction and Design</title>
    <link rel="stylesheet" href="/style.css" />
    <link rel="stylesheet" href="/projects/project-shell.css" />
    <script type="module" src="/script.js"></script>
  </head>
  <body
    data-page="project"
    data-record-id="${escapeHtml(record.id)}"
    data-template="${escapeHtml(templateForRecord(record))}"
  >
    <a class="skip-link" href="#main-content">Skip to project name</a>

    <header class="page-masthead project-masthead">
      ${renderIdentity("wordmark project-wordmark")}
      <p>Work record / ${number}</p>
      <p>Name record</p>
      <a class="inline-action" href="/work/">Back to work</a>
    </header>

    <main id="main-content" class="project-name-shell">
      <p class="folio-label">Record / ${number}</p>
      <h1>${title}</h1>
    </main>

    ${renderTerminalIdentity()}

    ${renderNavigation("index")}
  </body>
</html>
`;
}

function renderPracticeRecord(record, index) {
  return `
    <article
      class="practice-record-row"
      data-record="${escapeHtml(record.id)}"
      data-contexts="${escapeHtml(record.contexts.join(" "))}"
    >
      <a class="practice-record-row__link" href="${recordHref(record)}">
        <span class="practice-record-row__index">${formatIndex(index)}</span>
        <span class="practice-record-row__title">${escapeHtml(
          record.title
        )}</span>
        <span class="practice-record-row__period">${escapeHtml(
          recordPeriod(record)
        )}</span>
        <span class="practice-record-row__context">${escapeHtml(
          recordContext(record)
        )}</span>
        <span class="practice-record-row__kind">${escapeHtml(
          recordKind(record)
        )}</span>
        <span class="practice-record-row__open">
          <span class="visually-hidden">Open ${escapeHtml(record.title)}</span>
          <img
            class="ui-icon"
            src="/assets/ui/arrow-up-right.svg"
            alt=""
            aria-hidden="true"
          />
        </span>
      </a>
    </article>
  `;
}

function renderPracticePage(practice, index) {
  const title = escapeHtml(practice.label);
  const records = [...recordsForPractice(practice.id)].sort(
    (a, b) =>
      (b.endYear ?? Number.POSITIVE_INFINITY) -
        (a.endYear ?? Number.POSITIVE_INFINITY) ||
      b.startYear - a.startYear ||
      a.title.localeCompare(b.title)
  );
  const countLabel = `${records.length} ${
    records.length === 1 ? "name record" : "name records"
  }`;

  return `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="${title} / Practice collection / Direction and Design"
    />
    <meta name="theme-color" content="#f2f0e9" />
    <title>${title} / Direction and Design</title>
    <link rel="stylesheet" href="/style.css" />
    <script type="module" src="/script.js"></script>
  </head>
  <body data-page="practice" data-practice-id="${escapeHtml(practice.id)}">
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <header class="page-masthead">
      ${renderIdentity()}
      <p>Practice / ${formatIndex(index)}</p>
      <p>${countLabel}</p>
      <a class="inline-action" href="/work/">
        <span>Complete registry</span>
        <img
          src="/assets/ui/arrow-up-right.svg"
          alt=""
          aria-hidden="true"
        />
      </a>
    </header>

    <main id="main-content" class="page-shell practice-collection-page">
      <header class="page-introduction">
        <p class="folio-label">Practice collection / ${formatIndex(index)}</p>
        <h1>${title}</h1>
        <p>${escapeHtml(practice.description)}</p>
        <dl class="collection-facts">
          <div>
            <dt>Indexed records</dt>
            <dd data-practice-count>${records.length}</dd>
          </div>
          <div>
            <dt>Contexts</dt>
            <dd>Independent / Industry / Academic</dd>
          </div>
        </dl>
      </header>

      <section class="practice-collection-register" aria-labelledby="collection-title">
        <div class="section-rail">
          <h2 id="collection-title">Name records</h2>
          <a href="/practices/">All practices</a>
        </div>
        <div class="practice-records" data-practice-records aria-live="polite">
          ${records.map(renderPracticeRecord).join("")}
        </div>
      </section>
    </main>

    ${renderTerminalIdentity()}

    ${renderNavigation("practices")}
  </body>
</html>
`;
}

await Promise.all([
  mkdir(projectsDirectory, { recursive: true }),
  mkdir(practicesDirectory, { recursive: true })
]);

await Promise.all([
  ...portfolioRecords.map(async (record, index) => {
    const routeDirectory = path.join(projectsDirectory, record.slug);
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(
      path.join(routeDirectory, "index.html"),
      renderProjectShell(record, index),
      "utf8"
    );
  }),
  ...practiceGroups.map(async (practice, index) => {
    const routeDirectory = path.join(practicesDirectory, practice.id);
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(
      path.join(routeDirectory, "index.html"),
      renderPracticePage(practice, index),
      "utf8"
    );
  })
]);

console.log(
  `Generated ${portfolioRecords.length} name-only project routes and ${practiceGroups.length} practice collection routes.`
);
