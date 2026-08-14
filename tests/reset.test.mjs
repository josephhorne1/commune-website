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
import { fashionTurntables } from "../assets/media/fashion-turntables/manifest.js";
import {
  practiceGridImages,
  volumeImages
} from "../assets/media/home-collections/manifest.js";
import {
  getPracticeMosaicColumnCount,
  getPracticeMosaicSlotCount,
  PRACTICE_MOSAIC_ROWS
} from "../scripts/practice-mosaic-layout.js";
import {
  createCarouselInteraction,
  exponentialWheelSpeedForEnergy,
  manualResponseForSpeed,
  MANUAL_RESUME_DELAY_MS,
  MAXIMUM_MOTION_BLUR_PX,
  MAXIMUM_WHEEL_ACCELERATION,
  motionBlurForSpeed,
  moveWithinBounds,
  nextWheelEnergy,
  smoothCarouselPosition,
  normalizeWheelDelta
} from "../scripts/carousel-interaction.js";
import {
  playbackRateTier,
  retimeAnimatedWebp
} from "../scripts/animated-webp-rate.js";

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
  "MT570",
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
  "Mass Exodus 2024 / Slate",
  "City of Knowledge / Prophet Cloak",
  "MUHANN Studio",
  "City of Knowledge / Bookclub Zine",
  "Antony Riddle"
];

