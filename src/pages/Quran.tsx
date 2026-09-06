import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { Search, BookOpen, ChevronRight, Share2, Menu, X } from 'lucide-react';

interface Verse {
  arabic: string | null;
  dhivehi: string | null;
}

interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  pdfUrl: string;
  verses: Verse[];
}

export default function Quran() {
  const navigate = useNavigate();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quranSurahs, setQuranSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchQuranData = async () => {
      try {
        const db = getFirestore();
        const quranCollection = collection(db, 'quran');
        const querySnapshot = await getDocs(quranCollection);
        const surahs: Surah[] = [];
        querySnapshot.forEach((doc) => {
          surahs.push(doc.data() as Surah);
        });
        setQuranSurahs(surahs);
      } catch (error) {
        console.error('Error fetching Quran data:', error);
        // Fallback to JSON if Firebase fails
        try {
          const quranData = await import('../data/quran-full.json');
          setQuranSurahs(quranData.default as Surah[]);
        } catch (fallbackError) {
          console.error('Error loading fallback Quran data:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuranData();
  }, []);

  const filteredSurahs: { surah: Surah; verseIndex: number; verse: Verse }[] = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    const results: { surah: Surah; verseIndex: number; verse: Verse }[] = [];
    
    quranSurahs.forEach((surah) => {
      surah.verses.forEach((verse, index) => {
        if (verse.arabic && verse.dhivehi) {
          const arabicMatch = verse.arabic.toLowerCase().includes(query);
          const dhivehiMatch = verse.dhivehi.toLowerCase().includes(query);
          const nameMatch = surah.nameArabic.toLowerCase().includes(query) || 
                          surah.nameEnglish.toLowerCase().includes(query);
          
          if (arabicMatch || dhivehiMatch || nameMatch) {
            results.push({ surah, verseIndex: index, verse });
          }
        }
      });
    });
    
    return results;
  }, [searchQuery]);

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setSearchQuery('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSurah(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Quran data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-slate-800 mb-3" dir="rtl">الْقُرْآنا ترجمة</h1>
          <p className="text-2xl text-slate-600 font-medium">ތައުލީންގެ ކިތާބު</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-2xl mx-auto flex items-center gap-4"
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input
              type="text"
              placeholder="ސޫރާ ނުވަތަ އާޔަތް ހޯދާ..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg shadow-sm"
              dir="rtl"
            />
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">ސޫރާތައް</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition"
                    >
                      <X className="w-6 h-6 text-slate-600" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quranSurahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          handleSurahSelect(surah);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full p-4 rounded-2xl text-right transition-all ${
                          selectedSurah?.number === surah.number
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-base font-bold">{surah.nameArabic}</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                            selectedSurah?.number === surah.number
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>{surah.number}</span>
                        </div>
                        <div className={`text-sm mt-1 ${
                          selectedSurah?.number === surah.number
                            ? 'text-white/80'
                            : 'text-slate-500'
                        }`}>{surah.nameEnglish}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Surah List */}
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 max-h-[700px] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center pb-4 border-b border-slate-200">ސޫރާތައް</h2>
                <div className="space-y-2">
                  {quranSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => handleSurahSelect(surah)}
                      className={`w-full p-4 rounded-2xl text-right transition-all ${
                        selectedSurah?.number === surah.number
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      dir="rtl"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-bold">{surah.nameArabic}</span>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                          selectedSurah?.number === surah.number
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>{surah.number}</span>
                      </div>
                      <div className={`text-sm mt-1 ${
                        selectedSurah?.number === surah.number
                          ? 'text-white/80'
                          : 'text-slate-500'
                      }`}>{surah.nameEnglish}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Verses Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={searchQuery ? 'lg:col-span-3' : 'lg:col-span-2'}
          >
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 max-h-[700px] overflow-y-auto">
              {searchQuery ? (
                /* Search Results */
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center pb-4 border-b border-slate-200">
                    ނަތީޖާ: {filteredSurahs.length}
                  </h2>
                  <div className="space-y-6">
                    {filteredSurahs.map((result, index) => (
                      <motion.div
                        key={`${result.surah.number}-${result.verseIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-sm"
                      >
                        <div className="text-sm text-slate-500 mb-4 text-center font-medium">
                          {result.surah.nameArabic} - {result.surah.nameEnglish} ({result.surah.number}:{result.verseIndex})
                        </div>
                        <div className="text-2xl font-bold text-slate-800 text-right mb-4 leading-loose" dir="rtl" style={{ fontFamily: 'Traditional Arabic, Scheherazade New, Arial' }}>
                          {result.verse.arabic}
                        </div>
                        <div className="text-lg text-slate-700 text-right leading-relaxed" dir="rtl">
                          {result.verse.dhivehi}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredSurahs.length === 0 && (
                    <div className="text-center text-slate-500 py-16">
                      <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-xl">ނަތީޖާ ނެތް</p>
                    </div>
                  )}
                </div>
              ) : selectedSurah ? (
                /* Selected Surah Verses */
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <button
                      onClick={() => setSelectedSurah(null)}
                      className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>އަނބުރާ</span>
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800" dir="rtl">
                      {selectedSurah.nameArabic}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/quran/facebook-post')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
                      >
                        <span>Facebook Post</span>
                        <Share2 className="w-5 h-5" />
                      </button>
                      <a
                        href={selectedSurah.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
                      >
                        <span>PDF</span>
                        <BookOpen className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {selectedSurah.verses.map((verse, index) => {
                      if (!verse.arabic || !verse.dhivehi) return null;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.01 }}
                          className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-sm"
                        >
                          <div className="text-sm text-slate-500 mb-4 text-center font-medium">
                            {selectedSurah.nameArabic} ({selectedSurah.number}:{index})
                          </div>
                          <div className="text-2xl font-bold text-slate-800 text-right mb-4 leading-loose" dir="rtl" style={{ fontFamily: 'Traditional Arabic, Scheherazade New, Arial' }}>
                            {verse.arabic}
                          </div>
                          <div className="text-lg text-slate-700 text-right leading-relaxed" dir="rtl">
                            {verse.dhivehi}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Initial State */
                <div className="text-center text-slate-500 py-20">
                  <BookOpen className="w-24 h-24 mx-auto mb-6 opacity-20" />
                  <p className="text-xl font-medium">ސޫރާއެއް އިޚްތިޔާރު ކުރާ ނުވަތަ ހޯދިގެން ބަލާ</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
