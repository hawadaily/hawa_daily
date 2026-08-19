import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, getDocsFromCache, onSnapshot } from 'firebase/firestore';
import { Article, categories } from '../data/mockData';
import { Recipe } from '../data/recipes';
import ArticleCard from '../components/ArticleCard';
import PromoBanner from '../components/PromoBanner';
import RecipeSlider from '../components/RecipeSlider';
import SiteStats from '../components/SiteStats';
import JobsPromoSlide from '../components/JobsPromoSlide';
import { getCompanyLogo } from '../data/companyLogos';

export default function Home() {
  const [articlesState, setArticlesState] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobIndex, setJobIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [language, setLanguage] = useState<'dv' | 'en'>('dv');

  useEffect(() => {
    const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
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
    }, (error) => {
      console.error('Error fetching articles:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Use fallback jobs data instead of API call for production
        const { fallbackJobs } = await import('../data/fallbackJobs');
        setJobs(fallbackJobs.slice(0, 8));
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesQuery = query(collection(db, 'recipes'), orderBy('id'));
        const snapshot = await getDocs(recipesQuery);
        const recipesData = snapshot.docs.map(doc => doc.data() as Recipe);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (isPaused || jobs.length === 0) return;
    const interval = setInterval(() => {
      setJobIndex((prev) => (prev + 1) % jobs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [jobs.length, isPaused]);

  const featuredArticles = useMemo(() => articlesState.filter((article) => article.featured), [articlesState]);
  const breakingArticles = useMemo(() => articlesState.filter((article) => article.breakingNews), [articlesState]);
  
  // Priority: Breaking news first, then featured, then regular articles
  const heroArticles = useMemo(() => {
    const priorityArticles = [...breakingArticles, ...featuredArticles];
    const uniquePriorityArticles = Array.from(new Map(priorityArticles.map(article => [article.id, article])).values());
    
    if (uniquePriorityArticles.length >= 3) {
      return uniquePriorityArticles.slice(0, 3);
    }
    
    // Fill remaining slots with recent articles
    const recentArticles = articlesState.filter(article => 
      !uniquePriorityArticles.some(p => p.id === article.id)
    ).slice(0, 3 - uniquePriorityArticles.length);
    
    return [...uniquePriorityArticles, ...recentArticles];
  }, [breakingArticles, featuredArticles, articlesState]);
  
  const filteredArticles = selectedCategory 
    ? articlesState.filter(article => article.category === selectedCategory)
    : articlesState;
  const trending = useMemo(() => filteredArticles.filter((article) => article.trending), [filteredArticles]);
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

      {/* Jobs Promotion Slide */}
      <JobsPromoSlide />

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
        {/* Sidebar - Jobs and Recipe Sliders */}
        <aside className="hidden lg:block lg:h-[512px]">
          <div className="rounded-2xl border border-[#90e0ef] bg-white p-5 shadow-lg h-full overflow-hidden flex flex-col">
            {/* Recipe Slider */}
            <div className="mb-4">
              <RecipeSlider 
                recipes={recipes} 
                language={language}
                onViewDetails={(recipe) => {
                  window.location.href = `/recipes`;
                }}
              />
            </div>
            
            {/* Jobs Slider */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0077b6]">ފަހުގެ ވަޒީފާ</h3>
                <Link to="/jobs" className="text-sm text-[#00b4d8] hover:text-[#0077b6] transition">
                  އިތުރަށް ބަލާ →
                </Link>
              </div>
              
              {jobs.length > 0 ? (
                <div 
                  className="relative h-[200px]"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={jobIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Link to="/jobs" className="block h-full">
                        <div className="h-full flex flex-col">
                          {jobs.slice(jobIndex, jobIndex + 2).map((job, idx) => {
                            const companyLogo = getCompanyLogo(job.company);
                            return (
                              <div 
                                key={`${job.id}-${idx}`}
                                className="flex items-center gap-3 p-3 rounded-xl border border-[#90e0ef] bg-[#caf0f8]/50 hover:bg-[#caf0f8] transition mb-2 last:mb-0"
                              >
                                {companyLogo && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={companyLogo} 
                                      alt={job.company}
                                      className="w-10 h-10 object-contain bg-white rounded-lg p-1.5 shadow"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-[#0077b6] line-clamp-1">
                                    {job.title}
                                  </h4>
                                  <p className="text-xs text-[#00b4d8]">{job.company}</p>
                                  <span className="text-[10px] text-[#0077b6]/70">
                                    {getRelativeTime(job.postedDate)}
                                  </span>
                                </div>
                                <svg className="w-5 h-5 text-[#00b4d8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            );
                          })}
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation dots */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {Array.from({ length: Math.ceil(jobs.length / 2) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setJobIndex(index * 2)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          Math.floor(jobIndex / 2) === index ? 'bg-[#0077b6] w-6' : 'bg-[#90e0ef]'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Arrow navigation */}
                  <button
                    onClick={() => setJobIndex((prev) => (prev - 2 + jobs.length) % jobs.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#caf0f8] hover:bg-[#00b4d8] hover:text-white rounded-full flex items-center justify-center text-[#0077b6] transition shadow"
                    aria-label="Previous slide"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setJobIndex((prev) => (prev + 2) % jobs.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#caf0f8] hover:bg-[#00b4d8] hover:text-white rounded-full flex items-center justify-center text-[#0077b6] transition shadow"
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <div className="text-4xl mb-2">💼</div>
                  <p className="text-sm text-[#00b4d8]">ވަޒީފާ ލޯޑް ވަނީ...</p>
                </div>
              )}
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

      {/* Site Stats */}
      <SiteStats />

      {/* Bottom Promo Banner */}
      <PromoBanner location="home" position="bottom" />
    </div>
  );
}
