"use client";

import { useMemo, useState } from "react";
import { paperlogUrlForDoi } from "../data/paper-links";
import {
  buildRoundQuestion,
  collectionCatalog,
  collectionStats,
  gameModes,
  getCollection,
  getPlayablePapers,
  pointsForImagesSeen,
  type GameMode,
  type Paper,
  type PaperFigure,
} from "../data/papers";

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
  const defaultCollection = collectionCatalog[1] ?? collectionCatalog[0];
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(defaultCollection.id);
  const [selectedMode, setSelectedMode] = useState<GameMode>("institution");
  const [gameMode, setGameMode] = useState<GameMode>("institution");
  const [started, setStarted] = useState(false);
  const [gamePapers, setGamePapers] = useState<Paper[]>(getPlayablePapers(defaultCollection.id));
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

  const selectedCollection = getCollection(selectedCollectionId) ?? defaultCollection;
  const selectedPapers = getPlayablePapers(selectedCollection.id);
  const selectedStats = collectionStats(selectedCollection.id);
  const totalStats = collectionCatalog.reduce((total, item) => {
    const stats = collectionStats(item.id);
    return { papers: total.papers + stats.paperCount, figures: total.figures + stats.figureCount };
  }, { papers: 0, figures: 0 });
  const paper = gamePapers[round];
  const question = useMemo(() => paper ? buildRoundQuestion(paper, gameMode) : null, [gameMode, paper]);
  const potential = pointsForImagesSeen(reveal + 1);
  const progress = useMemo(() => gamePapers.length ? ((round + (selected !== null ? 1 : 0)) / gamePapers.length) * 100 : 0, [gamePapers.length, round, selected]);
  const activeCollection = getCollection(selectedCollectionId) ?? selectedCollection;

  async function startGame() {
    const collectionPapers = getPlayablePapers(selectedCollection.id);
    setStarted(true);
    setGameMode(selectedMode);
    setGamePapers(localShuffle(collectionPapers));
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
      const response = await fetch("/api/game-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: selectedCollection.id, mode: selectedMode }),
      });
      const result = await response.json() as { id?: string; paperIds?: string[]; mode?: GameMode };
      if (!response.ok || !result.id || !Array.isArray(result.paperIds)) throw new Error("Session unavailable");
      const ordered = result.paperIds.map((id) => collectionPapers.find((candidate) => candidate.id === id)).filter((candidate): candidate is Paper => Boolean(candidate));
      if (ordered.length !== collectionPapers.length) throw new Error("Collection order is incomplete");
      setGamePapers(ordered);
      setSessionId(result.id);
      setGameMode(result.mode ?? selectedMode);
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  }

  async function choose(index: number) {
    if (selected !== null || !paper || !question) return;
    setSelected(index);
    if (sourceOpened) setAssistedRounds((value) => value + 1);
    if (index === question.correct) setScore((value) => value + potential);
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
    const specimen = selectedPapers[0];
    return (
      <main className="landing-shell">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Paper Picture home"><span className="brand-mark">PP</span><span>Paper Picture</span></a>
          <div className="topbar-actions"><span className="nav-note">{totalStats.papers} papers · {totalStats.figures} figures</span><a href="/test-guide">Test guide</a><a href="/profile">My profile</a></div>
        </nav>
        <section className="hero" id="main-content">
          <div className="hero-copy" id="top">
            <div className="eyebrow"><span /> A visual research game</div>
            <h1>Can you read<br />a paper by its <em>pictures?</em></h1>
            <p>Study a real, openly licensed research figure. Guess its people, place, venue, year, or topic. Reveal another figure when you need it—but every clue costs points.</p>
            <a className="text-link" href="#game-setup">Choose a collection and mode ↓</a>
          </div>
          <div className="hero-specimen">
            <div className="specimen-number">{selectedCollection.title.slice(-2)}</div>
            <FigureView figure={specimen.figures[1]} index={0} />
            <div className="specimen-caption"><b>Look closely.</b><span>Every figure is connected to its source, license, and complete citation.</span></div>
          </div>
        </section>

        <section className="game-setup" id="game-setup" aria-labelledby="setup-title">
          <div className="setup-heading"><div><div className="eyebrow"><span /> Build your round</div><h2 id="setup-title">Choose what to investigate.</h2></div><p>Anonymous play works immediately. Sign in only if you want a private saved history.</p></div>
          <fieldset className="collection-picker">
            <legend>1. Collection</legend>
            <div>
              {collectionCatalog.map((item) => {
                const stats = collectionStats(item.id);
                const active = selectedCollectionId === item.id;
                return <button type="button" key={item.id} className={active ? "is-selected" : ""} aria-pressed={active} onClick={() => setSelectedCollectionId(item.id)}><span>{item.title}</span><b>{item.description}</b><small>{stats.paperCount} papers · {stats.figureCount} figures · frozen {item.frozenAt}</small></button>;
              })}
            </div>
          </fieldset>
          <fieldset className="mode-picker">
            <legend>2. Question mode</legend>
            <div>
              {gameModes.map((mode) => <button type="button" key={mode.id} className={selectedMode === mode.id ? "is-selected" : ""} aria-pressed={selectedMode === mode.id} onClick={() => setSelectedMode(mode.id)}><span>{mode.label}</span><small>{mode.description}</small></button>)}
            </div>
          </fieldset>
          <div className="setup-action"><button className="primary-button" onClick={startGame}>Play {selectedCollection.title} <span>→</span></button><span>{selectedStats.paperCount} rounds · up to {selectedStats.maximumScore} points</span></div>
        </section>

        <section className="principles">
          <article><span>01</span><h2>Observe</h2><p>Start with one unmodified figure from a real research paper.</p></article>
          <article><span>02</span><h2>Deduce</h2><p>Choose between four plausible, real answers in six game modes.</p></article>
          <article><span>03</span><h2>Verify</h2><p>See the authors, affiliation, DOI, figure source, and license.</p></article>
        </section>
        <section className="collection-note" id="method">
          <div className="eyebrow"><span /> Collection policy</div>
          <h2>Real papers. Traceable figures. Versioned sets.</h2>
          <p>Each frozen collection includes only articles whose publication pages explicitly license the article and included figures under CC BY 4.0 unless separately credited. Collection 01 remains unchanged; Collection 02 has its own evidence archive and checksums.</p>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Read the CC BY 4.0 license ↗</a>
        </section>
        <footer className="landing-footer"><span>Paper Picture · paperpicture.net</span><span>{collectionCatalog.length} collections · {totalStats.papers} papers · {totalStats.figures} figures</span><span><a href="/feedback">Feedback</a> · <a href="/privacy">Privacy</a></span></footer>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="result-shell">
        <div className="result-card">
          <div className="eyebrow"><span /> {activeCollection.label} · {gameMode} complete</div>
          <div className="score-orbit"><strong>{score}</strong><span>/ {gamePapers.length * 100}</span></div>
          <h1>You followed the visual evidence.</h1>
          <p>You explored {gamePapers.length} real CC BY research papers in {gameMode} mode.</p>
          {assistedRounds > 0 && <p className="assisted-note">Assisted game · source opened before answering in {assistedRounds} {assistedRounds === 1 ? "round" : "rounds"}.</p>}
          <p aria-live="polite" className={`save-message ${saveState === "saved" ? "is-saved" : "is-unsaved"}`}>{saveState === "saved" ? `✓ This ${scoreClass} game is saved to your private profile.` : "Played anonymously. Sign in through My profile before your next game if you want it saved."}</p>
          <div className="result-actions"><button className="primary-button" onClick={startGame}>Play again <span>↻</span></button><a className="secondary-button" href="/feedback">Give feedback</a><a className="secondary-button" href="/profile">View profile</a></div>
          <button className="text-button" onClick={() => { setStarted(false); setComplete(false); }}>Choose another game</button>
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
        <div className="header-right"><span className="mode-badge">{gameMode}</span><span aria-live="polite" className={`save-indicator ${saveState}`}>{saveState === "saving" || saveState === "connecting" ? "Saving…" : saveState === "unsaved" ? "Anonymous" : "Saved"}</span><a href="/feedback">Feedback</a><div className="score"><span>SCORE</span><strong>{String(score).padStart(3, "0")}</strong></div></div>
      </header>

      <section className="game-board">
        <div className="figure-panel">
          <div className="panel-kicker"><span>{gameMode === "topic" ? "Visual research clue" : paper.topic}</span><span>Image {reveal + 1} of {paper.figures.length}</span></div>
          <FigureView figure={figure} index={reveal} onSourceOpen={() => selected === null && setSourceOpened(true)} />
          <div className="figure-footnote"><span>{figure.number} · {figure.license}</span><span>{sourceOpened ? "Assisted round: source opened" : "Opening Source before answering marks this round assisted"}</span></div>
        </div>

        <div className="question-panel" id="question">
          {selected === null ? (
            <>
              <div className="question-heading"><span className="question-index">Q{round + 1}</span><div><div className="eyebrow"><span /> {question?.label}</div><h1>{question?.prompt}</h1></div></div>
              <div className="answer-list">
                {question?.options.map((option, index) => <button key={option} disabled={saveState === "connecting"} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{saveState === "connecting" ? "Preparing game…" : option}</b><i aria-hidden="true">↗</i></button>)}
              </div>
              <div className="hint-row"><div><strong>{potential}</strong><span>points available</span></div><button disabled={saveState === "connecting" || reveal === paper.figures.length - 1} onClick={() => setReveal((value) => Math.min(paper.figures.length - 1, value + 1))}>Reveal next figure <span>−30 pts</span></button></div>
            </>
          ) : (
            <div className="answer-reveal">
              <div role="status" className={`verdict ${selected === question?.correct ? "correct" : "incorrect"}`}>{selected === question?.correct ? "Correct deduction" : "Not this time"}</div>
              {sourceOpened && <p className="assisted-note">This round is recorded as assisted because the figure source was opened before answering.</p>}
              <div className="eyebrow"><span /> The paper</div><h1>{paper.title}</h1><p className="authors">{paper.authors}</p>
              <dl><div><dt>Institution</dt><dd>{paper.institution}</dd></div><div><dt>Country</dt><dd>{paper.country}</dd></div><div><dt>Published</dt><dd>{paper.journal}, {paper.year}</dd></div><div><dt>Topic</dt><dd>{paper.topic}</dd></div></dl>
              <div className="source-actions"><a href={paperlogUrlForDoi(paper.doi)} target="_blank" rel="noreferrer">View on Paperlog ↗</a><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">DOI ↗</a></div>
              <div className="rights-note"><span>✓</span><p><b>{figure.number} · {figure.license}</b>{figure.modifications} <a href={figure.sourceUrl} target="_blank" rel="noreferrer">Figure source</a> · <a href={paper.licenseEvidenceUrl} target="_blank" rel="noreferrer">License evidence</a></p></div>
              <button className="primary-button" disabled={saveState === "saving"} onClick={nextRound}>{saveState === "saving" ? "Saving answer…" : round === gamePapers.length - 1 ? "See final score" : "Next paper"} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
