import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Trophy,
  Zap,
  PartyPopper,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import QuestionDots from "./QuestionDots";
import ScoreRing from "./ScoreRing";

function normalize(str) {
  return (str || "").trim().toLowerCase();
}

function isCorrect(question, answer) {
  if (answer === undefined || answer === null || answer === "") return false;
  if (question.type === "shortanswer") {
    // Extractive short-answer: credit any answer that shares real overlap
    // with the source sentence, since we can't semantically grade for free.
    const answerWords = new Set(normalize(answer).split(/\W+/).filter((w) => w.length > 3));
    const sourceWords = normalize(question.correctAnswer).split(/\W+/).filter((w) => w.length > 3);
    const overlap = sourceWords.filter((w) => answerWords.has(w)).length;
    return overlap >= Math.min(3, Math.ceil(sourceWords.length * 0.25));
  }
  return normalize(answer) === normalize(question.correctAnswer);
}

const TYPE_LABEL = { mcq: "Multiple choice", truefalse: "True or false", fillblank: "Fill in the blank", shortanswer: "Short answer" };

export default function QuizPlayer({ quiz, onFinish, savedIds = new Set(), onToggleSave }) {
  const questions = quiz.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timerOn, setTimerOn] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState("end"); // "end" | "immediate"
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);

  useEffect(() => {
    if (!started || submitted || !timerOn) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, submitted, timerOn]);

  const q = questions[index];
  const total = questions.length;

  const results = useMemo(() => {
    if (!submitted) return null;
    const rows = questions.map((question) => ({
      question,
      answer: answers[question.id],
      correct: isCorrect(question, answers[question.id]),
    }));
    const score = rows.filter((r) => r.correct).length;
    return { rows, score, total };
  }, [submitted, questions, answers, total]);

  const dotStates = questions.map((question) => {
    if (submitted) return isCorrect(question, answers[question.id]) ? "correct" : "incorrect";
    const a = answers[question.id];
    return a !== undefined && a !== "" ? "answered" : undefined;
  });

  const setAnswer = (val) => setAnswers((prev) => ({ ...prev, [q.id]: val }));

  const submit = () => {
    setSubmitted(true);
    onFinish({ score: results?.score, total, answers });
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!started) {
    return (
      <Card className="p-8 max-w-lg mx-auto text-center animate-pop-in">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-[#7d79ff] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-pop)]">
          <Trophy size={24} className="text-white" />
        </div>
        <h2 className="font-display text-xl text-ink mb-2">{quiz.title}</h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge tone="teal">{total} questions</Badge>
          <Badge tone="amber">{quiz.difficulty}</Badge>
        </div>
        <div className="space-y-4 text-left mb-7">
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer bg-ink/[0.03] rounded-xl px-3.5 py-3">
            <input type="checkbox" className="accent-teal w-4 h-4" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} />
            <Clock size={15} className="text-slate" />
            Time this attempt
          </label>
          <div>
            <p className="text-xs text-slate mb-1.5 font-medium">Answer feedback</p>
            <div className="flex gap-2">
              {[
                ["end", "Show results at the end"],
                ["immediate", "Show after each question"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFeedbackMode(val)}
                  className={`press-effect text-xs rounded-xl border-2 px-3 py-2.5 flex-1 font-medium transition-colors ${
                    feedbackMode === val ? "border-teal bg-teal/[0.08] text-teal-deep" : "border-line text-ink hover:border-line-strong"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={() => setStarted(true)} icon={Zap} size="lg" className="w-full">
          Start quiz
        </Button>
      </Card>
    );
  }

  if (submitted) {
    const pct = Math.round((results.score / total) * 100);
    const missed = results.rows.filter((r) => !r.correct);
    const celebrate = pct >= 80;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center relative overflow-hidden animate-pop-in">
          {celebrate && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-4 border-moss/30 animate-celebrate-ring" />
          )}
          <p className="text-xs text-slate mb-3 font-medium uppercase tracking-wide flex items-center justify-center gap-1.5">
            {celebrate && <PartyPopper size={13} className="text-amber" />}
            Final score
          </p>
          <div className="flex justify-center mb-4">
            <ScoreRing pct={pct} />
          </div>
          <p className="font-display text-lg text-ink mb-5">
            {results.score} / {total} correct
          </p>
          <div className="flex justify-center">
            <Badge tone={pct >= 80 ? "moss" : pct >= 50 ? "amber" : "rose"} icon={Trophy}>
              {pct >= 80 ? "Great work!" : pct >= 50 ? "Solid effort" : "Keep practicing"}
            </Badge>
          </div>
        </Card>

        {reviewOnly ? (
          <div className="space-y-3">
            <h3 className="font-display text-base text-ink">Review your mistakes</h3>
            {missed.length === 0 && <p className="text-sm text-slate">No mistakes — nice work.</p>}
            {missed.map((r) => (
              <Card key={r.question.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-ink font-medium">{r.question.prompt}</p>
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(r.question)}
                      aria-label="Save question"
                      className="shrink-0 text-slate hover:text-amber press-effect"
                    >
                      <Star size={16} fill={savedIds.has(r.question.id) ? "currentColor" : "none"} className={savedIds.has(r.question.id) ? "text-amber" : ""} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-rose flex items-center gap-1.5 mb-1">
                  <XCircle size={13} /> Your answer: {r.answer || "(blank)"}
                </p>
                <p className="text-xs text-moss flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={13} /> Correct answer: {r.question.correctAnswer}
                </p>
                {r.question.explanation && <p className="text-xs text-slate italic bg-ink/[0.03] rounded-2xl px-3 py-2">{r.question.explanation}</p>}
              </Card>
            ))}
            <Button variant="ghost" onClick={() => setReviewOnly(false)}>
              Back to summary
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base text-ink">All questions</h3>
              {missed.length > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setReviewOnly(true)}>
                  Review {missed.length} mistake{missed.length === 1 ? "" : "s"}
                </Button>
              )}
            </div>
            {results.rows.map((r, i) => (
              <Card key={r.question.id} className={`p-4 border-l-4 ${r.correct ? "border-l-moss" : "border-l-rose"}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink/[0.05] text-slate text-xs font-semibold flex items-center justify-center shrink-0 mb-1">
                    {i + 1}
                  </span>
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(r.question)}
                      aria-label="Save question"
                      className="shrink-0 text-slate hover:text-amber press-effect"
                    >
                      <Star size={14} fill={savedIds.has(r.question.id) ? "currentColor" : "none"} className={savedIds.has(r.question.id) ? "text-amber" : ""} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink mb-2 mt-1">{r.question.prompt}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  {r.correct ? (
                    <Badge tone="moss" icon={CheckCircle2}>Correct</Badge>
                  ) : (
                    <Badge tone="rose" icon={XCircle}>Incorrect — correct answer: {r.question.correctAnswer}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const answered = answers[q.id];
  const showFeedbackNow = feedbackMode === "immediate" && answered !== undefined && answered !== "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <QuestionDots total={total} current={index} states={dotStates} />
        {timerOn && (
          <span className="flex items-center gap-1.5 text-xs text-slate font-mono bg-ink/[0.05] rounded-full px-2.5 py-1">
            <Clock size={13} /> {fmtTime(seconds)}
          </span>
        )}
      </div>
      <ProgressBar value={index + 1} max={total} tone="teal" />

      <Card key={q.id} className="p-6 sm:p-7 mt-5 animate-pop-in">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-full bg-teal/10 text-teal-deep text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <Badge tone="slate">{TYPE_LABEL[q.type]}</Badge>
        </div>
        <p className="text-base sm:text-lg text-ink font-medium mb-6 leading-relaxed">{q.prompt}</p>

        {(q.type === "mcq" || q.type === "truefalse") && (
          <div className="space-y-2.5">
            {q.choices.map((choice, i) => {
              const active = answered === choice;
              const correct = showFeedbackNow && choice === q.correctAnswer;
              const wrong = showFeedbackNow && active && choice !== q.correctAnswer;
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={choice}
                  onClick={() => setAnswer(choice)}
                  className={`press-effect w-full text-left text-sm rounded-2xl border-2 px-4 py-3.5 transition-all duration-150 flex items-center gap-3 ${
                    correct
                      ? "border-moss bg-moss/[0.08] text-ink"
                      : wrong
                      ? "border-rose bg-rose/[0.08] text-ink"
                      : active
                      ? "border-teal bg-teal/[0.07] text-teal-deep font-semibold shadow-[var(--shadow-soft)]"
                      : "border-line hover:border-line-strong text-ink hover:bg-ink/[0.02]"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      correct ? "bg-moss text-white" : wrong ? "bg-rose text-white" : active ? "bg-teal text-white" : "bg-ink/[0.06] text-slate"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {correct && <CheckCircle2 size={17} className="text-moss shrink-0" />}
                  {wrong && <XCircle size={17} className="text-rose shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "fillblank" && (
          <input
            value={answered || ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the missing word or phrase"
            className="w-full rounded-2xl border-2 border-line px-4 py-3.5 text-sm focus:border-teal transition-colors"
          />
        )}

        {q.type === "shortanswer" && (
          <textarea
            value={answered || ""}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="Answer in your own words"
            className="w-full rounded-2xl border-2 border-line px-4 py-3.5 text-sm focus:border-teal resize-none transition-colors"
          />
        )}

        {showFeedbackNow && q.explanation && (
          <p className="text-xs text-slate italic mt-4 border-t border-line pt-3">{q.explanation}</p>
        )}
      </Card>

      <div className="flex items-center justify-between mt-5">
        <Button variant="ghost" icon={ChevronLeft} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Previous
        </Button>
        {index < total - 1 ? (
          <Button iconRight={ChevronRight} onClick={() => setIndex((i) => i + 1)}>
            Next
          </Button>
        ) : (
          <Button icon={RotateCcw} variant="success" onClick={submit}>
            Submit quiz
          </Button>
        )}
      </div>
    </div>
  );
}
