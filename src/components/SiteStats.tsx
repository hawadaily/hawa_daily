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
        // Fetch all articles in parallel with their stats
        const articlesSnapshot = await getDocs(collection(db, 'articles'));
        
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;

        // Aggregate views from article documents (fast)
        articlesSnapshot.forEach((articleDoc) => {
          const articleData = articleDoc.data();
          totalViews += articleData.views || 0;
        });

        // Fetch likes and comments in parallel (faster than sequential)
        const articleIds = articlesSnapshot.docs.map(doc => doc.id);
        
        const [likesPromises, commentsPromises] = articleIds.reduce((acc, articleId) => {
          acc[0].push(getDoc(doc(db, 'articles', articleId, 'likes', 'count')));
          acc[1].push(getDocs(collection(db, 'articles', articleId, 'comments')));
          return acc;
        }, [[], []] as [Promise<any>[], Promise<any>[]]);

        const likesResults = await Promise.all(likesPromises);
        const commentsResults = await Promise.all(commentsPromises);

        // Aggregate likes
        likesResults.forEach((likesDoc) => {
          totalLikes += likesDoc.exists() ? likesDoc.data().count || 0 : 0;
        });

        // Aggregate comments
        commentsResults.forEach((commentsSnapshot) => {
          totalComments += commentsSnapshot.size;
        });

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
