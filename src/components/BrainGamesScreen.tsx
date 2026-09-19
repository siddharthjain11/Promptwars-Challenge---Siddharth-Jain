import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Heart,
  Volume2,
  VolumeX,
  RefreshCw,
  Globe2,
  Film,
  Compass,
  TreePine,
  History,
} from "lucide-react";
import { speech } from "../utils/speech";
import { QuizQuestion, AppLanguage } from "../types";
import { REAL_WORLD_QUIZZES } from "../data/realWorldQuizzes";

interface BrainGamesScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
  currentLanguage?: AppLanguage;
  isAudioDescEnabled?: boolean;
}

type GameMode = "words" | "memory" | "quiz";

const WORD_PUZZLES = [
  { word: "GARDEN", hint: "A peaceful place with flowers, grass, and trees." },
  { word: "FAMILY", hint: "Your loved ones, children, and grandchildren." },
  { word: "SUNSHINE", hint: "Warm morning light that brightens the day." },
  { word: "FRIEND", hint: "Someone special who brings joy and warmth." },
  { word: "KITTEN", hint: "A sweet, playful baby cat with soft fur." },
  { word: "COFFEE", hint: "A warm, comforting morning brewed drink." },
];

const MEMORY_SYMBOLS = [
  { id: "flower", icon: "🌻", name: "Sunflower" },
  { id: "tea", icon: "☕", name: "Warm Tea" },
  { id: "cat", icon: "🐱", name: "Gentle Kitty" },
  { id: "dove", icon: "🕊️", name: "Peace Dove" },
];

const CATEGORIES = [
  { id: "all", name: "🌟 All Real-World", icon: Globe2 },
  { id: "cinema", name: "🎬 Cinema & Melodies", icon: Film },
  { id: "geography", name: "🌍 Geography & Wonders", icon: Compass },
  { id: "nature", name: "🌿 Nature & Wildlife", icon: TreePine },
  { id: "nostalgia", name: "📜 Nostalgia & Traditions", icon: History },
];

