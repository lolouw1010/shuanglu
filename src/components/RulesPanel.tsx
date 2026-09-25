import { X } from "lucide-react";
import { loreEntries } from "@/data/lore";
import { ruleNotes } from "@/data/ruleNotes";

type RulesPanelProps = {
  onClose: () => void;
};

export function RulesPanel({ onClose }: RulesPanelProps) {
  return (
    <div className="rules-panel-backdrop fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <section className="rules-panel-sheet max-h-[86dvh] w-full max-w-2xl overflow-auto rounded border border-amber-200/30 bg-[#1c1010] p-6 text-stone-100 shadow-lacquer">
        <div className="rules-panel-header mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-amber-100">博戏志</h2>
            <p className="mt-1 text-sm text-stone-300">
              本原型采用基于双陆传统与同类博戏规则的可玩复原规则，并不声称完全等同于唐宋原始规则。
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭规则"
            className="rounded border border-amber-200/20 p-2 text-amber-100 hover:bg-amber-100/10"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 text-sm leading-7 text-stone-200 sm:grid-cols-2">
          {ruleNotes.map((note) => (
            <article key={note.id} className="rounded bg-black/20 p-3">
              <h3 className="font-semibold text-amber-100">{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-3 text-sm leading-7 text-stone-200 sm:grid-cols-2">
          {loreEntries.slice(0, 6).map((entry) => (
            <article key={entry.id} className="rounded bg-black/20 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-amber-100">{entry.title}</h3>
                <span className="rounded border border-amber-200/20 px-2 py-0.5 text-xs text-amber-100/80">
                  {entry.confidence}
                </span>
              </div>
              <p>{entry.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
