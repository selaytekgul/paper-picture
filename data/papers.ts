import { collection02, papers02 } from "./open-graphics-02";

export type PaperFigure = {
  src: string;
  number: string;
  caption: string;
  alt: string;
  sourceUrl: string;
  license: "CC BY 4.0";
  licenseUrl: string;
  modifications: string;
  rightsStatus: "approved";
};

export type Paper = {
  id: string;
  title: string;
  year: number;
  journal: string;
  doi: string;
  paperUrl: string;
  authors: string;
  topic: string;
  questionType: "institution" | "country";
  question: string;
  institution: string;
  country: string;
  options: string[];
  correct: number;
  rightsStatus: "approved";
  licenseEvidenceUrl: string;
  figures: PaperFigure[];
};

export type GameMode = "institution" | "country" | "author" | "venue" | "year" | "topic";

export const gameModes: { id: GameMode; label: string; description: string }[] = [
  { id: "institution", label: "Institution", description: "Match a paper to an author affiliation." },
  { id: "country", label: "Country", description: "Locate the first listed affiliation." },
  { id: "author", label: "Author", description: "Recognize a researcher from the figures." },
  { id: "venue", label: "Venue", description: "Guess the publication venue." },
  { id: "year", label: "Year", description: "Place the paper in time." },
  { id: "topic", label: "Topic", description: "Identify the research area." },
];

const ccBy = "https://creativecommons.org/licenses/by/4.0/";

export const collection = {
  id: "open-graphics-01-v1",
  legacyId: "open-graphics-01",
  title: "Open Graphics Collection 01",
  version: "1.0",
  label: "Open Graphics Collection 01 · v1.0",
  frozenAt: "2026-07-12",
  description: "Geometry processing, meshing, CAD, and optimization",
} as const;

