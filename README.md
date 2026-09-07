# Marginal — AI Study Platform

Upload a document, generate quizzes and flashcards from its actual content, and study with an
interactive quiz player and flip-card reviewer. Built with React, React Router, Tailwind CSS v4, and Vite.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

Requires Node.js 18+.

## What's implemented

- **Document upload** — drag-and-drop or file picker. Real text extraction for `.pdf` (pdfjs-dist),
  `.docx` (mammoth), and `.txt`/`.md`, with cleaning and section-chunking, section selection,
  and graceful handling of unsupported/oversized files.
- **Generation pipeline** — `src/services/documentService.js` (extraction/cleaning/chunking) feeds
  `src/services/aiService.js` (generation + validation). The generator is a deterministic,
  extractive algorithm — every question is grounded in a sentence from the uploaded text, so nothing
  is invented. It's swappable for a real LLM backend without touching any calling code (see the
  comment at the top of `aiService.js` for the exact seam — a backend route is required so no API
  key is ever placed in the frontend).
- **Quiz mode** — multiple choice, true/false, fill-in-the-blank, short answer, and mixed quizzes.
  Optional timer, immediate-or-end-of-quiz feedback, scoring, percentage, and a mistake-review view.
  Questions can be starred into the Library's "Saved questions" tab.
- **Flashcard mode** — flip cards, shuffle, Easy / Need Review / Mastered sorting, and a review mode
  that resurfaces only cards marked "Need review."
- **Dashboard** — recent documents, recent study sets, and rollup stats (attempts, average score,
  cards reviewed).
- **Library** — rename, duplicate, delete, and reopen documents, quizzes, and flashcard sets; manage
  saved questions.
- **History** — a day-grouped timeline of quiz attempts and flashcard reviews.
- **Settings** — display name, daily goal, default timer preference, and a full data reset/wipe.

All data (documents, generated sets, history, preferences) is stored in the browser's `localStorage`
via `src/services/storageService.js` — nothing leaves the device except the (currently local, mocked)
generation step.

## Project layout

```
src/
  components/       Reusable UI (Button, Card, Modal, ProgressBar, Skeleton, EmptyState),
                     layout (Sidebar, Topbar, AppLayout), and feature widgets
                     (Dropzone, GenerateForm, QuizPlayer, FlashcardPlayer)
  context/          AppContext (all persisted state + actions), ToastContext
  pages/            One file per route
  services/         documentService, aiService, storageService, seedData
```

## Swapping in a real AI backend

`src/services/aiService.js` exports a single `generateStudyMaterials(params)` function used by the
whole app. To connect a real model:

1. Stand up a backend route (e.g. `/api/generate`) that holds your API key server-side and calls
   your LLM provider.
2. Implement a `backendProvider` object with a `generate(params)` method that `fetch`es that route
   (a template is in the file header comment).
3. Set `activeProvider` to `backendProvider`.

No other file needs to change.