export const BrainGamesScreen: React.FC<BrainGamesScreenProps> = ({
  onBackToHome,
  isLargeText,
  currentLanguage = "en",
  isAudioDescEnabled = false,
}) => {
  const [activeGame, setActiveGame] = useState<GameMode>("words");

  // 1. Word Puzzle State
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = WORD_PUZZLES[puzzleIndex];
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 2. Memory Cards State
  const [cards, setCards] = useState(() => {
    const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((item, idx) => ({
      ...item,
      uniqueId: idx,
      isFlipped: false,
      isMatched: false,
    }));
    return deck.sort(() => Math.random() - 0.5);
  });
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  // 3. Unlimited Real-World Quiz State (with Gemini AI)
  const initialQuestions =
    REAL_WORLD_QUIZZES[currentLanguage] || REAL_WORLD_QUIZZES.en;
  const [quizList, setQuizList] = useState<QuizQuestion[]>(initialQuestions);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [isReadingFact, setIsReadingFact] = useState(false);

  // Sync reading state with global speech
  useEffect(() => {
    const unsub = speech.subscribe((speaking) => {
      if (!speaking) {
        setIsReadingQuestion(false);
        setIsReadingFact(false);
      }
    });
    return () => unsub();
  }, []);

  // Update questions pool when language changes
  useEffect(() => {
    const newDefaults =
      REAL_WORLD_QUIZZES[currentLanguage] || REAL_WORLD_QUIZZES.en;
    setQuizList(newDefaults);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
  }, [currentLanguage]);

  // Fetch infinite questions from Gemini backend
  const fetchAiQuestions = async (topicName?: string) => {
    setIsLoadingMore(true);
    try {
      const topic =
        topicName ||
        (selectedCategory !== "all"
          ? CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Real-World Trivia"
          : "Nostalgia, Classic Cinema, Geography & World Wonders");

      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language: currentLanguage,
          count: 3,
          previousQuestions: quizList.map((q) => q.question),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizList((prev) => [...prev, ...data.questions]);
          speech.playChime("success");
        }
      }
    } catch (err) {
      console.warn("Could not fetch more questions:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Reset Memory Game
  const resetMemoryGame = () => {
    const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((item, idx) => ({
      ...item,
      uniqueId: idx,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairsCount(0);
  };

  const handleCardClick = (uniqueId: number) => {
    if (flippedCards.length === 2) return;
    const clickedCard = cards.find((c) => c.uniqueId === uniqueId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map((c) =>
      c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, uniqueId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const first = cards.find((c) => c.uniqueId === newFlipped[0])!;
      const second = clickedCard;

      if (first.id === second.id) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatchedPairsCount((prev) => {
            const next = prev + 1;
            if (next === MEMORY_SYMBOLS.length) {
              speech.speakDescription(
                currentLanguage === "hi"
                  ? "शाबाश! आपने सभी जोड़े मिला लिए हैं!"
                  : currentLanguage === "hinglish"
                  ? "Wah! Aapne saare pairs dhoondh liye!"
                  : "Wonderful! You found all the matching pairs!",
                { lang: currentLanguage }
              );
            } else {
              speech.speakDescription(`Match: ${first.name}!`, { lang: currentLanguage });
            }
            return next;
          });
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uniqueId === newFlipped[0] || c.uniqueId === newFlipped[1]
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  // Word Unscramble logic
  const handleWordLetterClick = (letter: string) => {
    if (selectedLetters.length >= currentPuzzle.word.length) return;
    const nextSelected = [...selectedLetters, letter];
    setSelectedLetters(nextSelected);

    if (nextSelected.join("") === currentPuzzle.word) {
      setPuzzleCompleted(true);
      speech.speakDescription(
        currentLanguage === "hi"
          ? `बहुत बढ़िया! आपने सही शब्द हल किया: ${currentPuzzle.word}`
          : currentLanguage === "hinglish"
          ? `Bahut badiya! Word solve ho gaya: ${currentPuzzle.word}`
          : `Wonderful job! You solved the word: ${currentPuzzle.word}!`,
        { lang: currentLanguage }
      );
    }
  };

  const handleRemoveLastLetter = () => {
    setSelectedLetters((prev) => prev.slice(0, -1));
  };

  const handleNextWordPuzzle = () => {
    const nextIdx = (puzzleIndex + 1) % WORD_PUZZLES.length;
    setPuzzleIndex(nextIdx);
    setSelectedLetters([]);
    setPuzzleCompleted(false);
    setShowHint(false);
  };

  // Current Quiz item
  const currentQuiz = quizList[quizIndex] || quizList[0] || {
    question: "Which bird is known as the symbol of peace?",
    options: ["Dove", "Crow", "Hawk"],
    correct: 0,
    fact: "Doves represent serenity.",
  };

  const handleSelectQuizAnswer = (optionIdx: number) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(optionIdx);
    setIsAnswerRevealed(true);
    if (optionIdx === currentQuiz.correct) {
      setQuizScore((prev) => prev + 1);
      speech.speakDescription(
        currentLanguage === "hi"
          ? "बिल्कुल सही जवाब! बहुत सुंदर!"
          : currentLanguage === "hinglish"
          ? "Sahi jawab! Bahut khoob!"
          : "Correct! That is the right answer.",
        { lang: currentLanguage }
      );
    } else {
      speech.speakDescription(
        currentLanguage === "hi"
          ? `अच्छा प्रयास! सही उत्तर है: ${currentQuiz.options[currentQuiz.correct]}`
          : currentLanguage === "hinglish"
          ? `Acha try kiya! Sahi answer hai: ${currentQuiz.options[currentQuiz.correct]}`
          : `Good try! The answer is ${currentQuiz.options[currentQuiz.correct]}.`,
        { lang: currentLanguage }
      );
    }
  };

  const handleNextQuizQuestion = () => {
    const nextIdx = quizIndex + 1;
    if (nextIdx >= quizList.length - 1) {
      // Near end of list: automatically fetch more so there's no limit!
      fetchAiQuestions();
    }
    if (nextIdx < quizList.length) {
      setQuizIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      // Wrap or wait for fetch
      setQuizIndex(0);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    }
  };

  const readQuestionAloud = () => {
    if (isReadingQuestion || speech.isSpeaking()) {
      speech.stop();
      setIsReadingQuestion(false);
      return;
    }
    const textToSpeak = `${currentQuiz.question}. Option 1: ${currentQuiz.options[0]}. Option 2: ${currentQuiz.options[1]}. Option 3: ${currentQuiz.options[2]}.`;
    setIsReadingQuestion(true);
    speech.speak(textToSpeak, {
      lang: currentLanguage,
      onStart: () => setIsReadingQuestion(true),
      onEnd: () => setIsReadingQuestion(false),
      onError: () => setIsReadingQuestion(false),
    });
  };

  const readFactAloud = () => {
    if (isReadingFact || speech.isSpeaking()) {
      speech.stop();
      setIsReadingFact(false);
      return;
    }
    const factText = currentQuiz.fact || "";
    if (!factText) return;
    setIsReadingFact(true);
    speech.speak(factText, {
      lang: currentLanguage,
      onStart: () => setIsReadingFact(true),
      onEnd: () => setIsReadingFact(false),
      onError: () => setIsReadingFact(false),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-sky-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="games-back-to-home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-base sm:text-lg border-2 border-sky-200 transition focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-sky-700" />
            <span>Return to Home</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            Gentle Daily Exercises • No Pressure
          </span>
        </div>
      </div>

      {/* Game Mode Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            speech.stop();
            setActiveGame("words");
          }}
          className={`p-4 rounded-2xl border-2 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeGame === "words"
              ? "bg-sky-600 text-white border-sky-700 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Word Puzzle</span>
        </button>

        <button
          onClick={() => {
            speech.stop();
            setActiveGame("memory");
          }}
          className={`p-4 rounded-2xl border-2 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeGame === "memory"
              ? "bg-sky-600 text-white border-sky-700 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Memory Match</span>
        </button>

        <button
          onClick={() => {
            speech.stop();
            setActiveGame("quiz");
          }}
          className={`p-4 rounded-2xl border-2 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeGame === "quiz"
              ? "bg-sky-600 text-white border-sky-700 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          <span>Real-World Daily Quiz</span>
        </button>
      </div>

      {/* GAME 1: WORD PUZZLE */}
      {activeGame === "words" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-lg">
              Puzzle {puzzleIndex + 1} of {WORD_PUZZLES.length}
            </span>

            <button
              onClick={handleNextWordPuzzle}
              className="text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Skip to Next</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Unscramble the Warm Word
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium">
              Tap the letters in the correct order to spell the word.
            </p>
          </div>

          {/* Word Hint */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3 max-w-xl mx-auto">
            <HelpCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900">Friendly Clue:</p>
              <p className="text-base font-medium text-amber-950">
                {currentPuzzle.hint}
              </p>
            </div>
          </div>

          {/* Letter Slots */}
          <div className="flex justify-center gap-2 sm:gap-3 py-4">
            {Array.from({ length: currentPuzzle.word.length }).map((_, idx) => {
              const letter = selectedLetters[idx] || "";
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-extrabold transition ${
                    letter
                      ? "border-sky-500 bg-sky-50 text-sky-950 shadow-xs scale-105"
                      : "border-dashed border-slate-300 bg-slate-50 text-slate-400"
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          {/* Scrambled Letter Choices */}
          {!puzzleCompleted && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-md mx-auto">
                {currentPuzzle.word
                  .split("")
                  .sort(() => 0.5 - Math.sin(puzzleIndex + 1))
                  .map((letter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWordLetterClick(letter)}
                      className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border-2 border-sky-300 text-sky-950 font-extrabold text-2xl sm:text-3xl shadow-sm transition active:scale-90 cursor-pointer"
                    >
                      {letter}
                    </button>
                  ))}
              </div>

              {selectedLetters.length > 0 && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleRemoveLastLetter}
                    className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-sm cursor-pointer"
                  >
                    ← Erase Last Letter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Celebration */}
          {puzzleCompleted && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-3 border-emerald-300 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950">
                  Wonderful Job! That is Correct!
                </h3>
                <p className="text-emerald-900 font-medium text-base mt-1">
                  You solved "{currentPuzzle.word}". Your brain is active and doing great today!
                </p>
              </div>
              <button
                onClick={handleNextWordPuzzle}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg sm:text-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                Next Word Puzzle →
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: MEMORY CARDS */}
      {activeGame === "memory" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                Match the Pairs
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                Tap cards to flip them. Find matching pictures at your own gentle pace.
              </p>
            </div>

            <button
              onClick={resetMemoryGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 font-bold text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Shuffle Cards</span>
            </button>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto">
            {cards.map((card) => {
              const showFront = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleCardClick(card.uniqueId)}
                  disabled={showFront}
                  className={`h-28 sm:h-32 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-xs ${
                    card.isMatched
                      ? "bg-emerald-50 border-emerald-400 opacity-90 scale-95"
                      : showFront
                      ? "bg-sky-50 border-sky-500 scale-100"
                      : "bg-sky-600 hover:bg-sky-700 border-sky-700 text-white active:scale-95"
                  }`}
                >
                  {showFront ? (
                    <>
                      <span className="text-4xl sm:text-5xl">{card.icon}</span>
                      <span className="text-xs font-bold text-slate-700 mt-1">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl text-sky-200 font-extrabold">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Victory notification */}
          {matchedPairsCount === MEMORY_SYMBOLS.length && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-3 border-emerald-300 text-center space-y-4">
              <Trophy className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h3 className="font-serif font-bold text-2xl text-emerald-950">
                  Congratulations! All Pairs Found!
                </h3>
                <p className="text-emerald-900 text-base font-medium">
                  A wonderful exercise for memory and visual recall.
                </p>
              </div>
              <button
                onClick={resetMemoryGame}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-md cursor-pointer"
              >
                Play Another Round
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: UNLIMITED REAL-WORLD QUIZ (CONNECTED TO GEMINI AI) */}
      {activeGame === "quiz" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-200 shadow-xs space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                  Real-World Trivia & Nostalgia
                </h2>
                {currentQuiz.isAiGenerated && (
                  <span className="text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    Gemini AI
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Endless fascinating questions on golden cinema, geography, nature & nostalgic moments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1.5 rounded-xl">
                Question {quizIndex + 1} of {quizList.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Score: {quizScore}
              </span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    fetchAiQuestions(cat.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-sky-600 text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Question Box */}
          <div className="space-y-3 bg-sky-50/50 p-5 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md">
                {currentQuiz.category || "General Curiosity"}
              </span>

              <button
                onClick={readQuestionAloud}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-2xs transition active:scale-95 cursor-pointer ${
                  isReadingQuestion
                    ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 ring-1 ring-rose-300"
                    : "bg-white text-sky-800 border-sky-200 hover:bg-sky-50"
                }`}
                title={isReadingQuestion ? "Stop audio" : "Read question and options aloud"}
              >
                {isReadingQuestion ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                )}
                <span>{isReadingQuestion ? "Stop Audio" : "Read Aloud"}</span>
              </button>
            </div>

            <h2
              className={`font-serif font-bold text-slate-900 leading-snug ${
                isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              }`}
            >
              {currentQuiz.question}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQuiz.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuiz.correct;

              let btnStyle =
                "bg-white hover:bg-sky-50 border-slate-200 text-slate-900";
              if (isAnswerRevealed) {
                if (isCorrect) {
                  btnStyle =
                    "bg-emerald-50 border-emerald-400 text-emerald-950 font-extrabold ring-2 ring-emerald-300";
                } else if (isSelected) {
                  btnStyle =
                    "bg-rose-50 border-rose-300 text-rose-950 font-bold";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectQuizAnswer(idx)}
                  disabled={isAnswerRevealed}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left text-lg sm:text-xl font-bold flex items-center justify-between transition cursor-pointer shadow-2xs ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerRevealed && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback, Fact & Next Button */}
          {isAnswerRevealed && (
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-3 animate-in fade-in duration-150">
              <p className="text-slate-900 font-bold text-base sm:text-lg">
                {selectedAnswer === currentQuiz.correct
                  ? "🌟 Excellent! That is right!"
                  : "💙 Gentle notice: You did great!"}
              </p>
              <div className="flex items-start justify-between gap-3">
                <p className="text-slate-700 font-medium text-base leading-relaxed">
                  {currentQuiz.fact}
                </p>
                {currentQuiz.fact && (
                  <button
                    onClick={readFactAloud}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border shadow-2xs transition active:scale-95 cursor-pointer shrink-0 ${
                      isReadingFact
                        ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 ring-1 ring-rose-300"
                        : "bg-white text-sky-800 border-sky-200 hover:bg-sky-50"
                    }`}
                    title={isReadingFact ? "Stop fact audio" : "Listen to this interesting fact"}
                  >
                    {isReadingFact ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    <span>{isReadingFact ? "Stop" : "Listen"}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleNextQuizQuestion}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base sm:text-lg shadow-sm cursor-pointer transition active:scale-95"
                >
                  Next Question →
                </button>

                <button
                  onClick={() => fetchAiQuestions()}
                  disabled={isLoadingMore}
                  className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-purple-600 ${
                      isLoadingMore ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isLoadingMore
                      ? "Generating Questions..."
                      : "✨ Get Fresh AI Questions"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Endless Fetch Action */}
          {!isAnswerRevealed && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Want a fresh set of questions on different topics?
              </p>
              <button
                onClick={() => fetchAiQuestions()}
                disabled={isLoadingMore}
                className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isLoadingMore
                    ? "Asking Gemini..."
                    : "Add More Real-World Questions (AI)"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
