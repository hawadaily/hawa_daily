import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Article, categories } from '../data/mockData';
import ArticleCard from '../components/ArticleCard';
import PromoBanner from '../components/PromoBanner';
import SiteStats from '../components/SiteStats';

export default function Home() {
  const [articlesState, setArticlesState] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(16);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articleReactions, setArticleReactions] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const [sidebarPromotions, setSidebarPromotions] = useState<any[]>([]);
  const [slot1Index, setSlot1Index] = useState(0);
  const [slot2Index, setSlot2Index] = useState(0);

  // Fetch articles with periodic updates instead of real-time listeners
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(articlesQuery);
        const articles = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            publishedAt: data.createdAt || data.publishedAt
          } as Article;
        });
        setArticlesState(articles);
        setLoading(false);
        
        // Fetch reactions for each article in parallel
        const reactionsData: Record<string, { likes: number; dislikes: number }> = {};
        const reactionPromises = articles.map(async (article) => {
          try {
            const [likesDoc, dislikesDoc] = await Promise.all([
              getDoc(doc(db, 'articles', article.id, 'likes', 'count')),
              getDoc(doc(db, 'articles', article.id, 'dislikes', 'count'))
            ]);
            return {
              id: article.id,
              likes: likesDoc.exists() ? likesDoc.data().count || 0 : 0,
              dislikes: dislikesDoc.exists() ? dislikesDoc.data().count || 0 : 0
            };
          } catch (e) {
            return { id: article.id, likes: 0, dislikes: 0 };
          }
        });
        
        const reactionResults = await Promise.all(reactionPromises);
        reactionResults.forEach(result => {
          reactionsData[result.id] = { likes: result.likes, dislikes: result.dislikes };
        });
        setArticleReactions(reactionsData);
        
        // Fetch sidebar promotions
        try {
          const promotionsQuery = query(collection(db, 'sidebar-promotions'), orderBy('createdAt', 'desc'));
          const promotionsSnapshot = await getDocs(promotionsQuery);
          const promotionsData = promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSidebarPromotions(promotionsData);
        } catch (e) {
          console.error('Error fetching sidebar promotions:', e);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchArticles();

    // Refresh articles every 5 minutes (instead of real-time)
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);

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
      clearInterval(interval);
      clearInterval(slot1Interval);
      clearInterval(slot2Interval);
    };
  }, [sidebarPromotions]);

  const featuredArticles = useMemo(() => {
    // Show articles from last 24 hours as featured
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentFeatured = articlesState.filter(article => {
      let articleDate: Date;
      if (article.publishedAt && typeof article.publishedAt === 'object' && 'toDate' in article.publishedAt) {
        // Firebase Timestamp
        articleDate = (article.publishedAt as any).toDate();
      } else {
        // String or other format
        articleDate = new Date(article.publishedAt);
      }
      return articleDate >= twentyFourHoursAgo;
    });
    
    // If there are articles from last 24 hours, show them as featured
    if (recentFeatured.length > 0) {
      return recentFeatured.slice(0, 4);
    }
    
    // Otherwise fall back to articles marked as featured
    return articlesState.filter((article) => article.featured);
  }, [articlesState]);
  
  const breakingArticles = useMemo(() => {
    // Show articles from last 24 hours as breaking news
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentBreaking = articlesState.filter(article => {
      let articleDate: Date;
      if (article.publishedAt && typeof article.publishedAt === 'object' && 'toDate' in article.publishedAt) {
        // Firebase Timestamp
        articleDate = (article.publishedAt as any).toDate();
      } else {
        // String or other format
        articleDate = new Date(article.publishedAt);
      }
      return articleDate >= twentyFourHoursAgo;
    });
    
    // If there are articles from last 24 hours, show them as breaking news
    if (recentBreaking.length > 0) {
      return recentBreaking.slice(0, 4);
    }
    
    // Otherwise fall back to articles marked as breaking news
    return articlesState.filter((article) => article.breakingNews);
  }, [articlesState]);
  
  // Priority: Breaking news first, then featured, then regular articles
  const heroArticles = useMemo(() => {
    const priorityArticles = [...breakingArticles, ...featuredArticles];
    const uniquePriorityArticles = Array.from(new Map(priorityArticles.map(article => [article.id, article])).values());
    
    if (uniquePriorityArticles.length >= 3) {
      return uniquePriorityArticles.slice(0, 3);
    }
    
    // Fill remaining slots with articles from last 24 hours first, then recent articles
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentArticles24h = articlesState.filter(article => {
      let articleDate: Date;
      if (article.publishedAt && typeof article.publishedAt === 'object' && 'toDate' in article.publishedAt) {
        // Firebase Timestamp
        articleDate = (article.publishedAt as any).toDate();
      } else {
        // String or other format
        articleDate = new Date(article.publishedAt);
      }
      return articleDate >= twentyFourHoursAgo && 
             !uniquePriorityArticles.some(p => p.id === article.id);
    });
    
    const olderArticles = articlesState.filter(article => 
      !uniquePriorityArticles.some((p: any) => p.id === article.id) &&
      !recentArticles24h.some((p: any) => p.id === article.id)
    ).slice(0, 3 - uniquePriorityArticles.length - recentArticles24h.length);
    
    return [...uniquePriorityArticles, ...recentArticles24h.slice(0, 3 - uniquePriorityArticles.length), ...olderArticles];
  }, [breakingArticles, featuredArticles, articlesState]);
  
  const filteredArticles = selectedCategory 
    ? articlesState.filter(article => article.category === selectedCategory)
    : articlesState;
  
  // Get current time for filtering last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Show articles from last 24 hours in the trending section
  const trending = useMemo(() => {
    return filteredArticles.filter((article) => {
      let articleDate: Date;
      if (article.publishedAt && typeof article.publishedAt === 'object' && 'toDate' in article.publishedAt) {
        // Firebase Timestamp
        articleDate = (article.publishedAt as any).toDate();
      } else {
        // String or other format
        articleDate = new Date(article.publishedAt);
      }
      return articleDate >= twentyFourHoursAgo;
    }).slice(0, 4); // Show up to 4 articles from last 24 hours
  }, [filteredArticles, twentyFourHoursAgo]);
  
  const latest = useMemo(() => filteredArticles.slice(0, visibleCount), [filteredArticles, visibleCount]);
  const hasMore = filteredArticles.length > visibleCount;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">ލޯޑް ވަނީ...</p>
      </div>
    );
  }

  if (articlesState.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">ޚަބަރު ނެތް</p>
      </div>
    );
  }

  const activeHero = heroArticles[heroIndex % heroArticles.length];

  const getCategoryTitle = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.title : categoryId;
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'އަވަސްޓެއް';
    
    const now = new Date();
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'އަވަސްޓެއް';
    
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'އަންނަވަނީ';
    if (diffHours < 24) return `${diffHours} ގަޑިއިރު ކުރިން`;
    if (diffDays < 7) return `${diffDays} ދުވަސް ކުރިން`;
    return date.toLocaleDateString('dv-MV');
  };

  return (
    <div className="space-y-8 pt-0 text-right lg:space-y-12 lg:pt-16">
      {/* Top Promo Banner */}
      <PromoBanner location="home" position="top" />

      {/* Main News Section */}
      <section className="grid gap-8 lg:grid-cols-3 lg:items-start">
        {/* Main story large */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="rounded-2xl border border-slate-200 bg-white p-0 shadow-soft overflow-hidden relative">
            <img src={activeHero.image} alt={activeHero.title} className="w-full h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3 text-right z-10 sm:p-8">
              <span className="hidden sm:inline-flex rounded-full bg-sky-600/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-soft">{getCategoryTitle(activeHero.category)}</span>
              <h3 className="mt-2 text-lg font-bold text-white drop-shadow-lg sm:mt-4 sm:text-3xl">{activeHero.title}</h3>
              <p className="hidden mt-3 max-w-2xl text-base leading-6 text-slate-100 drop-shadow sm:block">{activeHero.excerpt}</p>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              {heroArticles.map((_, index) => (
                <button
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full border border-white transition ${heroIndex === index ? 'bg-white' : 'bg-slate-400/60'}`}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Show hero slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Trending/featured below main story */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {trending.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                likes={articleReactions[article.id]?.likes || 0}
                dislikes={articleReactions[article.id]?.dislikes || 0}
              />
            ))}
          </div>
        </div>

        {/* Promotion Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {sidebarPromotions.length > 0 ? (
            <>
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
              
              {/* Slot 2 */}
              {(() => {
                const slot2Promotions = sidebarPromotions.filter(p => p.slot === 'slot2');
                if (slot2Promotions.length === 0) return null;
                const currentPromotion = slot2Promotions[slot2Index];
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
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
                <img 
                  src="/promotions/desktop_1200x300/portrait1.png" 
                  alt="Promotion 1" 
                  className="w-full h-auto"
                  style={{ aspectRatio: '1/1.5' }}
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
                <img 
                  src="/promotions/desktop_1200x300/portrait2.png" 
                  alt="Promotion 2" 
                  className="w-full h-auto"
                  style={{ aspectRatio: '1/1.5' }}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Middle Promo Banner */}
      <PromoBanner location="home" position="middle" />

      {/* Latest Articles Grid */}
      <section className="lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-soft lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-600">ސުރުޚީ</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">ފަހުގެ ޚަބަރު</h2>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {latest.map((article: any) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                likes={articleReactions[article.id]?.likes || 0}
                dislikes={articleReactions[article.id]?.dislikes || 0}
              />
            ))}
          </div>
        </div>
        {hasMore && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              އިތުރަށް ބަލާ
            </button>
          </div>
        )}
      </section>

      {/* Site Stats */}
      <SiteStats />

      {/* Bottom Promo Banner */}
      <PromoBanner location="home" position="bottom" />
    </div>
  );
}
