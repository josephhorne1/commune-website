export const practiceGroups = [
  {
    id: "creative-direction",
    shortLabel: "Direction",
    label: "Creative Direction",
    description:
      "Concept, strategy, image, and teams shaped into one public-facing direction.",
    tags: [
      "creative-direction",
      "research-strategy",
      "fashion-communications",
      "worldbuilding"
    ]
  },
  {
    id: "fashion-garment-design",
    shortLabel: "Fashion",
    label: "Fashion & Garment Design",
    description:
      "Garments, technical development, styling, and manufacturing considered as one practice.",
    tags: [
      "fashion-design",
      "garment-design",
      "technical-design",
      "footwear-design",
      "styling",
      "manufacturing"
    ]
  },
  {
    id: "visual-identity-graphic-design",
    shortLabel: "Identity",
    label: "Visual Identity & Graphic Design",
    description:
      "Identity systems, print, packaging, campaigns, and visual communication.",
    tags: [
      "visual-identity",
      "graphic-design",
      "brand-strategy",
      "packaging",
      "print-production",
      "advertising"
    ]
  },
  {
    id: "image-film",
    shortLabel: "Image",
    label: "Image & Film",
    description:
      "Photography, moving image, retouching, production design, and image direction.",
    tags: [
      "image-direction",
      "photography",
      "film-video",
      "campaign-direction",
      "retouching",
      "ecommerce-content",
      "production-design"
    ]
  },
  {
    id: "product-3d",
    shortLabel: "Product",
    label: "Product & 3D",
    description:
      "Objects, spatial systems, 3D development, and installation.",
    tags: [
      "product-design",
      "3d-development",
      "spatial-design",
      "installation-design"
    ]
  },
  {
    id: "music-live-experience",
    shortLabel: "Live",
    label: "Music & Live Experience",
    description:
      "Live production, performance environments, campaign systems, and sound-led work.",
    tags: [
      "music-sound",
      "music-live-production",
      "event-production"
    ]
  }
];

