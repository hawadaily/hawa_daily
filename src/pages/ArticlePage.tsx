import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Article, categories } from '../data/mockData';
import { db, dbWithFallback } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit, addDoc, deleteDoc, setDoc, updateDoc, getDocsFromCache, increment } from 'firebase/firestore';
import { auth } from '../firebase';
import PromoBanner from '../components/PromoBanner';
import QuranVerseSlider from '../components/QuranVerseSlider';
import GoldenTimeSlider from '../components/GoldenTimeSlider';

const getRelativeTime = (dateValue: any) => {
  let date: Date;
  
  if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
    // Firebase Timestamp
    date = new Date(dateValue.seconds * 1000);
  } else if (typeof dateValue === 'string') {
    // ISO string
    date = new Date(dateValue);
  } else {
    return 'އަވަސްޓެއް ނުވެއެވެ';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'އަންނަވަނީ';
  if (diffMins < 1) return 'އަންނަވަނީ';
  if (diffMins < 60) return `${diffMins} މިނިޓު ކުރިން`;
  if (diffHours < 24) return `${diffHours} ގަޑިއިރު ކުރިން`;
  if (diffDays < 7) return `${diffDays} ދުވަސް ކުރިން`;
  return date.toLocaleDateString('dv-MV');
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentReactions, setCommentReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [sidebarPromotions, setSidebarPromotions] = useState<any[]>([]);
  const [slot1Index, setSlot1Index] = useState(0);
  const [slot2Index, setSlot2Index] = useState(0);
  const [midArticlePromotions, setMidArticlePromotions] = useState<any[]>([]);
  const [midArticlePromotionIndex, setMidArticlePromotionIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setArticle(null);
      setLoading(false);
      return;
    }
    
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const articleData = {
            id: id,
            ...data,
            publishedAt: data.createdAt || data.publishedAt
          } as Article;
          setArticle(articleData);
          setArticleId(id);
          console.log('DEBUG - Article loaded:', articleData.title);
          console.log('DEBUG - Article youtubeLink:', articleData.youtubeLink);
          console.log('DEBUG - Article tiktokLink:', articleData.tiktokLink);

          // Debounced view count increment - only increment if not viewed in last hour
          const viewKey = `article_${id}_viewed`;
          const lastViewed = localStorage.getItem(viewKey);
          const now = Date.now();
          const oneHour = 60 * 60 * 1000;

          if (!lastViewed || (now - parseInt(lastViewed)) > oneHour) {
            dbWithFallback.writeOperation(async (dbInstance) => {
              return updateDoc(doc(dbInstance, 'articles', id), { views: increment(1) });
            })
              .then(() => localStorage.setItem(viewKey, now.toString()))
              .catch(err => console.warn('Unable to increment article views:', err));
          }

          // Parallel fetch of likes/dislikes
          Promise.all([
            getDoc(doc(db, 'articles', id, 'likes', 'count')),
            getDoc(doc(db, 'articles', id, 'dislikes', 'count'))
          ]).then(([likesDoc, dislikesDoc]) => {
            const likeCount = likesDoc.exists() ? likesDoc.data().count : 0;
            const dislikeCount = dislikesDoc.exists() ? dislikesDoc.data().count : 0;
            console.log('Fetched counts - likes:', likeCount, 'dislikes:', dislikeCount);
            // Convert to number and strip any non-numeric characters
            const cleanLikeCount = parseInt(String(likeCount).replace(/[^0-9]/g, '')) || 0;
            const cleanDislikeCount = parseInt(String(dislikeCount).replace(/[^0-9]/g, '')) || 0;
            console.log('Cleaned counts - likes:', cleanLikeCount, 'dislikes:', cleanDislikeCount);
            setLikes(cleanLikeCount);
            setDislikes(cleanDislikeCount);
          }).catch(err => {
            console.warn('Unable to load like/dislike counts:', err);
          });

          // User-specific data (logged in or anonymous)
          const userId = auth.currentUser?.uid || 'anonymous';
          const bookmarkPromise = auth.currentUser 
            ? getDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', id))
            : Promise.resolve(null);
          
          Promise.all([
            getDoc(doc(db, 'articles', id, 'userReactions', userId)),
            bookmarkPromise
          ]).then(([userLikeDoc, bookmarkDoc]) => {
            if (userLikeDoc.exists()) {
              setUserReaction(userLikeDoc.data().type);
            } else if (!auth.currentUser) {
              // Check localStorage for anonymous users
              const localReaction = localStorage.getItem(`article_${id}_reaction`);
              if (localReaction) {
                setUserReaction(localReaction as 'like' | 'dislike');
              }
            }
            setIsBookmarked(bookmarkDoc?.exists() || false);
          }).catch(err => {
            console.warn('Unable to load user reaction/bookmark state:', err);
          });

          // Fetch related articles from the same category (optimized query)
          if (articleData.category) {
            try {
              const relatedQuery = query(
                collection(db, 'articles'),
                where('category', '==', articleData.category),
                limit(4)
              );
              const relatedSnap = await getDocs(relatedQuery);
              const related = relatedSnap.docs
                .map(doc => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    ...data,
                    publishedAt: data.createdAt || data.publishedAt
                  } as Article;
                })
                .filter(item => item.id !== articleId)
                .slice(0, 3);
              setRelatedArticles(related);
            } catch (relatedError) {
              console.warn('Unable to load related articles:', relatedError);
            }
          }
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(error instanceof Error ? error.message : 'Unable to load article.');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (showComments && article) {
      const articleId = article.id;
      getDocs(query(collection(db, 'articles', articleId, 'comments'), orderBy('createdAt', 'desc')))
        .then(commentsSnap => {
          const commentsData = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setComments(commentsData);
        })
        .catch(err => {
          console.warn('Unable to load article comments:', err);
        });
    }
  }, [showComments, article]);

  // Fetch sidebar promotions
  useEffect(() => {
    const fetchSidebarPromotions = async () => {
      try {
        const promotionsQuery = query(collection(db, 'sidebar-promotions'), orderBy('createdAt', 'desc'));
        const promotionsSnapshot = await getDocs(promotionsQuery);
        const promotionsData = promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSidebarPromotions(promotionsData);
      } catch (e) {
        console.error('Error fetching sidebar promotions:', e);
      }
    };
    fetchSidebarPromotions();

    // Auto-rotate sidebar promotions every 5 seconds
    const slot1Interval = setInterval(() => {
      setSlot1Index(prev => {
        const slot1Promotions = sidebarPromotions.filter(p => p.slot === 'slot1');
        return slot1Promotions.length > 0 ? (prev + 1) % slot1Promotions.length : 0;
      });
    }, 5000);

    const slot2Interval = setInterval(() => {
      setSlot2Index(prev => {
        const slot2Promotions = sidebarPromotions.filter(p => p.slot === 'slot2');
        return slot2Promotions.length > 0 ? (prev + 1) % slot2Promotions.length : 0;
      });
    }, 5000);

    return () => {
      clearInterval(slot1Interval);
      clearInterval(slot2Interval);
    };
  }, [sidebarPromotions]);

  // Fetch mid-article promotions
  useEffect(() => {
    const fetchMidArticlePromotions = async () => {
      try {
        const promotionsQuery = query(collection(db, 'mid-article-promotions'), orderBy('createdAt', 'desc'));
        const promotionsSnapshot = await getDocs(promotionsQuery);
        const promotionsData = promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMidArticlePromotions(promotionsData);
      } catch (e) {
        console.error('Error fetching mid-article promotions:', e);
      }
    };
    fetchMidArticlePromotions();
  }, []);

  // Auto-rotate mid-article promotions every 5 seconds
  useEffect(() => {
    const midArticleInterval = setInterval(() => {
      setMidArticlePromotionIndex(prev => {
        return midArticlePromotions.length > 0 ? (prev + 1) % midArticlePromotions.length : 0;
      });
    }, 5000);

    return () => {
      clearInterval(midArticleInterval);
    };
  }, [midArticlePromotions]);

  if (loading || article === undefined) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft text-right">
        <h2 className="text-2xl font-semibold text-slate-900">ލޯޑް ވަނީ...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-soft text-right">
        <h2 className="text-2xl font-semibold text-rose-700">ސިސްޓަމް އޮތް އިންޓަރނެޓް ޑިސްޓރިބިއުޝަން އެރަރ</h2>
        <p className="mt-4 text-rose-700">{error}</p>
        <p className="mt-2 text-sm text-rose-600">ތިބާ ކޮންމެ ސުވާލަކަށް ތައާރަފް ކޮށްލާ.</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft text-right">
        <h2 className="text-2xl font-semibold text-slate-900">މި ލިޔުން ނުފެނުން</h2>
        <p className="mt-4 text-slate-500">އެހެން ލިޔުންތަކެއް ހޯއްދަވާ</p>
      </div>
    );
  }

  const related = relatedArticles;

  // Open Graph meta tags for Facebook sharing
  const ogTitle = article.title || '';
  const ogDescription = article.excerpt || '';
  const ogImage = article.image || '';
  const ogUrl = `${window.location.origin}/article/${id}`;

  // Handler functions
  const handleBookmark = async () => {
    if (!auth.currentUser) {
      alert('ބުކްމާރކް ކުރުމަށް ލޮގްއިން ކުރޭ');
      return;
    }
    if (!articleId) return;
    
    try {
      if (isBookmarked) {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', articleId));
        setIsBookmarked(false);
      } else {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', articleId), {
          articleId: articleId,
          createdAt: new Date().toISOString()
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('ބުކްމާރކް ކުރުމުގައި މައްސަލާތެއް ޖެހިއްޖެ');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: article?.title,
      text: article?.excerpt,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('ލިންކް ކޮޕީ ކުރެވިއްޖެ');
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!articleId) return;

    try {
      // Use localStorage for anonymous users
      const userId = auth.currentUser?.uid || 'anonymous';
      const userReactionRef = doc(db, 'articles', articleId, 'userReactions', userId);
      const userReactionDoc = await getDoc(userReactionRef);
      
      if (userReactionDoc.exists()) {
        const currentType = userReactionDoc.data().type;
        
        if (currentType === type) {
          // Remove reaction
          await deleteDoc(userReactionRef);
          await updateReactionCount(type, -1);
          setUserReaction(null);
          // Update localStorage for anonymous users
          if (!auth.currentUser) {
            localStorage.removeItem(`article_${articleId}_reaction`);
          }
        } else {
          // Change reaction
          await setDoc(userReactionRef, { type, createdAt: new Date().toISOString() });
          await updateReactionCount(currentType, -1);
          await updateReactionCount(type, 1);
          setUserReaction(type);
          // Update localStorage for anonymous users
          if (!auth.currentUser) {
            localStorage.setItem(`article_${articleId}_reaction`, type);
          }
        }
      } else {
        // Add new reaction
        await setDoc(userReactionRef, { type, createdAt: new Date().toISOString() });
        await updateReactionCount(type, 1);
        setUserReaction(type);
        // Update localStorage for anonymous users
        if (!auth.currentUser) {
          localStorage.setItem(`article_${articleId}_reaction`, type);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      alert('ލައިކް/ޑިސްލައިކް ކުރުމުގައި މައްސަލާތެއް ޖެހިއްޖެ');
    }
  };

  const updateReactionCount = async (type: 'like' | 'dislike', delta: number) => {
    if (!articleId) return;
    
    // Debounce reaction updates to prevent rapid successive writes
    const reactionKey = `article_${articleId}_${type}_debounce`;
    const lastUpdate = localStorage.getItem(reactionKey);
    const now = Date.now();
    const debounceDelay = 1000; // 1 second debounce

    if (lastUpdate && (now - parseInt(lastUpdate)) < debounceDelay) {
      console.log('Debouncing reaction update');
      return;
    }

    localStorage.setItem(reactionKey, now.toString());
    
    // Use fallback database for reaction count updates
    await dbWithFallback.writeOperation(async (dbInstance) => {
      const countRef = doc(dbInstance, 'articles', articleId, type === 'like' ? 'likes' : 'dislikes', 'count');
      await setDoc(countRef, { count: increment(delta) }, { merge: true });
      
      // Fetch the updated count to ensure accuracy
      const countDoc = await getDoc(countRef);
      const rawCount = countDoc.exists() ? countDoc.data().count : 0;
      // Strip any non-numeric characters to handle corrupted data
      const newCount = parseInt(String(rawCount).replace(/[^0-9]/g, '')) || 0;
      console.log('Updated count - type:', type, 'delta:', delta, 'rawCount:', rawCount, 'newCount:', newCount);
      
      if (type === 'like') {
        setLikes(newCount);
      } else {
        setDislikes(newCount);
      }
    });
  };

  const handleAddComment = async () => {
    if (!articleId || !newComment.trim()) return;
    if (!auth.currentUser && !commentName.trim()) {
      alert('ނަން ލިޔުން ބޭންޖެއެވެ');
      return;
    }

    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const userName = auth.currentUser?.displayName || commentName.trim() || 'އަންނަނިވި އަހަރުމެން';
      
      await addDoc(collection(db, 'articles', articleId, 'comments'), {
        userId: userId,
        userName: userName,
        text: newComment,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
      setCommentName('');

      // Refresh comments
      const commentsQuery = query(collection(db, 'articles', articleId, 'comments'), orderBy('createdAt', 'desc'));
      const commentsSnap = await getDocs(commentsQuery);
      const commentsData = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('ކޮމެންޓް ލިޔުމުގައި މައްސަލާތެއް ޖެހިއްޖެ');
    }
  };

  const handleCommentReaction = async (commentId: string, type: 'like' | 'dislike') => {
    if (!articleId) return;

    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const userReactionRef = doc(db, 'articles', articleId, 'comments', commentId, 'userReactions', userId);
      const userReactionDoc = await getDoc(userReactionRef);

      if (userReactionDoc.exists()) {
        const currentType = userReactionDoc.data().type;

        if (currentType === type) {
          // Remove reaction
          await deleteDoc(userReactionRef);
          await updateCommentReactionCount(commentId, type, -1);
          setCommentReactions(prev => ({ ...prev, [commentId]: null }));
        } else {
          // Change reaction
          await setDoc(userReactionRef, { type, createdAt: new Date().toISOString() });
          await updateCommentReactionCount(commentId, currentType, -1);
          await updateCommentReactionCount(commentId, type, 1);
          setCommentReactions(prev => ({ ...prev, [commentId]: type }));
        }
      } else {
        // Add new reaction
        await setDoc(userReactionRef, { type, createdAt: new Date().toISOString() });
        await updateCommentReactionCount(commentId, type, 1);
        setCommentReactions(prev => ({ ...prev, [commentId]: type }));
      }
    } catch (error) {
      console.error('Error handling comment reaction:', error);
    }
  };

  const updateCommentReactionCount = async (commentId: string, type: 'like' | 'dislike', delta: number) => {
    if (!articleId) return;
    try {
      const countRef = doc(db, 'articles', articleId, 'comments', commentId, type === 'like' ? 'likes' : 'dislikes', 'count');
      const countDoc = await getDoc(countRef);
      const currentCount = countDoc.exists() ? countDoc.data().count : 0;
      await setDoc(countRef, { count: currentCount + delta });

      // Update local comment state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: type === 'like' ? (comment.likes || 0) + delta : comment.likes,
            dislikes: type === 'dislike' ? (comment.dislikes || 0) + delta : comment.dislikes,
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error updating comment reaction count:', error);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="space-y-8 text-right">
      <Helmet>
        <title>{ogTitle} | ހަވާއިން ޙަބަރު</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:url" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:site_name" content="ހަވާއިން ޙަބަރު" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <PromoBanner location="article" position="top" />
      <motion.section className="lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-soft sm:p-8">
        <button
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          onClick={handleGoBack}
        >
          ← ފަހަތަށް
        </button>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.5fr] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-soft">
              <img src={article.image} alt={article.title} className="h-[360px] w-full object-cover" />
            </div>

            {article.video && (
              <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-soft">
                <video controls className="w-full" poster={article.image}>
                  <source src={article.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Social Media Links */}
            {(article.youtubeLink || article.tiktokLink) && (
              <div className="space-y-3">
                <h3 className="text-center text-sm font-semibold text-gray-700">
                  މި އާޓިކަލްއާ ބެހޭ މައުލޫމާތު އިތުރަށް ސާފުކޮށްލެއްވުމަށް ޔޫޓިއުބް ނުވަތަ ޓިކްޓޮކް ލިންކް ޙިޔާރު ކޮށްލައްވާ
                </h3>
                <div className="flex gap-3">
                  {article.youtubeLink && (
                    <a
                      href={article.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      ▶️ YouTube
                    </a>
                  )}
                  {article.tiktokLink && (
                    <a
                      href={article.tiktokLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gray-50 px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                    >
                      🎵 TikTok
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Debug: Show video URL if exists */}
            {process.env.NODE_ENV === 'development' && article.video && (
              <div className="rounded-2xl bg-yellow-100 p-2 text-xs text-yellow-800">
                Video URL: {article.video}
              </div>
            )}
            {process.env.NODE_ENV === 'development' && !article.video && (
              <div className="rounded-2xl bg-red-100 p-2 text-xs text-red-800">
                No video found in article data
              </div>
            )}
            <div className="space-y-2 text-slate-700">
              <span className="inline-flex rounded-full bg-sky-600/95 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white">{article.category}</span>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
                <span>{getRelativeTime(article.publishedAt)}</span>
                <span className="font-medium text-slate-700">ލިޔުއްވީ: {article.author || 'Admin'}</span>
                <span>{article.readingTime}</span>
              </div>
              <h1 className="mt-4 mb-6 text-2xl font-bold leading-[2.5] text-[#0077b6] sm:text-3xl">{article.title}</h1>
              <p className="text-sm leading-7 text-[#00b4d8]">{article.excerpt}</p>
            </div>
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
              {(() => {
                const bodyText = Array.isArray(article.body) ? article.body.join(' ') : article.body;
                if (typeof bodyText !== 'string') return null;

                // Split text into paragraphs after every 2 full stops
                const paragraphs: string[] = [];
                let currentParagraph = '';
                let fullStopCount = 0;

                for (let i = 0; i < bodyText.length; i++) {
                  const char = bodyText[i];
                  currentParagraph += char;

                  if (char === '.') {
                    fullStopCount++;
                    if (fullStopCount === 2) {
                      paragraphs.push(currentParagraph.trim());
                      currentParagraph = '';
                      fullStopCount = 0;
                    }
                  }
                }

                // Add any remaining text
                if (currentParagraph.trim()) {
                  paragraphs.push(currentParagraph.trim());
                }

                // Split paragraphs into 2 halves
                const midPoint = Math.ceil(paragraphs.length / 2);
                const firstHalf = paragraphs.slice(0, midPoint);
                const secondHalf = paragraphs.slice(midPoint);

                return (
                  <>
                    {/* First half of article body */}
                    {firstHalf.map((paragraph: string, index: number) => (
                      paragraph && (
                        <p key={`first-${index}`} className="text-base leading-8 text-slate-700">{paragraph}</p>
                      )
                    ))}

                    {/* Social Media Links - Middle */}
                    {(article.youtubeLink || article.tiktokLink) && (
                      <div className="my-6 space-y-3">
                        <h3 className="text-center text-sm font-semibold text-gray-700">
                          މި އާޓިކަލްއާ ބެހޭ މައުލޫމާތު އިތުރަށް ސާފުކޮށްލެއްވުމަށް ޔޫޓިއުބް ނުވަތަ ޓިކްޓޮކް ލިންކް ޙިޔާރު ކޮށްލައްވާ
                        </h3>
                        <div className="flex gap-3">
                          {article.youtubeLink && (
                            <a
                              href={article.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              ▶️ YouTube
                            </a>
                          )}
                          {article.tiktokLink && (
                            <a
                              href={article.tiktokLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gray-50 px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                            >
                              🎵 TikTok
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {console.log('DEBUG - Middle social links rendered:', article.youtubeLink, article.tiktokLink)}

                    {/* Mid-Article Promotion */}
                    {midArticlePromotions.length > 0 && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={midArticlePromotions[midArticlePromotionIndex].id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="my-6 rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden"
                        >
                          <a href={midArticlePromotions[midArticlePromotionIndex].link || '#'} target={midArticlePromotions[midArticlePromotionIndex].link ? '_blank' : '_self'}>
                            <img
                              src={midArticlePromotions[midArticlePromotionIndex].image}
                              alt={midArticlePromotions[midArticlePromotionIndex].title || 'Promotion'}
                              className="w-auto h-auto mx-auto"
                              style={{ maxHeight: '200px' }}
                            />
                          </a>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Second half of article body */}
                    {secondHalf.map((paragraph: string, index: number) => (
                      paragraph && (
                        <p key={`second-${index}`} className="text-base leading-8 text-slate-700">{paragraph}</p>
                      )
                    ))}

                    {/* Social Media Links - Bottom */}
                    {(article.youtubeLink || article.tiktokLink) && (
                      <div className="my-6 space-y-3">
                        <h3 className="text-center text-sm font-semibold text-gray-700">
                          މި އާޓިކަލްއާ ބެހޭ މައުލޫމާތު އިތުރަށް ސާފުކޮށްލެއްވުމަށް ޔޫޓިއުބް ނުވަތަ ޓިކްޓޮކް ލިންކް ޙިޔާރު ކޮށްލައްވާ
                        </h3>
                        <div className="flex gap-3">
                          {article.youtubeLink && (
                            <a
                              href={article.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              ▶️ YouTube
                            </a>
                          )}
                          {article.tiktokLink && (
                            <a
                              href={article.tiktokLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gray-50 px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                            >
                              🎵 TikTok
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {console.log('DEBUG - Bottom social links rendered:', article.youtubeLink, article.tiktokLink)}
                  </>
                );
              })()}
            </div>
            <div className="mt-6">
              <QuranVerseSlider />
            </div>
            <div className="flex flex-col gap-3 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleReaction('like')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    userReaction === 'like' 
                      ? 'bg-sky-600 text-white' 
                      : 'border border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 hover:text-slate-900'
                  }`}
                >
                  👍 {likes}
                </button>
                <button 
                  onClick={() => handleReaction('dislike')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    userReaction === 'dislike' 
                      ? 'bg-red-600 text-white' 
                      : 'border border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 hover:text-slate-900'
                  }`}
                >
                  👎 {dislikes}
                </button>
                <button 
                  onClick={handleBookmark}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isBookmarked 
                      ? 'bg-amber-500 text-white' 
                      : 'border border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isBookmarked ? '🔖' : '📑'} ބުކްމާރކް
                </button>
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  📤 ޝެއަރ
                </button>
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  💬 {comments.length}
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">ކޮމެންޓްތައް</h3>
                
                <div className="space-y-3">
                  {!auth.currentUser && (
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="ނަން..."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none"
                    />
                  )}
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="ކޮމެންޓް ލިޔޭ..."
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none"
                      rows={3}
                    />
                    <button 
                      onClick={handleAddComment}
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      ފޮނުވާ
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{comment.userName}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString('dv-MV')}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{comment.text}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-500">ކޮމެންޓް ނެތް</p>
                  )}
                </div>
              </div>
            )}

            {/* Home Button */}
            <div className="mt-6 rounded-2xl border border-[#90e0ef] bg-gradient-to-r from-[#caf0f8]/50 to-[#90e0ef]/30 p-6 text-center shadow-soft">
              <p className="text-sm text-[#0077b6] mb-3">އިތުރު ޚަބަރު ބަލާން ބޭންނެވޭތޯ؟</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-full bg-[#0077b6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005f8c] shadow-md"
              >
                🏠 މައި ޞަފްޙާއަށް ގޮސްދޭ
              </button>
            </div>

            {/* Engagement CTA */}
            <div className="mt-6 rounded-2xl border border-[#90e0ef] bg-gradient-to-r from-[#caf0f8]/50 to-[#90e0ef]/30 p-6 text-center shadow-soft">
              <p className="text-sm text-[#0077b6] mb-3">މި ޚަބަރާމަށް ކިޔާންތެއް ދޭން ބޭންނެވޭތޯ؟</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  onClick={() => handleReaction('like')}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition shadow-md ${
                    userReaction === 'like' 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-[#0077b6] text-white hover:bg-[#005f8c]'
                  }`}
                >
                  👍 ލައިކް ކުރޭ
                </button>
                <button
                  onClick={() => {
                    setShowComments(true);
                    setTimeout(() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea) textarea.focus();
                    }, 100);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0077b6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005f8c] shadow-md"
                >
                  💬 ކޮމެންޓް ލިޔޭ
                </button>
              </div>
            </div>
          </div>
          <aside className="space-y-5">
            <GoldenTimeSlider />
            <div>
              <h3 className="text-slate-900">ގުޅުން ލިޔުންތައް</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {related.map((item: Article) => (
                  <button
                    key={item.id}
                    className="block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-right transition hover:border-sky-400/40"
                    onClick={() => navigate(`/article/${item.id}`)}
                  >
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-[13px] text-slate-500">{getRelativeTime(item.publishedAt)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Promotions */}
            {sidebarPromotions.length > 0 && (
              <div className="flex flex-col gap-4">
                {/* Slot 1 */}
                {(() => {
                  const slot1Promotions = sidebarPromotions.filter(p => p.slot === 'slot1');
                  if (slot1Promotions.length === 0) return null;
                  const currentPromotion = slot1Promotions[slot1Index];
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPromotion.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden"
                      >
                        <a href={currentPromotion.link || '#'} target={currentPromotion.link ? '_blank' : '_self'}>
                          <img
                            src={currentPromotion.image}
                            alt={currentPromotion.title || 'Promotion'}
                            className="w-full h-auto"
                            style={{ aspectRatio: '1/1.5' }}
                          />
                        </a>
                      </motion.div>
                    </AnimatePresence>
                  );
                })()}
              </div>
            )}
          </aside>
        </div>
      </motion.section>
      <PromoBanner location="article" position="bottom" />
    </div>
  );
}
