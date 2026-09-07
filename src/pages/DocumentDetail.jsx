import { useState } from "react";
import { useParams, useOutletContext, Link, Navigate } from "react-router-dom";
import { Sparkles, BrainCircuit, Layers, FileText } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import GenerateForm from "../components/generate/GenerateForm";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { formatFileSize } from "../services/documentService";

export default function DocumentDetail() {
  const { id } = useParams();
  const { openMenu } = useOutletContext();
  const { documents, quizzes, flashcardSets, addQuiz, addFlashcardSet } = useApp();
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const document = documents.find((d) => d.id === id);
  const docQuizzes = quizzes.filter((q) => q.documentId === id);
  const docSets = flashcardSets.filter((f) => f.documentId === id);

  if (!document) return <Navigate to="/documents" replace />;

  const handleCreated = (payload) => {
    if (payload.cards) {
      addFlashcardSet({ documentId: id, title: payload.title, cards: payload.cards });
      notify(`Created flashcard set "${payload.title}"`, "success");
    } else {
      addQuiz({
        documentId: id,
        title: payload.title,
        type: payload.type,
        difficulty: payload.difficulty,
        includeAnswers: payload.includeAnswers,
        questions: payload.questions,
      });
      notify(`Created quiz "${payload.title}"`, "success");
    }
    setModalOpen(false);
  };

  return (
    <div>
      <Topbar title={document.name} subtitle="Choose what to generate from this document" onMenu={openMenu} />

      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-teal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-ink font-medium">{document.name}</p>
                <p className="text-xs text-slate">
                  {formatFileSize(document.sizeBytes)}
                  {document.pageCount ? ` · ${document.pageCount} pages` : ""} · {document.chunks.length} section
                  {document.chunks.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Button onClick={() => setModalOpen(true)} icon={Sparkles} size="sm">
              Generate
            </Button>
          </div>
          <div className="text-sm text-ink/80 bg-ink/[0.03] rounded-md p-3 max-h-32 overflow-y-auto thin-scroll leading-relaxed">
            {document.text.slice(0, 600)}…
          </div>
        </Card>

        <section>
          <h2 className="font-display text-base text-ink mb-3">Quizzes from this document</h2>
          {docQuizzes.length === 0 ? (
            <p className="text-sm text-slate">None yet — generate one above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {docQuizzes.map((q) => (
                <Card key={q.id} className="p-4 flex items-center gap-3">
                  <BrainCircuit size={17} className="text-teal shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{q.title}</p>
                    <p className="text-xs text-slate">{q.questions.length} questions · {q.difficulty}</p>
                  </div>
                  <Link to={`/quiz/${q.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                    Open
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-base text-ink mb-3">Flashcard sets from this document</h2>
          {docSets.length === 0 ? (
            <p className="text-sm text-slate">None yet — generate one above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {docSets.map((f) => (
                <Card key={f.id} className="p-4 flex items-center gap-3">
                  <Layers size={17} className="text-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{f.title}</p>
                    <p className="text-xs text-slate">{f.cards.length} cards</p>
                  </div>
                  <Link to={`/flashcards/${f.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                    Open
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate study materials">
        <GenerateForm document={document} onCreated={handleCreated} />
      </Modal>
    </div>
  );
}
