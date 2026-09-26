import { Flag, Trophy } from "lucide-react";
import type { BoardState, Player } from "@/game";

type VictoryTrackerProps = {
  state: BoardState;
};

function playerName(player: Player): string {
  return player === "white" ? "白方" : "黑方";
}

function progressWidth(done: number, total: number): string {
  return `${Math.min(100, Math.round((done / total) * 100))}%`;
}

function PlayerProgress({
  player,
  active,
  state,
}: {
  player: Player;
  active: boolean;
  state: BoardState;
}) {
  const total = state.ruleConfig.horsesPerPlayer;
  const done = state.borneOff[player];
  const remaining = total - done;

  return (
    <div
      className={`rounded border px-2.5 py-2 ${
        active
          ? "border-amber-200/65 bg-amber-100/12"
          : "border-stone-200/10 bg-black/20"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] text-stone-400">{active ? "当前" : "等待"}</p>
          <h3 className="font-display text-base text-amber-50">{playerName(player)}</h3>
        </div>
        <p className="font-display text-lg text-amber-100">
          {done}
          <span className="text-xs text-stone-400">/{total}</span>
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-black/45">
        <div
          className={`h-full rounded ${
            player === "white" ? "bg-stone-100" : "bg-amber-500"
          }`}
          style={{ width: progressWidth(done, total) }}
        />
      </div>
      <p className="mt-1 truncate text-[11px] text-stone-300">
        还差 <span className="text-amber-100">{remaining}</span> 枚
        {state.bar[player] > 0 ? `；栏中 ${state.bar[player]} 枚` : ""}
      </p>
    </div>
  );
}

export function VictoryTracker({ state }: VictoryTrackerProps) {
  return (
    <section className="rounded border border-amber-200/25 bg-[#1b1110]/92 p-2 shadow-[0_18px_60px_rgba(0,0,0,.22)]">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded border border-amber-200/35 bg-amber-100/10 text-amber-100">
            <Trophy size={14} />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-amber-200/70">
              Win
            </p>
            <h2 className="font-display text-base text-amber-50">
              先出完 {state.ruleConfig.horsesPerPlayer} 枚马
            </h2>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 rounded border border-amber-200/25 bg-black/18 px-2 py-1 text-[11px] text-stone-300 md:inline-flex">
          <Flag size={12} className="text-amber-100" />
          对手未出马则双胜
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <PlayerProgress
          player="white"
          active={state.currentPlayer === "white"}
          state={state}
        />
        <PlayerProgress
          player="black"
          active={state.currentPlayer === "black"}
          state={state}
        />
      </div>
    </section>
  );
}
