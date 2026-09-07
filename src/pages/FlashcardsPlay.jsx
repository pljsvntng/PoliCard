import { useParams, useOutletContext, Navigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import FlashcardPlayer from "../components/flashcards/FlashcardPlayer";
import { useApp } from "../context/AppContext";

export default function FlashcardsPlay() {
  const { id } = useParams();
  const { openMenu } = useOutletContext();
  const { flashcardSets, updateFlashcardSet, logHistory } = useApp();

  const set = flashcardSets.find((f) => f.id === id);
  if (!set) return <Navigate to="/flashcards" replace />;

  const handleMark = (cardId, status) => {
    updateFlashcardSet(id, (f) => ({
      cards: f.cards.map((c) => (c.id === cardId ? { ...c, status } : c)),
    }));
    logHistory({ type: "flashcards", refId: id, title: set.title, reviewed: 1 });
  };

  return (
    <div>
      <Topbar title={set.title} subtitle={`${set.cards.length} cards`} onMenu={openMenu} />
      <div className="p-6 sm:p-8">
        <FlashcardPlayer set={set} onMark={handleMark} />
      </div>
    </div>
  );
}
