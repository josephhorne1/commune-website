import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  featuredRecords,
  legacyProjectTitles,
  portfolioRecords,
  practiceGroups,
  recordHref,
  recordsForPractice,
  templateFamilies,
  templateForRecord
} from "../data/portfolio.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const projectsRoot = path.join(projectRoot, "projects");
const practicesRoot = path.join(projectRoot, "practices");

const requiredLegacyTitles = [
  "Toronto Metropolitan University",
  "INDEX INDEX",
  "Aira Bumi",
  "Interstice",
  "Image Making",
  "Suburban Propaganda",
  "570 / The Pillow Bag",
  "The Pillow Bag",
  "PUPIL / Sean Leon",
  "Live @ the Drake Underground",
  "YOFC",
  "Burn Everything",
  "Herd Immunity",
  "Billboards",
  "Blood",
  "The Glade",
  "Aquarious",
  "In Loving Memory",
  "Mass Exodus / Slate",
  "City_of_K Prophet Hoodie",
  "Muhann.Studio",
  "City_of_K Lookbook",
  "Antony Riddle"
];

const requiredFeaturedTitles = [
  "Volume",
  "570 / The Pillow Bag",
  "PUPIL / Sean Leon",
  "Mass Exodus / Slate",
  "Muhann.Studio",
  "Interstice"
];

const requiredFrameworkRoutes = [
  "index.html",
  "work/index.html",
  "timeline/index.html",
  "practices/index.html",
  "about/index.html",
  "contact/index.html",
  "404.html"
];

const allowedSystemMedia = [
  "assets/system/paper-stock.png",
  "assets/system/system-object.png",
  "assets/system/underwater-paper-atmosphere.png"
];

