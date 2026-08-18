import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        // Calculate timestamp for 12 hours ago
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const newsQuery = query(
          collection(db, 'articles'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(newsQuery);
        // Filter to only include articles from the last 12 hours
        const items = snapshot.docs
          .filter(doc => {
            const createdAt = doc.data().createdAt;
            if (!createdAt) return false;
            const articleDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
            return articleDate >= twelveHoursAgo;
          })
          .map(doc => doc.data().title || doc.data().titleEn || '');
        setNewsItems(items);
      } catch (error) {
        console.error('Error fetching news ticker:', error);
      }
    };

    fetchLatestNews();
  }, []);

  return (
    <div className="w-full bg-sky-600 text-white py-1 px-4 overflow-hidden flex items-center mt-0 lg:mt-24" dir="rtl">
      <span className="font-bold ml-4">ފަހުގެ ޚަބަރު:</span>
      <div className="flex-1 whitespace-nowrap overflow-hidden">
        <div 
          className="inline-block animate-marquee"
        >
          {newsItems.length > 0 ? (
            newsItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="mx-8">
                  {item}
                </span>
                {idx < newsItems.length - 1 && (
                  <img 
                    src="/HAWA LOGO.jpg" 
                    alt="Hawa Daily" 
                    className="inline-block w-6 h-6 mx-4"
                  />
                )}
              </React.Fragment>
            ))
          ) : (
            <span className="mx-8">ލޯޑް ވަނީ...</span>
          )}
        </div>
      </div>
    </div>
  );
}
