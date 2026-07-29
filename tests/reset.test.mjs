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
  recordsForPractice
} from "../data/portfolio.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const projectsRoot = path.join(projectRoot, "projects");

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

test("the canonical legacy project inventory is complete", () => {
  assert.equal(legacyProjectTitles.length, 23);
  assert.deepEqual(
    [...legacyProjectTitles].sort(),
    [...requiredLegacyTitles].sort()
  );
});

test("the six selected overview records are exact and ordered", () => {
  assert.deepEqual(
    featuredRecords.map((record) => record.title),
    requiredFeaturedTitles
  );
  featuredRecords.forEach((record) => {
    assert.equal(typeof record.overviewLabel, "string");
    assert.ok(record.overviewLabel.length > 0);
  });
});

test("registry identifiers, slugs, dates, relationships and contexts are valid", () => {
  const ids = new Set();
  const slugs = new Set();
  const allowedContexts = new Set([
    "education",
    "industry",
    "self-directed"
  ]);

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

test("every practice is a functional index with related records", () => {
  assert.equal(practiceGroups.length, 6);

  practiceGroups.forEach((practice) => {
    assert.ok(recordsForPractice(practice.id).length > 0);
  });

  portfolioRecords.forEach((record) => {
    const indexed = practiceGroups.some((practice) =>
      record.practices.some((tag) => practice.tags.includes(tag))
    );
    assert.ok(indexed, `${record.title} is not indexed by a practice`);
  });
});

test("every record has a generated name-only route", async () => {
  for (const record of portfolioRecords) {
    const routePath = path.join(projectsRoot, record.slug, "index.html");
    assert.equal((await stat(routePath)).isFile(), true);
    const html = await readFile(routePath, "utf8");

    assert.match(html, new RegExp(record.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(
      html,
      /<(?:audio|canvas|embed|iframe|img|object|picture|source|video)\b/i
    );
    assert.doesNotMatch(
      html,
      /(?:case study forthcoming|framework only|project imagery|process|outcomes|credits)/i
    );
    assert.match(html, /<nav class="project-navigation"/);
    assert.equal(
      (html.match(/<h1\b/g) || []).length,
      1,
      `${record.title} must have exactly one H1`
    );
  }
});

test("the deployed project tree contains no media or project interiors", async () => {
  const files = await walk(projectsRoot);
  const media = files.filter((file) =>
    forbiddenMediaExtensions.has(path.extname(file).toLowerCase())
  );
  assert.deepEqual(media, []);

  const relativeFiles = files.map((file) =>
    path.relative(projectsRoot, file).replaceAll("\\", "/")
  );

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

test("the reset site contains no portfolio media outside the QA evidence", async () => {
  const files = await walk(projectRoot);
  const mediaFiles = files.filter((file) =>
    forbiddenMediaExtensions.has(path.extname(file).toLowerCase())
  );

  assert.deepEqual(mediaFiles, []);
});

test("legacy layers, runtimes and broken-content phrases are absent", async () => {
  const rootFiles = await readdir(projectRoot);
  assert.ok(!rootFiles.includes("volume-loader.js"));
  assert.ok(!rootFiles.includes("volume.js"));
  assert.ok(!rootFiles.includes("volume.bundle.js"));

  const sourceFiles = [
    "index.html",
    "script.js",
    "style.css"
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
    /(?:full case study|framework only|case study forthcoming|project imagery \/ process \/ outcomes)/i
  );
});

test("the homepage contains the reset architecture and direct navigation", async () => {
  const html = await readFile(path.join(projectRoot, "index.html"), "utf8");

  assert.match(html, /id="home"/);
  assert.match(html, /id="timeline"/);
  assert.match(html, /id="practices"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /aria-current="location"/);
  assert.doesNotMatch(html, /<details\b/i);
  assert.doesNotMatch(html, /<iframe\b|<canvas\b/i);

  const cname = (await readFile(path.join(projectRoot, "CNAME"), "utf8")).trim();
  assert.equal(cname, "direction.design");
});
