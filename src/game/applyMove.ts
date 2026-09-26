import { cloneState } from "./initialState";
import { assertPieceDestinationConservation } from "./invariants";
import { opponent } from "./movement";
import { shouldEndTurn, endTurn } from "./turn";
import { validateMove } from "./validateMove";
import { getWinner } from "./winDetector";
import type { BoardState, Move, Player } from "./types";

function consumeStep(steps: number[], step: number): number[] {
  const index = steps.indexOf(step);
  if (index === -1) return steps;
  return [...steps.slice(0, index), ...steps.slice(index + 1)];
}

function removeFromPoint(state: BoardState, from: number): void {
  const source = state.points[from];
  source.count -= 1;
  if (source.count === 0) {
    source.owner = null;
  }
}

function placeOnPoint(state: BoardState, player: Player, to: number): boolean {
  const target = state.points[to];
  const enemy = opponent(player);
  const hitsOpponent = target.owner === enemy && target.count === 1;

  if (hitsOpponent) {
    state.bar[enemy] += 1;
    target.owner = player;
    target.count = 1;
    return true;
  }

  if (target.owner === player) {
    target.count += 1;
    return false;
  }

  target.owner = player;
  target.count = 1;
  return false;
}

export function applyMove(state: BoardState, move: Move): BoardState {
  const validation = validateMove(state, move);
  if (!validation.legal) {
    throw new Error(`Illegal move: ${validation.reason}`);
  }

  const next = cloneState(state);
  let hitsOpponent = false;

  if (move.type === "normal") {
    removeFromPoint(next, move.from as number);
    hitsOpponent = placeOnPoint(next, move.player, move.to as number);
  }

  if (move.type === "enter_from_bar") {
    next.bar[move.player] -= 1;
    hitsOpponent = placeOnPoint(next, move.player, move.to as number);
  }

  if (move.type === "bear_off") {
    removeFromPoint(next, move.from as number);
    next.borneOff[move.player] += 1;
  }

  next.diceSteps = consumeStep(next.diceSteps, move.step);
  next.moveHistory.push({
    ...move,
    hitsOpponent,
    resultingBar: { ...next.bar },
    resultingBorneOff: { ...next.borneOff },
  });

  assertPieceDestinationConservation(state, next);

  if (getWinner(next)) {
    next.turnPhase = "game_over";
    next.diceSteps = [];
    return next;
  }

  if (shouldEndTurn(next)) {
    return endTurn(next);
  }

  return next;
}
