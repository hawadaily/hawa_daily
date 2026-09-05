import { useEffect, useState } from 'react';
import React from 'react';
import { collection, query, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, serverTimestamp, onSnapshot, getDocs } from 'firebase/firestore';
import { db as goldenTimeDb } from '../firebase-golden-time';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react';

interface GoldenTimeArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  year?: number;
  category?: string;
  content?: string;
  createdAt: any;
  likes?: string[];
  dislikes?: string[];
  views?: number;
  comments?: number;
}

export default function GoldenTime() {
  const [articles, setArticles] = useState<GoldenTimeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  // Simple bilingual mapping for common terms
  const bilingualMap: Record<string, string[]> = {
    'fish': ['ފިހި', 'މަސް', 'ގަރުދިޔަ'],
    'sea': ['ކަނޑު', 'ކަނޑުރައްތައް'],
    'water': ['ފެން', 'އައްވާ'],
    'island': ['ރަށް', 'އަތޮޅު'],
    'boat': ['ނަވައް', 'ޑޮނީ'],
    'people': ['މީހުން', 'އާބަދަރިން'],
    'house': ['ގެ', 'އިމާރާތް'],
    'food': ['ކާނާ', 'ކައިބު'],
    'market': ['ބަޒާރު', 'މާރުކެޓް'],
    'school': ['ސުކޫލް', 'މަދަރަސާ'],
    'mosque': ['މިސްކިދު', 'މަސްޖިދު'],
    'beach': ['ބީޗް', 'ކަނޑުފަޅި'],
    'sun': ['އިރު', 'ޝަމްސު'],
    'moon': ['މާކަނޑު', 'ކަނޑު'],
    'star': ['އިރުގަނޑު', 'ތަރި'],
    'tree': ['ގަސް', 'ފަސް'],
    'flower': ['ފުޅި', 'ގޮވާ'],
    'bird': ['ފާނައިގެއް', 'ފިކުރާ'],
    'animal': ['ޖަނަވާރިއްޔާ', 'ސައިވާނާ'],
    'gold': ['ރަން', 'އޮލްޑް'],
    'time': ['ޒަމާން', 'ވަގުތު'],
    'history': ['ތާރީޚް', 'ހިސާބު'],
    'old': ['ކުރީގެ', 'އަންހެން'],
    'new': ['އާ', 'ހަމަ'],
  };

  const normalizeText = (text: string) => {
    return text.toLowerCase().trim();
  };

  const searchInText = (text: string, term: string): boolean => {
    const normalizedText = normalizeText(text);
    const normalizedTerm = normalizeText(term);
    
    // Direct match (handles both English and Dhivehi)
    if (normalizedText.includes(normalizedTerm)) {
      return true;
    }

    // Check bilingual mappings for cross-language search
    for (const [english, dhivehiTerms] of Object.entries(bilingualMap)) {
      // If searching in English, check if text contains any Dhivehi equivalent
      if (normalizedTerm === english.toLowerCase()) {
        return dhivehiTerms.some(dhivehi => normalizedText.includes(dhivehi));
      }
      // If searching in Dhivehi, check if text contains English equivalent
      if (dhivehiTerms.includes(normalizedTerm)) {
        return normalizedText.includes(english.toLowerCase());
      }
    }

    return false;
  };

  const filteredArticles = articles.filter(article => {
    // Filter by selected title
    if (selectedTitle && article.title !== selectedTitle) {
      return false;
    }
    
    // Filter by search term
    if (!searchTerm) return true;
    
    const searchFields = [
      article.title,
      article.description,
      article.category,
      article.author,
    ].filter((field): field is string => Boolean(field));

    return searchFields.some(field => searchInText(field, searchTerm));
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (articleId: string) => {
    if (!user) return;
    const articleRef = doc(goldenTimeDb, 'golden-time', articleId);
    const articleSnap = await getDoc(articleRef);
    if (articleSnap.exists()) {
      const article = articleSnap.data() as GoldenTimeArticle;
      const likes = article.likes || [];
      const dislikes = article.dislikes || [];
      
      if (likes.includes(user.uid)) {
        await updateDoc(articleRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(articleRef, { 
          likes: arrayUnion(user.uid),
          dislikes: dislikes.includes(user.uid) ? arrayRemove(user.uid) : []
        });
      }
    }
  };

  const handleDislike = async (articleId: string) => {
    if (!user) {
      alert('Please login to dislike articles');
      return;
    }
    try {
      const articleRef = doc(goldenTimeDb, 'golden-time', articleId);
      const articleSnap = await getDoc(articleRef);
      const articleData = articleSnap.data();
      
      if (articleData?.dislikes?.includes(user.uid)) {
        await updateDoc(articleRef, {
          dislikes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(articleRef, {
          dislikes: arrayUnion(user.uid),
          likes: arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error('Error disliking article:', error);
    }
  };

  const incrementView = async (articleId: string) => {
    try {
      const articleRef = doc(goldenTimeDb, 'golden-time', articleId);
      await updateDoc(articleRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    const loadArticles = () => {
      const articlesQuery = query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
        const articlesData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setArticles(articlesData);
        setLoading(false);
      }, (error) => {
        console.error('Failed to load golden time articles:', error);
        setLoading(false);
      });
      return unsubscribe;
    };

    const loadPromotions = async () => {
      try {
        const promotionsSnapshot = await getDocs(query(collection(db, 'mid-article-promotions'), orderBy('createdAt', 'desc')));
        const promotionsData = promotionsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Failed to load promotions:', error);
      }
    };

    const unsubscribe = loadArticles();
    loadPromotions();
    return () => unsubscribe();
  }, []);

  // Update meta tags for social sharing
  useEffect(() => {
    document.title = 'ދިވެހި ރަން ޒަމާން | ހަވާ ޑެއިލީ';

    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateMetaTagName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('og:title', 'ދިވެހި ރަން ޒަމާން | ހަވާ ޑެއިލީ');
    updateMetaTag('og:description', 'ދިވެހިރާއްޖޭގެ 1990 ގެ ޒަމާންގެ ވާހަކަތައް - Stories from Maldives Golden Era');
    updateMetaTag('og:image', 'https://www.hawadaily.com/og-image.jpg');
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'ހަވާ ޑެއިލީ');
    
    updateMetaTagName('twitter:card', 'summary_large_image');
    updateMetaTagName('twitter:title', 'ދިވެހި ރަން ޒަމާން | ހަވާ ޑެއިލީ');
    updateMetaTagName('twitter:description', 'ދިވެހިރާއްޖޭގެ 1990 ގެ ޒަމާންގެ ވާހަކަތައް - Stories from Maldives Golden Era');
    updateMetaTagName('twitter:image', 'https://www.hawadaily.com/og-image.jpg');

    return () => {
      const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      metaTags.forEach((tag) => tag.remove());
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#caf0f8] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Banner */}
        <div className="mb-8 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-orange-50 p-6">
          <p className="text-center text-sm text-gray-700">
           📸 ވޭތުވެދިޔަ ޒަމާނަކަށް އެނބުރި ދަތުރެއް ކުރައްވާ! 1980 ގެ އަހަރުތަކުގެ ނުވަތަ 1990 ގެ އަހަރުތަކުގެ ތެރެއިން، ތިޔަބޭފުޅާގެ ހަނދާނުގައި ބިންވަޅުނެގިފައިވާ ޚާއްސަ ހަނދާނެއް އަލުން ދިރުވާލަން ބޭނުންފުޅުތޯ؟ ތިޔަބޭފުޅާ އަލުން އާކުރަން ބޭނުންފުޅުވާ ވަކި އަހަރެއް، ހާދިސާއެއް، ތަނެއް، ނުވަތަ މައުޟޫއެއް ވާނަމަ އަޅުގަނޑުމެންނާ ހިއްސާކޮށްލައްވާށެވެ. އަޅުގަނޑުމެންގެ ޓީމުން އެ ޒަމާނަށް ތިޔަބޭފުޅާ އަނބުރާ ގެންގޮސްދީ، އެ ދުވަސްވަރުގެ އަސްލު ސިފަ ގެނުވައިދޭ ފޮޓޯތަކެއްގެ ޒަރީއާއިން އެ ވަގުތުތައް އަލުން ބިނާކޮށްދޭނަމެވެ؛ އެ ދުވަސްތައް ޚާއްސަކޮށްދިން މީހުންނާއި، ތަންތަނާއި، އަދި ހަނދާންތައް ހަނދާންކޮށްދިނުމަށް އެހީތެރިވެދޭނެއެވެ. ތިޔަބޭފުޅާގެ ހަނދާންތައް ވެގެންދާނީ އެންމެންނަށްވެސް ތަޖުރިބާކޮށްލެވޭނެ ދަތުރަކަށެވެ. ❤️
          </p>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ދިވެހި ރަން ޒަމާން </h1>
          <p className="mt-2 text-gray-600">ދިވެހިރާއްޖޭގެ 1900 އަހަރުތަކުގެ ގެ ޒަމާންގެ ވާހަކަތައް </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Search Input */}
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <input
                type="text"
                placeholder="ހޯދާލާ... / Search... (ފިހި / fish)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Title Dropdown */}
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <select
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer"
              >
                <option value="">ޙާއްސަ ސުރުހީތަށް</option>
                {[...new Set(articles.map(a => a.title))].sort().map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || selectedTitle) && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'ނަތީޖާ' : 'ނަތީޖާތައް'} ފެނުނު
            </p>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'ހޯއްދެވި މަޢުލޫމާތެއް ނެތް. No results found.' : 'އެއްވެސް މަޢުލޫމާތެއް ނެތް. No articles available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article, index) => {
              const shouldShowBanner = index > 0 && index % 6 === 0 && promotions.length > 0;
              const bannerIndex = Math.floor(index / 6) - 1;
              const currentBanner = shouldShowBanner ? promotions[bannerIndex % promotions.length] : null;

              return (
                <React.Fragment key={article.id}>
                  {shouldShowBanner && currentBanner && (
                    <div className="col-span-full">
                      <Link
                        to={currentBanner.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={currentBanner.image}
                          alt={currentBanner.title || 'Promotion'}
                          className="w-full h-auto rounded-2xl border border-gray-200 shadow-sm"
                        />
                      </Link>
                    </div>
                  )}
                  <Link
                    to={`/golden-time/${article.slug}`}
                    onClick={() => incrementView(article.id)}
                    className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      {article.year && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                            {article.year}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition">
                        {article.title}
                      </h3>
                      {article.author && (
                        <p className="mt-1 text-sm text-gray-500">by {article.author}</p>
                      )}
                      {article.category && (
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {article.category}
                        </span>
                      )}
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.description}</p>
                      
                      {/* Engagement Stats */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleLike(article.id);
                            }}
                            className={`flex items-center gap-1 text-sm transition ${
                              article.likes?.includes(user?.uid) ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{article.likes?.length || 0}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDislike(article.id);
                            }}
                            className={`flex items-center gap-1 text-sm transition ${
                              article.dislikes?.includes(user?.uid) ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>{article.dislikes?.length || 0}</span>
                          </button>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageCircle className="w-4 h-4" />
                            <span>{article.comments || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{article.views || 0}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm text-brand-600 font-semibold">
                        <span>އިތުރަށް ބަލާލުމަށް</span>
                        <svg className="ml-1 h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
