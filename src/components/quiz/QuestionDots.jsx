export default function QuestionDots({ total, current, states = [] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => {
        const state = states[i]; // "correct" | "incorrect" | "answered" | undefined
        const isCurrent = i === current;
        let cls = "bg-ink/10";
        if (state === "correct") cls = "bg-moss";
        else if (state === "incorrect") cls = "bg-rose";
        else if (state === "answered") cls = "bg-teal";
        return (
          <span
            key={i}
            className={`rounded-full transition-all duration-200 ${
              isCurrent ? "w-3.5 h-3.5 ring-2 ring-teal/30" : "w-2 h-2"
            } ${cls}`}
          />
        );
      })}
    </div>
  );
}
