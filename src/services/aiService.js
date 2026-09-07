// Stage 5–6 of the pipeline: AI Generation -> Validation.
//
// This module exposes ONE stable function, `generateStudyMaterials`, so the
// rest of the app never talks to a specific AI vendor. Swapping providers —
// e.g. pointing this at a real backend route that calls an LLM — means
// changing `activeProvider` below and nothing else. No API key ever lives
// in this frontend; a real provider MUST call your own backend endpoint,
// which then holds the key server-side.
//
//   const backendProvider = {
//     async generate(params) {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(params),
//       });
//       if (!res.ok) throw new Error("Generation failed");
//       return res.json(); // { questions } or { cards }
//     },
//   };

import { uid } from "./storageService";

const STOPWORDS = new Set(
  "the a an of and or but to in on at for with is are was were be been being this that these those it its as by from into over under between within than then so such not no nor also can could may might will would shall should must do does did have has had you your we our they their he she his her i my me".split(
    " "
  )
);

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 320 && /[a-zA-Z]/.test(s));
}

function words(sentence) {
  return sentence.match(/[A-Za-z][A-Za-z'-]+/g) || [];
}

// Pick the most "informative" token in a sentence to use as an answer/blank:
// prefer capitalized multi-word terms and numbers, fall back to the longest
// non-stopword. This is a heuristic stand-in for a real NER/keyphrase model.
function keyTerm(sentence) {
  const numberMatch = sentence.match(/\b\d[\d,.%]*\b/);
  const properPhrase = sentence.match(/\b([A-Z][a-zA-Z'-]*(?:\s+[A-Z][a-zA-Z'-]*){0,2})\b/);
  if (properPhrase && !STOPWORDS.has(properPhrase[1].toLowerCase())) {
    return properPhrase[1];
  }
  if (numberMatch) return numberMatch[0];
  const candidates = words(sentence)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()) && w.length > 4)
    .sort((a, b) => b.length - a.length);
  return candidates[0] || null;
}

function sentenceScore(sentence) {
  const w = words(sentence);
  const contentWords = w.filter((x) => !STOPWORDS.has(x.toLowerCase()));
  const hasNumber = /\d/.test(sentence) ? 1 : 0;
  const hasProperNoun = /[a-z]\s[A-Z][a-z]/.test(sentence) ? 1 : 0;
  return contentWords.length + hasNumber * 2 + hasProperNoun * 2;
}

