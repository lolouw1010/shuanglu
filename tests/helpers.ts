import {
  createInitialState,
  POINT_COUNT,
  type BoardState,
  type Player,
  type Point,
  type RuleConfig,
} from "@/game";

export function emptyPoints(): Point[] {
  return Array.from({ length: POINT_COUNT }, () => ({ owner: null, count: 0 }));
}

export function stateWithPoints(
  points: Point[],
  player: Player = "white",
  diceSteps: number[] = [1],
  config?: RuleConfig,
): BoardState {
  return {
    ...createInitialState(config),
    points,
    currentPlayer: player,
    diceSteps,
    currentRoll: null,
    turnPhase: "awaiting_move",
    moveHistory: [],
  };
}

export function put(
  points: Point[],
  index: number,
  owner: Player,
  count: number,
): Point[] {
  points[index] = { owner, count };
  return points;
}
