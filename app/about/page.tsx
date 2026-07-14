import type { Metadata } from "next";
import Link from "next/link";
import { collectionCatalog, collectionStats } from "../../data/papers";

export const metadata: Metadata = {
  title: "About Paper Picture — Computer graphics research game",
  description: "Why Paper Picture turns real computer graphics and digital geometry research figures into a short, traceable guessing game.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Paper Picture — Computer graphics research game",
    description: "A visual guessing game built from real, openly licensed research figures.",
    url: "/about",
  },
};

export default function AboutPage() {
  const totals = collectionCatalog.reduce((result, collection) => {
    const stats = collectionStats(collection.id);
    return { papers: result.papers + stats.paperCount, figures: result.figures + stats.figureCount };
  }, { papers: 0, figures: 0 });

  return (
    <main className="legal-shell">
      <a className="skip-link" href="#about">Skip to about Paper Picture</a>
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" href="/"><span className="brand-mark">PP</span><span>Paper Picture</span></Link>
        <div className="profile-nav-actions"><Link href="/test-guide">How it works</Link><Link href="/profile">My games</Link></div>
      </nav>
      <article id="about">
        <div className="eyebrow"><span /> About Paper Picture</div>
        <h1>A computer graphics research paper guessing game.</h1>
        <p>Paper Picture starts with an image from a real research paper. You study the figure, choose an answer, and then discover the paper, its authors, institution, venue, topic, and original source. Games cover computer graphics, digital geometry processing, mesh generation, geometric modelling, CAD, and related numerical methods.</p>

        <div className="about-facts" aria-label="Current Paper Picture collection">
          <div><strong>{totals.papers}</strong><span>rights-reviewed papers</span></div>
          <div><strong>{totals.figures}</strong><span>openly licensed figures</span></div>
          <div><strong>{collectionCatalog.length}</strong><span>frozen collections</span></div>
        </div>

        <h2>Why Paper Picture exists</h2>
        <p>The idea began while Selay Tekgül was studying for an MSc in computer engineering with a focus on computer graphics and digital geometry processing. It returned to the foreground after an SMI conference presented its best-paper awards through the papers&apos; pictures. A research image could be more than an illustration: it could become an invitation to recognize the people, groups, universities, and countries behind the work.</p>

        <h2>Real papers and traceable figures</h2>
        <p>The game does not use fictional papers. Every published figure in the current collections has recorded source and licence evidence, and each answer reveals links back to the publication, figure source, and reusable licence. Collections are frozen after release so their questions, scores, and evidence remain reproducible.</p>

        <h2>Play first, read next</h2>
        <p>No sign-in is required to play. Optional private profiles save completed games without creating public rankings or social profiles. After an answer, the paper can also be opened on <a href="https://paperlog.net" target="_blank" rel="noreferrer">Paperlog</a>, a connected reading diary for research papers.</p>

        <h2>Created openly</h2>
        <p>Paper Picture is created by <a href="https://selaytekgul.com" target="_blank" rel="noreferrer">Selay Tekgül</a>. The application source is public on <a href="https://github.com/selaytekgul/paper-picture" target="_blank" rel="noreferrer">GitHub</a>. Corrections, accessibility reports, rights questions, and takedown requests can be sent through the <Link href="/feedback">feedback form</Link>.</p>

        <div className="about-links">
          <Link className="primary-button" href="/">Play Paper Picture <span>→</span></Link>
          <Link className="secondary-button" href="/test-guide">See how it works</Link>
        </div>
      </article>
    </main>
  );
}