export const portfolioRecords = [
  {
    id: "volume",
    slug: "volume",
    title: "Volume",
    kind: "body",
    startYear: 2023,
    endYear: null,
    ongoing: true,
    featuredRank: 1,
    overviewLabel: "Independent Practice",
    contexts: ["self-directed"],
    practices: [
      "creative-direction",
      "fashion-design",
      "garment-design",
      "3d-development",
      "graphic-design",
      "image-direction",
      "photography",
      "film-video",
      "music-sound",
      "styling",
      "visual-identity",
      "worldbuilding"
    ],
    parentId: null,
    relatedIds: ["suburban-propaganda"],
    contentStatus: "empty",
    legacyProject: false
  },
  {
    id: "toronto-metropolitan-university",
    slug: "toronto-metropolitan-university",
    title: "Toronto Metropolitan University",
    kind: "education",
    startYear: 2019,
    endYear: 2024,
    ongoing: false,
    featuredRank: null,
    contexts: ["education"],
    practices: [
      "fashion-communications",
      "creative-direction",
      "fashion-design",
      "graphic-design",
      "image-direction",
      "research-strategy"
    ],
    parentId: null,
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "index-index",
    slug: "index-index",
    title: "INDEX INDEX",
    kind: "project",
    startYear: 2021,
    endYear: 2021,
    ongoing: false,
    featuredRank: null,
    contexts: ["education"],
    practices: [
      "brand-strategy",
      "product-design",
      "fashion-design",
      "visual-identity",
      "research-strategy",
      "packaging"
    ],
    parentId: "toronto-metropolitan-university",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "aira-bumi",
    slug: "aira-bumi",
    title: "Aira Bumi",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["education"],
    practices: [
      "footwear-design",
      "product-design",
      "brand-strategy",
      "visual-identity",
      "research-strategy",
      "packaging"
    ],
    parentId: "toronto-metropolitan-university",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "interstice",
    slug: "interstice",
    title: "Interstice",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: 6,
    overviewLabel: "Garment / Installation",
    contexts: ["education"],
    practices: [
      "creative-direction",
      "fashion-design",
      "garment-design",
      "installation-design",
      "image-direction",
      "worldbuilding"
    ],
    parentId: "toronto-metropolitan-university",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "image-making",
    slug: "image-making",
    title: "Image Making",
    kind: "project",
    startYear: 2024,
    endYear: 2024,
    ongoing: false,
    featuredRank: null,
    contexts: ["education"],
    practices: ["image-direction", "photography", "graphic-design"],
    parentId: "toronto-metropolitan-university",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "suburban-propaganda",
    slug: "suburban-propaganda",
    title: "Suburban Propaganda",
    kind: "body",
    startYear: 2020,
    endYear: 2024,
    ongoing: false,
    featuredRank: null,
    contexts: ["self-directed"],
    practices: [
      "fashion-design",
      "garment-design",
      "3d-development",
      "graphic-design",
      "image-direction",
      "worldbuilding"
    ],
    parentId: null,
    relatedIds: ["volume"],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "570",
    slug: "570",
    title: "570 / The Pillow Bag",
    kind: "body",
    startYear: 2021,
    endYear: 2024,
    ongoing: false,
    featuredRank: 2,
    overviewLabel: "Product / 3D",
    contexts: ["self-directed"],
    practices: [
      "creative-direction",
      "product-design",
      "fashion-design",
      "3d-development",
      "visual-identity",
      "campaign-direction",
      "manufacturing",
      "event-production"
    ],
    parentId: null,
    relatedIds: ["the-pillow-bag"],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "the-pillow-bag",
    slug: "the-pillow-bag",
    title: "The Pillow Bag",
    kind: "project",
    startYear: 2022,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["self-directed"],
    practices: [
      "product-design",
      "fashion-design",
      "3d-development",
      "manufacturing",
      "campaign-direction"
    ],
    parentId: "570",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true,
    legacyRoute: "projects/570/"
  },
  {
    id: "pupil-sean-leon",
    slug: "pupil-sean-leon",
    title: "PUPIL / Sean Leon",
    kind: "experience",
    startYear: 2022,
    endYear: 2024,
    ongoing: false,
    featuredRank: 3,
    overviewLabel: "Music / Live",
    contexts: ["industry"],
    practices: [
      "garment-design",
      "graphic-design",
      "campaign-direction",
      "music-live-production",
      "event-production",
      "spatial-design",
      "production-design"
    ],
    parentId: null,
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "live-at-the-drake-underground",
    slug: "live-at-the-drake-underground",
    title: "Live @ the Drake Underground",
    kind: "project",
    startYear: 2022,
    endYear: 2022,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: [
      "event-production",
      "music-live-production",
      "spatial-design",
      "graphic-design"
    ],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "yofc",
    slug: "yofc",
    title: "YOFC",
    kind: "project",
    startYear: 2022,
    endYear: 2022,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "burn-everything",
    slug: "burn-everything",
    title: "Burn Everything",
    kind: "project",
    startYear: 2022,
    endYear: 2022,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "herd-immunity",
    slug: "herd-immunity",
    title: "Herd Immunity",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "billboards",
    slug: "billboards",
    title: "Billboards",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "advertising"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "blood",
    slug: "blood",
    title: "Blood",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "the-glade",
    slug: "the-glade",
    title: "The Glade",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "aquarious",
    slug: "aquarious",
    title: "Aquarious",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: ["graphic-design", "campaign-direction", "music-live-production"],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "in-loving-memory",
    slug: "in-loving-memory",
    title: "In Loving Memory",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: [
      "creative-direction",
      "graphic-design",
      "campaign-direction",
      "music-live-production"
    ],
    parentId: "pupil-sean-leon",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "mass-ex",
    slug: "mass-ex",
    title: "Mass Exodus / Slate",
    kind: "event",
    startYear: 2023,
    endYear: 2024,
    ongoing: false,
    featuredRank: 4,
    overviewLabel: "Direction / Identity",
    contexts: ["education", "industry"],
    practices: [
      "creative-direction",
      "visual-identity",
      "graphic-design",
      "campaign-direction",
      "event-production",
      "spatial-design",
      "print-production",
      "film-video"
    ],
    parentId: "toronto-metropolitan-university",
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "city-of-k-prophet-hoodie",
    slug: "city-of-k-prophet-hoodie",
    title: "City_of_K Prophet Hoodie",
    kind: "project",
    startYear: 2023,
    endYear: 2023,
    ongoing: false,
    featuredRank: null,
    contexts: ["industry"],
    practices: [
      "fashion-design",
      "garment-design",
      "technical-design",
      "product-design"
    ],
    parentId: null,
    relatedIds: ["city-of-k-lookbook"],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "muhann",
    slug: "muhann",
    title: "Muhann.Studio",
    kind: "project",
    startYear: 2024,
    endYear: 2024,
    ongoing: false,
    featuredRank: 5,
    overviewLabel: "Image / Direction",
    contexts: ["industry"],
    practices: [
      "creative-direction",
      "styling",
      "photography",
      "retouching",
      "campaign-direction",
      "ecommerce-content"
    ],
    parentId: null,
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "city-of-k-lookbook",
    slug: "city-of-k-lookbook",
    title: "City_of_K Lookbook",
    kind: "project",
    startYear: 2021,
    endYear: 2021,
    ongoing: false,
    featuredRank: null,
    contexts: ["self-directed"],
    practices: [
      "image-direction",
      "photography",
      "styling",
      "campaign-direction"
    ],
    parentId: null,
    relatedIds: ["city-of-k-prophet-hoodie"],
    contentStatus: "empty",
    legacyProject: true
  },
  {
    id: "antony-riddle",
    slug: "antony-riddle",
    title: "Antony Riddle",
    kind: "project",
    startYear: 2021,
    endYear: 2021,
    ongoing: false,
    featuredRank: null,
    contexts: ["self-directed"],
    practices: ["creative-direction"],
    parentId: null,
    relatedIds: [],
    contentStatus: "empty",
    legacyProject: true
  }
];

