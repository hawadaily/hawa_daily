import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

interface SiteStats {
  visitors: number;
  likes: number;
  comments: number;
}

export default function SiteStats() {
  const [stats, setStats] = useState<SiteStats>({
    visitors: 0,
    likes: 0,
    comments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all articles
        const articlesSnapshot = await getDocs(collection(db, 'articles'));
        
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;

        // Aggregate stats from all articles
        for (const articleDoc of articlesSnapshot.docs) {
          const articleData = articleDoc.data();
          
          // Sum views (stored as 'views' field in each article)
          totalViews += articleData.views || 0;
          
          // Fetch likes from subcollection (articles/{articleId}/likes/count)
          const likesCountDoc = await getDoc(doc(db, 'articles', articleDoc.id, 'likes', 'count'));
          totalLikes += likesCountDoc.exists() ? likesCountDoc.data().count || 0 : 0;

          // Count comments for this article
          const commentsSnapshot = await getDocs(collection(db, 'articles', articleDoc.id, 'comments'));
          totalComments += commentsSnapshot.size;
        }

        setStats({
          visitors: totalViews,
          likes: totalLikes,
          comments: totalComments
        });
      } catch (error) {
        console.error('Error fetching site stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-600 mb-2">ވިސިޓަރުން</p>
          <p className="text-2xl font-bold text-slate-900">{stats.visitors.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-600 mb-2">ލައިކްތައް</p>
          <p className="text-2xl font-bold text-slate-900">{stats.likes.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-600 mb-2">ކޮމެންޓްތައް</p>
          <p className="text-2xl font-bold text-slate-900">{stats.comments.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
