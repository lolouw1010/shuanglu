import type { Point, RuleConfig } from "./types";

export const HORSES_PER_PLAYER = 15;
export const POINT_COUNT = 24;

export const DEFAULT_RULE_CONFIG: RuleConfig = {
  mode: "reconstruction",
  useDoublesAsFourSteps: true,
  enableCrushingWin: false,
  horsesPerPlayer: HORSES_PER_PLAYER,
  enableCharacterSkills: false,
};

export const CLASSICAL_RULE_CONFIG: RuleConfig = {
  mode: "classical",
  useDoublesAsFourSteps: false,
  enableCrushingWin: false,
  horsesPerPlayer: HORSES_PER_PLAYER,
  enableCharacterSkills: false,
};

export const WHITE_HOME = [0, 1, 2, 3, 4, 5] as const;
export const BLACK_HOME = [18, 19, 20, 21, 22, 23] as const;

export const INITIAL_POINTS: Point[] = [
  { owner: "black", count: 2 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: "white", count: 5 },
  { owner: null, count: 0 },
  { owner: "white", count: 3 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: "black", count: 5 },
  { owner: "white", count: 5 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: "black", count: 3 },
  { owner: null, count: 0 },
  { owner: "black", count: 5 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: null, count: 0 },
  { owner: "white", count: 2 },
];