export const papers: Paper[] = [
  {
    id: "goal-adaptive-meshing",
    title: "Goal-adaptive Meshing of Isogeometric Kirchhoff–Love Shells",
    year: 2024,
    journal: "Engineering with Computers",
    doi: "10.1007/s00366-024-01958-4",
    paperUrl: "https://link.springer.com/article/10.1007/s00366-024-01958-4",
    authors: "H. M. Verhelst · A. Mantzaflaris · M. Möller · J. H. Den Besten",
    topic: "Adaptive meshing",
    questionType: "institution",
    question: "Which university lists H. M. Verhelst as an affiliated author?",
    institution: "Delft University of Technology",
    country: "The Netherlands",
    options: ["KU Leuven", "ETH Zürich", "Eindhoven University of Technology", "Delft University of Technology"],
    correct: 3,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00366-024-01958-4#rightslink",
    figures: [
      {
        src: "/papers/goal-adaptive/fig11.png",
        number: "Figure 11",
        caption: "Buckling modes and error estimates for a square plate.",
        alt: "Four colored square-plate buckling modes above corresponding convergence plots.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-024-01958-4/figures/11",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/goal-adaptive/fig15.png",
        number: "Figure 15",
        caption: "Error fields for uniformly and adaptively refined meshes.",
        alt: "A grid of blue, green, and orange adaptive mesh error fields at increasing refinement levels.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-024-01958-4/figures/15",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/goal-adaptive/fig13.jpg",
        number: "Figure 13",
        caption: "Deformed membrane from the adaptive meshing benchmark.",
        alt: "A softly shaded, deformed square membrane surface with diagonal folds.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-024-01958-4/figures/13",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
  {
    id: "functional-maps-morphing",
    title: "Functional maps regularization for high quality mesh morphing applied to shape registration in computed tomography",
    year: 2026,
    journal: "Engineering with Computers",
    doi: "10.1007/s00366-025-02243-8",
    paperUrl: "https://link.springer.com/article/10.1007/s00366-025-02243-8",
    authors: "Amelia Ferhat · Henry Proudhon · Clement Remacha · David Ryckelynck",
    topic: "Geometry processing",
    questionType: "country",
    question: "In which country is Amelia Ferhat’s first listed affiliation located?",
    institution: "MINES ParisTech, PSL University",
    country: "France",
    options: ["Germany", "Belgium", "France", "Italy"],
    correct: 2,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00366-025-02243-8#rightslink",
    figures: [
      {
        src: "/papers/functional-maps/fig3.png",
        number: "Figure 3",
        caption: "Bijectively matched CAD-mesh nodes under three mapping methods.",
        alt: "Three gray 3D component meshes with progressively denser matched nodes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-025-02243-8/figures/3",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/functional-maps/fig6.png",
        number: "Figure 6",
        caption: "Comparison between CAD, deformed CAD, and tomographic meshes.",
        alt: "Two grayscale renderings of a turbine-blade core component with a deviation scale.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-025-02243-8/figures/6",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/functional-maps/fig4.png",
        number: "Figure 4",
        caption: "Matched CAD and real-object mesh nodes under three mapping methods.",
        alt: "Three paired turbine component meshes connected by increasingly dense correspondence lines.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-025-02243-8/figures/4",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
  {
    id: "topology-aerodynamic",
    title: "Topology-inclusive aerodynamic shape optimisation using a cellular automata parameterisation",
    year: 2025,
    journal: "Structural and Multidisciplinary Optimization",
    doi: "10.1007/s00158-024-03916-6",
    paperUrl: "https://link.springer.com/article/10.1007/s00158-024-03916-6",
    authors: "M. J. Wood · T. C. S. Rendall · C. B. Allen · L. J. Kedward · N. J. Taylor · J. Fincham · N. E. Leppard",
    topic: "Geometric optimization",
    questionType: "institution",
    question: "Which university lists M. J. Wood as an affiliated author?",
    institution: "University of Bristol",
    country: "United Kingdom",
    options: ["University of Cambridge", "University of Bristol", "University of Southampton", "Cranfield University"],
    correct: 1,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00158-024-03916-6#rightslink",
    figures: [
      {
        src: "/papers/topology-aero/fig2.png",
        number: "Figure 2",
        caption: "Two cellular-automata geometries with different topologies.",
        alt: "Two black and white cellular domains outlined in red, one connected and one separated.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00158-024-03916-6/figures/2",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/topology-aero/fig28.png",
        number: "Figure 28",
        caption: "Mach and pressure-coefficient fields around optimized packaged geometries.",
        alt: "Three vivid simulation fields showing Mach flow around single and paired aerodynamic shapes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00158-024-03916-6/figures/28",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/topology-aero/fig26.png",
        number: "Figure 26",
        caption: "Optimal geometry after three optimization-refinement cycles.",
        alt: "Three red aerodynamic profiles over progressively refined rectangular control meshes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00158-024-03916-6/figures/26",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
  {
    id: "mesh-assimilation",
    title: "Be water my friend: mesh assimilation",
    year: 2021,
    journal: "The Visual Computer",
    doi: "10.1007/s00371-021-02183-6",
    paperUrl: "https://link.springer.com/article/10.1007/s00371-021-02183-6",
    authors: "Dennis R. Bukenberger · Hendrik P. A. Lensch",
    topic: "Surface reconstruction",
    questionType: "country",
    question: "In which country is Dennis R. Bukenberger’s listed university located?",
    institution: "University of Tübingen",
    country: "Germany",
    options: ["Germany", "Austria", "Switzerland", "The Netherlands"],
    correct: 0,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00371-021-02183-6#rightslink",
    figures: [
      {
        src: "/papers/mesh-assimilation/fig1.jpg",
        number: "Figure 1",
        caption: "A low-poly initialization mesh grows within a target point cloud and reconstructs fine detail.",
        alt: "Eleven stages of a coarse mesh expanding through a point cloud to reconstruct a human hand.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-021-02183-6/figures/1",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/mesh-assimilation/fig9.png",
        number: "Figure 9",
        caption: "Mesh construction on noisy input at three noise magnitudes.",
        alt: "Three rainbow-colored reconstructions of a mechanical test shape with increasing surface noise.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-021-02183-6/figures/9",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/mesh-assimilation/fig13.png",
        number: "Figure 13",
        caption: "Adaptive meshing results driven by local surface curvature and sample density.",
        alt: "A scanned bust and sphere shown as samples, adaptive triangle meshes, and reconstructed surfaces.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-021-02183-6/figures/13",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
  {
    id: "tubular-hex-meshing",
    title: "Higher-order block-structured hex meshing of tubular structures",
    year: 2024,
    journal: "Engineering with Computers",
    doi: "10.1007/s00366-023-01834-7",
    paperUrl: "https://link.springer.com/article/10.1007/s00366-023-01834-7",
    authors: "Domagoj Bošnjak · Antonio Pepe · Richard Schussnig · Dieter Schmalstieg · Thomas-Peter Fries",
    topic: "Hex mesh generation",
    questionType: "institution",
    question: "Which university lists Domagoj Bošnjak as an affiliated author?",
    institution: "Graz University of Technology",
    country: "Austria",
    options: ["University of Augsburg", "TU Wien", "ETH Zürich", "Graz University of Technology"],
    correct: 3,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00366-023-01834-7#rightslink",
    figures: [
      {
        src: "/papers/tubular-hex/fig19.png",
        number: "Figure 19",
        caption: "Four synthetic meshes shown together with their radius-encoded skeletons.",
        alt: "Four red-and-blue skeleton graphs paired with complex yellow tubular hexahedral meshes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-023-01834-7/figures/19",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/tubular-hex/fig20.png",
        number: "Figure 20",
        caption: "A patient-specific aorta from skeleton and block structure to refined higher-order meshes.",
        alt: "Five stages of an aorta model progressing from a red-and-blue skeleton to dense yellow meshes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-023-01834-7/figures/20",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/tubular-hex/fig21.png",
        number: "Figure 21",
        caption: "A patient-specific coronary artery from skeleton to refined linear and quadratic meshes.",
        alt: "Five stages of a branching coronary artery progressing from a skeleton to refined yellow meshes.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00366-023-01834-7/figures/21",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
  {
    id: "cadgcl-retrieval",
    title: "CADGCL: unsupervised retrieval of CAD models via boundary representations",
    year: 2025,
    journal: "The Visual Computer",
    doi: "10.1007/s00371-025-03949-y",
    paperUrl: "https://link.springer.com/article/10.1007/s00371-025-03949-y",
    authors: "Feiwei Qin · Liangzhe Zhu · Zijian Xu · Meie Fang · Ping Li",
    topic: "CAD retrieval",
    questionType: "institution",
    question: "Which university lists Feiwei Qin as an affiliated author?",
    institution: "Hangzhou Dianzi University",
    country: "China",
    options: ["Guangzhou University", "The Hong Kong Polytechnic University", "Hangzhou Dianzi University", "Zhejiang University"],
    correct: 2,
    rightsStatus: "approved",
    licenseEvidenceUrl: "https://link.springer.com/article/10.1007/s00371-025-03949-y#rightslink",
    figures: [
      {
        src: "/papers/cadgcl/fig1.png",
        number: "Figure 1",
        caption: "Overview of the CADGCL data augmentation, contrastive learning, and negative-sampling pipeline.",
        alt: "A pastel flow diagram connecting CAD graph augmentation, graph encoders, embeddings, and mixture-model fitting.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-025-03949-y/figures/1",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/cadgcl/fig2.png",
        number: "Figure 2",
        caption: "A CAD model and its corresponding boundary-representation attribute graph.",
        alt: "A gray stepped cylinder is decomposed into analytic surfaces and then represented as a colored graph.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-025-03949-y/figures/2",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
      {
        src: "/papers/cadgcl/fig4.png",
        number: "Figure 4",
        caption: "CAD retrieval results, with each query followed by geometrically related results.",
        alt: "Rows of retrieved gears, fasteners, channels, bearings, springs, rails, and mechanical housings.",
        sourceUrl: "https://link.springer.com/article/10.1007/s00371-025-03949-y/figures/4",
        license: "CC BY 4.0",
        licenseUrl: ccBy,
        modifications: "Unmodified publisher-provided figure image; resized by the browser.",
        rightsStatus: "approved",
      },
    ],
  },
];

export const playablePapers = papers.filter(
  (paper) => paper.rightsStatus === "approved" && paper.figures.length >= 2 && paper.figures.every((figure) => figure.rightsStatus === "approved"),
);

export const collectionPaperCount = playablePapers.length;
export const collectionFigureCount = playablePapers.reduce((total, paper) => total + paper.figures.length, 0);
export const maximumCollectionScore = collectionPaperCount * 100;
export const pointsForImagesSeen = (imagesSeen: number) => Math.max(10, 100 - (Math.max(1, imagesSeen) - 1) * 30);

export type PaperCollection = typeof collection | typeof collection02;

const isPlayable = (paper: Paper) => paper.rightsStatus === "approved" && paper.figures.length >= 2 && paper.figures.every((figure) => figure.rightsStatus === "approved");

export const collectionCatalog = [collection, collection02] as const;
export const allPapers = [...papers, ...papers02].filter(isPlayable);

export function getCollection(collectionId: string): PaperCollection | undefined {
  return collectionCatalog.find((candidate) => candidate.id === collectionId || candidate.legacyId === collectionId);
}

export function getPlayablePapers(collectionId: string) {
  if (collectionId === collection02.id || collectionId === collection02.legacyId) return papers02.filter(isPlayable);
  if (collectionId === collection.id || collectionId === collection.legacyId) return playablePapers;
  return [];
}

export function collectionStats(collectionId: string) {
  const selected = getPlayablePapers(collectionId);
  return {
    paperCount: selected.length,
    figureCount: selected.reduce((total, paper) => total + paper.figures.length, 0),
    maximumScore: selected.length * 100,
  };
}

export type RoundQuestion = {
  type: GameMode;
  label: string;
  prompt: string;
  options: string[];
  correct: number;
  answer: string;
};

export function buildRoundQuestion(paper: Paper, mode: GameMode): RoundQuestion {
  const anchorAuthor = paper.authors.split(" · ")[0];
  const answer = answerForMode(paper, mode);
  const candidates = unique(allPapers.map((candidate) => answerForMode(candidate, mode))).filter((candidate) => candidate !== answer);
  const distractors = seededOrder(candidates, `${paper.id}:${mode}:distractors`).slice(0, 3);
  const options = seededOrder([answer, ...distractors], `${paper.id}:${mode}:options`);
  const prompts: Record<GameMode, string> = {
    institution: `Which institution lists ${anchorAuthor} as an affiliated author?`,
    country: `In which country is ${anchorAuthor}’s verified affiliation located?`,
    author: "Which researcher is listed as an author of this paper?",
    venue: "In which venue was this paper published?",
    year: "In which year was this paper published?",
    topic: "Which topic best describes this paper?",
  };
  return { type: mode, label: gameModes.find((candidate) => candidate.id === mode)?.label ?? mode, prompt: prompts[mode], options, correct: options.indexOf(answer), answer };
}

function answerForMode(paper: Paper, mode: GameMode) {
  if (mode === "institution") return paper.institution;
  if (mode === "country") return paper.country;
  if (mode === "author") return paper.authors.split(" · ")[0];
  if (mode === "venue") return paper.journal;
  if (mode === "year") return String(paper.year);
  return paper.topic;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function seededOrder(values: string[], seed: string) {
  return [...values].sort((left, right) => stableHash(`${seed}:${left}`) - stableHash(`${seed}:${right}`));
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function collectionLabel(collectionId: string) {
  const selected = getCollection(collectionId);
  if (!selected) return collectionId;
  return collectionId === selected.legacyId ? `${selected.title} · legacy` : selected.label;
}
