import { Link, useOutletContext } from "react-router-dom";
import { BrainCircuit, UploadCloud } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useApp } from "../context/AppContext";
import { QUESTION_TYPE_LABELS } from "../services/aiService";

export default function Quiz() {
  const { openMenu } = useOutletContext();
  const { quizzes, documents } = useApp();

  return (
    <div>
      <Topbar title="Quizzes" subtitle={`${quizzes.length} generated`} onMenu={openMenu} />
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        {quizzes.length === 0 ? (
          <EmptyState
            icon={BrainCircuit}
            title="No quizzes yet"
            description="Generate a quiz from one of your uploaded documents."
            action={
              <Button as={Link} to={documents.length ? "/documents" : "/upload"} icon={UploadCloud}>
                {documents.length ? "Choose a document" : "Upload a document"}
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => {
              const lastAttempt = q.attempts?.[0];
              const doc = documents.find((d) => d.id === q.documentId);
              return (
                <Card key={q.id} interactive className="p-5 flex flex-col">
                  <p className="text-xs text-teal-deep font-medium mb-1">{QUESTION_TYPE_LABELS[q.type]}</p>
                  <h3 className="text-sm text-ink font-medium mb-1 leading-snug">{q.title}</h3>
                  <p className="text-xs text-slate mb-4">{doc?.name || "Source document deleted"}</p>
                  <div className="text-xs text-slate mb-4 flex items-center justify-between">
                    <span>{q.questions.length} questions</span>
                    <span>{q.difficulty}</span>
                  </div>
                  {lastAttempt && (
                    <p className="text-xs text-slate mb-4">
                      Last attempt: {lastAttempt.score}/{lastAttempt.total}
                    </p>
                  )}
                  <Button as={Link} to={`/quiz/${q.id}`} size="sm" className="mt-auto">
                    {lastAttempt ? "Retake quiz" : "Start quiz"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
