import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import PromoBanner from '../components/PromoBanner';
import { categories } from '../data/mockData';

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

export default function Categories() {
  const { categoryId } = useParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const articlesQuery = query(
          collection(db, 'articles'),
          where('category', '==', categoryId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(articlesQuery);
        const articlesData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            publishedAt: data.createdAt || data.publishedAt
          };
        });
        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [categoryId]);

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  const categoryIcons: Record<string, string> = {
    local: '🏠',
    politics: '🏛️',
    sports: '⚽',
    islamic: '🕌',
    business: '💼',
    technology: '💻',
    world: '🌍',
    entertainment: '🎭',
    health: '🏥',
    education: '📚'
  };

  const categoryColors: Record<string, string> = {
    local: 'from-[#0077b6] to-[#00b4d8]',
    politics: 'from-[#00b4d8] to-[#90e0ef]',
    sports: 'from-[#90e0ef] to-[#caf0f8]',
    islamic: 'from-[#0077b6] to-[#90e0ef]',
    business: 'from-[#00b4d8] to-[#0077b6]',
    technology: 'from-[#90e0ef] to-[#00b4d8]',
    world: 'from-[#0077b6] to-[#caf0f8]',
    entertainment: 'from-[#00b4d8] to-[#90e0ef]',
    health: 'from-[#90e0ef] to-[#0077b6]',
    education: 'from-[#caf0f8] to-[#00b4d8]'
  };

  return (
    <motion.section className="min-h-screen bg-gradient-to-br from-[#caf0f8] via-white to-[#90e0ef] pt-24 text-right" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
        <div className="hidden lg:block">
          <PromoBanner location="category" position="top" />
        </div>
        
        <div className="mt-8">
          {categoryId && selectedCategory ? (
            <div>
              {/* Category Header */}
              <div className="mb-8 rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryColors[selectedCategory.id] || 'from-[#0077b6] to-[#00b4d8]'} text-3xl shadow-lg`}>
                      {categoryIcons[selectedCategory.id] || '📰'}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#00b4d8]">ބައި</p>
                      <h2 className="mt-1 text-3xl font-bold text-[#0077b6]">{selectedCategory.title}</h2>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#caf0f8] px-4 py-2">
                    <p className="text-sm font-semibold text-[#0077b6]">{articles.length} ޚަބަރު</p>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#90e0ef] border-t-[#0077b6]" />
                    <p className="text-[#00b4d8]">ލޯޑް ވަނީ...</p>
                  </div>
                </div>
              ) : articles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={`/article/${article.id}`}
                        className="group block overflow-hidden rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm shadow-lg transition hover:shadow-xl hover:border-[#00b4d8]"
                      >
                        {article.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </div>
                        )}
                        <div className="p-5">
                          <span className="inline-block rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-semibold text-[#0077b6]">
                            {getRelativeTime(article.publishedAt)}
                          </span>
                          <h3 className="mt-3 text-lg font-bold text-[#0077b6] line-clamp-2 group-hover:text-[#00b4d8] transition">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="mt-2 text-sm text-[#00b4d8] line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm p-12 text-center shadow-lg">
                  <div className="mb-4 text-6xl">📭</div>
                  <h3 className="text-xl font-bold text-[#0077b6]">މި ބައިގައި ޚަބަރު ނެތް</h3>
                  <p className="mt-2 text-[#00b4d8]">އެހެންވެސް އެހެން ބައެއް ބަލާލައްވާ</p>
                  <Link 
                    to="/categories"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
                  >
                    ހުރިހާ ބައިތައް ބަލާ
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* All Categories Header */}
              <div className="mb-8 rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#00b4d8]">ހުރިހާ ބައިތައް</p>
                    <h2 className="mt-1 text-3xl font-bold text-[#0077b6]">ޚަބަރު ބައިތައް</h2>
                  </div>
                </div>
              </div>
              
              {/* Categories Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={`/categories/${category.id}`}
                      className="group block overflow-hidden rounded-2xl border border-[#90e0ef] bg-white/95 backdrop-blur-sm shadow-lg transition hover:shadow-xl hover:border-[#00b4d8]"
                    >
                      <div className={`relative h-32 bg-gradient-to-br ${categoryColors[category.id] || 'from-[#0077b6] to-[#00b4d8]'} p-6`}>
                        <div className="absolute right-4 top-4 text-5xl opacity-20 group-hover:opacity-30 transition">
                          {categoryIcons[category.id] || '📰'}
                        </div>
                        <div className="relative z-10">
                          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            {category.id}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[#0077b6] group-hover:text-[#00b4d8] transition">
                          {category.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#00b4d8]">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>އިތުރަށް ބަލާ</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block mt-8">
          <PromoBanner location="category" position="bottom" />
        </div>
      </div>
    </motion.section>
  );
}
