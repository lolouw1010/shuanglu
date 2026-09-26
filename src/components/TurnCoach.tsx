import { Goal, MousePointer2, Route, ShieldAlert } from "lucide-react";
import type { BoardState, Move } from "@/game";

type TurnCoachProps = {
  state: BoardState;
  availableMoves: Move[];
  selectedSource: number | "bar" | null;
  targetMoves: Move[];
};

function playerLabel(player: "white" | "black"): string {
  return player === "white" ? "白方" : "黑方";
}

function sourceLabel(source: number | "bar"): string {
  return source === "bar" ? "马栏" : `${source} 路`;
}

function targetLabel(target: number | "off"): string {
  return target === "off" ? "出马" : `${target} 路`;
}

function moveLabel(move: Move): string {
  return `${sourceLabel(move.from)} -> ${targetLabel(move.to)}，用 ${move.step} 步${
    move.hitsOpponent ? "，可打马" : ""
  }`;
}

function currentActionText(
  state: BoardState,
  selectedSource: number | "bar" | null,
  targetMoves: Move[],
): string {
  if (state.turnPhase === "game_over") {
    return `本局结束。胜者是先把 ${state.ruleConfig.horsesPerPlayer} 枚马全部移出棋盘的一方。`;
  }

  if (state.turnPhase === "awaiting_roll") {
    return `轮到${playerLabel(state.currentPlayer)}。先掷骰，骰面会变成本回合可用步数。`;
  }

  if (state.bar[state.currentPlayer] > 0 && selectedSource !== "bar") {
    return "栏中有马时必须先复马。先点棋盘中部写着“点这里复马”的马栏按钮，再点绿色入口。";
  }

  if (selectedSource !== null) {
    if (targetMoves.length === 0) {
      return "这枚马暂时没有合法落点。改点其他发光的己方马。";
    }
    return "现在点绿色落点。落到敌方孤马可打马；敌方两枚以上成关，不能进入。";
  }

  return "点一枚发光的己方马。白方往低点走，黑方往高点走。";
}

export function TurnCoach({
  state,
  availableMoves,
  selectedSource,
  targetMoves,
}: TurnCoachProps) {
  const examples = (selectedSource === null ? availableMoves : targetMoves).slice(0, 3);
  const actionText = currentActionText(state, selectedSource, targetMoves);
  const moveCount =
    state.turnPhase === "awaiting_move"
      ? selectedSource === null
        ? availableMoves.length
        : targetMoves.length
      : 0;

  return (
    <section className="rounded border border-amber-200/20 bg-[#20110f]/88 px-4 py-3 text-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[260px] flex-1">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-100/10 px-3 py-1 text-xs font-semibold text-amber-100">
            <Goal size={15} />
            本回合
          </div>
          <p className="text-sm leading-6 text-stone-200">{actionText}</p>
          {state.turnPhase === "awaiting_move" ? (
            <p className="mt-2 text-xs text-amber-100/80">
              当前可行动作：{moveCount} 个
              {state.diceSteps.length ? `；剩余步数 ${state.diceSteps.join(" / ")}` : ""}
            </p>
          ) : null}
        </div>

        <div className="grid min-w-[360px] flex-1 gap-2 text-xs leading-5 text-stone-300 sm:grid-cols-3">
          <div className="rounded border border-stone-200/8 bg-black/18 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-stone-100">
              <Route size={14} />
              行路
            </div>
            <p>白方 23 -&gt; 0；黑方 0 -&gt; 23。</p>
          </div>
          <div className="rounded border border-stone-200/8 bg-black/18 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-stone-100">
              <ShieldAlert size={14} />
              打马
            </div>
            <p>一枚敌马可打入栏；两枚以上是关。</p>
          </div>
          <div className="rounded border border-stone-200/8 bg-black/18 px-3 py-2">
            <div className="flex items-center gap-2 font-semibold text-stone-100">
              <MousePointer2 size={14} />
              点击
            </div>
            <p>
              {state.bar[state.currentPlayer] > 0
                ? "复马：先点马栏按钮，再点绿色入口。"
                : "先点发光己方马，再点绿色落点。"}
            </p>
          </div>
        </div>
      </div>

      {examples.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {examples.map((move) => (
            <span
              key={`${move.type}-${move.from}-${move.to}-${move.step}`}
              className="rounded border border-emerald-200/30 bg-emerald-300/10 px-2.5 py-1 text-emerald-100"
            >
              {moveLabel(move)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
