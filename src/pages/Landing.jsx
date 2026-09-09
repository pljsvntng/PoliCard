import { Link } from "react-router-dom";
import { ArrowRight, UploadCloud, BrainCircuit, Layers, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload what you're studying",
    body: "A textbook chapter, a lecture PDF, your own notes. PoliCard reads the text straight out of the file.",
    tone: "teal",
  },
  {
    icon: BrainCircuit,
    title: "Choose how to be tested",
    body: "Multiple choice, true or false, fill-in-the-blank, short answer, or a mixed quiz — every question traces back to a line in your document.",
    tone: "amber",
  },
  {
    icon: Layers,
    title: "Review until it sticks",
    body: "Flip through flashcards, sort what you've mastered from what needs another pass, and track it over time.",
    tone: "moss",
  },
];

const TONE_BG = {
  teal: "bg-teal/10 text-teal-deep",
  amber: "bg-amber/12 text-[#a25f00]",
  moss: "bg-moss/10 text-[#0f7a4c]",
};

export default function Landing() {
  return (
    <div className="min-h-full bg-parchment">
      <header className="flex items-center justify-between px-6 sm:px-10 h-20">
        <div className="flex items-center gap-2 text-ink">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal to-[#7d79ff] flex items-center justify-center shadow-[var(--shadow-pop)]">
            <Sparkles size={17} className="text-white" />
          </span>
          <span className="font-display text-xl">PoliCard</span>
        </div>
        <Link
          to="/dashboard"
          className="press-effect text-sm font-semibold text-ink border-2 border-line-strong rounded-2xl px-5 py-2.5 hover:border-teal hover:text-teal-deep transition-colors"
        >
          Open study desk
        </Link>
      </header>

      <main className="px-6 sm:px-10">
        <section className="max-w-3xl mx-auto pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-sm text-teal-deep font-semibold mb-5 bg-teal/10 rounded-full px-3.5 py-1.5">
            <Sparkles size={13} /> A study platform that reads with you
          </span>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] text-ink mb-6">
            Turn any document into a quiz you can actually learn from.
          </h1>
          <p className="text-base sm:text-lg text-slate max-w-xl mx-auto mb-9 leading-relaxed">
            Upload a PDF, a Word doc, or your notes. PoliCard builds questions and flashcards
            straight from what's on the page — nothing invented, nothing off-topic.
          </p>
          <Link
            to="/upload"
            className="press-effect inline-flex items-center gap-2 bg-teal text-white rounded-2xl px-7 py-3.5 font-semibold shadow-[0_2px_0_0_rgba(0,0,0,0.12),var(--shadow-lift)] hover:bg-teal-deep transition-colors"
          >
            Upload your first document
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 pb-24">
          {STEPS.map(({ icon: Icon, title, body, tone }, i) => (
            <div key={title} className="lift-on-hover border border-line rounded-3xl p-6 bg-paper shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-xs text-slate mb-5">
                <span className="w-7 h-7 rounded-full border-2 border-line-strong flex items-center justify-center font-mono text-[11px] font-semibold text-ink">
                  {i + 1}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${TONE_BG[tone]}`}>
                <Icon size={19} />
              </div>
              <h3 className="font-display text-base text-ink mb-2">{title}</h3>
              <p className="text-sm text-slate leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
