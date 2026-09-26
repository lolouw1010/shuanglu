import type { Character } from "@/data/characters";

type CharacterPanelProps = {
  character: Character;
  active: boolean;
  barCount: number;
  borneOff: number;
  total: number;
};

function sideLabel(player: Character["player"]): string {
  return player === "white" ? "白方（你）" : "黑方（对手）";
}

function TokenTrack({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total?: number;
}) {
  const visibleSlots = 9;
  const filledSlots = Math.min(count, visibleSlots);

  return (
    <div className="character-track">
      <div className="character-track-heading">
        <span className="character-track-label">
          <span className="character-track-label-full">{label}</span>
          <span className="character-track-label-short" aria-hidden="true">
            {label === "已出马" ? "出" : "栏"}
          </span>
        </span>
        <strong>{count}/{total}</strong>
      </div>
      <div className="character-track-slots" aria-label={`${label} ${count} 枚`}>
        {Array.from({ length: visibleSlots }).map((_, index) => (
          <span
            key={index}
            className={index < filledSlots ? "character-track-slot-filled" : ""}
          />
        ))}
      </div>
    </div>
  );
}

export function CharacterPanel({
  character,
  active,
  barCount,
  borneOff,
  total,
}: CharacterPanelProps) {
  return (
    <aside
      className={`character-scroll-panel character-scroll-${character.player} ${
        active ? "character-scroll-active" : ""
      }`}
    >
      <div className="character-scroll-heading">
        <p>{sideLabel(character.player)}</p>
        <h2>{character.name}</h2>
        <span>{character.title}</span>
      </div>

      <div
        className={`character-portrait character-portrait-${character.player}`}
        role="img"
        aria-label={character.name}
      />

      <p className="character-quote">{character.quote}</p>

      <div className="character-skill-box">
        <span>技能</span>
        <strong>{character.player === "white" ? "观局" : "雅弈"}</strong>
        <p>{character.player === "white" ? "看清可行点，稳扎稳打。" : "偏好压栏、打马与连点。"}</p>
      </div>

      <div className="character-token-box">
        <TokenTrack label="已出马" count={borneOff} total={total} />
        <TokenTrack label="马栏" count={barCount} total={total} />
      </div>
    </aside>
  );
}