const forbiddenMediaExtensions = new Set([
  ".avif",
  ".fbx",
  ".gif",
  ".glb",
  ".gltf",
  ".jpeg",
  ".jpg",
  ".mov",
  ".mp3",
  ".mp4",
  ".png",
  ".wav",
  ".webm",
  ".webp"
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function normaliseRelative(file) {
  return path.relative(projectRoot, file).replaceAll("\\", "/");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      [".design-qa", ".git", "node_modules"].includes(entry.name)
    ) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

test("the canonical project and selected-work inventories remain exact", () => {
  assert.equal(portfolioRecords.length, 24);
  assert.equal(legacyProjectTitles.length, 23);
  assert.deepEqual(
    [...legacyProjectTitles].sort(),
    [...requiredLegacyTitles].sort()
  );
  assert.deepEqual(
    featuredRecords.map((record) => record.title),
    requiredFeaturedTitles
  );

  featuredRecords.forEach((record) => {
    assert.equal(typeof record.overviewLabel, "string");
    assert.ok(record.overviewLabel.length > 0);
  });
});

test("registry identifiers, dates, relationships, contexts, and templates are valid", () => {
  const ids = new Set();
  const slugs = new Set();
  const allowedContexts = new Set([
    "education",
    "industry",
    "self-directed"
  ]);
  const allowedTemplates = new Set(
    templateFamilies.map((template) => template.id)
  );

  for (const record of portfolioRecords) {
    assert.equal(record.contentStatus, "empty");
    assert.ok(!ids.has(record.id), `Duplicate id: ${record.id}`);
    assert.ok(!slugs.has(record.slug), `Duplicate slug: ${record.slug}`);
    ids.add(record.id);
    slugs.add(record.slug);

    assert.ok(Number.isInteger(record.startYear));
    if (record.endYear !== null) {
      assert.ok(Number.isInteger(record.endYear));
      assert.ok(record.endYear >= record.startYear);
    } else {
      assert.equal(record.ongoing, true);
    }

    record.contexts.forEach((context) =>
      assert.ok(allowedContexts.has(context), `Unknown context: ${context}`)
    );
    assert.ok(
      allowedTemplates.has(templateForRecord(record)),
      `Unknown template for ${record.title}`
    );
    assert.equal(recordHref(record), `/projects/${record.slug}/`);
  }

  for (const record of portfolioRecords) {
    if (record.parentId) assert.ok(ids.has(record.parentId));
    record.relatedIds.forEach((relatedId) => assert.ok(ids.has(relatedId)));
  }

  const pillowBag = portfolioRecords.find(
    (record) => record.id === "the-pillow-bag"
  );
  assert.equal(pillowBag.parentId, "570");
  assert.equal(pillowBag.legacyRoute, "projects/570/");

  const massExodus = portfolioRecords.find(
    (record) => record.id === "mass-ex"
  );
  assert.deepEqual(massExodus.contexts, ["education", "industry"]);
});

test("all six practices form complete, functional indexes", () => {
  assert.equal(practiceGroups.length, 6);

  practiceGroups.forEach((practice) => {
    assert.ok(practice.shortLabel.length > 0);
    assert.ok(practice.description.length > 0);
    assert.ok(recordsForPractice(practice.id).length > 0);
  });

  portfolioRecords.forEach((record) => {
    const indexed = practiceGroups.some((practice) =>
      record.practices.some((tag) => practice.tags.includes(tag))
    );
    assert.ok(indexed, `${record.title} is not indexed by a practice`);
  });
});

test("every record has a root-relative, noindex, name-only project route", async () => {
  for (const record of portfolioRecords) {
    const routePath = path.join(projectsRoot, record.slug, "index.html");
    assert.equal((await stat(routePath)).isFile(), true);
    const html = await readFile(routePath, "utf8");

    assert.match(html, new RegExp(escapeRegExp(record.title)));
    assert.match(html, /<meta name="robots" content="noindex,follow"\s*\/>/);
    assert.match(html, /href="\/style\.css"/);
    assert.match(html, /href="\/projects\/project-shell\.css"/);
    assert.match(html, /src="\/script\.js"/);
    assert.match(html, /data-page="project"/);
    assert.match(
      html,
      new RegExp(`data-record-id="${escapeRegExp(record.id)}"`)
    );
    assert.doesNotMatch(
      html,
      /<(?:audio|canvas|embed|iframe|object|picture|source|video)\b/i
    );
    const imageSources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)]
      .map((match) => match[1]);
    assert.deepEqual(
      imageSources,
      [
        "/assets/identity/direction-design-master-logo.svg",
        "/assets/identity/direction-design-master-logo.svg"
      ],
      `${record.title} may use only the approved identity-chrome image`
    );
    assert.doesNotMatch(
      html,
      /(?:case study forthcoming|coming soon|framework only|project imagery|process|outcomes|credits)/i
    );
    assert.match(html, /<nav class="site-navigation project-navigation"/);
    assert.equal(
      (html.match(/<h1\b/g) || []).length,
      1,
      `${record.title} must have exactly one H1`
    );
    assert.equal(
      (html.match(/<nav\b/g) || []).length,
      1,
      `${record.title} must have one primary navigation`
    );
  }
});

test("the project tree contains only one shared stylesheet and 24 shells", async () => {
  const files = await walk(projectsRoot);
  const media = files.filter((file) =>
    forbiddenMediaExtensions.has(path.extname(file).toLowerCase())
  );
  assert.deepEqual(media, []);

  const relativeFiles = files.map((file) =>
    path.relative(projectsRoot, file).replaceAll("\\", "/")
  );
  const routeFiles = relativeFiles.filter((file) =>
    /^[^/]+\/index\.html$/.test(file)
  );

  assert.equal(routeFiles.length, portfolioRecords.length);
  assert.ok(!relativeFiles.some((file) => file.includes("Mass_Exodus")));
  assert.ok(
    relativeFiles.every(
      (file) =>
        file === "project-shell.css" ||
        /^[^/]+\/index\.html$/.test(file)
    ),
    `Unexpected project files remain:\n${relativeFiles.join("\n")}`
  );
});

