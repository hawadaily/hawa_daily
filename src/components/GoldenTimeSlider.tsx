import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db as goldenTimeDb } from '../firebase-golden-time';
import { Link } from 'react-router-dom';

interface GoldenTimeCard {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  year?: number;
  category?: string;
}

export default function GoldenTimeSlider() {
  const [goldenTimeArticles, setGoldenTimeArticles] = useState<GoldenTimeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchGoldenTime = async () => {
      try {
        const q = query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const articlesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GoldenTimeCard));
        setGoldenTimeArticles(articlesData);
      } catch (error) {
        console.error('Error fetching Golden Time articles:', error);
      }
    };

    fetchGoldenTime();
  }, []);

  // Auto-rotate Golden Time cards
  useEffect(() => {
    if (goldenTimeArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % goldenTimeArticles.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [goldenTimeArticles.length]);

  // Filter articles to only show those with successfully loaded images
  const validArticles = goldenTimeArticles.filter(article => loadedImages.has(article.coverImage));
  
  if (validArticles.length === 0) return null;

  const currentArticle = validArticles[currentIndex];

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  const handleImageError = (imageUrl: string) => {
    console.error(`Failed to load Golden Time image: ${imageUrl}`);
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full"
          >
            <Link to={`/golden-time/${currentArticle.id}`}>
              <img
                src={currentArticle.coverImage}
                alt={currentArticle.title}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(currentArticle.coverImage)}
                onError={() => handleImageError(currentArticle.coverImage)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm mb-2">
                  ރަން ޒަމާން
                </span>
                <h3 className="text-lg font-bold text-white line-clamp-2">{currentArticle.title}</h3>
                {currentArticle.year && (
                  <p className="text-sm text-white/80 mt-1">{currentArticle.year}</p>
                )}
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      {validArticles.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {validArticles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {validArticles.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + validArticles.length) % validArticles.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % validArticles.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
