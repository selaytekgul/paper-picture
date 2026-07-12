"use client";

import { useMemo, useState } from "react";

type Paper = {
  id: string;
  title: string;
  institution: string;
  country: string;
  authors: string;
  topic: string;
  options: string[];
  correct: number;
  visual: "mesh" | "fluid" | "flora";
};

const papers: Paper[] = [
  {
    id: "demo-geometry",
    title: "Spectral Weaving of Animated Surface Fields",
    institution: "Northbridge Institute of Technology",
    country: "Switzerland",
    authors: "Mira Chen · Leon Varga · Ada Ren",
    topic: "Geometry processing",
    options: ["Northbridge Institute of Technology", "Bellweather University", "Arcadia Technical University", "Westmere Research Lab"],
    correct: 0,
    visual: "mesh",
  },
  {
    id: "demo-fluid",
    title: "Vortex Sketching for Art-Directed Fluids",
    institution: "Bellweather University",
    country: "Canada",
    authors: "Noah Bell · Ece Kaya · Imani Cole",
    topic: "Physical simulation",
    options: ["Arcadia Technical University", "Bellweather University", "Northbridge Institute of Technology", "Westmere Research Lab"],
    correct: 1,
    visual: "fluid",
  },
  {
    id: "demo-flora",
    title: "Branch by Branch: Controllable Botanical Growth",
    institution: "Arcadia Technical University",
    country: "Japan",
    authors: "Rin Sato · Alma Ortiz · Theo Moss",
    topic: "Procedural modeling",
    options: ["Westmere Research Lab", "Northbridge Institute of Technology", "Arcadia Technical University", "Bellweather University"],
    correct: 2,
    visual: "flora",
  },
];

function ResearchVisual({ kind, reveal }: { kind: Paper["visual"]; reveal: number }) {
  return (
    <div className={`research-visual visual-${kind} reveal-${reveal}`} role="img" aria-label="Abstract demo visualization created for this prototype">
      <div className="figure-grid" />
      <div className="figure-object object-a" />
      <div className="figure-object object-b" />
      <div className="figure-object object-c" />
      <div className="figure-label">FIG. {reveal + 1}</div>
      <div className="figure-scale"><span /></div>
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const paper = papers[round];
  const potential = [100, 70, 40][reveal];
  const progress = useMemo(() => ((round + (selected !== null ? 1 : 0)) / papers.length) * 100, [round, selected]);

  function choose(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === paper.correct) setScore((value) => value + potential);
  }

  function nextRound() {
    if (round === papers.length - 1) {
      setComplete(true);
      return;
    }
    setRound((value) => value + 1);
    setReveal(0);
    setSelected(null);
  }

  function restart() {
    setRound(0);
    setReveal(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
    setStarted(true);
  }

  if (!started) {
    return (
      <main className="landing-shell">
        <nav className="topbar">
          <a className="brand" href="#top" aria-label="Paper Picture home"><span className="brand-mark">PP</span><span>Paper Picture</span></a>
          <div className="nav-note">SIGGRAPH 2025 · prototype collection</div>
        </nav>
        <section className="hero" id="top">
          <div className="hero-copy">
            <div className="eyebrow"><span /> A visual research game</div>
            <h1>Can you read<br />a paper by its <em>pictures?</em></h1>
            <p>Study one figure. Guess the institution. Reveal more visual evidence when you need it—but every clue costs points.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setStarted(true)}>Play the prototype <span>→</span></button>
              <span className="time-note">3 demo rounds · about 2 min</span>
            </div>
          </div>
          <div className="hero-specimen" aria-hidden="true">
            <div className="specimen-number">01</div>
            <ResearchVisual kind="mesh" reveal={1} />
            <div className="specimen-caption"><b>Look closely.</b><span>Shape, color, subject, style—every detail might be a clue.</span></div>
          </div>
        </section>
        <section className="principles">
          <article><span>01</span><h2>Observe</h2><p>Start with a single, carefully prepared paper figure.</p></article>
          <article><span>02</span><h2>Deduce</h2><p>Choose between plausible institutions from the field.</p></article>
          <article><span>03</span><h2>Discover</h2><p>Meet the paper, authors and affiliations after your guess.</p></article>
        </section>
        <footer className="landing-footer"><span>Built as an extensible, rights-aware prototype.</span><span>All current papers and figures are fictional.</span></footer>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="result-shell">
        <div className="result-card">
          <div className="eyebrow"><span /> Collection complete</div>
          <div className="score-orbit"><strong>{score}</strong><span>/ 300</span></div>
          <h1>You followed the visual evidence.</h1>
          <p>This prototype uses fictional research so the game can be tested before licensed SIGGRAPH figures are curated.</p>
          <button className="primary-button" onClick={restart}>Play again <span>↻</span></button>
          <button className="text-button" onClick={() => { setStarted(false); setComplete(false); }}>Back to introduction</button>
        </div>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <button className="brand brand-button" onClick={() => setStarted(false)}><span className="brand-mark">PP</span><span>Paper Picture</span></button>
        <div className="round-status"><span>ROUND {String(round + 1).padStart(2, "0")}</span><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><span>{String(papers.length).padStart(2, "0")}</span></div>
        <div className="score"><span>SCORE</span><strong>{String(score).padStart(3, "0")}</strong></div>
      </header>

      <section className="game-board">
        <div className="figure-panel">
          <div className="panel-kicker"><span>{paper.topic}</span><span>Image {reveal + 1} of 3</span></div>
          <ResearchVisual kind={paper.visual} reveal={reveal} />
          <div className="figure-footnote"><span>Prototype figure · original artwork</span><span>Identifying labels withheld</span></div>
        </div>

        <div className="question-panel">
          {selected === null ? (
            <>
              <div className="question-heading"><span className="question-index">Q{round + 1}</span><div><div className="eyebrow"><span /> Institution</div><h1>Which institution<br />produced this work?</h1></div></div>
              <div className="answer-list">
                {paper.options.map((option, index) => (
                  <button key={option} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{option}</b><i>↗</i></button>
                ))}
              </div>
              <div className="hint-row">
                <div><strong>{potential}</strong><span>points available</span></div>
                <button disabled={reveal === 2} onClick={() => setReveal((value) => Math.min(2, value + 1))}>Reveal another image <span>−30 pts</span></button>
              </div>
            </>
          ) : (
            <div className="answer-reveal">
              <div className={`verdict ${selected === paper.correct ? "correct" : "incorrect"}`}>{selected === paper.correct ? "Correct deduction" : "Not this time"}</div>
              <div className="eyebrow"><span /> The paper</div>
              <h1>{paper.title}</h1>
              <p className="authors">{paper.authors}</p>
              <dl><div><dt>Institution</dt><dd>{paper.institution}</dd></div><div><dt>Country</dt><dd>{paper.country}</dd></div><div><dt>Collection</dt><dd>SIGGRAPH 2025 · demo</dd></div></dl>
              <div className="rights-note"><span>✓</span><p><b>Rights checked</b>This is fictional seed content and original prototype artwork.</p></div>
              <button className="primary-button" onClick={nextRound}>{round === papers.length - 1 ? "See final score" : "Next paper"} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
