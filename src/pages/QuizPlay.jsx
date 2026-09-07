import { useParams, useOutletContext, Navigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import QuizPlayer from "../components/quiz/QuizPlayer";
import { useApp } from "../context/AppContext";
import { uid } from "../services/storageService";

export default function QuizPlay() {
  const { id } = useParams();
  const { openMenu } = useOutletContext();
  const { quizzes, updateQuiz, logHistory, savedQuestions, toggleSavedQuestion } = useApp();

  const quiz = quizzes.find((q) => q.id === id);
  if (!quiz) return <Navigate to="/quiz" replace />;

  const handleFinish = ({ score, total, answers }) => {
    const attempt = { id: uid("att"), date: Date.now(), score, total, answers };
    updateQuiz(id, (q) => ({ attempts: [attempt, ...(q.attempts || [])] }));
    logHistory({ type: "quiz", refId: id, title: quiz.title, score, total });
  };

  const savedIds = new Set(savedQuestions.map((s) => s.question.id));

  return (
    <div>
      <Topbar title={quiz.title} subtitle={`${quiz.questions.length} questions`} onMenu={openMenu} />
      <div className="p-6 sm:p-8">
        <QuizPlayer
          quiz={quiz}
          onFinish={handleFinish}
          savedIds={savedIds}
          onToggleSave={(question) => toggleSavedQuestion(question, quiz.title, quiz.id)}
        />
      </div>
    </div>
  );
}
