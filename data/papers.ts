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

const ccBy = "https://creativecommons.org/licenses/by/4.0/";

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
    options: ["Delft University of Technology", "Eindhoven University of Technology", "KU Leuven", "ETH Zürich"],
    correct: 0,
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
    options: ["France", "Germany", "Italy", "Belgium"],
    correct: 0,
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
    options: ["University of Bristol", "University of Southampton", "Cranfield University", "University of Cambridge"],
    correct: 0,
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
];

export const playablePapers = papers.filter(
  (paper) => paper.rightsStatus === "approved" && paper.figures.length >= 2 && paper.figures.every((figure) => figure.rightsStatus === "approved"),
);
