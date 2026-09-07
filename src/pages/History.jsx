import { Link, useOutletContext } from "react-router-dom";
import { BrainCircuit, Layers, History as HistoryIcon } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { useApp } from "../context/AppContext";

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function groupByDay(history) {
  const groups = new Map();
  for (const h of history) {
    const key = formatDate(h.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(h);
  }
  return Array.from(groups.entries());
}

export default function History() {
  const { openMenu } = useOutletContext();
  const { history } = useApp();
  const groups = groupByDay(history);

  return (
    <div>
      <Topbar title="History" subtitle={`${history.length} study sessions logged`} onMenu={openMenu} />

      <div className="p-6 sm:p-8 max-w-3xl mx-auto">
        {history.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No study sessions yet"
            description="Take a quiz or review some flashcards and it'll show up here."
          />
        ) : (
          <div className="space-y-8">
            {groups.map(([day, items]) => (
              <div key={day}>
                <p className="text-xs text-slate mb-3 font-mono">{day}</p>
                <div className="space-y-2">
                  {items.map((h) => (
                    <Card key={h.id} className="p-4 flex items-center gap-3">
                      {h.type === "quiz" ? (
                        <BrainCircuit size={17} className="text-teal shrink-0" />
                      ) : (
                        <Layers size={17} className="text-amber shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink truncate">{h.title}</p>
                        <p className="text-xs text-slate">
                          {h.type === "quiz"
                            ? `Scored ${h.score}/${h.total} (${Math.round((h.score / h.total) * 100)}%)`
                            : "Reviewed a flashcard"}
                        </p>
                      </div>
                      <Link
                        to={h.type === "quiz" ? `/quiz/${h.refId}` : `/flashcards/${h.refId}`}
                        className="text-xs text-teal-deep hover:underline shrink-0"
                      >
                        Revisit
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
