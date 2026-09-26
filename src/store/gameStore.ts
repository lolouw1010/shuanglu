"use client";

import { create } from "zustand";
import {
  applyMove,
  chooseAIMove,
  createInitialState,
  diceToSteps,
  endTurn,
  generateLegalMoves,
  getWinner,
  rollDice,
  shouldEndTurn,
  type BoardState,
  type DiceRoll,
  type Move,
} from "@/game";
import { characters } from "@/data/characters";
import type {
  OnlineActionResponse,
  OnlineJoinResponse,
  OnlineRoomView,
  OnlineSeat,
} from "@/online/types";
import { onlineApiUrl } from "@/online/runtimeConfig";

type GameMode = "human" | "ai" | "online";
type BoardView = "classic" | "3d";
type Screen = "menu" | "game";
type Source = number | "bar";

type OnlineSession = {
  roomId: string;
  playerId: string;
  seat: OnlineSeat;
  players: Record<"white" | "black", boolean>;
  version: number;
  updatedAt: number;
};

type GameStore = {
  screen: Screen;
  mode: GameMode;
  boardView: BoardView;
  state: BoardState;
  online: OnlineSession | null;
  selectedSource: Source | null;
  targetMoves: Move[];
  showRules: boolean;
  message: string;
  onlineStatus: string | null;
  startMatch: (mode: GameMode, boardView?: BoardView) => void;
  createOnlineRoom: () => Promise<void>;
  joinOnlineRoom: (roomId: string) => Promise<void>;
  syncOnlineRoom: () => Promise<void>;
  backToMenu: () => void;
  toggleRules: () => void;
  rollCurrentPlayer: (roll?: DiceRoll) => void;
  selectSource: (source: Source) => void;
  selectTarget: (target: number | "off") => void;
  runAITurn: () => void;
};

function playerLabel(player: "white" | "black"): string {
  return player === "white" ? "白方" : "黑方";
}

function rollIntoState(state: BoardState, roll: DiceRoll): BoardState {
  return {
    ...state,
    currentRoll: roll,
    diceSteps: diceToSteps(roll, state.ruleConfig),
    turnPhase: "awaiting_move",
  };
}

function messageForState(state: BoardState): string {
  const winner = getWinner(state);
  if (winner) return `${playerLabel(winner)}胜。`;
  if (state.turnPhase === "awaiting_roll") {
    return `${playerLabel(state.currentPlayer)}请掷骰。目标是先出完 ${state.ruleConfig.horsesPerPlayer} 枚马。`;
  }
  if (state.bar[state.currentPlayer] > 0) {
    return `尚有${playerLabel(state.currentPlayer)}马在栏：先点棋盘中部的“马栏/复马”按钮，再点绿色入口。`;
  }
  return `${playerLabel(state.currentPlayer)}行棋：先点发光的己方马。`;
}

function finishRollIfNoMoves(state: BoardState): BoardState {
  if (shouldEndTurn(state)) return endTurn(state);
  return state;
}

function removeOneStep(steps: number[], step: number): number[] {
  const index = steps.indexOf(step);
  if (index === -1) return steps;
  return [...steps.slice(0, index), ...steps.slice(index + 1)];
}

function stepsText(steps: number[]): string {
  return steps.length > 0 ? steps.join(" / ") : "无";
}

function blockedRollMessage(rolled: BoardState, next: BoardState): string {
  const player = playerLabel(rolled.currentPlayer);
  const nextPlayer = playerLabel(next.currentPlayer);
  if (rolled.bar[rolled.currentPlayer] > 0) {
    return `${player}掷出 ${stepsText(rolled.diceSteps)}，但栏中马没有可复马入口，回合交给${nextPlayer}。`;
  }
  return `${player}掷出 ${stepsText(rolled.diceSteps)}，但没有合法走法，回合交给${nextPlayer}。`;
}

function blockedRemainderMessage(before: BoardState, move: Move, next: BoardState): string | null {
  if (next.currentPlayer === before.currentPlayer || next.turnPhase !== "awaiting_roll") return null;

  const remaining = removeOneStep(before.diceSteps, move.step);
  if (remaining.length === 0) return null;

  return `${playerLabel(before.currentPlayer)}已走 ${move.step} 步；剩余步数 ${stepsText(remaining)} 没有合法走法，回合交给${playerLabel(next.currentPlayer)}。`;
}

