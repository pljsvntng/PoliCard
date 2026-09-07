import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import Quiz from "./pages/Quiz";
import QuizPlay from "./pages/QuizPlay";
import Flashcards from "./pages/Flashcards";
import FlashcardsPlay from "./pages/FlashcardsPlay";
import Library from "./pages/Library";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz/:id" element={<QuizPlay />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/flashcards/:id" element={<FlashcardsPlay />} />
              <Route path="/library" element={<Library />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
