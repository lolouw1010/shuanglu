"use client";

import { ArrowLeft, BookOpen, CircleHelp, Home, ScrollText, Settings, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { characters } from "@/data/characters";
import { generateLegalMoves, getVictoryType, getWinner } from "@/game";
import { roomShareUrl } from "@/online/runtimeConfig";
import { useGameStore } from "@/store/gameStore";
import { Board } from "./Board";
import { CharacterPanel } from "./CharacterPanel";
import { DicePanel } from "./DicePanel";
import { ParchmentCommandPanel } from "./ParchmentCommandPanel";
import { PlayFeedback } from "./PlayFeedback";
import { latestContiguousMovesForPlayer } from "./moveDisplay";
import { TurnCoach } from "./TurnCoach";
import { VictoryTracker } from "./VictoryTracker";

const GameTable3D = dynamic(
  () =>
    import("./three/GameTable3D").then((module) => module.GameTable3D),
  {
    ssr: false,
    loading: () => (
      <section className="game-3d-shell">
        <div className="flex min-h-[min(520px,62dvh)] items-center justify-center text-sm text-amber-100/75">
          正在布置三维棋局...
        </div>
      </section>
    ),
  },
);

export function GameScreen() {
  const {
    mode,
    boardView,
    state,
    online,
    selectedSource,
    targetMoves,
    message,
    onlineStatus,
    backToMenu,
    toggleRules,
    rollCurrentPlayer,
    selectSource,
    selectTarget,
    runAITurn,
    startMatch,
    syncOnlineRoom,
  } = useGameStore();

  const winner = getWinner(state);
  const victoryType = getVictoryType(state);
  const onlineShareUrl =
    online ? roomShareUrl(online.roomId) : "";
  const canAct =
    mode !== "online" ||
    (online?.seat !== "spectator" && online?.seat === state.currentPlayer);
  const availableMoves = canAct ? generateLegalMoves(state) : [];
  const highlightedBlackMoves =
    mode === "ai" ? latestContiguousMovesForPlayer(state, "black") : [];
  const roundLabel = Math.max(1, Math.floor(state.moveHistory.length / 2) + 1);
  const actionLabel =
    state.turnPhase === "game_over"
      ? "棋局已分"
      : state.currentPlayer === "white"
        ? "白方行动中"
        : "黑方行动中";

  useEffect(() => {
    if (mode === "ai" && state.currentPlayer === "black") {
      const justAutoPassed = message.includes("回合交给黑方");
      const timer = window.setTimeout(runAITurn, justAutoPassed ? 1400 : 450);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [mode, state.currentPlayer, state.turnPhase, message, runAITurn]);

  useEffect(() => {
    if (mode !== "online") return undefined;
    const interval = window.setInterval(() => {
      void syncOnlineRoom();
    }, 1400);
    return () => window.clearInterval(interval);
  }, [mode, syncOnlineRoom]);

  const shellClass =
    boardView === "3d"
      ? "min-h-[100dvh] overflow-x-hidden px-2 py-2 text-stone-100 sm:px-3 bg-[radial-gradient(circle_at_50%_0%,rgba(214,162,80,.16),transparent_28%),linear-gradient(140deg,#120d0c,#351317_48%,#15100e)]"
      : "parchment-game-shell min-h-[100dvh] overflow-x-hidden px-2 py-2 text-[#3b2514] sm:px-3";
  const layoutClass =
    boardView === "3d"
      ? "relative z-10 mx-auto grid max-w-[1500px] gap-2 xl:grid-cols-[220px_1fr_220px]"
      : "parchment-game-layout relative z-10 mx-auto grid max-w-[1780px] gap-2";

  return (
    <main className={shellClass}>
      <div className={layoutClass}>
        <div className="game-topbar parchment-topbar flex items-center justify-between gap-3 rounded border px-3 py-2 xl:col-span-3">
          <div className="brand-block min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="brand-title font-display text-3xl sm:text-5xl">双陆</h1>
              <span className="brand-subtitle text-sm font-semibold">唐宋博戏</span>
              {boardView === "3d" ? <span className="text-xs text-amber-100/80">3D 测试局</span> : null}
            </div>
            {mode === "online" && online ? (
              <p className="mt-0.5 truncate text-xs">
                房间 {online.roomId} ·{" "}
                {online.seat === "spectator"
                  ? "旁观"
                  : online.seat === "white"
                    ? "你执白"
                    : "你执黑"}{" "}
                · {online.players.black ? "对手已入席" : "等待朋友加入"}
              </p>
            ) : null}
          </div>
          <div className="chapter-heading hidden min-w-0 text-center md:block">
            <p className="font-display text-2xl font-semibold">第一章 · 初入京城</p>
            <p className="mt-1 text-sm">与对手对坐，一局雅弈</p>
          </div>
          <div className="topbar-actions flex shrink-0 gap-2">
            <button type="button" aria-label="博戏志" className="topbar-icon-button topbar-primary-action" onClick={toggleRules}>
              <BookOpen size={22} />
              <span>博戏志</span>
            </button>
            <button type="button" aria-label="棋局记录" className="topbar-icon-button topbar-secondary-action" onClick={toggleRules}>
              <ScrollText size={22} />
              <span>棋局记录</span>
            </button>
            <button type="button" aria-label="设置" className="topbar-icon-button topbar-secondary-action" onClick={toggleRules}>
              <Settings size={22} />
              <span>设置</span>
            </button>
            <button type="button" aria-label="返回" className="topbar-icon-button topbar-primary-action" onClick={backToMenu}>
              <ArrowLeft size={22} />
              <span>返回</span>
            </button>
          </div>
        </div>

        <div className={`${boardView === "3d" ? "order-3 xl:order-none" : "parchment-side-panel parchment-side-left order-2"}`}>
          <CharacterPanel
            character={characters.white}
            active={state.currentPlayer === "white"}
            barCount={state.bar.white}
            borneOff={state.borneOff.white}
          />
        </div>

        <div className="parchment-play-area order-2 grid gap-2 xl:order-none">
          {boardView === "3d" ? (
            <div className="game-compact-hud grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(230px,270px)]">
              <VictoryTracker state={state} />
              <DicePanel
                state={state}
                onRoll={() => rollCurrentPlayer()}
                canRollOverride={canAct}
              />
            </div>
          ) : (
            <div className="parchment-round-strip">
              <div className="round-status-plaque">
                <span>回合 {roundLabel}</span>
                <strong>{actionLabel}</strong>
              </div>
              <DicePanel
                state={state}
                onRoll={() => rollCurrentPlayer()}
                canRollOverride={canAct}
              />
            </div>
          )}
          {mode === "online" && online ? (
            <section className="parchment-room-strip">
              <span>
                分享房间{" "}
                <strong className="font-mono text-amber-100">
                  {online.roomId}
                </strong>
                。朋友打开链接即可加入。
              </span>
              <span className="max-w-full truncate font-mono text-xs text-amber-100/75">
                {onlineShareUrl}
              </span>
              <span className={canAct ? "text-emerald-100" : "text-stone-400"}>
                {canAct ? "轮到你行动" : "等待对方行动"}
              </span>
              {onlineStatus ? (
                <span className="basis-full text-amber-100">{onlineStatus}</span>
              ) : null}
            </section>
          ) : null}
          {boardView === "3d" ? (
            <GameTable3D
              state={state}
              availableMoves={availableMoves}
              selectedSource={selectedSource}
              targetMoves={targetMoves}
              onSelectSource={selectSource}
              onSelectTarget={selectTarget}
            />
          ) : (
            <Board
              state={state}
              availableMoves={availableMoves}
              selectedSource={selectedSource}
              targetMoves={targetMoves}
              onSelectSource={selectSource}
              onSelectTarget={selectTarget}
              highlightedMoves={highlightedBlackMoves}
            />
          )}
          {boardView === "3d" ? (
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,.95fr)]">
              <TurnCoach
                state={state}
                availableMoves={availableMoves}
                selectedSource={selectedSource}
                targetMoves={targetMoves}
              />
              <PlayFeedback state={state} message={message} />
            </div>
          ) : (
            <ParchmentCommandPanel
              state={state}
              availableMoves={availableMoves}
              selectedSource={selectedSource}
              targetMoves={targetMoves}
              message={message}
              onSelectSource={selectSource}
            />
          )}
          {winner ? (
            <section className="rounded border border-amber-200/40 bg-amber-100/12 p-5 text-center">
              <p className="text-sm text-amber-200">胜负已分</p>
              <h2 className="mt-1 font-display text-3xl text-amber-50">
                {winner === "white" ? "白方胜" : "黑方胜"}
              </h2>
              <p className="mt-2 text-sm text-stone-200">
                {victoryType === "double_win"
                  ? "对手尚未出马，记为双胜。"
                  : "对手已出过马，记为普通胜。"}
              </p>
              <button
                type="button"
                className="mt-4 rounded border border-amber-200/40 bg-amber-100 px-4 py-2 text-sm font-semibold text-stone-950"
                onClick={() => startMatch(mode, boardView)}
              >
                再开一局
              </button>
            </section>
          ) : null}
        </div>

        <div className={`${boardView === "3d" ? "order-4 xl:order-none" : "parchment-side-panel parchment-side-right order-3"}`}>
          <CharacterPanel
            character={characters.black}
            active={state.currentPlayer === "black"}
            barCount={state.bar.black}
            borneOff={state.borneOff.black}
          />
        </div>

        {boardView === "3d" ? null : (
          <nav className="parchment-footer-nav order-4" aria-label="棋局导航">
            <button type="button" onClick={toggleRules}>
              <ScrollText size={23} />
              <span>棋局记录</span>
            </button>
            <button type="button" onClick={toggleRules}>
              <UserRound size={23} />
              <span>角色信息</span>
            </button>
            <button type="button" className="parchment-footer-active" onClick={toggleRules}>
              <BookOpen size={26} />
              <span>博戏志</span>
            </button>
            <button type="button" onClick={toggleRules}>
              <CircleHelp size={24} />
              <span>帮助</span>
            </button>
            <button type="button" onClick={backToMenu}>
              <Home size={24} />
              <span>返回主界面</span>
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
