import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import quranData from '../data/quran-full.json';

interface Verse {
  arabic: string | null;
  dhivehi: string | null;
}

interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  pdfUrl: string;
  verses: Verse[];
}

const quranSurahs: Surah[] = quranData as Surah[];

export default function QuranVerseSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [allVerses, setAllVerses] = useState<{ surah: Surah; verseIndex: number; verse: Verse }[]>([]);

  useEffect(() => {
    // Flatten all verses into a single array
    const verses: { surah: Surah; verseIndex: number; verse: Verse }[] = [];
    quranSurahs.forEach((surah: Surah) => {
      surah.verses.forEach((verse: Verse, index: number) => {
        if (verse.arabic && verse.dhivehi) {
          verses.push({ surah, verseIndex: index, verse });
        }
      });
    });
    setAllVerses(verses);

    // Calculate which verse to show based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setCurrentIndex(dayOfYear % verses.length);
  }, []);

  useEffect(() => {
    if (isPaused || allVerses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allVerses.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [isPaused, allVerses.length]);

  if (allVerses.length === 0) {
    return (
      <div className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-[#0077b6] to-[#00b4d8] flex items-center justify-center">
        <div className="text-white text-center">ތައުލީން...</div>
      </div>
    );
  }

  const currentVerse = allVerses[currentIndex];

  return (
    <div 
      className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-[#0077b6] to-[#00b4d8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full flex flex-col items-center justify-center px-8 py-4"
        >
          {/* Surah info */}
          <div className="text-white/80 text-sm mb-2 text-center">
            {currentVerse.surah.nameArabic} - {currentVerse.surah.nameEnglish} ({currentVerse.surah.number}:{currentVerse.verseIndex})
          </div>

          {/* Arabic text */}
          <div className="text-white text-lg font-semibold text-center mb-2 leading-relaxed" dir="rtl">
            {currentVerse.verse.arabic}
          </div>

          {/* Dhivehi translation */}
          <div className="text-white/90 text-sm text-center leading-relaxed">
            {currentVerse.verse.dhivehi}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {allVerses.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
          const actualIndex = Math.max(0, currentIndex - 2) + index;
          return (
            <button
              key={actualIndex}
              onClick={() => setCurrentIndex(actualIndex)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                actualIndex === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to verse ${actualIndex + 1}`}
            />
          );
        })}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + allVerses.length) % allVerses.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
        aria-label="Previous verse"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % allVerses.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
        aria-label="Next verse"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
