import { useOutletContext, Link } from "react-router-dom";
import { UploadCloud, BrainCircuit, Layers, FileText, Target, ArrowRight, Sparkles } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";
import { useApp } from "../context/AppContext";
import { formatFileSize } from "../services/documentService";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { openMenu } = useOutletContext();
  const { documents, quizzes, flashcardSets, history, settings } = useApp();

  const totalAttempts = quizzes.flatMap((q) => q.attempts || []);
  const avgScore = totalAttempts.length
    ? Math.round(
        (totalAttempts.reduce((s, a) => s + a.score / a.total, 0) / totalAttempts.length) * 100
      )
    : null;
  const cardsReviewed = flashcardSets
    .flatMap((f) => f.cards)
    .filter((c) => c.status !== "new").length;
  const totalCards = flashcardSets.flatMap((f) => f.cards).length;

  const stats = [
    { label: "Documents uploaded", value: documents.length, icon: FileText, tone: "teal" },
    { label: "Quizzes taken", value: totalAttempts.length, icon: BrainCircuit, tone: "amber" },
    { label: "Average score", value: avgScore !== null ? `${avgScore}%` : "—", icon: Target, tone: "moss" },
    { label: "Flashcards reviewed", value: `${cardsReviewed}/${totalCards || 0}`, icon: Layers, tone: "rose" },
  ];

  return (
    <div>
      <Topbar
        title={`Welcome back, ${settings.name || "there"}`}
        subtitle="Here's where your studying stands"
        onMenu={openMenu}
        actions={
          <Button as={Link} to="/upload" size="sm" icon={UploadCloud} className="hidden sm:flex">
            Upload document
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} interactive className="p-4 sm:p-5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  { teal: "bg-teal/10 text-teal-deep", amber: "bg-amber/12 text-[#a25f00]", moss: "bg-moss/10 text-[#0f7a4c]", rose: "bg-rose/10 text-[#c8283a]" }[tone]
                }`}
              >
                <Icon size={17} />
              </div>
              <div className="font-display font-semibold text-2xl text-ink">{value}</div>
              <div className="text-xs text-slate mt-1">{label}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button as={Link} to="/upload" variant="secondary" className="justify-start" icon={UploadCloud}>
            Upload document
          </Button>
          <Button as={Link} to="/quiz" variant="secondary" className="justify-start" icon={BrainCircuit}>
            Create quiz
          </Button>
          <Button as={Link} to="/flashcards" variant="secondary" className="justify-start" icon={Layers}>
            Create flashcards
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-base text-ink flex items-center gap-1.5"><Sparkles size={14} className="text-amber" /> Recent documents</h2>
              <Link to="/documents" className="text-xs text-teal-deep hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Upload a PDF or Word document to get started."
                action={<Button as={Link} to="/upload" size="sm">Upload a document</Button>}
              />
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 4).map((doc) => (
                  <Card key={doc.id} interactive className="p-4 flex items-center gap-3">
                    <FileText size={18} className="text-teal shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">{doc.name}</p>
                      <p className="text-xs text-slate">
                        {formatFileSize(doc.sizeBytes)} · {timeAgo(doc.uploadedAt)}
                      </p>
                    </div>
                    <Link to={`/documents/${doc.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                      Generate
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-base text-ink flex items-center gap-1.5"><Sparkles size={14} className="text-amber" /> Your study sets</h2>
              <Link to="/library" className="text-xs text-teal-deep hover:underline flex items-center gap-1">
                View library <ArrowRight size={12} />
              </Link>
            </div>
            {quizzes.length === 0 && flashcardSets.length === 0 ? (
              <EmptyState
                icon={BrainCircuit}
                title="Nothing generated yet"
                description="Once you upload a document, you can turn it into a quiz or flashcard set."
              />
            ) : (
              <div className="space-y-2">
                {quizzes.slice(0, 2).map((q) => (
                  <Card key={q.id} interactive className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-ink">{q.title}</p>
                      <Link to={`/quiz/${q.id}`} className="text-xs text-teal-deep hover:underline">
                        Study
                      </Link>
                    </div>
                    <ProgressBar
                      value={q.attempts?.[0]?.score || 0}
                      max={q.attempts?.[0]?.total || q.questions.length}
                      tone="teal"
                      label={`${q.questions.length} questions`}
                    />
                  </Card>
                ))}
                {flashcardSets.slice(0, 2).map((f) => {
                  const mastered = f.cards.filter((c) => c.status === "mastered").length;
                  return (
                    <Card key={f.id} interactive className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-ink">{f.title}</p>
                        <Link to={`/flashcards/${f.id}`} className="text-xs text-teal-deep hover:underline">
                          Study
                        </Link>
                      </div>
                      <ProgressBar value={mastered} max={f.cards.length} tone="amber" label={`${f.cards.length} cards`} />
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
