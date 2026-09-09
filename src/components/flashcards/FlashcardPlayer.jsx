import { useMemo, useState } from "react";
import { Shuffle, ChevronLeft, ChevronRight, RotateCw, Frown, Smile, Trophy } from "lucide-react";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";

const STATUS_STYLES = {
  easy: "bg-amber/12 text-[#a25f00] border-amber/25",
  review: "bg-rose/10 text-[#c8283a] border-rose/25",
  mastered: "bg-moss/10 text-[#0f7a4c] border-moss/25",
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
        <div className="w-12 h-12 rounded-2xl bg-moss/10 text-moss flex items-center justify-center mx-auto mb-4">
          <Trophy size={20} />
        </div>
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
        <div className="flex gap-2 bg-ink/[0.04] p-1 rounded-xl">
          {["study", "review"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setIndex(0);
                setFlipped(false);
              }}
              className={`press-effect text-xs rounded-2xl px-3 py-1.5 font-medium transition-colors ${
                mode === m ? "bg-paper text-teal-deep shadow-[var(--shadow-soft)]" : "text-slate hover:text-ink"
              }`}
            >
              {m === "study" ? "Study mode" : "Review mode"}
            </button>
          ))}
        </div>
        <button onClick={shuffleCards} className="press-effect text-xs text-slate flex items-center gap-1.5 hover:text-ink bg-ink/[0.04] rounded-2xl px-3 py-1.5">
          <Shuffle size={13} /> Shuffle
        </button>
      </div>

      <ProgressBar value={index + 1} max={pool.length} tone="amber" label={`Card ${index + 1} of ${pool.length}`} />

      <div className="mt-5 [perspective:1200px]">
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative h-64 sm:h-72 cursor-pointer card-flip-inner"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <div className="card-flip-face absolute inset-0 rounded-3xl border-2 border-line bg-paper shadow-[var(--shadow-lift)] flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs font-semibold text-teal-deep bg-teal/10 rounded-full px-3 py-1 mb-4">Term</span>
            <p className="font-display text-xl sm:text-2xl text-ink leading-snug">{card.front}</p>
            <span className="text-xs text-slate/70 mt-6 flex items-center gap-1.5">
              <RotateCw size={12} /> Tap to flip
            </span>
          </div>
          <div className="card-flip-face card-flip-back absolute inset-0 rounded-3xl border-2 border-teal/30 bg-gradient-to-br from-teal/[0.06] to-[#7d79ff]/[0.06] shadow-[var(--shadow-lift)] flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs font-semibold text-teal-deep bg-paper rounded-full px-3 py-1 mb-4 shadow-[var(--shadow-soft)]">Definition</span>
            <p className="text-sm sm:text-base text-ink leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <Button variant="ghost" icon={ChevronLeft} disabled={index === 0} onClick={() => go(-1)}>
          Prev
        </Button>
        <span className={`text-xs font-semibold rounded-full border-2 px-3 py-1.5 capitalize ${STATUS_STYLES[card.status]}`}>
          {card.status === "new" ? "Not reviewed" : card.status}
        </span>
        <Button variant="ghost" iconRight={ChevronRight} disabled={index === pool.length - 1} onClick={() => go(1)}>
          Next
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Button
          size="sm"
          onClick={() => mark("review")}
          icon={Frown}
          className="bg-rose/10 text-[#c8283a] shadow-none hover:bg-rose/20 hover:shadow-none border-2 border-transparent"
        >
          Need review
        </Button>
        <Button
          size="sm"
          onClick={() => mark("easy")}
          className="bg-amber/12 text-[#a25f00] shadow-none hover:bg-amber/20 hover:shadow-none border-2 border-transparent"
        >
          Easy
        </Button>
        <Button
          size="sm"
          onClick={() => mark("mastered")}
          icon={Smile}
          className="bg-moss/10 text-[#0f7a4c] shadow-none hover:bg-moss/20 hover:shadow-none border-2 border-transparent"
        >
          Mastered
        </Button>
      </div>
    </div>
  );
}
