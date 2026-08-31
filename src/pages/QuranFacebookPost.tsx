import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, BookOpen, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import AdminNavbar from '../components/AdminNavbar';

interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  pdfUrl: string;
  verses: { arabic: string | null; dhivehi: string | null }[];
}

type Platform = 'facebook' | 'instagram' | 'tiktok';

const PLATFORM_DIMENSIONS = {
  facebook: { width: 1080, height: 1080, aspectRatio: '1/1' },
  instagram: { width: 1080, height: 1080, aspectRatio: '1/1' },
  tiktok: { width: 1080, height: 1920, aspectRatio: '9/16' },
};

export default function QuranFacebookPost() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState<number>(100);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [quranData, setQuranData] = useState<Surah[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setCustomImage(reader.result as string);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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
        // Deduplicate by number and sort
        const uniqueSurahs = surahs.filter((surah, index, self) =>
          index === self.findIndex((s) => s.number === surah.number)
        );
        setQuranData(uniqueSurahs.sort((a, b) => a.number - b.number));
      } catch (error) {
        console.error('Error fetching Quran data:', error);
        // Fallback to JSON if Firebase fails
        try {
          const quranDataJson = await import('../data/quran-full.json');
          const data = quranDataJson.default as Surah[];
          // Deduplicate by number and sort
          const uniqueSurahs = data.filter((surah, index, self) =>
            index === self.findIndex((s) => s.number === surah.number)
          );
          setQuranData(uniqueSurahs.sort((a, b) => a.number - b.number));
        } catch (fallbackError) {
          console.error('Error loading fallback Quran data:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuranData();
  }, []);

  useEffect(() => {
    if (quranData.length === 0) return;
    const foundSurah = quranData.find((s: Surah) => s.number === selectedSurah);
    setSurah(foundSurah || null);
    setSelectedVerses([]);
  }, [selectedSurah, quranData]);

  const toggleVerse = (index: number) => {
    setSelectedVerses(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectAllVerses = () => {
    if (!surah) return;
    setSelectedVerses(surah.verses.map((_, i) => i).filter(i => surah.verses[i].arabic));
  };

  const clearSelection = () => {
    setSelectedVerses([]);
  };

  const downloadCard = async (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Temporarily remove transform for capture
      const originalTransform = card.style.transform;
      card.style.transform = 'none';
      
      const dimensions = PLATFORM_DIMENSIONS[selectedPlatform];
      
      const canvas = await html2canvas(card, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#0f172a',
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: dimensions.width,
        height: dimensions.height,
      });
      
      // Restore transform
      card.style.transform = originalTransform;
      
      const link = document.createElement('a');
      link.download = `quran-surah-${selectedSurah}-verse-${index + 1}-${selectedPlatform}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  const downloadAll = async () => {
    for (const index of selectedVerses) {
      await downloadCard(index);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!surah) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">الْقُرْآنا ترجمة - Quran Translation</h1>
          <p className="text-center text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const validVerses = surah.verses.filter((v, i) => v.arabic && v.dhivehi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <AdminNavbar />
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">الْقُرْآنا ترجمة</h1>
          <p className="text-gray-400">Quran Translation - Facebook Post Generator</p>
        </motion.div>

        {/* Platform Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Select Platform</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedPlatform('facebook')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlatform === 'facebook'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-slate-700 border-slate-600 hover:border-sky-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <p className="text-sm font-semibold">Facebook</p>
              <p className="text-xs text-gray-400">1080x1080</p>
            </button>
            <button
              onClick={() => setSelectedPlatform('instagram')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlatform === 'instagram'
                  ? 'bg-pink-600 border-pink-500'
                  : 'bg-slate-700 border-slate-600 hover:border-sky-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <p className="text-sm font-semibold">Instagram</p>
              <p className="text-xs text-gray-400">1080x1080</p>
            </button>
            <button
              onClick={() => setSelectedPlatform('tiktok')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlatform === 'tiktok'
                  ? 'bg-black border-gray-600'
                  : 'bg-slate-700 border-slate-600 hover:border-sky-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <p className="text-sm font-semibold">TikTok</p>
              <p className="text-xs text-gray-400">1080x1920</p>
            </button>
          </div>
        </div>

        {/* Surah Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Select Surah</label>
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(Number(e.target.value))}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
            disabled={loading || quranData.length === 0}
          >
            {quranData.map((s: Surah) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameArabic} - {s.nameEnglish}
              </option>
            ))}
          </select>

          <div className="flex gap-3 mt-4">
            <button
              onClick={selectAllVerses}
              className="flex-1 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="flex-1 bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Clear
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            Selected: {selectedVerses.length} verses
          </p>
        </div>

        {/* Custom Image Upload */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Upload Custom Image (Optional) or Paste Image (Ctrl+V)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setCustomImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
          />
          <p className="text-xs text-gray-400 mt-2">You can also paste an image directly using Ctrl+V</p>
          {customImage && (
            <div className="mt-4">
              <img
                src={customImage}
                alt="Custom"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => setCustomImage(null)}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Text Customization */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Text Customization</label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Text Color */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Text Position */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Text Position</label>
              <select
                value={textPosition}
                onChange={(e) => setTextPosition(e.target.value as 'top' | 'center' | 'bottom')}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Font Size: {fontSize}%</label>
              <input
                type="range"
                min="50"
                max="150"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Verse Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Select Verses</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto">
            {validVerses.map((_, index) => (
              <button
                key={index}
                onClick={() => toggleVerse(index)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                  selectedVerses.includes(index)
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Download All Button */}
        {selectedVerses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={downloadAll}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 px-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Download className="w-6 h-6" />
              Download All Selected ({selectedVerses.length})
            </button>
          </motion.div>
        )}

        {/* Preview Cards */}
        <div className="space-y-8">
          {selectedVerses.map((verseIndex) => {
            const verse = validVerses[verseIndex];
            if (!verse) return null;

            return (
              <motion.div
                key={verseIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Card Preview */}
                <div className="flex justify-center">
                  <div
                    ref={(el) => (cardRefs.current[verseIndex] = el)}
                    className="rounded-2xl border-2 border-sky-600/30 shadow-2xl relative overflow-hidden"
                    style={{ 
                      width: `${PLATFORM_DIMENSIONS[selectedPlatform].width}px`, 
                      height: `${PLATFORM_DIMENSIONS[selectedPlatform].height}px`, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center',
                      transform: selectedPlatform === 'tiktok' ? 'scale(0.25)' : 'scale(0.37)',
                      transformOrigin: 'top center'
                    }}
                  >
                  {/* Custom Image Background */}
                  {customImage ? (
                    <img
                      src={customImage}
                      alt="Custom"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                  )}

                  {/* Transparent Overlay - exclude logo area */}
                  <div className="absolute inset-0 bg-black/60" style={{ clipPath: 'inset(0 0 0 0)' }}></div>

                  {/* Logo Overlay with white background */}
                  <div className="absolute top-4 right-4 z-20 bg-white rounded-xl p-2 shadow-lg">
                    <img
                      src="/logo.png"
                      alt="Hawa Daily"
                      className="w-10 h-10 object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="relative z-10 text-center space-y-4 p-8"
                    style={{
                      justifyContent: textPosition === 'top' ? 'flex-start' : textPosition === 'bottom' ? 'flex-end' : 'center',
                      fontSize: `${fontSize}%`
                    }}
                  >
                    {/* Surah Header */}
                    <div className="border-b border-white/30 pb-4" style={{ fontSize: '1rem' }}>
                      <p className="font-bold" style={{ color: textColor, fontSize: '2em' }}>{surah.nameArabic}</p>
                      <p style={{ color: textColor, fontSize: '0.875em' }}>{surah.nameEnglish} - Verse {verseIndex + 1}</p>
                    </div>

                    {/* Arabic Text */}
                    <div className="font-bold leading-relaxed" style={{ fontFamily: 'Amiri, serif', color: textColor, fontSize: '3em' }}>
                      {verse.arabic}
                    </div>

                    {/* Dhivehi Translation */}
                    <div className="leading-relaxed" style={{ color: textColor, fontSize: '2em' }}>
                      {verse.dhivehi}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/30 pt-4 space-y-2" style={{ fontSize: '0.875em' }}>
                      <p style={{ color: textColor, fontSize: '1em' }}>ހަވާ ޑެއިލީ | Hawa Daily</p>
                      <p style={{ color: textColor, fontSize: '0.75em' }}>الْقُرْآنا ގެ ترجمة އެއްކޮން ކިޔާލެއްވުމަށް</p>
                      <p style={{ color: textColor, fontSize: '0.75em' }}>www.hawadaily.com/quran</p>
                      <div className="flex justify-center gap-4 items-center" style={{ color: textColor, fontSize: '0.75em' }}>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Hawa Daily</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span>@hawadailymv</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                          <span>@hawadailymv</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => downloadCard(verseIndex)}
                  className="w-full bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Verse {verseIndex + 1}
                </button>
              </motion.div>
            );
          })}
        </div>

        {selectedVerses.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select verses above to generate Facebook posts</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
