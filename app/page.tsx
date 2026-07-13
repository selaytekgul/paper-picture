"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedCollection = getCollection(selectedCollectionId) ?? defaultCollection;
  const selectedStats = collectionStats(selectedCollection.id);
  const selectedModeDetails = gameModes.find((mode) => mode.id === selectedMode) ?? gameModes[0];
  const totalStats = collectionCatalog.reduce((total, item) => {
    const stats = collectionStats(item.id);
    return { papers: total.papers + stats.paperCount, figures: total.figures + stats.figureCount };
  }, { papers: 0, figures: 0 });
  const paper = gamePapers[round];
  const question = useMemo(() => paper ? buildRoundQuestion(paper, gameMode) : null, [gameMode, paper]);
  const potential = pointsForImagesSeen(reveal + 1);
  const progress = useMemo(() => gamePapers.length ? ((round + (selected !== null ? 1 : 0)) / gamePapers.length) * 100 : 0, [gamePapers.length, round, selected]);
  const activeCollection = getCollection(selectedCollectionId) ?? selectedCollection;

  useEffect(() => {
    if (started && !complete && selected === null) questionHeadingRef.current?.focus();
  }, [complete, round, selected, started]);

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
    return (
      <main className="landing-shell" id="top">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Paper Picture home"><span className="brand-mark">PP</span><span>Paper Picture</span></a>
          <div className="topbar-actions"><a href="/test-guide">How it works</a><a className="profile-link" href="/profile">My games</a></div>
        </nav>
        <section className="simple-hero" id="main-content">
          <div className="eyebrow"><span /> A visual research game</div>
          <h1>Look at the figure.<br /><em>Guess the paper.</em></h1>
          <p>Explore real computer-graphics research through its pictures. Choose what you want to guess, then play six quick rounds.</p>
          <div className="hero-facts" aria-label="Game summary"><span>No sign-in needed</span><span>6 rounds</span><span>About 3 minutes</span></div>
        </section>

        <section className="game-setup simple-game-setup" id="game-setup" aria-labelledby="setup-title">
          <div className="setup-heading"><div><div className="eyebrow"><span /> Start here</div><h2 id="setup-title">Set up your game.</h2></div><p>Choose a collection and what you want to guess.</p></div>
          <fieldset className="collection-picker">
            <legend><b>1</b> Pick a collection</legend>
            <div>
              {collectionCatalog.map((item) => {
                const stats = collectionStats(item.id);
                const active = selectedCollectionId === item.id;
                return <button type="button" key={item.id} className={active ? "is-selected" : ""} aria-pressed={active} onClick={() => setSelectedCollectionId(item.id)}><span>Collection {item.title.slice(-2).replace(/^0/, "")}</span><b>{item.description}</b><small>{stats.paperCount} real papers · {stats.figureCount} figures</small></button>;
              })}
            </div>
          </fieldset>
          <fieldset className="mode-picker">
            <legend><b>2</b> What do you want to guess?</legend>
            <div>
              {gameModes.map((mode) => <button type="button" key={mode.id} className={selectedMode === mode.id ? "is-selected" : ""} aria-pressed={selectedMode === mode.id} onClick={() => setSelectedMode(mode.id)}><span>{mode.label}</span></button>)}
            </div>
            <p className="mode-help" aria-live="polite"><b>{selectedModeDetails.label}:</b> {selectedModeDetails.description}</p>
          </fieldset>
          <div className="setup-action"><button className="primary-button" onClick={startGame}>Start the game <span>→</span></button><div><b>{selectedStats.paperCount} rounds · up to {selectedStats.maximumScore} points</b><span>Play now. Sign in later only if you want to save.</span></div></div>
        </section>

        <section className="simple-how" aria-labelledby="how-title">
          <div><span>How it works</span><h2 id="how-title">Look. Guess. Learn.</h2></div>
          <ol><li><b>1</b><span>Study one research figure.</span></li><li><b>2</b><span>Choose from four answers.</span></li><li><b>3</b><span>See the paper and its source.</span></li></ol>
        </section>
        <p className="trust-note">Every clue comes from a real, openly licensed paper. Sources and credits are shown after each answer. <a href="/test-guide">See how papers are selected.</a></p>
        <footer className="landing-footer"><span>{totalStats.papers} real papers · {totalStats.figures} figures · CC BY 4.0</span><span><a href="/feedback">Feedback</a><a href="/privacy">Privacy</a><a href="https://github.com/selaytekgul/paper-picture" target="_blank" rel="noreferrer">GitHub</a></span></footer>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="result-shell">
        <div className="result-card">
          <div className="eyebrow"><span /> {activeCollection.label} · {gameMode} complete</div>
          <div className="score-orbit"><strong>{score}</strong><span>/ {gamePapers.length * 100}</span></div>
          <h1>Game complete.</h1>
          <p>You explored {gamePapers.length} real research papers and scored {score} points.</p>
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
        <div className="round-status"><b>{round + 1} of {gamePapers.length}</b><div className="progress-track" role="progressbar" aria-label="Game progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div></div>
        <div className="header-right"><span aria-live="polite" className={`save-indicator ${saveState}`}>{saveState === "saving" || saveState === "connecting" ? "Saving…" : saveState === "unsaved" ? "Not saved" : "Saved"}</span><div className="score"><span>Score</span><strong>{score}</strong></div></div>
      </header>

      <section className="game-board">
        <div className="figure-panel">
          <div className="panel-kicker"><span>{gameMode === "topic" ? "Research figure" : paper.topic}</span><span>Clue {reveal + 1} of {paper.figures.length}</span></div>
          <FigureView figure={figure} index={reveal} onSourceOpen={() => selected === null && setSourceOpened(true)} />
          <div className="figure-footnote"><span>{figure.number} · {figure.license}</span><span>{sourceOpened ? "Source opened · assisted round" : "Opening the source marks this round assisted"}</span></div>
        </div>

        <div className="question-panel" id="question">
          {selected === null ? (
            <>
              <div className="question-heading"><div><div className="question-label">Guess the {question?.label.toLowerCase()}</div><h1 ref={questionHeadingRef} tabIndex={-1}>{question?.prompt}</h1></div></div>
              <div className="answer-list">
                {question?.options.map((option, index) => <button key={option} disabled={saveState === "connecting"} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><b>{saveState === "connecting" ? "Preparing game…" : option}</b><i aria-hidden="true">↗</i></button>)}
              </div>
              <div className="hint-row"><div><strong>{potential} points</strong><span>for this answer</span></div><button disabled={saveState === "connecting" || reveal === paper.figures.length - 1} onClick={() => setReveal((value) => Math.min(paper.figures.length - 1, value + 1))}>Show another clue <span>−30 points</span></button></div>
            </>
          ) : (
            <div className="answer-reveal">
              <div role="status" className={`verdict ${selected === question?.correct ? "correct" : "incorrect"}`}>{selected === question?.correct ? "Correct!" : "Not quite"}</div>
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
