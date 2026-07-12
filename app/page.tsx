"use client";

import { useMemo, useState } from "react";
import { collectionFigureCount, collectionPaperCount, maximumCollectionScore, playablePapers, pointsForImagesSeen, type PaperFigure } from "../data/papers";

function FigureView({ figure, index }: { figure: PaperFigure; index: number }) {
  return (
    <figure className="paper-figure">
      <div className="figure-frame">
        <img src={figure.src} alt={figure.alt} />
        <span className="figure-badge">IMAGE {index + 1}</span>
      </div>
      <figcaption>
        <b>{figure.number}</b>
        <span>{figure.caption}</span>
        <span className="figure-credit"><a href={figure.sourceUrl} target="_blank" rel="noreferrer">Source</a> · <a href={figure.licenseUrl} target="_blank" rel="noreferrer">{figure.license}</a></span>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "connecting" | "saving" | "saved" | "unsaved">("idle");
  const paper = playablePapers[round];
  const potential = pointsForImagesSeen(reveal + 1);
  const progress = useMemo(() => ((round + (selected !== null ? 1 : 0)) / playablePapers.length) * 100, [round, selected]);

  async function startGame() {
    setStarted(true);
    setRound(0);
    setReveal(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
    setSessionId(null);
    setSaveState("connecting");
    try {
      const response = await fetch("/api/game-sessions", { method: "POST" });
      const result = await response.json() as { id?: string };
      if (!response.ok || !result.id) throw new Error("Session unavailable");
      setSessionId(result.id);
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  }

  async function choose(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === paper.correct) setScore((value) => value + potential);
    if (!sessionId) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/game-sessions/${sessionId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paper.id, selectedOption: index, imagesSeen: reveal + 1 }),
      });
      if (!response.ok) throw new Error("Attempt not saved");
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  }

  async function nextRound() {
    if (round === playablePapers.length - 1) {
      if (sessionId && saveState !== "unsaved") {
        setSaveState("saving");
        try {
          const response = await fetch(`/api/game-sessions/${sessionId}/complete`, { method: "POST" });
          const result = await response.json() as { score?: number };
          if (!response.ok) throw new Error("Game not saved");
          if (typeof result.score === "number") setScore(result.score);
          setSaveState("saved");
        } catch {
          setSaveState("unsaved");
        }
      }
      setComplete(true);
      return;
    }
    setRound((value) => value + 1);
    setReveal(0);
    setSelected(null);
  }

  if (!paper) {
    return <main className="result-shell"><div className="result-card"><h1>No approved papers are available.</h1><p>The collection fails closed when its rights checks are incomplete.</p></div></main>;
  }

  if (!started) {
    return (
      <main className="landing-shell">
        <nav className="topbar">
          <a className="brand" href="#top" aria-label="Paper Picture home"><span className="brand-mark">PP</span><span>Paper Picture</span></a>
          <div className="topbar-actions"><span className="nav-note">Open Graphics Collection 01</span><a href="/profile">My profile</a></div>
        </nav>
        <section className="hero" id="top">
          <div className="hero-copy">
            <div className="eyebrow"><span /> A visual research game</div>
            <h1>Can you read<br />a paper by its <em>pictures?</em></h1>
            <p>Study a real, openly licensed research figure. Guess the institution or country. Reveal a second figure when you need it—but every clue costs points.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={startGame}>Play the real collection <span>→</span></button>
              <span className="time-note">{collectionPaperCount} verified papers · {collectionFigureCount} licensed figures</span>
            </div>
          </div>
          <div className="hero-specimen">
            <div className="specimen-number">01</div>
            <FigureView figure={playablePapers[0].figures[1]} index={0} />
            <div className="specimen-caption"><b>Look closely.</b><span>Every displayed figure is connected to its source, license, and complete citation.</span></div>
          </div>
        </section>
        <section className="principles">
          <article><span>01</span><h2>Observe</h2><p>Start with one unmodified figure from a real research paper.</p></article>
          <article><span>02</span><h2>Deduce</h2><p>Choose between plausible institutions or countries.</p></article>
          <article><span>03</span><h2>Verify</h2><p>See the authors, affiliation, DOI, figure source, and license.</p></article>
        </section>
        <section className="collection-note" id="method">
          <div className="eyebrow"><span /> Collection policy</div>
          <h2>Real papers. Traceable figures.</h2>
          <p>This first collection includes only articles whose publication pages explicitly license the article and included figures under CC BY 4.0 unless a separate credit says otherwise. The selected captions contain no separate third-party credit. All {collectionFigureCount} images are publisher-provided originals and are resized only by the browser.</p>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Read the CC BY 4.0 license ↗</a>
        </section>
        <footer className="landing-footer"><span>Open Graphics Collection 01</span><span>{collectionPaperCount} papers · {collectionFigureCount} source-traceable figures</span><a href="/privacy">Privacy & data</a></footer>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="result-shell">
        <div className="result-card">
          <div className="eyebrow"><span /> Collection complete</div>
          <div className="score-orbit"><strong>{score}</strong><span>/ {maximumCollectionScore}</span></div>
          <h1>You followed the visual evidence.</h1>
          <p>You explored {collectionPaperCount} real CC BY research papers across geometry processing, meshing, CAD retrieval, and geometric optimization.</p>
          <p className={`save-message ${saveState === "saved" ? "is-saved" : "is-unsaved"}`}>{saveState === "saved" ? "✓ This game is saved to your private profile." : "This score was not saved. You can still play normally."}</p>
          <div className="result-actions"><button className="primary-button" onClick={startGame}>Play again <span>↻</span></button><a className="secondary-button" href="/profile">View my profile</a></div>
          <button className="text-button" onClick={() => { setStarted(false); setComplete(false); }}>Back to collection</button>
        </div>
      </main>
    );
  }

  const figure = paper.figures[reveal];

  return (
    <main className="game-shell">
      <header className="game-header">
        <button className="brand brand-button" onClick={() => setStarted(false)}><span className="brand-mark">PP</span><span>Paper Picture</span></button>
        <div className="round-status"><span>ROUND {String(round + 1).padStart(2, "0")}</span><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><span>{String(playablePapers.length).padStart(2, "0")}</span></div>
        <div className="header-right"><span className={`save-indicator ${saveState}`}>{saveState === "saving" || saveState === "connecting" ? "Saving…" : saveState === "unsaved" ? "Not saved" : "Saved"}</span><a href="/profile">Profile</a><div className="score"><span>SCORE</span><strong>{String(score).padStart(3, "0")}</strong></div></div>
      </header>

      <section className="game-board">
        <div className="figure-panel">
          <div className="panel-kicker"><span>{paper.topic}</span><span>Image {reveal + 1} of {paper.figures.length}</span></div>
          <FigureView figure={figure} index={reveal} />
          <div className="figure-footnote"><span>{figure.number} · {figure.license}</span><span>Source shown after answer</span></div>
        </div>

        <div className="question-panel">
          {selected === null ? (
            <>
              <div className="question-heading"><span className="question-index">Q{round + 1}</span><div><div className="eyebrow"><span /> {paper.questionType}</div><h1>{paper.question}</h1></div></div>
              <div className="answer-list">
                {paper.options.map((option, index) => (
                  <button key={option} disabled={saveState === "connecting"} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{saveState === "connecting" ? "Preparing your saved game…" : option}</b><i>↗</i></button>
                ))}
              </div>
              <div className="hint-row">
                <div><strong>{potential}</strong><span>points available</span></div>
                <button disabled={saveState === "connecting" || reveal === paper.figures.length - 1} onClick={() => setReveal((value) => Math.min(paper.figures.length - 1, value + 1))}>Reveal next figure <span>−30 pts</span></button>
              </div>
            </>
          ) : (
            <div className="answer-reveal">
              <div className={`verdict ${selected === paper.correct ? "correct" : "incorrect"}`}>{selected === paper.correct ? "Correct deduction" : "Not this time"}</div>
              <div className="eyebrow"><span /> The paper</div>
              <h1>{paper.title}</h1>
              <p className="authors">{paper.authors}</p>
              <dl><div><dt>Institution</dt><dd>{paper.institution}</dd></div><div><dt>Country</dt><dd>{paper.country}</dd></div><div><dt>Published</dt><dd>{paper.journal}, {paper.year}</dd></div></dl>
              <div className="source-actions"><a href={paper.paperUrl} target="_blank" rel="noreferrer">Read paper ↗</a><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">DOI ↗</a></div>
              <div className="rights-note"><span>✓</span><p><b>{figure.number} · {figure.license}</b>{figure.modifications} <a href={figure.sourceUrl} target="_blank" rel="noreferrer">Figure source</a> · <a href={paper.licenseEvidenceUrl} target="_blank" rel="noreferrer">License evidence</a></p></div>
              <button className="primary-button" disabled={saveState === "saving"} onClick={nextRound}>{saveState === "saving" ? "Saving answer…" : round === playablePapers.length - 1 ? "See final score" : "Next paper"} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
