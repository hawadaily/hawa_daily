import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, BookOpen, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  pdfUrl: string;
  verses: { arabic: string | null; dhivehi: string | null }[];
}

export default function QuranFacebookPost() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState<number>(100);
  const [quranData, setQuranData] = useState<Surah[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        setQuranData(surahs);
      } catch (error) {
        console.error('Error fetching Quran data:', error);
        // Fallback to JSON if Firebase fails
        try {
          const quranDataJson = await import('../data/quran-full.json');
          setQuranData(quranDataJson.default as Surah[]);
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
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: '#0f172a',
      });
      
      const link = document.createElement('a');
      link.download = `quran-surah-${selectedSurah}-verse-${index + 1}.png`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">الْقُرْآنا ترجمة - Quran Translation</h1>
          <p className="text-center text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const validVerses = surah.verses.filter((v, i) => v.arabic && v.dhivehi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">الْقُرْآنا ترجمة</h1>
          <p className="text-gray-400">Quran Translation - Facebook Post Generator</p>
        </motion.div>

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
          <label className="block text-sm font-semibold mb-3">Upload Custom Image (Optional)</label>
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
                <div
                  ref={(el) => (cardRefs.current[verseIndex] = el)}
                  className="rounded-2xl border-2 border-sky-600/30 shadow-2xl relative overflow-hidden"
                  style={{ aspectRatio: '1/1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
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

                  {/* Transparent Overlay */}
                  <div className="absolute inset-0 bg-black/60"></div>

                  {/* Logo Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                    <img
                      src="/HAWA LOGO.jpg"
                      alt="Hawa Daily"
                      className="w-12 h-12 object-contain opacity-90"
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
                    <div className="border-b border-white/30 pb-4">
                      <p className="text-2xl font-bold" style={{ color: textColor }}>{surah.nameArabic}</p>
                      <p className="text-sm" style={{ color: textColor }}>{surah.nameEnglish} - Verse {verseIndex + 1}</p>
                    </div>

                    {/* Arabic Text */}
                    <div className="text-3xl md:text-4xl font-bold leading-relaxed" style={{ fontFamily: 'Amiri, serif', color: textColor }}>
                      {verse.arabic}
                    </div>

                    {/* Dhivehi Translation */}
                    <div className="text-xl md:text-2xl leading-relaxed" style={{ color: textColor }}>
                      {verse.dhivehi}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/30 pt-4 space-y-2">
                      <p className="text-sm" style={{ color: textColor }}>ހަވާ ޑެއިލީ | Hawa Daily</p>
                      <p className="text-xs" style={{ color: textColor }}>الْقُرْآنا ގެ ترجمة އެއްކޮން ކިޔާލެއްވުމަށް</p>
                      <p className="text-xs" style={{ color: textColor }}>www.hawadaily.com</p>
                      <div className="flex justify-center gap-2 text-xs" style={{ color: textColor }}>
                        <span>Facebook: Hawa Daily</span>
                        <span>|</span>
                        <span>Instagram: @hawadailymv</span>
                        <span>|</span>
                        <span>TikTok: @hawadailymv</span>
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
  );
}