function getClientPlayerId(): string {
  const storageKey = "shuanglu.playerId";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const next =
    window.crypto?.randomUUID?.() ??
    `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(storageKey, next);
  return next;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(body.error ?? "online_request_failed");
  }
  return body;
}

function applyOnlineRoom(
  room: OnlineRoomView,
  playerId: string,
  seat: OnlineSeat,
): Partial<GameStore> {
  return {
    screen: "game",
    mode: "online",
    boardView: "classic",
    state: room.state,
    online: {
      roomId: room.id,
      playerId,
      seat,
      players: room.players,
      version: room.version,
      updatedAt: room.updatedAt,
    },
    selectedSource: null,
    targetMoves: [],
    onlineStatus: null,
    message:
      seat === "spectator"
        ? `正在旁观房间 ${room.id}。`
        : `${seat === "white" ? "你执白" : "你执黑"}。${room.message}`,
  };
}

function canActOnline(state: BoardState, online: OnlineSession | null): boolean {
  return Boolean(online && online.seat === state.currentPlayer);
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "menu",
  mode: "human",
  boardView: "classic",
  state: createInitialState(),
  online: null,
  selectedSource: null,
  targetMoves: [],
  showRules: false,
  message: "请开始一局双陆。",
  onlineStatus: null,

  startMatch: (mode, boardView = "classic") => {
    const state = createInitialState();
    set({
      screen: "game",
      mode,
      boardView,
      state,
      online: null,
      selectedSource: null,
      targetMoves: [],
      showRules: false,
      onlineStatus: null,
      message: messageForState(state),
    });
  },

  createOnlineRoom: async () => {
    set({ onlineStatus: "正在开设房间..." });
    try {
      const playerId = getClientPlayerId();
      const data = await readResponse<OnlineJoinResponse>(
        await fetch(onlineApiUrl("/api/rooms"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        }),
      );
      window.history.replaceState(null, "", `/?room=${data.room.id}`);
      set(applyOnlineRoom(data.room, data.playerId, data.seat));
    } catch (error) {
      set({
        onlineStatus:
          error instanceof Error ? error.message : "创建房间失败，请重试。",
      });
    }
  },

  joinOnlineRoom: async (roomId) => {
    const normalized = roomId.trim().toUpperCase();
    if (!normalized) {
      set({ onlineStatus: "请输入房间码。" });
      return;
    }

    set({ onlineStatus: "正在加入房间..." });
    try {
      const playerId = getClientPlayerId();
      const data = await readResponse<OnlineJoinResponse>(
        await fetch(onlineApiUrl(`/api/rooms/${encodeURIComponent(normalized)}`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, action: "join" }),
        }),
      );
      window.history.replaceState(null, "", `/?room=${data.room.id}`);
      set(applyOnlineRoom(data.room, data.playerId, data.seat));
    } catch (error) {
      set({
        onlineStatus:
          error instanceof Error ? error.message : "加入房间失败，请检查房间码。",
      });
    }
  },

  syncOnlineRoom: async () => {
    const online = get().online;
    if (!online) return;

    try {
      const data = await readResponse<OnlineActionResponse>(
        await fetch(
          onlineApiUrl(
            `/api/rooms/${encodeURIComponent(online.roomId)}?playerId=${encodeURIComponent(
              online.playerId,
            )}`,
          ),
          { cache: "no-store" },
        ),
      );
      if (data.room.version === online.version && data.seat === online.seat) {
        set({
          online: {
            ...online,
            players: data.room.players,
            updatedAt: data.room.updatedAt,
          },
          onlineStatus: null,
        });
        return;
      }
      set(applyOnlineRoom(data.room, online.playerId, data.seat));
    } catch (error) {
      set({
        onlineStatus:
          error instanceof Error ? error.message : "房间同步失败，稍后重试。",
      });
    }
  },

  backToMenu: () => {
    set({
      screen: "menu",
      state: createInitialState(),
      boardView: "classic",
      online: null,
      selectedSource: null,
      targetMoves: [],
      onlineStatus: null,
      message: "请开始一局双陆。",
    });
    window.history.replaceState(null, "", "/");
  },

  toggleRules: () => set((store) => ({ showRules: !store.showRules })),

  rollCurrentPlayer: (forcedRoll) => {
    const current = get().state;
    if (current.turnPhase !== "awaiting_roll") return;

    const online = get().online;
    if (get().mode === "online") {
      if (!online || !canActOnline(current, online)) {
        set({ message: "等待对方行动。" });
        return;
      }

      void fetch(onlineApiUrl(`/api/rooms/${encodeURIComponent(online.roomId)}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: online.playerId, action: "roll" }),
      })
        .then((response) => readResponse<OnlineActionResponse>(response))
        .then((data) => {
          set(applyOnlineRoom(data.room, online.playerId, data.seat));
        })
        .catch((error) => {
          set({
            onlineStatus:
              error instanceof Error ? error.message : "掷骰失败，请重试。",
          });
        });
      return;
    }

    const rolled = rollIntoState(current, forcedRoll ?? rollDice());
    const next = finishRollIfNoMoves(rolled);
    set({
      state: next,
      selectedSource: null,
      targetMoves: [],
      message:
        next.currentPlayer !== rolled.currentPlayer
          ? blockedRollMessage(rolled, next)
          : messageForState(next),
    });
  },

  selectSource: (source) => {
    const state = get().state;
    if (state.turnPhase !== "awaiting_move") return;
    if (get().mode === "online" && !canActOnline(state, get().online)) {
      set({ message: "等待对方行动。" });
      return;
    }

    const moves = generateLegalMoves(state).filter((move) => move.from === source);
    set({
      selectedSource: source,
      targetMoves: moves,
      message:
        moves.length > 0
          ? source === "bar"
            ? "已选择马栏。现在点绿色入口，把栏中马复入棋盘。"
            : "请选择绿色落点。"
          : state.bar[state.currentPlayer] > 0
            ? "栏中马必须先复入。请点棋盘中部的“马栏/复马”按钮。"
            : "此马暂无可行之步，请改选发光的己方马。",
    });
  },

  selectTarget: (target) => {
    const { state, targetMoves } = get();
    const move = targetMoves.find((candidate) => candidate.to === target);
    if (!move) return;

    const online = get().online;
    if (get().mode === "online") {
      if (!online || !canActOnline(state, online)) {
        set({ message: "等待对方行动。" });
        return;
      }

      void fetch(onlineApiUrl(`/api/rooms/${encodeURIComponent(online.roomId)}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: online.playerId,
          action: "move",
          from: move.from,
          to: move.to,
        }),
      })
        .then((response) => readResponse<OnlineActionResponse>(response))
        .then((data) => {
          set(applyOnlineRoom(data.room, online.playerId, data.seat));
        })
        .catch((error) => {
          set({
            onlineStatus:
              error instanceof Error ? error.message : "走子失败，请重试。",
          });
        });
      return;
    }

    const next = applyMove(state, move);
    const canContinue =
      next.currentPlayer === state.currentPlayer &&
      next.turnPhase === "awaiting_move";
    const blockedRemainder = blockedRemainderMessage(state, move, next);
    set({
      state: next,
      selectedSource: null,
      targetMoves: [],
      message:
        blockedRemainder ??
        (move.hitsOpponent && canContinue
          ? "敌方孤马已被打入栏。继续点发光的己方马。"
          : messageForState(next)),
    });
  },

  runAITurn: () => {
    const store = get();
    if (store.mode !== "ai") return;
    let state = store.state;
    if (state.currentPlayer !== "black" || state.turnPhase === "game_over") return;

    let aiMessage: string | null = null;

    if (state.turnPhase === "awaiting_roll") {
      const rolled = rollIntoState(state, rollDice());
      state = finishRollIfNoMoves(rolled);
      if (state.currentPlayer !== rolled.currentPlayer) {
        aiMessage = blockedRollMessage(rolled, state);
      }
    }

    let guard = 0;
    while (
      state.currentPlayer === "black" &&
      state.turnPhase === "awaiting_move" &&
      guard < 8
    ) {
      const move = chooseAIMove(
        state,
        "black",
        characters.black.aiProfile,
      );
      if (!move) {
        state = endTurn(state);
        break;
      }
      const beforeMove = state;
      state = applyMove(state, move);
      aiMessage = blockedRemainderMessage(beforeMove, move, state) ?? aiMessage;
      guard += 1;
    }

    set({
      state,
      selectedSource: null,
      targetMoves: [],
      message: aiMessage ?? messageForState(state),
    });
  },
}));
