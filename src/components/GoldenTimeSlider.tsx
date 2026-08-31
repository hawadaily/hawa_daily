import { useState, useEffect } from 'react';
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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

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

  // Show all articles except those with failed image loads
  const validArticles = goldenTimeArticles.filter(article => !failedImages.has(article.coverImage));
  
  if (goldenTimeArticles.length === 0) return null;

  const handleImageError = (imageUrl: string) => {
    console.error(`Failed to load Golden Time image: ${imageUrl}`);
    setFailedImages(prev => new Set(prev).add(imageUrl));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-slate-900 font-semibold"> ދިވެހި ރަން ޒަމާން </h3>
      <div className="space-y-3">
        {validArticles.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            to={`/golden-time/${article.id}`}
            className="block rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(article.coverImage)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="inline-block rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm mb-1">
                  ރަން ޒަމާން
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-2">{article.title}</h4>
                {article.year && (
                  <p className="text-xs text-white/80 mt-0.5">{article.year}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
