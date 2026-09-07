import { uid } from "./storageService";

// A small, realistic first-run state so new users land somewhere useful
// instead of an empty dashboard. Everything here is deletable.
export function seedDemoData() {
  const docId = uid("doc");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const sourceText =
    "Cellular respiration is the process by which cells break down glucose to release energy. " +
    "This process occurs in three main stages: glycolysis, the Krebs cycle, and the electron transport chain. " +
    "Glycolysis takes place in the cytoplasm and splits one molecule of glucose into two molecules of pyruvate. " +
    "The Krebs cycle occurs inside the mitochondrial matrix and produces carbon dioxide as a byproduct. " +
    "The electron transport chain is located in the inner mitochondrial membrane and generates the majority of a cell's ATP. " +
    "In total, aerobic respiration can produce approximately 36 to 38 molecules of ATP per glucose molecule. " +
    "Without oxygen, cells rely on fermentation, which produces far less energy than aerobic respiration. " +
    "Mitochondria are often called the powerhouse of the cell because they are the primary site of ATP production.";

  const documents = [
    {
      id: docId,
      name: "Cellular Respiration — Chapter 7.pdf",
      sizeBytes: 482_300,
      pageCount: 4,
      uploadedAt: now - 3 * day,
      status: "ready",
      text: sourceText,
      chunks: [{ id: "sec_1", title: "Section 1 — Cellular respiration overview", text: sourceText }],
    },
  ];

  const quizId = uid("quiz");
  const quizzes = [
    {
      id: quizId,
      documentId: docId,
      title: "Cellular Respiration — Quick Check",
      type: "mcq",
      difficulty: "Medium",
      createdAt: now - 2 * day,
      questions: [
        {
          id: uid("q"),
          type: "mcq",
          prompt: "_____ occurs inside the mitochondrial matrix and produces carbon dioxide as a byproduct.",
          choices: ["The Krebs cycle", "Glycolysis", "Fermentation", "Photosynthesis"],
          correctAnswer: "The Krebs cycle",
          explanation: 'The source states: "The Krebs cycle occurs inside the mitochondrial matrix and produces carbon dioxide as a byproduct."',
        },
        {
          id: uid("q"),
          type: "mcq",
          prompt: "Glycolysis takes place in the _____ and splits glucose into two pyruvate molecules.",
          choices: ["cytoplasm", "nucleus", "Golgi apparatus", "cell wall"],
          correctAnswer: "cytoplasm",
          explanation: 'The source states: "Glycolysis takes place in the cytoplasm and splits one molecule of glucose into two molecules of pyruvate."',
        },
        {
          id: uid("q"),
          type: "truefalse",
          prompt: "Aerobic respiration can produce approximately 36 to 38 molecules of ATP per glucose molecule.",
          choices: ["True", "False"],
          correctAnswer: "True",
          explanation: "This statement is taken directly from the document.",
        },
      ],
      attempts: [
        {
          id: uid("att"),
          date: now - 1 * day,
          score: 2,
          total: 3,
          answers: {},
        },
      ],
    },
  ];

  const fsetId = uid("fset");
  const flashcardSets = [
    {
      id: fsetId,
      documentId: docId,
      title: "Cellular Respiration — Key Terms",
      createdAt: now - 2 * day,
      cards: [
        { id: uid("card"), front: "Mitochondria", back: "Often called the powerhouse of the cell; the primary site of ATP production.", status: "mastered" },
        { id: uid("card"), front: "Glycolysis", back: "Takes place in the cytoplasm and splits one molecule of glucose into two molecules of pyruvate.", status: "easy" },
        { id: uid("card"), front: "Krebs cycle", back: "Occurs inside the mitochondrial matrix and produces carbon dioxide as a byproduct.", status: "review" },
        { id: uid("card"), front: "Electron transport chain", back: "Located in the inner mitochondrial membrane; generates the majority of a cell's ATP.", status: "new" },
        { id: uid("card"), front: "Fermentation", back: "Used without oxygen; produces far less energy than aerobic respiration.", status: "new" },
      ],
    },
  ];

  const history = [
    { id: uid("hist"), date: now - 1 * day, type: "quiz", refId: quizId, title: "Cellular Respiration — Quick Check", score: 2, total: 3 },
    { id: uid("hist"), date: now - 2 * day, type: "flashcards", refId: fsetId, title: "Cellular Respiration — Key Terms", reviewed: 5 },
  ];

  return { documents, quizzes, flashcardSets, history };
}