export const legacyProjectTitles = portfolioRecords
  .filter((record) => record.legacyProject)
  .map((record) => record.title);

export const featuredRecords = portfolioRecords
  .filter((record) => Number.isInteger(record.featuredRank))
  .sort((a, b) => a.featuredRank - b.featuredRank);

export const contextLabels = Object.freeze({
  "self-directed": "Independent",
  industry: "Industry",
  education: "Academic"
});

export const templateFamilies = Object.freeze([
  {
    id: "dossier",
    label: "Registry Dossier",
    purpose: "Direction, identity, event, campaign, and conventional case studies."
  },
  {
    id: "folio",
    label: "Visual Folio",
    purpose: "Image, fashion, garment, film, and spatially led work."
  },
  {
    id: "system",
    label: "System / Process Study",
    purpose: "Product, 3D, fabrication, identity systems, and production development."
  },
  {
    id: "collection",
    label: "Collection Container",
    purpose: "Bodies of work, employment, and education that contain child records."
  }
]);

export function recordHref(record) {
  return `/projects/${record.slug}/`;
}

export function practiceHref(practice) {
  return `/practices/${practice.id}/`;
}

export function recordPeriod(record) {
  if (record.ongoing) return `${record.startYear}—Present`;
  if (record.endYear === null || record.startYear === record.endYear) {
    return String(record.startYear);
  }
  return `${record.startYear}—${record.endYear}`;
}

export function recordContext(record) {
  return record.contexts
    .map((context) => contextLabels[context] || context)
    .join(" / ");
}

export function recordKind(record) {
  const labels = {
    body: "Body of work",
    education: "Education",
    event: "Event",
    experience: "Experience",
    project: "Project"
  };
  return labels[record.kind] || record.kind;
}

export function childrenForRecord(recordId) {
  return portfolioRecords.filter((record) => record.parentId === recordId);
}

export function recordById(recordId) {
  return portfolioRecords.find((record) => record.id === recordId) || null;
}

export function recordBySlug(slug) {
  return portfolioRecords.find((record) => record.slug === slug) || null;
}

export function templateForRecord(record) {
  if (["body", "education", "experience"].includes(record.kind)) {
    return "collection";
  }

  const systemTags = new Set([
    "3d-development",
    "installation-design",
    "manufacturing",
    "product-design",
    "spatial-design",
    "technical-design"
  ]);
  const folioTags = new Set([
    "campaign-direction",
    "fashion-design",
    "film-video",
    "garment-design",
    "image-direction",
    "photography",
    "styling"
  ]);

  if (record.practices.some((tag) => systemTags.has(tag))) return "system";
  if (record.practices.some((tag) => folioTags.has(tag))) return "folio";
  return "dossier";
}

export function recordsForPractice(practiceId) {
  const group = practiceGroups.find((candidate) => candidate.id === practiceId);
  if (!group) return [];

  return portfolioRecords.filter((record) =>
    record.practices.some((tag) => group.tags.includes(tag))
  );
}
