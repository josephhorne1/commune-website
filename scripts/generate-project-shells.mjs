import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { portfolioRecords } from "../data/portfolio.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const projectsDirectory = path.join(projectRoot, "projects");

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

function renderProjectShell(record, index) {
  const title = escapeHtml(record.title);
  const number = String(index + 1).padStart(2, "0");

  return `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${title} / Direction and Design" />
    <meta name="theme-color" content="#f9f8f4" />
    <title>${title} / Direction and Design</title>
    <link rel="stylesheet" href="../project-shell.css" />
  </head>
  <body data-record-id="${escapeHtml(record.id)}">
    <a class="skip-link" href="#project-title">Skip to project name</a>

    <header class="project-header">
      <a class="project-identity" href="../../#home">
        <strong>Direction and Design</strong>
        <span>Joseph Horne</span>
      </a>
      <span class="project-index">Project [${number}]</span>
      <a class="project-return" href="../../#timeline">Back to timeline</a>
    </header>

    <main class="project-name">
      <h1 id="project-title">${title}</h1>
    </main>

    <nav class="project-navigation" aria-label="Primary">
      <a href="../../#home">Home <span>[00]</span></a>
      <a href="../../#about">About <span>[01]</span></a>
      <a href="../../#timeline">Timeline <span>[02]</span></a>
      <a href="../../#contact">Contact <span>[03]</span></a>
    </nav>
  </body>
</html>
`;
}

await mkdir(projectsDirectory, { recursive: true });

await Promise.all(
  portfolioRecords.map(async (record, index) => {
    const routeDirectory = path.join(projectsDirectory, record.slug);
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(
      path.join(routeDirectory, "index.html"),
      renderProjectShell(record, index),
      "utf8"
    );
  })
);

console.log(`Generated ${portfolioRecords.length} content-free project routes.`);
