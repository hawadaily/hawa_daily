import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, getDoc, doc, orderBy, query, limit } from 'firebase/firestore';
import ArticleCard from '../components/ArticleCard';
import PromoBanner from '../components/PromoBanner';
import { Article, categories } from '../data/mockData';
import { db } from '../firebase';

export default function Home() {
  const [articlesState, setArticlesState] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);

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
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const heroArticles = articlesState.slice(0, 3);
  const trending = useMemo(() => articlesState.filter((article) => article.trending), [articlesState]);
  const latest = useMemo(() => articlesState.slice(0, visibleCount), [articlesState, visibleCount]);
  const hasMore = articlesState.length > visibleCount;

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

  return (
    <div className="space-y-8 text-right lg:space-y-12">
      {/* Top Promo Banner */}
      <PromoBanner location="home" position="top" />

      {/* Categories Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-right">
          <div>
            <p className="text-xs lg:text-4xl uppercase tracking-[0.2em] text-sky-600">ހުރިހާ ބައިތައް</p>
          </div>
          <Link to="/categories" className="text-xs lg:text-2xl text-sky-700 transition hover:text-sky-900">އިތުރަށް ބަލާ</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/categories/${category.id}`}
              className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs lg:text-lg text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </section>

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
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <aside className="hidden lg:block lg:h-[512px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900">ޚާއްސަ ބައިތައް</h3>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {categories.slice(4).map((category) => (
                <div key={category.id} className={`rounded-3xl border border-slate-200 px-4 py-4 ${category.color} bg-opacity-10`}>
                  <p className="text-sm font-semibold text-slate-900">{category.title}</p>
                  <p className="mt-1 text-xs text-slate-500">ވެ އަވަދިވާ ނިއުސް</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
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
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {latest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
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

      {/* Bottom Promo Banner */}
      <PromoBanner location="home" position="bottom" />
    </div>
  );
}