test("every practice has a generated category route with its indexed names", async () => {
  for (const practice of practiceGroups) {
    const routePath = path.join(practicesRoot, practice.id, "index.html");
    assert.equal((await stat(routePath)).isFile(), true);
    const html = await readFile(routePath, "utf8");

    assert.match(html, /data-page="practice"/);
    assert.match(
      html,
      new RegExp(`data-practice-id="${escapeRegExp(practice.id)}"`)
    );
    assert.match(html, new RegExp(escapeRegExp(escapeHtml(practice.label))));
    assert.match(html, /data-practice-records/);
    assert.match(html, /href="\/style\.css"/);
    assert.match(html, /src="\/script\.js"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);

    recordsForPractice(practice.id).forEach((record) => {
      assert.match(html, new RegExp(escapeRegExp(record.title)));
    });
    assert.doesNotMatch(
      html,
      /(?:case study forthcoming|coming soon|framework only|project imagery|process|outcomes|credits)/i
    );
    assert.doesNotMatch(
      html,
      /(?:\.avif|\.gif|\.jpe?g|\.mov|\.mp[34]|\.png|\.wav|\.webm|\.webp)(?:["?#])/i
    );
  }
});

test("the framework route inventory and five-part navigation are complete", async () => {
  for (const relativeRoute of requiredFrameworkRoutes) {
    const routePath = path.join(projectRoot, relativeRoute);
    assert.equal(
      (await stat(routePath)).isFile(),
      true,
      `Missing framework route: ${relativeRoute}`
    );

    const html = await readFile(routePath, "utf8");
    if (relativeRoute !== "404.html") {
      assert.match(html, /id="main-content"/);
      assert.match(html, /class="site-navigation"/);
      assert.match(html, /href="\/timeline\/"/);
      assert.match(html, /href="\/practices\/"/);
      assert.match(html, /href="\/about\/"/);
      assert.match(html, /href="\/contact\/"/);
      assert.match(html, /Skip to main content/);
      assert.doesNotMatch(html, /<iframe\b|<canvas\b/i);
    }
  }
});

test("only the approved system raster assets exist outside QA evidence", async () => {
  const files = await walk(projectRoot);
  const mediaFiles = files
    .filter((file) =>
      forbiddenMediaExtensions.has(path.extname(file).toLowerCase())
    )
    .map(normaliseRelative)
    .sort();

  assert.deepEqual(mediaFiles, [...allowedSystemMedia].sort());
  for (const relativeFile of allowedSystemMedia) {
    assert.equal(
      (await stat(path.join(projectRoot, relativeFile))).isFile(),
      true
    );
  }
});

test("legacy runtimes, fabricated project copy, and broken-content layers are absent", async () => {
  const rootFiles = await readdir(projectRoot);
  assert.ok(!rootFiles.includes("volume-loader.js"));
  assert.ok(!rootFiles.includes("volume.js"));
  assert.ok(!rootFiles.includes("volume.bundle.js"));
  assert.ok(!rootFiles.includes("system"));

  const sourceFiles = [
    "index.html",
    "script.js",
    "style.css",
    "work/index.html",
    "timeline/index.html",
    "practices/index.html",
    "about/index.html",
    "contact/index.html"
  ];
  const combined = (
    await Promise.all(
      sourceFiles.map((file) => readFile(path.join(projectRoot, file), "utf8"))
    )
  ).join("\n");

  assert.doesNotMatch(
    combined,
    /(?:entry-gate|project-layer|project-frame|srcdoc|garment-node|volume-loader|volume\.bundle|<iframe|<canvas)/i
  );
  assert.doesNotMatch(
    combined,
    /(?:full case study|framework only|case study forthcoming|project imagery \/ process \/ outcomes|a study in objects and systems)/i
  );
});

test("the homepage exposes the Option 2 system without project interiors", async () => {
  const html = await readFile(path.join(projectRoot, "index.html"), "utf8");

  assert.match(html, /data-page="index"/);
  assert.match(html, /data-home-story/);
  assert.match(html, /data-home-timeline/);
  assert.match(html, /data-selected-work/);
  assert.match(html, /data-home-practices/);
  assert.match(html, /src="\/assets\/system\/system-object\.png"/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /aria-current="page"/);
  assert.doesNotMatch(html, /<details\b|<iframe\b|<canvas\b/i);

  const cname = (await readFile(path.join(projectRoot, "CNAME"), "utf8")).trim();
  assert.equal(cname, "direction.design");
});
