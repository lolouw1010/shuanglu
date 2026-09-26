import { describe, expect, it } from "vitest";
import {
  assertBoardStateInvariant,
  assertPieceDestinationConservation,
  cloneState,
  createInitialState,
} from "@/game";

describe("board state invariants", () => {
  it("accepts the initial state", () => {
    expect(() => assertBoardStateInvariant(createInitialState())).not.toThrow();
  });

  it("rejects a horse missing from the points destination", () => {
    const state = createInitialState();
    state.points[23].count -= 1;

    expect(() => assertBoardStateInvariant(state)).toThrow(
      "white has 14 horses",
    );
  });

  it("rejects a horse missing from the bar destination", () => {
    const state = createInitialState();
    state.points[23].count -= 1;
    state.bar.white = 1;

    expect(() => assertBoardStateInvariant(state)).not.toThrow();
    state.bar.white -= 1;

    expect(() => assertBoardStateInvariant(state)).toThrow(
      "white has 14 horses",
    );
  });

  it("rejects a horse missing from the borne-off destination", () => {
    const state = createInitialState();
    state.points[23].count -= 1;
    state.borneOff.white = 1;

    expect(() => assertBoardStateInvariant(state)).not.toThrow();
    state.borneOff.white -= 1;

    expect(() => assertBoardStateInvariant(state)).toThrow(
      "white has 14 horses",
    );
  });

  it("rejects an empty point that still has an owner", () => {
    const state = createInitialState();
    state.points[1] = { owner: "white", count: 0 };

    expect(() => assertBoardStateInvariant(state)).toThrow(
      "points[1] is empty but still has an owner",
    );
  });

  it("rejects an occupied point without an owner", () => {
    const state = createInitialState();
    state.points[1] = { owner: null, count: 1 };

    expect(() => assertBoardStateInvariant(state)).toThrow(
      "points[1] has horses but no owner",
    );
  });

  it("rejects negative and fractional destination counts", () => {
    const negative = createInitialState();
    negative.bar.white = -1;
    expect(() => assertBoardStateInvariant(negative)).toThrow(
      "bar.white must be a non-negative integer",
    );

    const fractional = createInitialState();
    fractional.borneOff.black = 0.5;
    expect(() => assertBoardStateInvariant(fractional)).toThrow(
      "borneOff.black must be a non-negative integer",
    );
  });

  it("rejects a move transition that loses a horse", () => {
    const before = createInitialState();
    const after = cloneState(before);
    after.points[23].count -= 1;

    expect(() => assertPieceDestinationConservation(before, after)).toThrow(
      "white changed from 15 to 14 horses",
    );
  });
});
