import { Link } from "react-router-dom";
import { ArrowRight, UploadCloud, BrainCircuit, Layers, BookOpen } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload what you're studying",
    body: "A textbook chapter, a lecture PDF, your own notes. POLICARD reads the text straight out of the file.",
  },
  {
    icon: BrainCircuit,
    title: "Choose how to be tested",
    body: "Multiple choice, true or false, fill-in-the-blank, short answer, or a mixed quiz — every question traces back to a line in your document.",
  },
  {
    icon: Layers,
    title: "Review until it sticks",
    body: "Flip through flashcards, sort what you've mastered from what needs another pass, and track it over time.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-full bg-parchment">
      <header className="flex items-center justify-between px-6 sm:px-10 h-20">
        <div className="flex items-center gap-2 text-ink">
          <BookOpen size={20} className="text-teal" />
          <span className="font-display text-xl">POLICARD</span>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-ink border border-line-strong rounded-md px-4 py-2 hover:border-ink transition-colors"
        >
          Open study desk
        </Link>
      </header>

      <main className="px-6 sm:px-10">
        <section className="max-w-3xl mx-auto pt-16 pb-20 text-center">
          <p className="text-sm text-teal-deep font-medium mb-4">A study platform that reads with you</p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] text-ink mb-6">
            Turn any document into a quiz you can actually learn from.
          </h1>
          <p className="text-base sm:text-lg text-slate max-w-xl mx-auto mb-9 leading-relaxed">
            Upload a PDF, a Word doc, or your notes. Marginal builds questions and flashcards
            straight from what's on the page — nothing invented, nothing off-topic.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-teal text-white rounded-md px-6 py-3 font-medium hover:bg-teal-deep transition-colors"
          >
            Upload your first document
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 pb-24">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="border border-line rounded-lg p-6 bg-paper">
              <div className="flex items-center gap-2 text-xs text-slate mb-4">
                <span className="w-6 h-6 rounded-full border border-line-strong flex items-center justify-center font-mono text-[11px]">
                  {i + 1}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <Icon size={20} className="text-teal mb-3" />
              <h3 className="font-display text-base text-ink mb-2">{title}</h3>
              <p className="text-sm text-slate leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
