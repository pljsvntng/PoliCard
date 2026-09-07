import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  FileText,
  BrainCircuit,
  Layers,
  Star,
  Trash2,
  Copy,
  Pencil,
  Check,
  X,
} from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { formatFileSize } from "../services/documentService";

const TABS = [
  { key: "documents", label: "Documents", icon: FileText },
  { key: "quizzes", label: "Quizzes", icon: BrainCircuit },
  { key: "flashcards", label: "Flashcards", icon: Layers },
  { key: "saved", label: "Saved questions", icon: Star },
];

function RenameRow({ value, onSave, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onSave(draft.trim());
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 text-sm rounded-md border border-teal px-2 py-1 min-w-0"
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              onSave(draft.trim());
              setEditing(false);
            }
          }}
          className="text-moss shrink-0"
          aria-label="Save name"
        >
          <Check size={15} />
        </button>
        <button onClick={() => setEditing(false)} className="text-slate shrink-0" aria-label="Cancel">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {children}
      <button onClick={() => setEditing(true)} className="text-slate hover:text-ink shrink-0" aria-label="Rename">
        <Pencil size={13} />
      </button>
    </div>
  );
}

export default function Library() {
  const { openMenu } = useOutletContext();
  const {
    documents,
    quizzes,
    flashcardSets,
    savedQuestions,
    removeDocument,
    renameDocument,
    removeQuiz,
    duplicateQuiz,
    updateQuiz,
    removeFlashcardSet,
    duplicateFlashcardSet,
    updateFlashcardSet,
    removeSavedQuestion,
  } = useApp();
  const { notify } = useToast();
  const [tab, setTab] = useState("documents");
  const [pendingDelete, setPendingDelete] = useState(null);

  const runDelete = () => {
    const { kind, item } = pendingDelete;
    if (kind === "document") removeDocument(item.id);
    if (kind === "quiz") removeQuiz(item.id);
    if (kind === "flashcards") removeFlashcardSet(item.id);
    if (kind === "saved") removeSavedQuestion(item.id);
    notify(`Deleted "${item.title || item.name}"`, "info");
    setPendingDelete(null);
  };

  return (
    <div>
      <Topbar title="Library" subtitle="Manage everything you've built" onMenu={openMenu} />

      <div className="p-6 sm:p-8 max-w-4xl mx-auto">
        <div className="flex gap-1.5 mb-6 border-b border-line overflow-x-auto thin-scroll">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 text-sm px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                tab === key ? "border-teal text-ink font-medium" : "border-transparent text-slate hover:text-ink"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === "documents" && (
          documents.length === 0 ? (
            <EmptyState icon={FileText} title="No documents" description="Upload one to get started." action={<Button as={Link} to="/upload">Upload</Button>} />
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4 flex items-center gap-3">
                  <FileText size={16} className="text-teal shrink-0" />
                  <RenameRow value={doc.name} onSave={(v) => renameDocument(doc.id, v)}>
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{doc.name}</p>
                      <p className="text-xs text-slate">{formatFileSize(doc.sizeBytes)}</p>
                    </div>
                  </RenameRow>
                  <Link to={`/documents/${doc.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                    Open
                  </Link>
                  <button onClick={() => setPendingDelete({ kind: "document", item: doc })} className="text-slate hover:text-rose shrink-0" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === "quizzes" && (
          quizzes.length === 0 ? (
            <EmptyState icon={BrainCircuit} title="No quizzes" description="Generate one from a document." action={<Button as={Link} to="/documents">Choose a document</Button>} />
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <Card key={q.id} className="p-4 flex items-center gap-3">
                  <BrainCircuit size={16} className="text-teal shrink-0" />
                  <RenameRow value={q.title} onSave={(v) => updateQuiz(q.id, () => ({ title: v }))}>
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{q.title}</p>
                      <p className="text-xs text-slate">{q.questions.length} questions</p>
                    </div>
                  </RenameRow>
                  <Link to={`/quiz/${q.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                    Open
                  </Link>
                  <button onClick={() => { duplicateQuiz(q.id); notify(`Duplicated "${q.title}"`, "success"); }} className="text-slate hover:text-ink shrink-0" aria-label="Duplicate">
                    <Copy size={15} />
                  </button>
                  <button onClick={() => setPendingDelete({ kind: "quiz", item: q })} className="text-slate hover:text-rose shrink-0" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === "flashcards" && (
          flashcardSets.length === 0 ? (
            <EmptyState icon={Layers} title="No flashcard sets" description="Generate one from a document." action={<Button as={Link} to="/documents">Choose a document</Button>} />
          ) : (
            <div className="space-y-2">
              {flashcardSets.map((f) => (
                <Card key={f.id} className="p-4 flex items-center gap-3">
                  <Layers size={16} className="text-amber shrink-0" />
                  <RenameRow value={f.title} onSave={(v) => updateFlashcardSet(f.id, () => ({ title: v }))}>
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{f.title}</p>
                      <p className="text-xs text-slate">{f.cards.length} cards</p>
                    </div>
                  </RenameRow>
                  <Link to={`/flashcards/${f.id}`} className="text-xs text-teal-deep hover:underline shrink-0">
                    Open
                  </Link>
                  <button onClick={() => { duplicateFlashcardSet(f.id); notify(`Duplicated "${f.title}"`, "success"); }} className="text-slate hover:text-ink shrink-0" aria-label="Duplicate">
                    <Copy size={15} />
                  </button>
                  <button onClick={() => setPendingDelete({ kind: "flashcards", item: f })} className="text-slate hover:text-rose shrink-0" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === "saved" && (
          savedQuestions.length === 0 ? (
            <EmptyState icon={Star} title="No saved questions" description="Star a question during quiz review to save it here." />
          ) : (
            <div className="space-y-2">
              {savedQuestions.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm text-ink flex-1">{s.question.prompt}</p>
                    <button onClick={() => setPendingDelete({ kind: "saved", item: { id: s.id, title: s.question.prompt } })} className="text-slate hover:text-rose shrink-0" aria-label="Remove">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-slate mb-2">From "{s.quizTitle}" · Answer: {s.question.correctAnswer}</p>
                  {s.quizId && (
                    <Link to={`/quiz/${s.quizId}`} className="text-xs text-teal-deep hover:underline">
                      Open quiz
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Delete this?" width="max-w-sm">
        <p className="text-sm text-slate mb-5">
          This can't be undone
          {pendingDelete?.kind === "document" ? " — quizzes and flashcards made from it will be removed too." : "."}
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={runDelete}>Delete</Button>
          <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
