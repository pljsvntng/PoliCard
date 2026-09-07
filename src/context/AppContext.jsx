import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { loadCollection, saveCollection, uid, clearAll } from "../services/storageService";
import { seedDemoData } from "../services/seedData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [documents, setDocuments] = useState(() => loadCollection("documents", null));
  const [quizzes, setQuizzes] = useState(() => loadCollection("quizzes", null));
  const [flashcardSets, setFlashcardSets] = useState(() => loadCollection("flashcardSets", null));
  const [history, setHistory] = useState(() => loadCollection("history", null));
  const [savedQuestions, setSavedQuestions] = useState(() => loadCollection("savedQuestions", []));
  const [settings, setSettings] = useState(() =>
    loadCollection("settings", { name: "Student", dailyGoalMinutes: 20, timerDefault: false })
  );

  // First run: seed a small demo set so the product doesn't open empty.
  useEffect(() => {
    if (documents === null) {
      const seed = seedDemoData();
      setDocuments(seed.documents);
      setQuizzes(seed.quizzes);
      setFlashcardSets(seed.flashcardSets);
      setHistory(seed.history);
    }
  }, [documents]);

  useEffect(() => {
    if (documents !== null) saveCollection("documents", documents);
  }, [documents]);
  useEffect(() => {
    if (quizzes !== null) saveCollection("quizzes", quizzes);
  }, [quizzes]);
  useEffect(() => {
    if (flashcardSets !== null) saveCollection("flashcardSets", flashcardSets);
  }, [flashcardSets]);
  useEffect(() => {
    if (history !== null) saveCollection("history", history);
  }, [history]);
  useEffect(() => {
    saveCollection("settings", settings);
  }, [settings]);
  useEffect(() => {
    saveCollection("savedQuestions", savedQuestions);
  }, [savedQuestions]);

  const toggleSavedQuestion = useCallback((question, quizTitle, quizId) => {
    setSavedQuestions((prev) => {
      const exists = prev.find((s) => s.question.id === question.id);
      if (exists) return prev.filter((s) => s.question.id !== question.id);
      return [{ id: uid("saved"), question, quizTitle, quizId, savedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeSavedQuestion = useCallback((id) => {
    setSavedQuestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addDocument = useCallback((doc) => {
    const record = { id: uid("doc"), uploadedAt: Date.now(), ...doc };
    setDocuments((prev) => [record, ...(prev || [])]);
    return record;
  }, []);

  const removeDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setQuizzes((prev) => prev.filter((q) => q.documentId !== id));
    setFlashcardSets((prev) => prev.filter((f) => f.documentId !== id));
  }, []);

  const addQuiz = useCallback((quiz) => {
    const record = { id: uid("quiz"), createdAt: Date.now(), attempts: [], ...quiz };
    setQuizzes((prev) => [record, ...(prev || [])]);
    return record;
  }, []);

  const updateQuiz = useCallback((id, updater) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updater(q) } : q)));
  }, []);

  const removeQuiz = useCallback((id) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const duplicateQuiz = useCallback((id) => {
    setQuizzes((prev) => {
      const source = prev.find((q) => q.id === id);
      if (!source) return prev;
      const copy = { ...source, id: uid("quiz"), title: `${source.title} (copy)`, createdAt: Date.now(), attempts: [] };
      return [copy, ...prev];
    });
  }, []);

  const addFlashcardSet = useCallback((set) => {
    const record = { id: uid("fset"), createdAt: Date.now(), ...set };
    setFlashcardSets((prev) => [record, ...(prev || [])]);
    return record;
  }, []);

  const updateFlashcardSet = useCallback((id, updater) => {
    setFlashcardSets((prev) => prev.map((f) => (f.id === id ? { ...f, ...updater(f) } : f)));
  }, []);

  const removeFlashcardSet = useCallback((id) => {
    setFlashcardSets((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const duplicateFlashcardSet = useCallback((id) => {
    setFlashcardSets((prev) => {
      const source = prev.find((f) => f.id === id);
      if (!source) return prev;
      const copy = {
        ...source,
        id: uid("fset"),
        title: `${source.title} (copy)`,
        createdAt: Date.now(),
        cards: source.cards.map((c) => ({ ...c, id: uid("card"), status: "new" })),
      };
      return [copy, ...prev];
    });
  }, []);

  const renameDocument = useCallback((id, name) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  }, []);

  const logHistory = useCallback((entry) => {
    const record = { id: uid("hist"), date: Date.now(), ...entry };
    setHistory((prev) => [record, ...(prev || [])]);
    return record;
  }, []);

  const resetAllData = useCallback(() => {
    clearAll();
    const seed = seedDemoData();
    setDocuments(seed.documents);
    setQuizzes(seed.quizzes);
    setFlashcardSets(seed.flashcardSets);
    setHistory(seed.history);
  }, []);

  const wipeAllData = useCallback(() => {
    clearAll();
    setDocuments([]);
    setQuizzes([]);
    setFlashcardSets([]);
    setHistory([]);
  }, []);

  const value = useMemo(
    () => ({
      documents: documents || [],
      quizzes: quizzes || [],
      flashcardSets: flashcardSets || [],
      history: history || [],
      savedQuestions,
      settings,
      setSettings,
      addDocument,
      removeDocument,
      addQuiz,
      updateQuiz,
      removeQuiz,
      addFlashcardSet,
      updateFlashcardSet,
      removeFlashcardSet,
      logHistory,
      toggleSavedQuestion,
      removeSavedQuestion,
      resetAllData,
      wipeAllData,
      loading: documents === null,
    }),
    [documents, quizzes, flashcardSets, history, savedQuestions, settings, addDocument, removeDocument, addQuiz, updateQuiz, removeQuiz, addFlashcardSet, updateFlashcardSet, removeFlashcardSet, logHistory, toggleSavedQuestion, removeSavedQuestion, resetAllData, wipeAllData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
