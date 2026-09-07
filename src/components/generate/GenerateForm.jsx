import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { generateStudyMaterials, QUESTION_TYPE_LABELS } from "../../services/aiService";
import { useToast } from "../../context/ToastContext";

const TYPES = ["mcq", "truefalse", "fillblank", "shortanswer", "mixed", "flashcards"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function GenerateForm({ document, onCreated }) {
  const { notify } = useToast();
  const [type, setType] = useState("mcq");
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState("Medium");
  const [chunkId, setChunkId] = useState("all");
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isFlashcards = type === "flashcards";
  const sourceText =
    chunkId === "all"
      ? document.chunks.map((c) => c.text).join("\n\n")
      : document.chunks.find((c) => c.id === chunkId)?.text || document.text;

  const handleGenerate = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await generateStudyMaterials({
        text: sourceText,
        type,
        count: Number(count),
        difficulty,
        includeExplanations,
      });
      onCreated({
        type,
        difficulty,
        includeAnswers,
        title: title.trim() || `${document.name.replace(/\.[^.]+$/, "")} — ${QUESTION_TYPE_LABELS[type]}`,
        questions: result.questions,
        cards: result.cards,
      });
    } catch (e) {
      setError(e.message || "Generation failed. Try a different section or fewer questions.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-slate mb-1.5 block">What do you want to generate?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-sm rounded-md border px-3 py-2 text-left transition-colors ${
                type === t ? "border-teal bg-teal/[0.07] text-teal-deep font-medium" : "border-line text-ink hover:border-line-strong"
              }`}
            >
              {QUESTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate mb-1.5 block">Set title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${document.name.replace(/\.[^.]+$/, "")} — ${QUESTION_TYPE_LABELS[type]}`}
          className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate mb-1.5 block">{isFlashcards ? "Number of cards" : "Number of questions"}</label>
          <input
            type="number"
            min={1}
            max={30}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
          />
        </div>
        <div>
          <label className="text-xs text-slate mb-1.5 block">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate mb-1.5 block">Topic / section</label>
        <select
          value={chunkId}
          onChange={(e) => setChunkId(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
        >
          <option value="all">Whole document</option>
          {document.chunks.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {!isFlashcards && (
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input type="checkbox" className="accent-teal" checked={includeExplanations} onChange={(e) => setIncludeExplanations(e.target.checked)} />
            Include explanations for correct answers
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input type="checkbox" className="accent-teal" checked={includeAnswers} onChange={(e) => setIncludeAnswers(e.target.checked)} />
            Include an answer key in the review screen
          </label>
        </div>
      )}

      {error && <p className="text-sm text-rose bg-rose/[0.06] border border-rose/20 rounded-md p-3">{error}</p>}

      <Button onClick={handleGenerate} disabled={busy} icon={busy ? undefined : Sparkles} className="w-full">
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Generating…
          </>
        ) : (
          `Generate ${isFlashcards ? "flashcards" : "quiz"}`
        )}
      </Button>
    </div>
  );
}
