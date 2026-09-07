import { useMemo, useState } from "react";
import { Shuffle, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";

const STATUS_STYLES = {
  easy: "bg-moss/10 text-moss border-moss/30",
  review: "bg-rose/10 text-rose border-rose/30",
  mastered: "bg-teal/10 text-teal-deep border-teal/30",
  new: "bg-ink/5 text-slate border-line",
};

export default function FlashcardPlayer({ set, onMark }) {
  const [mode, setMode] = useState("study"); // "study" | "review"
  const [order, setOrder] = useState(() => set.cards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const pool = useMemo(() => {
    const cards = mode === "review" ? set.cards.filter((c) => c.status === "review") : set.cards;
    const map = new Map(cards.map((c) => [c.id, c]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }, [mode, set.cards, order]);

  const card = pool[Math.min(index, pool.length - 1)];

  const shuffleCards = () => {
    const ids = [...set.cards.map((c) => c.id)];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder(ids);
    setIndex(0);
    setFlipped(false);
  };

  const go = (dir) => {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min(pool.length - 1, i + dir)));
  };

  const mark = (status) => {
    onMark(card.id, status);
    if (index < pool.length - 1) go(1);
  };

  if (pool.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-sm text-slate mb-4">
          {mode === "review" ? "Nothing marked \u201cNeed review\u201d right now." : "This set has no cards."}
        </p>
        {mode === "review" && (
          <Button variant="secondary" onClick={() => setMode("study")}>
            Back to study mode
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["study", "review"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setIndex(0);
                setFlipped(false);
              }}
              className={`text-xs rounded-md px-3 py-1.5 border ${
                mode === m ? "border-teal bg-teal/[0.07] text-teal-deep font-medium" : "border-line text-slate"
              }`}
            >
              {m === "study" ? "Study mode" : "Review mode"}
            </button>
          ))}
        </div>
        <button onClick={shuffleCards} className="text-xs text-slate flex items-center gap-1.5 hover:text-ink">
          <Shuffle size={13} /> Shuffle
        </button>
      </div>

      <ProgressBar value={index + 1} max={pool.length} tone="amber" label={`Card ${index + 1} of ${pool.length}`} />

      <div className="mt-5 perspective-distant">
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative h-64 cursor-pointer card-flip-inner"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <div className="card-flip-face absolute inset-0 rounded-lg border border-line bg-paper flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs text-slate mb-3">Term</span>
            <p className="font-display text-xl text-ink leading-snug">{card.front}</p>
            <span className="text-xs text-slate/70 mt-6 flex items-center gap-1.5">
              <RotateCw size={12} /> Tap to flip
            </span>
          </div>
          <div className="card-flip-face card-flip-back absolute inset-0 rounded-lg border border-teal/30 bg-teal/4 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs text-teal-deep mb-3">Definition</span>
            <p className="text-sm text-ink leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <Button variant="ghost" icon={ChevronLeft} disabled={index === 0} onClick={() => go(-1)}>
          Prev
        </Button>
        <span className={`text-xs rounded-full border px-2.5 py-1 capitalize ${STATUS_STYLES[card.status]}`}>
          {card.status === "new" ? "Not reviewed" : card.status}
        </span>
        <Button variant="ghost" iconRight={ChevronRight} disabled={index === pool.length - 1} onClick={() => go(1)}>
          Next
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Button variant="secondary" size="sm" onClick={() => mark("review")} className="border-rose/30 text-rose hover:bg-rose/6">
          Need review
        </Button>
        <Button variant="secondary" size="sm" onClick={() => mark("easy")} className="border-amber/40 text-amber hover:bg-amber/6">
          Easy
        </Button>
        <Button variant="secondary" size="sm" onClick={() => mark("mastered")} className="border-moss/30 text-moss hover:bg-moss/6">
          Mastered
        </Button>
      </div>
    </div>
  );
}
