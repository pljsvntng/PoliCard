import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, RotateCcw, Star } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

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

  const setAnswer = (val) => setAnswers((prev) => ({ ...prev, [q.id]: val }));

  const submit = () => {
    setSubmitted(true);
    onFinish({ score: results?.score, total, answers });
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!started) {
    return (
      <Card className="p-6 max-w-lg mx-auto text-center">
        <h2 className="font-display text-xl text-ink mb-2">{quiz.title}</h2>
        <p className="text-sm text-slate mb-6">
          {total} questions · {quiz.difficulty} difficulty
        </p>
        <div className="space-y-3 text-left mb-6">
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input type="checkbox" className="accent-teal" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} />
            Time this attempt
          </label>
          <div>
            <p className="text-xs text-slate mb-1.5">Answer feedback</p>
            <div className="flex gap-2">
              {[
                ["end", "Show results at the end"],
                ["immediate", "Show after each question"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFeedbackMode(val)}
                  className={`text-xs rounded-md border px-3 py-2 flex-1 ${
                    feedbackMode === val ? "border-teal bg-teal/[0.07] text-teal-deep font-medium" : "border-line text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={() => setStarted(true)} className="w-full">
          Start quiz
        </Button>
      </Card>
    );
  }

  if (submitted) {
    const pct = Math.round((results.score / total) * 100);
    const missed = results.rows.filter((r) => !r.correct);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 text-center">
          <p className="text-xs text-slate mb-1">Final score</p>
          <p className="font-display text-4xl text-ink mb-2">
            {results.score}/{total}
          </p>
          <p className="text-sm text-teal-deep font-medium mb-4">{pct}%</p>
          <ProgressBar value={results.score} max={total} tone={pct >= 70 ? "moss" : "amber"} />
        </Card>

        {reviewOnly ? (
          <div className="space-y-3">
            <h3 className="font-display text-base text-ink">Review your mistakes</h3>
            {missed.length === 0 && <p className="text-sm text-slate">No mistakes — nice work.</p>}
            {missed.map((r) => (
              <Card key={r.question.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-ink">{r.question.prompt}</p>
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(r.question)}
                      aria-label="Save question"
                      className="shrink-0 text-slate hover:text-amber"
                    >
                      <Star size={15} fill={savedIds.has(r.question.id) ? "currentColor" : "none"} className={savedIds.has(r.question.id) ? "text-amber" : ""} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-rose flex items-center gap-1.5 mb-1">
                  <XCircle size={13} /> Your answer: {r.answer || "(blank)"}
                </p>
                <p className="text-xs text-moss flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={13} /> Correct answer: {r.question.correctAnswer}
                </p>
                {r.question.explanation && <p className="text-xs text-slate italic">{r.question.explanation}</p>}
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
              <Card key={r.question.id} className={`p-4 border-l-2 ${r.correct ? "border-l-moss" : "border-l-rose"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-slate mb-1">Question {i + 1}</p>
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(r.question)}
                      aria-label="Save question"
                      className="shrink-0 text-slate hover:text-amber"
                    >
                      <Star size={14} fill={savedIds.has(r.question.id) ? "currentColor" : "none"} className={savedIds.has(r.question.id) ? "text-amber" : ""} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink mb-2">{r.question.prompt}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  {r.correct ? (
                    <span className="flex items-center gap-1 text-moss"><CheckCircle2 size={13} /> Correct</span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose"><XCircle size={13} /> Incorrect — correct answer: {r.question.correctAnswer}</span>
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
        <p className="text-xs text-slate">
          Question {index + 1} of {total}
        </p>
        {timerOn && (
          <span className="flex items-center gap-1.5 text-xs text-slate font-mono">
            <Clock size={13} /> {fmtTime(seconds)}
          </span>
        )}
      </div>
      <ProgressBar value={index + 1} max={total} tone="teal" />

      <Card className="p-6 mt-5">
        <p className="text-xs text-teal-deep font-medium mb-2 uppercase tracking-wide">
          {{ mcq: "Multiple choice", truefalse: "True or false", fillblank: "Fill in the blank", shortanswer: "Short answer" }[q.type]}
        </p>
        <p className="text-base text-ink mb-5 leading-relaxed">{q.prompt}</p>

        {(q.type === "mcq" || q.type === "truefalse") && (
          <div className="space-y-2">
            {q.choices.map((choice) => {
              const active = answered === choice;
              const correct = showFeedbackNow && choice === q.correctAnswer;
              const wrong = showFeedbackNow && active && choice !== q.correctAnswer;
              return (
                <button
                  key={choice}
                  onClick={() => setAnswer(choice)}
                  className={`w-full text-left text-sm rounded-md border px-4 py-3 transition-colors ${
                    correct
                      ? "border-moss bg-moss/[0.08] text-ink"
                      : wrong
                      ? "border-rose bg-rose/[0.08] text-ink"
                      : active
                      ? "border-teal bg-teal/[0.07] text-teal-deep font-medium"
                      : "border-line hover:border-line-strong text-ink"
                  }`}
                >
                  {choice}
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
            className="w-full rounded-md border border-line px-4 py-3 text-sm focus:border-teal"
          />
        )}

        {q.type === "shortanswer" && (
          <textarea
            value={answered || ""}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="Answer in your own words"
            className="w-full rounded-md border border-line px-4 py-3 text-sm focus:border-teal resize-none"
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
          <Button icon={RotateCcw} onClick={submit}>
            Submit quiz
          </Button>
        )}
      </div>
    </div>
  );
}
