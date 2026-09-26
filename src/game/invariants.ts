import { POINT_COUNT } from "./constants";
import { countPlayerHorses } from "./movement";
import type { BoardState, Player } from "./types";

const PLAYERS: Player[] = ["white", "black"];

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `Invalid board state: ${label} must be a non-negative integer.`,
    );
  }
}

export function assertBoardStateStructure(state: BoardState): void {
  if (state.points.length !== POINT_COUNT) {
    throw new Error(
      `Invalid board state: expected ${POINT_COUNT} points, received ${state.points.length}.`,
    );
  }

  state.points.forEach((point, index) => {
    assertNonNegativeInteger(point.count, `points[${index}].count`);

    if (point.count === 0 && point.owner !== null) {
      throw new Error(
        `Invalid board state: points[${index}] is empty but still has an owner.`,
      );
    }

    if (point.count > 0 && point.owner === null) {
      throw new Error(
        `Invalid board state: points[${index}] has horses but no owner.`,
      );
    }
  });

  PLAYERS.forEach((player) => {
    assertNonNegativeInteger(state.bar[player], `bar.${player}`);
    assertNonNegativeInteger(state.borneOff[player], `borneOff.${player}`);
  });
}

export function assertBoardStateInvariant(state: BoardState): void {
  assertBoardStateStructure(state);

  PLAYERS.forEach((player) => {
    const actual = countPlayerHorses(state, player);
    const expected = state.ruleConfig.horsesPerPlayer;
    if (actual !== expected) {
      throw new Error(
        `Invalid board state: ${player} has ${actual} horses across points, bar, and borneOff; expected ${expected}.`,
      );
    }
  });
}

export function assertPieceDestinationConservation(
  before: BoardState,
  after: BoardState,
): void {
  assertBoardStateStructure(after);

  PLAYERS.forEach((player) => {
    const previous = countPlayerHorses(before, player);
    const next = countPlayerHorses(after, player);
    if (next !== previous) {
      throw new Error(
        `Piece destination invariant failed: ${player} changed from ${previous} to ${next} horses.`,
      );
    }
  });
}