const requiredFeaturedTitles = [
  "Volume",
  "MT570",
  "PUPIL / Sean Leon",
  "Mass Exodus 2024 / Slate",
  "Allegra Halton",
  "MUHANN Studio",
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

const allowedFashionAnimationMedia = Array.from(
  { length: 20 },
  (_, index) =>
    `assets/media/fashion-turntables/animated/look-${String(index + 1).padStart(2, "0")}.webp`
);

const allowedFashionPosterMedia = Array.from(
  { length: 20 },
  (_, index) =>
    `assets/media/fashion-turntables/posters/look-${String(index + 1).padStart(2, "0")}.webp`
);

const allowedFashionMobileMedia = [
  "assets/media/fashion-turntables/mobile-grid.webp",
  "assets/media/fashion-turntables/mobile-grid-poster.webp"
];

const allowedFashionTurntableMedia = [
  ...allowedFashionAnimationMedia,
  ...allowedFashionPosterMedia
];

const allowedFashionMedia = [
  ...allowedFashionTurntableMedia,
  ...allowedFashionMobileMedia
];

const allowedVolumeMedia = Array.from(
  { length: 24 },
  (_, index) =>
    `assets/media/home-collections/volume/volume-${String(index + 1).padStart(2, "0")}.webp`
);

const allowedPracticeGridMedia = Array.from(
  { length: 50 },
  (_, index) =>
    `assets/media/home-collections/practice-grid/practice-${String(index + 1).padStart(2, "0")}.webp`
);

const allowedHomeCollectionMedia = [
  ...allowedVolumeMedia,
  ...allowedPracticeGridMedia
];

const allowedMedia = [
  ...allowedSystemMedia,
  ...allowedFashionMedia,
  ...allowedHomeCollectionMedia
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
      [".design-qa", ".git", "node_modules", "source-assets"].includes(
        entry.name
      )
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
  assert.equal(portfolioRecords.length, 28);
  assert.equal(legacyProjectTitles.length, 23);
  assert.deepEqual(
    [...legacyProjectTitles].sort(),
    [...requiredLegacyTitles].sort()
  );
  assert.deepEqual(
    featuredRecords.map((record) => record.title),
    requiredFeaturedTitles
  );
  assert.deepEqual(
    featuredRecords.map((record) => record.featuredRank),
    [1, 2, 3, 4, 5, 6, 7]
  );
  assert.equal(featuredRecords[4].id, "allegra-halton");

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
    assert.equal(
      record.contentStatus,
      record.id === "volume" ? "draft" : "empty"
    );
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

  const allegra = portfolioRecords.find(
    (record) => record.id === "allegra-halton"
  );
  assert.equal(allegra.kind, "experience");
  assert.equal(allegra.startYear, 2024);
  assert.equal(allegra.ongoing, true);
  assert.deepEqual(allegra.relatedIds, [
    "allegra-40th-anniversary",
    "rainbow-hardwood-flooring",
    "waldie-drywall"
  ]);
  assert.deepEqual(
    portfolioRecords
      .filter((record) => record.parentId === allegra.id)
      .map((record) => record.id),
    allegra.relatedIds
  );
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

test("every record has a root-relative route and empty records remain name-only", async () => {
  for (const record of portfolioRecords) {
    const routePath = path.join(projectsRoot, record.slug, "index.html");
    assert.equal((await stat(routePath)).isFile(), true);
    const html = await readFile(routePath, "utf8");

    assert.match(html, new RegExp(escapeRegExp(escapeHtml(record.title))));
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
    if (record.contentStatus === "empty") {
      const imageSources = [
        ...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)
      ].map((match) => match[1]);
      assert.deepEqual(
        imageSources,
        [
          "/assets/identity/direction-design-master-logo.svg",
          "/assets/identity/direction-design-master-logo.svg"
        ],
        `${record.title} may use only the approved identity-chrome image`
      );
      assert.match(html, /class="project-name-shell"/);
    }
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

test("the draft Volume route renders the exact shared 24-image collection", async () => {
  const volumeRecord = portfolioRecords.find((record) => record.id === "volume");
  const [html, generator, stylesheet, homepage] = await Promise.all([
    readFile(path.join(projectsRoot, volumeRecord.slug, "index.html"), "utf8"),
    readFile(path.join(projectRoot, "scripts/generate-project-shells.mjs"), "utf8"),
    readFile(path.join(projectsRoot, "project-shell.css"), "utf8"),
    readFile(path.join(projectRoot, "index.html"), "utf8")
  ]);

  assert.equal(volumeRecord.contentStatus, "draft");
  assert.match(html, /data-record-id="volume"/);
  assert.match(html, /data-content-status="draft"/);
  assert.match(html, /class="volume-project"/);
  assert.match(html, /id="volume-gallery-title">Selected images/);
  assert.match(html, /24 plates \/ Volume/);
  assert.match(html, /<meta name="robots" content="noindex,follow"\s*\/>/);

  const galleryStart = html.indexOf('class="volume-project__gallery"');
  const galleryEnd = html.indexOf("</section>", galleryStart);
  const galleryMarkup = html.slice(galleryStart, galleryEnd);
  const gallerySources = [
    ...galleryMarkup.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)
  ].map((match) => match[1]);
  assert.deepEqual(gallerySources, volumeImages.map((image) => image.src));
  assert.equal(new Set(gallerySources).size, volumeImages.length);

  volumeImages.forEach((image, index) => {
    const plateStart = galleryMarkup.indexOf(`data-volume-image="${image.id}"`);
    const plateEnd = galleryMarkup.indexOf("</figure>", plateStart);
    const plateMarkup = galleryMarkup.slice(plateStart, plateEnd);
    assert.ok(plateStart > -1 && plateEnd > plateStart);
    assert.match(plateMarkup, new RegExp(`src="${escapeRegExp(image.src)}"`));
    assert.match(plateMarkup, new RegExp(`width="${image.width}"`));
    assert.match(plateMarkup, new RegExp(`height="${image.height}"`));
    assert.match(
      plateMarkup,
      new RegExp(`loading="${index === 0 ? "eager" : "lazy"}"`)
    );
    assert.match(plateMarkup, /alt=""/);
  });
  assert.equal((galleryMarkup.match(/fetchpriority="high"/g) || []).length, 1);

  assert.match(
    generator,
    /import \{ volumeImages \} from "\.\.\/assets\/media\/home-collections\/manifest\.js"/
  );
  assert.match(generator, /record\.id === "volume"/);
  assert.match(generator, /renderVolumeProject\(record, index\)/);
  assert.match(stylesheet, /\.volume-project__grid\s*\{/);
  assert.match(stylesheet, /\.volume-project__plate--landscape\s*\{/);

  const volumeFigureStart = homepage.indexOf('class="volume-marquee"');
  const volumeFigureEnd = homepage.indexOf("</figure>", volumeFigureStart);
  const volumeFigureMarkup = homepage.slice(volumeFigureStart, volumeFigureEnd);
  const volumeLinkStart = volumeFigureMarkup.indexOf(
    'class="volume-marquee__link"'
  );
  const volumeTrackIndex = volumeFigureMarkup.indexOf(
    "data-volume-marquee-track"
  );
  const volumeLinkEnd = volumeFigureMarkup.indexOf("</a>", volumeLinkStart);
  assert.ok(volumeLinkStart > -1);
  assert.ok(volumeLinkStart < volumeTrackIndex && volumeTrackIndex < volumeLinkEnd);
  assert.equal(
    (volumeFigureMarkup.match(/href="\/projects\/volume\/"/g) || []).length,
    1
  );
  assert.match(volumeFigureMarkup, /aria-label="Open the Volume project record"/);
});

test("the project tree contains only one shared stylesheet and 28 shells", async () => {
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
  assert.equal(routeFiles.length, 28);
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
      assert.match(html, new RegExp(escapeRegExp(escapeHtml(record.title))));
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

test("the Fashion practice generates and runs the complete 20-look garment gallery", async () => {
  const fashionRoute = path.join(
    practicesRoot,
    "fashion-garment-design",
    "index.html"
  );
  const [html, generator, runtime, stylesheet] = await Promise.all([
    readFile(fashionRoute, "utf8"),
    readFile(
      path.join(projectRoot, "scripts/generate-project-shells.mjs"),
      "utf8"
    ),
    readFile(path.join(projectRoot, "scripts/garment-grid.js"), "utf8"),
    readFile(path.join(projectRoot, "style.css"), "utf8")
  ]);

  assert.equal(fashionTurntables.length, 20);
  assert.match(html, /src="\/scripts\/garment-grid\.js"/);
  assert.match(html, /id="garment-gallery"/);
  assert.match(html, /data-garment-gallery/);
  assert.match(html, /data-garment-gallery-grid/);
  assert.match(html, /20 self-directed studies/);
  assert.match(html, /data-garment-motion-toggle/);
  assert.doesNotMatch(html, /data-garment-gallery-grid[^>]*aria-live/);
  assert.match(
    generator,
    /const includesGarmentGallery = practice\.id === "fashion-garment-design"/
  );
  assert.match(generator, /src="\/scripts\/garment-grid\.js"/);
  assert.match(generator, /id="garment-gallery"/);
  assert.match(runtime, /fashionTurntables\.forEach\(\(look, index\) =>/);
  assert.match(runtime, /image\.src = look\.poster/);
  assert.match(runtime, /image\.dataset\.poster = look\.poster/);
  assert.match(runtime, /image\.dataset\.animated = look\.src/);
  assert.match(runtime, /image\.alt = `Self-directed garment turntable \$\{number\}`/);
  assert.match(
    runtime,
    /const animate =\s*visible && !motionPaused && !reducedMotion\.matches && !saveData/
  );
  assert.match(runtime, /const observer = new IntersectionObserver/);
  assert.match(runtime, /rootMargin: "12% 0px"/);
  assert.match(runtime, /motionToggle\?\.addEventListener\("click"/);
  assert.match(runtime, /gallery\.dataset\.state = "ready"/);
  assert.match(
    stylesheet,
    /\.garment-gallery__grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/
  );
  assert.match(
    stylesheet,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.garment-gallery__grid\s*\{[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/
  );

  for (const practice of practiceGroups.filter(
    (candidate) => candidate.id !== "fashion-garment-design"
  )) {
    const otherHtml = await readFile(
      path.join(practicesRoot, practice.id, "index.html"),
      "utf8"
    );
    assert.doesNotMatch(otherHtml, /garment-grid|data-garment-gallery/);
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
      assert.doesNotMatch(html, /<iframe\b/i);
      assert.doesNotMatch(html, /<canvas\b/i);
    }
  }
});

test("only approved system, homepage, and garment-gallery media exist outside QA evidence", async () => {
  const files = await walk(projectRoot);
  const mediaFiles = files
    .filter((file) =>
      forbiddenMediaExtensions.has(path.extname(file).toLowerCase())
    )
    .map(normaliseRelative)
    .sort();

  assert.deepEqual(mediaFiles, [...allowedMedia].sort());
  for (const relativeFile of allowedMedia) {
    assert.equal(
      (await stat(path.join(projectRoot, relativeFile))).isFile(),
      true
    );
  }
});

test("the Volume and practice-field manifests are exact and byte-bounded", async () => {
  const [volumePrepared, practicePrepared] = await Promise.all([
    readFile(
      path.join(
        projectRoot,
        "assets/media/home-collections/volume/prepared-assets.json"
      ),
      "utf8"
    ).then(JSON.parse),
    readFile(
      path.join(
        projectRoot,
        "assets/media/home-collections/practice-grid/prepared-assets.json"
      ),
      "utf8"
    ).then(JSON.parse)
  ]);

  assert.equal(volumeImages.length, 24);
  assert.equal(practiceGridImages.length, 50);
  assert.equal(new Set(volumeImages.map((image) => image.id)).size, 24);
  assert.equal(new Set(practiceGridImages.map((image) => image.id)).size, 50);
  assert.deepEqual(
    volumeImages.map((image) => image.src.slice(1)).sort(),
    [...allowedVolumeMedia].sort()
  );
  assert.deepEqual(
    practiceGridImages.map((image) => image.src.slice(1)).sort(),
    [...allowedPracticeGridMedia].sort()
  );
  assert.ok(volumeImages.some((image) => image.width > image.height));
  assert.ok(volumeImages.some((image) => image.width < image.height));
  assert.ok(
    new Set(
      volumeImages.map((image) => (image.width / image.height).toFixed(3))
    ).size >= 4
  );
  practiceGridImages.forEach((image) => {
    assert.equal(image.width, 720);
    assert.equal(image.height, 720);
  });

  assert.equal(volumePrepared.length, 24);
  assert.equal(practicePrepared.length, 50);
  assert.equal(new Set(volumePrepared.map((image) => image.sourceName)).size, 24);
  assert.equal(
    new Set(practicePrepared.map((image) => image.sourceName)).size,
    50
  );

  const volumeSizes = await Promise.all(
    volumePrepared.map(async (image, index) => {
      const definition = volumeImages[index];
      assert.equal(image.id, definition.id);
      assert.equal(image.file, path.basename(definition.src));
      assert.equal(image.width, definition.width);
      assert.equal(image.height, definition.height);
      const size = (await stat(path.join(projectRoot, definition.src.slice(1))))
        .size;
      assert.equal(image.bytes, size);
      return size;
    })
  );
  const practiceSizes = await Promise.all(
    practicePrepared.map(async (image, index) => {
      const definition = practiceGridImages[index];
      assert.equal(image.id, definition.id);
      assert.equal(image.file, path.basename(definition.src));
      assert.ok(image.width > 0 && image.width <= 720);
      assert.ok(image.height > 0 && image.height <= 720);
      const size = (await stat(path.join(projectRoot, definition.src.slice(1))))
        .size;
      assert.equal(image.bytes, size);
      return size;
    })
  );
  const volumeBytes = volumeSizes.reduce((total, size) => total + size, 0);
  const practiceBytes = practiceSizes.reduce((total, size) => total + size, 0);

  assert.ok(volumeBytes < 2 * 1024 * 1024);
  assert.ok(Math.max(...volumeSizes) < 256 * 1024);
  assert.ok(practiceBytes < 2.5 * 1024 * 1024);
  assert.ok(Math.max(...practiceSizes) < 128 * 1024);
  assert.ok(volumeBytes + practiceBytes < 4.5 * 1024 * 1024);

  const pairedSources = Array.from({ length: 25 }, (_, index) => [
    practiceGridImages[index].src,
    practiceGridImages[index + 25].src
  ]);
  pairedSources.forEach(([first, second]) => assert.notEqual(first, second));
  assert.equal(new Set(pairedSources.flat()).size, 50);
});

test("the homepage practice field derives a five-row grid from its width", () => {
  const viewportCases = [
    [320, 2],
    [1152, 5],
    [1440, 6],
    [2524, 11]
  ];

  assert.equal(PRACTICE_MOSAIC_ROWS, 5);
  viewportCases.forEach(([width, expectedColumns]) => {
    const columns = getPracticeMosaicColumnCount(width, 1, 16);
    assert.equal(columns, expectedColumns);
    assert.equal(getPracticeMosaicSlotCount(columns), expectedColumns * 5);
  });
});

test("carousel interaction smooths bounded energy input and uses a three-second release", async () => {
  assert.equal(MANUAL_RESUME_DELAY_MS, 3000);
  assert.equal(normalizeWheelDelta(2, 0), 2);
  assert.equal(normalizeWheelDelta(2, 1), 32);
  assert.equal(normalizeWheelDelta(2, 2, 16, 720), 1440);

  const wheelProfile = (delta, elapsed, count) => {
    let energy = 0;
    const speeds = [];
    for (let index = 0; index < count; index += 1) {
      energy = nextWheelEnergy(
        energy,
        delta,
        index === 0 ? Infinity : elapsed,
        true
      );
      speeds.push(exponentialWheelSpeedForEnergy(energy, true));
    }
    return { energy, speeds };
  };

  const slowProfile = wheelProfile(4, 16, 20);
  assert.equal(slowProfile.speeds.at(-1), 1);
  assert.equal(motionBlurForSpeed(slowProfile.speeds.at(-1)), 0);

  const sustainedProfile = wheelProfile(28, 40, 10);
  assert.deepEqual(
    sustainedProfile.speeds,
    [...sustainedProfile.speeds].sort((first, second) => first - second)
  );
  assert.ok(sustainedProfile.speeds.at(-1) > 3);
  assert.ok(motionBlurForSpeed(sustainedProfile.speeds.at(-1)) > 2);

  const fastProfile = wheelProfile(80, 40, 8);
  assert.equal(fastProfile.speeds.at(-1), MAXIMUM_WHEEL_ACCELERATION);
  assert.equal(
    motionBlurForSpeed(fastProfile.speeds.at(-1)),
    MAXIMUM_MOTION_BLUR_PX
  );
  assert.equal(exponentialWheelSpeedForEnergy(12, false), 1);
  const resetEnergy = nextWheelEnergy(
    fastProfile.energy,
    28,
    400,
    true
  );
  assert.equal(exponentialWheelSpeedForEnergy(resetEnergy, true), 1);

  assert.equal(manualResponseForSpeed(1), 132);
  assert.ok(manualResponseForSpeed(6) < manualResponseForSpeed(1));
  const firstSmoothedFrame = smoothCarouselPosition(0, 100, 16, 110);
  assert.ok(firstSmoothedFrame > 0 && firstSmoothedFrame < 100);
  const advancePosition = (frames, elapsed) => {
    let position = 0;
    for (let frame = 0; frame < frames; frame += 1) {
      const next = smoothCarouselPosition(position, 100, elapsed, 110);
      assert.ok(next >= position && next <= 100);
      position = next;
    }
    return position;
  };
  const positionAtTwentyFiveFrames = advancePosition(25, 16);
  const positionAtFiveFrames = advancePosition(5, 80);
  assert.ok(Math.abs(positionAtTwentyFiveFrames - positionAtFiveFrames) < 1e-9);
  assert.ok(positionAtTwentyFiveFrames > 97 && positionAtTwentyFiveFrames < 100);

  assert.deepEqual(moveWithinBounds(40, 20, 0, 100), {
    next: 60,
    applied: 20,
    residual: 0,
    consumed: true,
    atStart: false,
    atEnd: false
  });
  assert.deepEqual(moveWithinBounds(95, 20, 0, 100), {
    next: 100,
    applied: 5,
    residual: 15,
    consumed: true,
    atStart: false,
    atEnd: true
  });
  assert.equal(moveWithinBounds(100, 20, 0, 100).consumed, false);
  assert.deepEqual(moveWithinBounds(5, -20, 0, 100), {
    next: 0,
    applied: -5,
    residual: -15,
    consumed: true,
    atStart: true,
    atEnd: false
  });
  assert.equal(moveWithinBounds(0, -20, 0, 100).consumed, false);

  const source = await readFile(
    path.join(
      projectRoot,
      "assets/media/fashion-turntables/animated/look-01.webp"
    )
  );
  const sourceBuffer = source.buffer.slice(
    source.byteOffset,
    source.byteOffset + source.byteLength
  );
  const retimed = new Uint8Array(retimeAnimatedWebp(sourceBuffer, 4));
  const original = new Uint8Array(sourceBuffer);
  assert.equal(retimed.byteLength, original.byteLength);
  assert.notDeepEqual(retimed, original);
  assert.deepEqual(
    [1, 1.6, 2.8, 4.2, 6].map(playbackRateTier),
    [1, 1.5, 2, 3, 4]
  );
  assert.equal(playbackRateTier(undefined), 1);
});

test("carousel interaction waits for horizontal touch lock before taking control", () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const listeners = new Map();
  let resumeCallback = null;
  let resumeDelay = 0;
  let resumed = false;
  let pointerCaptured = false;
  let startCount = 0;
  const movements = [];
  const root = {
    clientWidth: 1000,
    dataset: {},
    addEventListener(type, callback) {
      listeners.set(type, callback);
    },
    removeEventListener() {},
    contains() {
      return false;
    },
    setPointerCapture() {
      pointerCaptured = true;
    },
    hasPointerCapture() {
      return pointerCaptured;
    },
    releasePointerCapture() {
      pointerCaptured = false;
    }
  };

  globalThis.window = {
    innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    clearTimeout() {},
    setTimeout(callback, delay) {
      resumeCallback = callback;
      resumeDelay = delay;
      return 1;
    }
  };
  globalThis.document = { activeElement: null };

  let controller;
  try {
    controller = createCarouselInteraction(root, {
      isEnabled: () => true,
      onStart: () => {
        startCount += 1;
      },
      onMove: (delta, detail) => {
        movements.push({ delta, detail });
        return { consumed: false, applied: 0 };
      },
      onResume: () => {
        resumed = true;
      }
    });

    assert.equal(root.dataset.carouselInteraction, "auto");
    listeners.get("pointerdown")({
      isPrimary: true,
      pointerType: "touch",
      pointerId: 4,
      clientX: 100,
      clientY: 100
    });
    assert.equal(startCount, 0);
    assert.equal(resumeCallback, null);
    assert.equal(root.dataset.carouselInteraction, "auto");

    let verticalMovePrevented = false;
    listeners.get("pointermove")({
      pointerId: 4,
      clientX: 102,
      clientY: 132,
      preventDefault() {
        verticalMovePrevented = true;
      }
    });
    listeners.get("pointerup")({ pointerId: 4 });
    assert.equal(verticalMovePrevented, false);
    assert.equal(startCount, 0);
    assert.equal(movements.length, 0);
    assert.equal(resumeCallback, null);
    assert.equal(resumeDelay, 0);
    assert.equal(root.dataset.carouselInteraction, "auto");
    assert.equal(pointerCaptured, false);

    listeners.get("pointerdown")({
      isPrimary: true,
      pointerType: "touch",
      pointerId: 5,
      clientX: 100,
      clientY: 100
    });
    assert.equal(startCount, 0);
    assert.equal(resumeCallback, null);
    let movePrevented = false;
    listeners.get("pointermove")({
      pointerId: 5,
      clientX: 72,
      clientY: 102,
      preventDefault() {
        movePrevented = true;
      }
    });
    assert.equal(startCount, 1);
    assert.equal(movements.length, 1);
    assert.equal(movements[0].delta, -28);
    assert.equal(movements[0].detail.source, "swipe");
    assert.equal(pointerCaptured, true);
    assert.equal(root.dataset.carouselInteraction, "swipe");
    listeners.get("pointerup")({ pointerId: 5 });

    let clickPrevented = false;
    let clickStopped = false;
    listeners.get("click")({
      preventDefault() {
        clickPrevented = true;
      },
      stopImmediatePropagation() {
        clickStopped = true;
      }
    });

    assert.equal(movePrevented, true);
    assert.equal(clickPrevented, true);
    assert.equal(clickStopped, true);
    assert.equal(resumeDelay, 3000);
    assert.ok(resumeCallback);
    resumeCallback();
    assert.equal(resumed, true);
    assert.equal(root.dataset.carouselInteraction, "auto");
  } finally {
    controller?.dispose();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test("the homepage media runtime loops project, Volume, and five-row image fields", async () => {
  const [runtime, interactionRuntime, stylesheet] = await Promise.all([
    readFile(path.join(projectRoot, "scripts/home-media.js"), "utf8"),
    readFile(path.join(projectRoot, "scripts/carousel-interaction.js"), "utf8"),
    readFile(path.join(projectRoot, "style.css"), "utf8")
  ]);

  assert.match(runtime, /const groups = \[0, 1\]\.map\(\(copyIndex\) =>/);
  assert.match(runtime, /volumeImages\.forEach\(\(definition, index\) =>/);
  assert.match(runtime, /track\.append\(group\)/);
  assert.match(
    runtime,
    /Promise\.all\([\s\S]*?track\.querySelectorAll\("img"\)[\s\S]*?root\.dataset\.state = "ready"/
  );
  assert.match(runtime, /const automaticSpeed = 52/);
  assert.match(runtime, /const duration = Math\.max\(42, groupWidth \/ automaticSpeed\)/);
  assert.match(runtime, /createCarouselInteraction\(root, \{/);
  assert.match(runtime, /let targetPosition = 0/);
  assert.match(runtime, /let manualMinimum = null/);
  assert.match(runtime, /let manualMaximum = null/);
  assert.match(runtime, /let manualOrigin = null/);
  assert.match(runtime, /const reversesUncommittedLane =/);
  assert.match(
    runtime,
    /position = smoothCarouselPosition\([\s\S]*?targetPosition,[\s\S]*?manualResponseForSpeed\(manualSpeed\)/
  );
  assert.match(runtime, /manualMaximum = position \+ groupWidth/);
  assert.match(
    runtime,
    /moveWithinBounds\([\s\S]*?targetPosition,[\s\S]*?manualMinimum,[\s\S]*?manualMaximum/
  );
  assert.match(
    runtime,
    /!movement\.consumed &&[\s\S]*?Math\.abs\(targetPosition - position\) > 0\.04[\s\S]*?consumed: true/
  );
  assert.match(
    runtime,
    /position = \(\(position % groupWidth\) \+ groupWidth\) % groupWidth/
  );
  assert.match(runtime, /window\.requestAnimationFrame\(renderFrame\)/);
  assert.match(interactionRuntime, /MANUAL_RESUME_DELAY_MS = 3000/);
  assert.match(interactionRuntime, /nextWheelEnergy\([\s\S]*?rawDelta/);
  assert.match(interactionRuntime, /exponentialWheelSpeedForEnergy\([\s\S]*?wheelEnergy/);
  assert.match(interactionRuntime, /--carousel-motion-blur/);
  assert.match(interactionRuntime, /WHEEL_VISUAL_SETTLE_MS = 220/);
  assert.match(
    interactionRuntime,
    /options\.isMotionSettled\?\.\(\) === false[\s\S]*?setTimeout\(settleSpeed, 60\)/
  );
  assert.match(runtime, /isMotionSettled: \(\) =>/);
  assert.match(interactionRuntime, /addEventListener\("wheel", onWheel, \{ passive: false \}\)/);
  assert.match(interactionRuntime, /addEventListener\("pointermove", onPointerMove, true\)/);
  assert.match(interactionRuntime, /suppressClickUntil/);
  const pointerMoveBlock = interactionRuntime.slice(
    interactionRuntime.indexOf("const onPointerMove"),
    interactionRuntime.indexOf("const releasePointer")
  );
  assert.ok(
    pointerMoveBlock.indexOf("pointerState.dragged = true") > -1 &&
      pointerMoveBlock.indexOf("pointerState.dragged = true") <
        pointerMoveBlock.indexOf("options.onMove(delta")
  );
  assert.match(
    interactionRuntime,
    /window\.setTimeout\(resume, MANUAL_RESUME_DELAY_MS\)/
  );
  assert.match(runtime, /const records = shuffled\(featuredRecords\)/);
  assert.match(runtime, /group\.setAttribute\("aria-hidden", "true"\)/);
  assert.match(runtime, /if \(isClone\) link\.tabIndex = -1/);
  assert.match(runtime, /const duration = Math\.max\(16, groupWidth \/ 140\)/);
  assert.match(runtime, /root\.dataset\.state = "ready"/);
  assert.match(
    runtime,
    /const slotCount = getPracticeMosaicSlotCount\(nextColumnCount\)/
  );
  assert.match(runtime, /index % practiceGridImages\.length/);
  assert.match(runtime, /const resizeObserver = new ResizeObserver/);
  assert.match(runtime, /root\.dataset\.fragments = String\(slotCount\)/);
  assert.match(runtime, /slot\.append\(first, second\)/);
  assert.match(runtime, /const ready = await imageReady\(nextImage\)/);
  assert.match(runtime, /const observer = new IntersectionObserver/);
  assert.match(runtime, /reducedMotion\.addEventListener\("change"/);
  assert.match(runtime, /portfolio-motion-change/);
  assert.match(runtime, /document\.body\.dataset\.motionPaused/);
  assert.match(
    stylesheet,
    /@keyframes volume-marquee-right\s*\{[\s\S]*?translate3d\(-50%, 0, 0\)[\s\S]*?translate3d\(0, 0, 0\)/
  );
  assert.match(
    stylesheet,
    /\.volume-marquee\s*\{[\s\S]*?touch-action:\s*pan-y pinch-zoom;/
  );
  assert.match(
    stylesheet,
    /\.volume-marquee__link\s*\{[\s\S]*?filter:\s*blur\(var\(--carousel-motion-blur\)\);[\s\S]*?transition:\s*filter 120ms linear;/
  );
  assert.match(stylesheet, /data-carousel-control="interactive"/);
  assert.match(
    stylesheet,
    /\.volume-marquee__image\s*\{[\s\S]*?width:\s*auto;[\s\S]*?height:\s*100%;/
  );
  assert.match(
    stylesheet,
    /@keyframes project-ticker-left\s*\{[\s\S]*?translate3d\(-50%, 0, 0\)/
  );
  assert.match(
    stylesheet,
    /\.project-ticker\s*\{[\s\S]*?color:\s*var\(--muted\);[\s\S]*?background:\s*rgba\(238, 237, 226, 0\.72\);[\s\S]*?backdrop-filter:\s*blur\(18px\) saturate\(0\.68\);/
  );
  assert.match(
    stylesheet,
    /body\[data-motion-paused="true"\][\s\S]*?\.project-ticker\[data-state="ready"\][\s\S]*?animation-play-state:\s*paused;/
  );
  assert.match(
    stylesheet,
    /\.project-ticker:focus-within \.project-ticker__track\s*\{[\s\S]*?animation:\s*none;[\s\S]*?transform:\s*none;/
  );
  assert.match(
    stylesheet,
    /\.practice-mosaic__grid\s*\{[\s\S]*?var\(--practice-mosaic-columns, 5\)/
  );
  assert.match(
    stylesheet,
    /\.practice-mosaic\s*\{[\s\S]*?calc\(var\(--space-page\) \* -1\)/
  );
  assert.match(
    stylesheet,
    /\.practice-mosaic__image\.is-active\s*\{[\s\S]*?opacity:\s*0\.64;/
  );
  assert.match(
    stylesheet,
    /\.identity-reference-row\s*\{[\s\S]*?width:\s*auto;[\s\S]*?max-width:\s*none;[\s\S]*?var\(--identity-action-inset\)[\s\S]*?var\(--identity-reading-inset\);[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/
  );
  assert.match(
    stylesheet,
    /\.home-records\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 0\.9fr\) minmax\(20rem, 1\.1fr\);/
  );
  assert.match(
    stylesheet,
    /\.home-records \+ \.practice-mosaic\s*\{[\s\S]*?margin-top:/
  );
  assert.match(
    stylesheet,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.volume-marquee__track,[\s\S]*?animation:\s*none;/
  );
  assert.match(
    stylesheet,
    /\.volume-marquee\[data-state="ready"\]\[data-carousel-control="static"\][\s\S]*?animation:\s*none;/
  );
  assert.match(
    stylesheet,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.volume-marquee__link\s*\{[\s\S]*?touch-action:\s*auto;/
  );
  assert.match(
    stylesheet,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.project-ticker__track,[\s\S]*?animation:\s*none;/
  );
  assert.match(
    stylesheet,
    /body\[data-motion-paused="true"\][\s\S]*?\.volume-marquee__track\s*\{[\s\S]*?animation-play-state:\s*paused;/
  );
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
    /(?:entry-gate|project-layer|project-frame|srcdoc|garment-node|volume-loader|volume\.bundle|<iframe)/i
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
  assert.match(html, /src="\/scripts\/home-media\.js"/);
  assert.match(html, /data-project-ticker/);
  assert.match(html, /data-project-ticker-track/);
  assert.match(html, /data-project-ticker-group/);
  assert.match(html, /data-volume-marquee/);
  assert.match(html, /data-volume-marquee-track/);
  assert.match(html, /href="\/projects\/volume\/"/);
  assert.match(html, /data-fashion-procession/);
  assert.match(html, /data-motion-toggle/);
  assert.match(html, /data-cycle-ms="50000"/);
  assert.match(html, /data-fashion-procession-viewport/);
  assert.match(
    html,
    /media="\(max-width: 47\.99rem\) and \(prefers-reduced-motion: no-preference\)"[\s\S]*?srcset="\/assets\/media\/fashion-turntables\/mobile-grid\.webp"/
  );
  assert.match(
    html,
    /media="\(max-width: 47\.99rem\)"[\s\S]*?srcset="\/assets\/media\/fashion-turntables\/mobile-grid-poster\.webp"/
  );
  assert.match(
    html,
    /href="\/practices\/fashion-garment-design\/#garment-gallery"/
  );
  assert.match(html, /data-practice-mosaic/);
  assert.match(html, /data-practice-mosaic-grid/);
  assert.match(html, /data-practice-mosaic-count/);
  assert.match(html, /class="identity-copy identity-directory"/);
  assert.match(html, /class="identity-reference-row"/);
  assert.match(html, /class="identity-registry-link" href="\/work\/"/);
  assert.match(html, /id="index-title" class="visually-hidden"/);
  const identityOpeningStart = html.indexOf('<div class="identity-opening">');
  const identityReferenceStart = html.indexOf(
    'class="identity-reference-row"',
    identityOpeningStart
  );
  const identityOpeningMarkup = html.slice(
    identityOpeningStart,
    identityReferenceStart
  );
  assert.doesNotMatch(identityOpeningMarkup, /Creative practice \/|across formats/);
  assert.doesNotMatch(
    identityOpeningMarkup,
    /Multidisciplinary design and creative production across fashion/
  );

  const tickerStart = html.indexOf("data-project-ticker");
  const tickerEnd = html.indexOf("</nav>", tickerStart);
  const tickerMarkup = html.slice(tickerStart, tickerEnd);
  assert.ok(tickerStart > -1 && tickerEnd > tickerStart);
  assert.doesNotMatch(tickerMarkup, /aria-live/);
  featuredRecords.forEach((record) => {
    assert.match(tickerMarkup, new RegExp(escapeRegExp(record.title)));
    assert.match(tickerMarkup, new RegExp(escapeRegExp(recordHref(record))));
  });

  const volumeIndex = html.indexOf("data-volume-marquee");
  const practiceIndex = html.indexOf("data-home-practices");
  const registryIndex = html.indexOf("identity-registry-link");
  const timelineIndex = html.indexOf("data-home-timeline");
  const recordsIndex = html.indexOf('class="home-records"');
  const activeRecordIndex = html.indexOf("data-selected-work");
  const selectedRegisterIndex = html.indexOf('class="selected-register"');
  const mosaicIndex = html.indexOf("data-practice-mosaic");
  const siteNavigationIndex = html.indexOf('<nav class="site-navigation"');
  assert.ok(tickerStart < volumeIndex);
  assert.ok(volumeIndex < practiceIndex);
  assert.ok(practiceIndex < registryIndex);
  assert.ok(registryIndex < timelineIndex);
  assert.ok(timelineIndex < recordsIndex);
  assert.ok(recordsIndex < activeRecordIndex);
  assert.ok(activeRecordIndex < selectedRegisterIndex);
  assert.ok(selectedRegisterIndex < mosaicIndex);
  assert.ok(mosaicIndex < siteNavigationIndex);
  assert.match(
    html.slice(html.lastIndexOf("<section"), siteNavigationIndex),
    /data-practice-mosaic/
  );
  assert.equal((html.match(/data-home-timeline/g) || []).length, 1);
  assert.equal((html.match(/data-home-practices/g) || []).length, 1);
  assert.match(
    html,
    /src="\/assets\/media\/fashion-turntables\/posters\/look-01\.webp"/
  );
  assert.doesNotMatch(html, /<canvas\b/i);
  assert.doesNotMatch(
    html,
    /(?:class="object-zone|class="system-object|System index \/ 00|system-object\.png|terminal-identity|data-story-instruction)/
  );
  assert.match(html, /01 \/ 28/);
  assert.match(html, /07 records/);
  assert.match(html, /href="\/projects\/allegra-halton\/"/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /aria-current="page"/);
  assert.doesNotMatch(html, /<details\b|<iframe\b/i);

  const cname = (await readFile(path.join(projectRoot, "CNAME"), "utf8")).trim();
  assert.equal(cname, "direction.design");

  const [workHtml, timelineHtml] = await Promise.all([
    readFile(path.join(projectRoot, "work/index.html"), "utf8"),
    readFile(path.join(projectRoot, "timeline/index.html"), "utf8")
  ]);
  assert.match(workHtml, /28 name records/);
  assert.match(workHtml, /data-registry-count>28 records/);
  assert.match(timelineHtml, /28 name records/);
  assert.match(timelineHtml, /Timeline \/ 2019—Present/);
});

test("the homepage turntable collection is complete, normalized, and web-bounded", async () => {
  const [manifest, preparedAssets] = await Promise.all([
    readFile(
      path.join(projectRoot, "assets/media/fashion-turntables/manifest.js"),
      "utf8"
    ),
    readFile(
      path.join(
        projectRoot,
        "assets/media/fashion-turntables/prepared-assets.json"
      ),
      "utf8"
    ).then(JSON.parse)
  ]);

  assert.equal(fashionTurntables.length, 20);
  assert.equal(new Set(fashionTurntables.map((look) => look.id)).size, 20);
  const manifestMedia = fashionTurntables
    .flatMap((look) => [look.src.slice(1), look.poster.slice(1)])
    .sort();
  assert.deepEqual(manifestMedia, [...allowedFashionTurntableMedia].sort());

  fashionTurntables.forEach((look) => {
    assert.equal(typeof look.scale, "number");
    assert.ok(look.scale > 0 && look.scale <= 1);
    assert.equal(typeof look.offsetY, "number");
    assert.ok(["full-body", "upper-body"].includes(look.crop));
    assert.match(look.src, /\.webp$/);
    assert.match(look.poster, /\.webp$/);
    assert.doesNotMatch(`${look.src} ${look.poster}`, /\.gif|\.glb/i);
  });

  const croppedLooks = fashionTurntables
    .filter((look) => look.crop === "upper-body")
    .map((look) => [look.sourceName, look.scale]);
  assert.deepEqual(croppedLooks, [
    ["Alien 2.gif", 0.82],
    ["Basics 3.gif", 0.56],
    ["1__06d1c551.gif", 0.62]
  ]);

  assert.equal(preparedAssets.length, 20);
  preparedAssets.forEach((look) => {
    assert.equal(look.frames, 108);
    assert.equal(look.fps, 12);
    assert.equal(look.durationMs, 9000);
  });

  const animationSizes = await Promise.all(
    allowedFashionAnimationMedia.map(async (relativeFile) => {
      return (await stat(path.join(projectRoot, relativeFile))).size;
    })
  );
  const posterSizes = await Promise.all(
    allowedFashionPosterMedia.map(async (relativeFile) => {
      return (await stat(path.join(projectRoot, relativeFile))).size;
    })
  );

  const animationBytes = animationSizes.reduce((total, size) => total + size, 0);
  const totalBytes = [...animationSizes, ...posterSizes].reduce(
    (total, size) => total + size,
    0
  );
  assert.ok(animationBytes < 40 * 1024 * 1024);
  assert.ok(totalBytes < 42 * 1024 * 1024);
  assert.ok(Math.max(...animationSizes) < 3 * 1024 * 1024);
  assert.doesNotMatch(manifest, /\.glb|fashion-sculptures|three/i);
});

test("the compact fashion composite is complete, animated, and byte-bounded", async () => {
  const metadata = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "assets/media/fashion-turntables/mobile-grid.json"
      ),
      "utf8"
    )
  );
  const [animationSize, posterSize] = await Promise.all(
    allowedFashionMobileMedia.map(async (relativeFile) =>
      (await stat(path.join(projectRoot, relativeFile))).size
    )
  );

  assert.deepEqual(
    {
      sourceCount: metadata.sourceCount,
      sourceFrames: metadata.sourceFrames,
      frames: metadata.frames,
      durationMs: metadata.durationMs,
      width: metadata.width,
      height: metadata.height
    },
    {
      sourceCount: 20,
      sourceFrames: 108,
      frames: 72,
      durationMs: 8928,
      width: 720,
      height: 720
    }
  );
  assert.ok(metadata.fps >= 8 && metadata.fps < 8.1);
  assert.equal(metadata.animatedBytes, animationSize);
  assert.equal(metadata.posterBytes, posterSize);
  assert.ok(animationSize < 1.5 * 1024 * 1024);
  assert.ok(posterSize < 32 * 1024);
  assert.ok(animationSize + posterSize < 1.55 * 1024 * 1024);
});

test("the homepage turntable runtime keeps five continuous looks and a bounded fallback", async () => {
  const [runtime, webpRuntime, stylesheet] = await Promise.all([
    readFile(path.join(projectRoot, "scripts/fashion-procession.js"), "utf8"),
    readFile(path.join(projectRoot, "scripts/animated-webp-rate.js"), "utf8"),
    readFile(path.join(projectRoot, "style.css"), "utf8")
  ]);

  assert.match(runtime, /const IMAGE_LOAD_TIMEOUT_MS = 8000/);
  assert.match(runtime, /const MAXIMUM_CACHED_LOOKS = 10/);
  assert.match(runtime, /const VISIBLE_LOOK_COUNT = 5/);
  assert.match(
    runtime,
    /const DISPLAY_OFFSETS = Object\.freeze\(\[-2, -1, 0, 1, 2, 3, 4, 5, 6\]\)/
  );
  assert.match(
    runtime,
    /const CACHE_OFFSETS = Object\.freeze\(\[\.\.\.DISPLAY_OFFSETS, 7\]\)/
  );
  assert.match(runtime, /setFallbackVisible\(true\)/);
  assert.match(runtime, /status === "timeout"|finish\("timeout"\)/);
  assert.match(runtime, /let cyclePosition = 0/);
  assert.match(runtime, /let targetCyclePosition = 0/);
  assert.match(runtime, /let manualMinimum = null/);
  assert.match(runtime, /let manualMaximum = null/);
  assert.match(runtime, /let manualOrigin = null/);
  assert.match(runtime, /const renderPosition = \(time\) =>/);
  assert.match(runtime, /cyclePosition = modulo\([\s\S]*?elapsed \/ cycleDuration/);
  assert.match(
    runtime,
    /cyclePosition = smoothCarouselPosition\([\s\S]*?targetCyclePosition,[\s\S]*?manualResponseForSpeed\(manualSpeed\)/
  );
  assert.match(runtime, /reconcileCache\(requiredIndexes, animatedIndexes\)/);
  assert.match(runtime, /reconcileCache\(requiredIndexes, openingIndexes\)/);
  assert.match(runtime, /lookStride = stageWidth \/ VISIBLE_LOOK_COUNT/);
  assert.match(
    runtime,
    /-stageWidth \* 0\.42 \+ position \* lookStride/
  );
  assert.match(runtime, /smoothstep\(1\.04, 1\.18, centre\)/);
  assert.match(runtime, /baseIndex !== renderedBaseIndex/);
  assert.match(
    runtime,
    /DISPLAY_OFFSETS\.forEach\(\(offset\) => \{[\s\S]*?const position = offset - fraction;[\s\S]*?showRecord\(record, position, opacity, time\)/
  );
  assert.match(
    runtime,
    /const prefetchedRecord = records\.get\([\s\S]*?CACHE_OFFSETS\.at\(-1\)[\s\S]*?prefetchedRecord\.element\.style\.visibility = "hidden"/
  );
  assert.doesNotMatch(runtime, /displayedIndexes\s*=\s*new Set/);
  assert.match(
    runtime,
    /const openingIndexes = \[-1, 0, 1, 2, 3, 4, 5\]/
  );
  assert.match(runtime, /createCarouselInteraction\(root, \{/);
  assert.match(
    runtime,
    /manualMaximum = cyclePosition \+ fashionTurntables\.length/
  );
  assert.match(
    runtime,
    /moveWithinBounds\([\s\S]*?targetCyclePosition,[\s\S]*?manualMinimum,[\s\S]*?manualMaximum/
  );
  assert.match(
    runtime,
    /!movement\.consumed &&[\s\S]*?Math\.abs\(targetCyclePosition - cyclePosition\) > 0\.0005[\s\S]*?consumed: true/
  );
  assert.match(
    runtime,
    /onSpeed: \(speed\) => \{[\s\S]*?setPlaybackRate\(speed\)/
  );
  assert.match(runtime, /let playbackApplyTimer = 0/);
  assert.match(runtime, /const applyPlaybackRate = \(rate\) =>/);
  assert.match(runtime, /record\.failedPlaybackRate === rate/);
  assert.match(runtime, /record\.playbackRetryAt = performance\.now\(\) \+ 5000/);
  assert.match(runtime, /record\.ready\.then\(/);
  assert.match(runtime, /record\.visible && record\.status === "ready"/);
  assert.match(runtime, /retimeAnimatedWebp\(buffer, rate\)/);
  assert.match(runtime, /URL\.createObjectURL/);
  assert.match(runtime, /record\.image\.src = blobUrl/);
  assert.match(runtime, /requestedPlaybackRate/);
  assert.match(runtime, /appliedPlaybackRate/);
  const playbackBlock = runtime.slice(
    runtime.indexOf("const requestRecordPlaybackRate"),
    runtime.indexOf("const setPlaybackRate")
  );
  assert.match(
    playbackBlock,
    /record\.image\.src = record\.definition\.src;[\s\S]*?commitRate\(\)/
  );
  assert.match(
    playbackBlock,
    /record\.image\.src = blobUrl;[\s\S]*?commitRate\(\)/
  );
  assert.match(runtime, /MAXIMUM_CACHED_ANIMATION_BUFFERS = 10/);
  assert.match(runtime, /animationBuffers\.clear\(\)/);
  assert.match(webpRuntime, /chunk === "ANMF"/);
  assert.match(webpRuntime, /Math\.round\(duration \/ rate\)/);
  assert.match(
    runtime,
    /opacity <= 0\.01[\s\S]*?style\.visibility = "hidden"[\s\S]*?style\.opacity = "0"/
  );
  assert.match(
    runtime,
    /reducedMotion\.addEventListener\("change", requestPresentationUpdate\)/
  );
  assert.match(
    runtime,
    /compactViewport\.addEventListener\("change", requestPresentationUpdate\)/
  );
  assert.match(runtime, /let stageIsVisible = false/);
  assert.match(
    runtime,
    /!stageIsVisible \|\|[\s\S]*?\(userPaused && !interactionPaused\) \|\|[\s\S]*?document\.hidden/
  );
  assert.match(
    runtime,
    /cyclePosition = modulo\(cyclePosition, fashionTurntables\.length\)/
  );
  assert.match(runtime, /mobile-grid-poster\.webp/);
  assert.match(runtime, /Boolean\(connection\?\.saveData\)/);
  const staticPredicate = runtime.match(
    /const shouldUseStaticPresentation = \(\) =>[\s\S]*?lowMemory;/
  )?.[0];
  assert.ok(staticPredicate);
  assert.doesNotMatch(staticPredicate, /compactViewport/);
  assert.match(runtime, /portfolio-motion-change/);
  assert.match(runtime, /const preloadImageSource = \(source\)/);

  const centreFor = (offset, fraction) =>
    0.5 - 0.42 + (offset - fraction) / 5;
  const smoothstep = (minimum, maximum, value) => {
    const progress = Math.min(
      1,
      Math.max(0, (value - minimum) / (maximum - minimum))
    );
    return progress * progress * (3 - 2 * progress);
  };
  const opacityFor = (offset, fraction) => {
    const centre = centreFor(offset, fraction);
    return Math.min(
      smoothstep(-0.1, 0.04, centre),
      1 - smoothstep(1.04, 1.18, centre)
    );
  };
  const displayOffsets = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
  [0, 0.25, 0.5, 0.75, 0.999999].forEach((fraction) => {
    assert.ok(
      displayOffsets.filter((offset) => opacityFor(offset, fraction) > 0.01)
        .length >= 5,
      `Fewer than five looks are visible at cycle fraction ${fraction}`
    );
  });
  const enteringBeforeBoundary = centreFor(5, 0.999999);
  const enteringAfterBoundary = centreFor(4, 0);
  assert.ok(Math.abs(enteringBeforeBoundary - enteringAfterBoundary) < 0.000001);
  assert.equal(opacityFor(5, 0.2), 1);
  assert.equal(opacityFor(0, 0.2), 1);
  assert.equal(opacityFor(5, 0.25), 1);
  assert.ok(opacityFor(0, 0.25) < 1);

  assert.match(
    stylesheet,
    /\.fashion-procession__image\s*\{[\s\S]*?-webkit-mask-image:[\s\S]*?mask-image:/
  );
  assert.match(
    stylesheet,
    /\.fashion-procession__fallback\[hidden\]\s*\{\s*display:\s*none;/
  );
  assert.match(
    stylesheet,
    /\.fashion-procession\s*\{[\s\S]*?--fashion-overlap:\s*clamp\(13rem, 22vw, 25rem\);[\s\S]*?margin-left:\s*calc\(var\(--fashion-overlap\) \* -1\);[\s\S]*?pointer-events:\s*auto;/
  );
  assert.match(
    stylesheet,
    /\.fashion-procession\s*\{[\s\S]*?touch-action:\s*pan-y pinch-zoom;/
  );
  assert.match(
    stylesheet,
    /\.fashion-procession__viewport\s*\{[\s\S]*?filter:\s*blur\(var\(--carousel-motion-blur\)\);[\s\S]*?transition:\s*filter 120ms linear;/
  );
  assert.match(
    stylesheet,
    /\.fashion-procession\s*\{[\s\S]*?--fashion-fade-start:\s*calc\([\s\S]*?var\(--fashion-overlap\) \+ clamp\(2rem, 3vw, 4rem\)[\s\S]*?--fashion-fade-mid:\s*calc\([\s\S]*?var\(--fashion-overlap\) \+ clamp\(6rem, 7vw, 9rem\)[\s\S]*?--fashion-fade-end:\s*calc\([\s\S]*?var\(--fashion-overlap\) \+ clamp\(13rem, 15vw, 18rem\)/
  );
  assert.match(
    stylesheet,
    /@media \(min-width: 64\.01rem\)[\s\S]*?\.fashion-procession__viewport\s*\{[\s\S]*?transparent var\(--fashion-fade-start\)[\s\S]*?rgba\(0, 0, 0, 0\.08\) var\(--fashion-fade-mid\)[\s\S]*?#000 var\(--fashion-fade-end\)/
  );
  assert.doesNotMatch(stylesheet, /\.identity-copy::before/);
  assert.match(
    stylesheet,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.fashion-procession,[\s\S]*?aspect-ratio:\s*1;/
  );
  assert.match(stylesheet, /@media \(max-width: 64rem\)/);
  assert.match(
    stylesheet,
    /\.garment-gallery\s*\{[\s\S]*?scroll-margin-top:/
  );
});