function rankSentences(text) {
  return splitSentences(text)
    .map((s) => ({ sentence: s, score: sentenceScore(s), term: keyTerm(s) }))
    .filter((s) => s.term)
    .sort((a, b) => b.score - a.score);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function blank(sentence, term) {
  const idx = sentence.indexOf(term);
  if (idx === -1) return sentence;
  return sentence.slice(0, idx) + "_____" + sentence.slice(idx + term.length);
}

function pickDistractors(pool, correct, count) {
  const seen = new Set([correct.toLowerCase()]);
  const options = [];
  for (const candidate of shuffle(pool)) {
    const c = candidate.trim();
    if (!c || seen.has(c.toLowerCase())) continue;
    // keep distractors roughly the same "shape" as the answer (word count)
    seen.add(c.toLowerCase());
    options.push(c);
    if (options.length >= count) break;
  }
  return options;
}

function difficultyFilter(ranked, difficulty) {
  // Harder questions lean on lower-salience (less obviously flagged) sentences
  // and longer terms; easier ones lean on the highest-scoring, shortest terms.
  if (difficulty === "Easy") return ranked.filter((r) => r.term.length <= 18);
  if (difficulty === "Hard") return ranked.slice(Math.floor(ranked.length / 3));
  return ranked;
}

function buildMCQ(ranked, allTerms, count, includeExplanations) {
  const out = [];
  const used = new Set();
  for (const r of ranked) {
    if (out.length >= count) break;
    if (used.has(r.sentence)) continue;
    const distractors = pickDistractors(allTerms, r.term, 3);
    if (distractors.length < 3) continue;
    used.add(r.sentence);
    const choices = shuffle([r.term, ...distractors]);
    out.push({
      id: uid("q"),
      type: "mcq",
      prompt: blank(r.sentence, r.term),
      choices,
      correctAnswer: r.term,
      explanation: includeExplanations
        ? `The source states: "${r.sentence}"`
        : "",
    });
  }
  return out;
}

function buildTrueFalse(ranked, allTerms, count, includeExplanations) {
  const out = [];
  const used = new Set();
  for (const r of ranked) {
    if (out.length >= count) break;
    if (used.has(r.sentence)) continue;
    used.add(r.sentence);
    const makeFalse = out.length % 2 === 1; // alternate true/false
    let statement = r.sentence;
    let answer = "True";
    if (makeFalse) {
      const swap = pickDistractors(allTerms, r.term, 1)[0];
      if (swap) {
        statement = statement.replace(r.term, swap);
        answer = "False";
      }
    }
    out.push({
      id: uid("q"),
      type: "truefalse",
      prompt: statement,
      choices: ["True", "False"],
      correctAnswer: answer,
      explanation: includeExplanations
        ? answer === "True"
          ? `This statement is taken directly from the document.`
          : `The document actually says: "${r.sentence}"`
        : "",
    });
  }
  return out;
}

function buildFillBlank(ranked, count, includeExplanations) {
  const out = [];
  const used = new Set();
  for (const r of ranked) {
    if (out.length >= count) break;
    if (used.has(r.sentence)) continue;
    used.add(r.sentence);
    out.push({
      id: uid("q"),
      type: "fillblank",
      prompt: blank(r.sentence, r.term),
      choices: null,
      correctAnswer: r.term,
      explanation: includeExplanations ? `Full sentence: "${r.sentence}"` : "",
    });
  }
  return out;
}

function buildShortAnswer(ranked, count, includeExplanations) {
  const out = [];
  const used = new Set();
  for (const r of ranked) {
    if (out.length >= count) break;
    if (used.has(r.sentence)) continue;
    used.add(r.sentence);
    out.push({
      id: uid("q"),
      type: "shortanswer",
      prompt: `In your own words, explain what the document means by: "${r.term}"`,
      choices: null,
      correctAnswer: r.sentence,
      explanation: includeExplanations ? `Reference: "${r.sentence}"` : "",
    });
  }
  return out;
}

function buildFlashcards(ranked, count) {
  const out = [];
  const used = new Set();
  for (const r of ranked) {
    if (out.length >= count) break;
    if (used.has(r.sentence)) continue;
    used.add(r.sentence);
    out.push({
      id: uid("card"),
      front: r.term,
      back: r.sentence,
      status: "new",
    });
  }
  return out;
}

// Validation pass: single correct answer, no duplicate choices, no
// duplicate prompts, drop anything malformed rather than guess.
function validateQuestions(questions) {
  const seenPrompts = new Set();
  return questions.filter((q) => {
    if (seenPrompts.has(q.prompt)) return false;
    if (q.choices) {
      const unique = new Set(q.choices.map((c) => c.toLowerCase()));
      if (unique.size !== q.choices.length) return false;
      if (!q.choices.includes(q.correctAnswer)) return false;
    }
    if (!q.correctAnswer || q.correctAnswer.length < 1) return false;
    seenPrompts.add(q.prompt);
    return true;
  });
}

const localExtractiveProvider = {
  async generate({ text, type, count, difficulty, includeExplanations }) {
    const ranked = difficultyFilter(rankSentences(text), difficulty);
    const allTerms = ranked.map((r) => r.term);

    if (type === "flashcards") {
      return { cards: buildFlashcards(shuffle(ranked), count) };
    }

    let questions = [];
    const shuffled = shuffle(ranked);

    if (type === "mcq") questions = buildMCQ(shuffled, allTerms, count, includeExplanations);
    else if (type === "truefalse") questions = buildTrueFalse(shuffled, allTerms, count, includeExplanations);
    else if (type === "fillblank") questions = buildFillBlank(shuffled, count, includeExplanations);
    else if (type === "shortanswer") questions = buildShortAnswer(shuffled, count, includeExplanations);
    else if (type === "mixed") {
      const each = Math.max(1, Math.ceil(count / 4));
      questions = [
        ...buildMCQ(shuffled, allTerms, each, includeExplanations),
        ...buildTrueFalse(shuffled, allTerms, each, includeExplanations),
        ...buildFillBlank(shuffled, each, includeExplanations),
        ...buildShortAnswer(shuffled, each, includeExplanations),
      ];
      questions = shuffle(questions).slice(0, count);
    }

    return { questions: validateQuestions(questions) };
  },
};

// The active provider. Point this at `backendProvider` (see file header)
// once a real backend/AI route exists — nothing else in the app changes.
const activeProvider = localExtractiveProvider;

export async function generateStudyMaterials(params) {
  if (!params.text || params.text.trim().length < 60) {
    throw new Error("Not enough document text to generate study materials from.");
  }
  const result = await activeProvider.generate(params);
  const gotQuestions = result.questions && result.questions.length > 0;
  const gotCards = result.cards && result.cards.length > 0;
  if (!gotQuestions && !gotCards) {
    throw new Error(
      "Couldn't generate reliable questions from this section — try a longer section or a different chunk."
    );
  }
  return result;
}

export const QUESTION_TYPE_LABELS = {
  mcq: "Multiple choice",
  truefalse: "True or False",
  fillblank: "Fill in the blank",
  shortanswer: "Short answer",
  mixed: "Mixed quiz",
  flashcards: "Flashcards",
};
