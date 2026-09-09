import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FileText, Trash2, UploadCloud, Sparkles } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { formatFileSize } from "../services/documentService";

export default function Documents() {
  const { openMenu } = useOutletContext();
  const { documents, quizzes, flashcardSets, removeDocument } = useApp();
  const { notify } = useToast();
  const [pendingDelete, setPendingDelete] = useState(null);

  const confirmDelete = () => {
    removeDocument(pendingDelete.id);
    notify(`Deleted "${pendingDelete.name}"`, "info");
    setPendingDelete(null);
  };

  return (
    <div>
      <Topbar
        title="Documents"
        subtitle={`${documents.length} uploaded`}
        onMenu={openMenu}
        actions={
          <Button as={Link} to="/upload" size="sm" icon={UploadCloud} className="hidden sm:flex">
            Upload
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload a PDF, Word document, or text file to start generating quizzes and flashcards."
            action={<Button as={Link} to="/upload">Upload a document</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => {
              const quizCount = quizzes.filter((q) => q.documentId === doc.id).length;
              const setCount = flashcardSets.filter((f) => f.documentId === doc.id).length;
              return (
                <Card key={doc.id} interactive className="p-5 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText size={20} className="text-teal shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-slate">
                        {formatFileSize(doc.sizeBytes)}
                        {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate/90 line-clamp-2 mb-4 flex-1">{doc.text.slice(0, 140)}…</p>
                  <div className="flex items-center justify-between text-xs text-slate mb-4">
                    <span>{quizCount} quiz{quizCount === 1 ? "" : "zes"}</span>
                    <span>{setCount} flashcard set{setCount === 1 ? "" : "s"}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button as={Link} to={`/documents/${doc.id}`} size="sm" icon={Sparkles} className="flex-1">
                      Generate
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(doc)} aria-label="Delete document">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Delete document?" width="max-w-sm">
        <p className="text-sm text-slate mb-5">
          This removes "{pendingDelete?.name}" along with every quiz and flashcard set generated from it. This can't be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
