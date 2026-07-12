"use client";

import { useMemo, useState } from "react";
import { collection, collectionFigureCount, collectionPaperCount, maximumCollectionScore, playablePapers, pointsForImagesSeen, type Paper, type PaperFigure } from "../data/papers";

function FigureView({ figure, index, onSourceOpen }: { figure: PaperFigure; index: number; onSourceOpen?: () => void }) {
  return (
    <figure className="paper-figure">
      <div className="figure-frame">
        {/* Publisher originals are intentionally served without image transformation. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={figure.src} alt={figure.alt} decoding="async" />
        <span className="figure-badge">IMAGE {index + 1}</span>
      </div>
      <figcaption>
        <b>{figure.number}</b>
        <span>{figure.caption}</span>
        <span className="figure-credit"><a href={figure.sourceUrl} target="_blank" rel="noreferrer" onClick={onSourceOpen}>Source</a> · <a href={figure.licenseUrl} target="_blank" rel="noreferrer">{figure.license}</a></span>
      </figcaption>
    </figure>
  );
}

function localShuffle(papers: Paper[]) {
  const shuffled = [...papers];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [gamePapers, setGamePapers] = useState<Paper[]>(playablePapers);
  const [round, setRound] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "connecting" | "saving" | "saved" | "unsaved">("idle");
  const [sourceOpened, setSourceOpened] = useState(false);
  const [assistedRounds, setAssistedRounds] = useState(0);
  const [scoreClass, setScoreClass] = useState<"casual" | "assisted">("casual");
  const paper = gamePapers[round];
  const potential = pointsForImagesSeen(reveal + 1);
  const progress = useMemo(() => ((round + (selected !== null ? 1 : 0)) / gamePapers.length) * 100, [gamePapers.length, round, selected]);

  async function startGame() {
    setStarted(true);
    setGamePapers(localShuffle(playablePapers));
    setRound(0);
    setReveal(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
    setSessionId(null);
    setSourceOpened(false);
    setAssistedRounds(0);
    setScoreClass("casual");
    setSaveState("connecting");
    try {
      const response = await fetch("/api/game-sessions", { method: "POST" });
      const result = await response.json() as { id?: string; paperIds?: string[] };
      if (!response.ok || !result.id || !Array.isArray(result.paperIds)) throw new Error("Session unavailable");
      const ordered = result.paperIds.map((id) => playablePapers.find((candidate) => candidate.id === id)).filter((candidate): candidate is Paper => Boolean(candidate));
      if (ordered.length !== playablePapers.length) throw new Error("Collection order is incomplete");
      setGamePapers(ordered);
      setSessionId(result.id);
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  }

  async function choose(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (sourceOpened) setAssistedRounds((value) => value + 1);
    if (index === paper.correct) setScore((value) => value + potential);
    if (!sessionId) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/game-sessions/${sessionId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paper.id, selectedOption: index, imagesSeen: reveal + 1, assisted: sourceOpened }),
      });
      if (!response.ok) throw new Error("Attempt not saved");
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  }

  async function nextRound() {
    if (round === gamePapers.length - 1) {
      if (sessionId && saveState !== "unsaved") {
        setSaveState("saving");
        try {
          const response = await fetch(`/api/game-sessions/${sessionId}/complete`, { method: "POST" });
          const result = await response.json() as { score?: number; scoreClass?: "casual" | "assisted"; assistedCount?: number };
          if (!response.ok) throw new Error("Game not saved");
          if (typeof result.score === "number") setScore(result.score);
          if (result.scoreClass) setScoreClass(result.scoreClass);
          if (typeof result.assistedCount === "number") setAssistedRounds(result.assistedCount);
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
    setSourceOpened(false);
  }

  if (!paper) return <main className="result-shell"><div className="result-card"><h1>No approved papers are available.</h1><p>The collection fails closed when its rights checks are incomplete.</p></div></main>;

  if (!started) {
    return (
      <main className="landing-shell">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Paper Picture home"><span className="brand-mark">PP</span><span>Paper Picture</span></a>
          <div className="topbar-actions"><span className="nav-note">{collection.label}</span><a href="/test-guide">Test guide</a><a href="/profile">My profile</a></div>
        </nav>
        <section className="hero" id="main-content">
          <div className="hero-copy" id="top">
            <div className="eyebrow"><span /> A visual research game</div>
            <h1>Can you read<br />a paper by its <em>pictures?</em></h1>
            <p>Study a real, openly licensed research figure. Guess the institution or country. Reveal another figure when you need it—but every clue costs points.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={startGame}>Play the randomized collection <span>→</span></button>
              <span className="time-note">{collectionPaperCount} verified papers · {collectionFigureCount} licensed figures</span>
            </div>
          </div>
          <div className="hero-specimen">
            <div className="specimen-number">01</div>
            <FigureView figure={playablePapers[0].figures[1]} index={0} />
            <div className="specimen-caption"><b>Look closely.</b><span>Every figure is connected to its source, license, and complete citation.</span></div>
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
          <p>This frozen {collection.label} set includes only articles whose publication pages explicitly license the article and included figures under CC BY 4.0 unless separately credited. All {collectionFigureCount} images are unmodified publisher originals.</p>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Read the CC BY 4.0 license ↗</a>
        </section>
        <footer className="landing-footer"><span>{collection.label}</span><span>{collectionPaperCount} papers · {collectionFigureCount} source-traceable figures</span><span><a href="/feedback">Feedback</a> · <a href="/privacy">Privacy</a></span></footer>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="result-shell">
        <div className="result-card">
          <div className="eyebrow"><span /> {collection.label} complete</div>
          <div className="score-orbit"><strong>{score}</strong><span>/ {maximumCollectionScore}</span></div>
          <h1>You followed the visual evidence.</h1>
          <p>You explored {collectionPaperCount} real CC BY research papers across geometry processing, meshing, CAD retrieval, and geometric optimization.</p>
          {assistedRounds > 0 && <p className="assisted-note">Assisted game · source opened before answering in {assistedRounds} {assistedRounds === 1 ? "round" : "rounds"}.</p>}
          <p aria-live="polite" className={`save-message ${saveState === "saved" ? "is-saved" : "is-unsaved"}`}>{saveState === "saved" ? `✓ This ${scoreClass} game is saved to your private profile.` : "This score was not saved. You can still play normally."}</p>
          <div className="result-actions"><button className="primary-button" onClick={startGame}>Play again <span>↻</span></button><a className="secondary-button" href="/feedback">Give feedback</a><a className="secondary-button" href="/profile">View profile</a></div>
          <button className="text-button" onClick={() => { setStarted(false); setComplete(false); }}>Back to collection</button>
        </div>
      </main>
    );
  }

  const figure = paper.figures[reveal];
  return (
    <main className="game-shell">
      <a className="skip-link" href="#question">Skip to question</a>
      <header className="game-header">
        <button className="brand brand-button" onClick={() => setStarted(false)} aria-label="Leave game and return to collection"><span className="brand-mark">PP</span><span>Paper Picture</span></button>
        <div className="round-status"><span>ROUND {String(round + 1).padStart(2, "0")}</span><div className="progress-track" role="progressbar" aria-label="Collection progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div><span>{String(gamePapers.length).padStart(2, "0")}</span></div>
        <div className="header-right"><span aria-live="polite" className={`save-indicator ${saveState}`}>{saveState === "saving" || saveState === "connecting" ? "Saving…" : saveState === "unsaved" ? "Not saved" : "Saved"}</span><a href="/feedback">Feedback</a><div className="score"><span>SCORE</span><strong>{String(score).padStart(3, "0")}</strong></div></div>
      </header>

      <section className="game-board">
        <div className="figure-panel">
          <div className="panel-kicker"><span>{paper.topic}</span><span>Image {reveal + 1} of {paper.figures.length}</span></div>
          <FigureView figure={figure} index={reveal} onSourceOpen={() => selected === null && setSourceOpened(true)} />
          <div className="figure-footnote"><span>{figure.number} · {figure.license}</span><span>{sourceOpened ? "Assisted round: source opened" : "Opening Source before answering marks this round assisted"}</span></div>
        </div>

        <div className="question-panel" id="question">
          {selected === null ? (
            <>
              <div className="question-heading"><span className="question-index">Q{round + 1}</span><div><div className="eyebrow"><span /> {paper.questionType}</div><h1>{paper.question}</h1></div></div>
              <div className="answer-list">
                {paper.options.map((option, index) => <button key={option} disabled={saveState === "connecting"} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{saveState === "connecting" ? "Preparing your saved game…" : option}</b><i aria-hidden="true">↗</i></button>)}
              </div>
              <div className="hint-row"><div><strong>{potential}</strong><span>points available</span></div><button disabled={saveState === "connecting" || reveal === paper.figures.length - 1} onClick={() => setReveal((value) => Math.min(paper.figures.length - 1, value + 1))}>Reveal next figure <span>−30 pts</span></button></div>
            </>
          ) : (
            <div className="answer-reveal">
              <div role="status" className={`verdict ${selected === paper.correct ? "correct" : "incorrect"}`}>{selected === paper.correct ? "Correct deduction" : "Not this time"}</div>
              {sourceOpened && <p className="assisted-note">This round is recorded as assisted because the figure source was opened before answering.</p>}
              <div className="eyebrow"><span /> The paper</div><h1>{paper.title}</h1><p className="authors">{paper.authors}</p>
              <dl><div><dt>Institution</dt><dd>{paper.institution}</dd></div><div><dt>Country</dt><dd>{paper.country}</dd></div><div><dt>Published</dt><dd>{paper.journal}, {paper.year}</dd></div></dl>
              <div className="source-actions"><a href={paper.paperUrl} target="_blank" rel="noreferrer">Read paper ↗</a><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">DOI ↗</a></div>
              <div className="rights-note"><span>✓</span><p><b>{figure.number} · {figure.license}</b>{figure.modifications} <a href={figure.sourceUrl} target="_blank" rel="noreferrer">Figure source</a> · <a href={paper.licenseEvidenceUrl} target="_blank" rel="noreferrer">License evidence</a></p></div>
              <button className="primary-button" disabled={saveState === "saving"} onClick={nextRound}>{saveState === "saving" ? "Saving answer…" : round === gamePapers.length - 1 ? "See final score" : "Next paper"} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
