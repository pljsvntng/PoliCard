import { Link, useOutletContext } from "react-router-dom";
import { Layers, UploadCloud } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import { useApp } from "../context/AppContext";

export default function Flashcards() {
  const { openMenu } = useOutletContext();
  const { flashcardSets, documents } = useApp();

  return (
    <div>
      <Topbar title="Flashcards" subtitle={`${flashcardSets.length} sets`} onMenu={openMenu} />
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        {flashcardSets.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No flashcard sets yet"
            description="Generate a flashcard set from one of your uploaded documents."
            action={
              <Button as={Link} to={documents.length ? "/documents" : "/upload"} icon={UploadCloud}>
                {documents.length ? "Choose a document" : "Upload a document"}
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSets.map((set) => {
              const doc = documents.find((d) => d.id === set.documentId);
              const mastered = set.cards.filter((c) => c.status === "mastered").length;
              return (
                <Card key={set.id} className="p-5 flex flex-col">
                  <h3 className="text-sm text-ink font-medium mb-1 leading-snug">{set.title}</h3>
                  <p className="text-xs text-slate mb-4">{doc?.name || "Source document deleted"}</p>
                  <ProgressBar value={mastered} max={set.cards.length} tone="amber" label={`${set.cards.length} cards`} />
                  <Button as={Link} to={`/flashcards/${set.id}`} size="sm" className="mt-4">
                    Study set
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
