import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ChefHat, Image as ImageIcon } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';

interface Recipe {
  id: string;
  titleDv: string;
  titleEn: string;
  image: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: {
    dv: string[];
    en: string[];
  };
  instructions: {
    dv: string;
    en: string;
  };
}

type Platform = 'facebook' | 'instagram' | 'tiktok';

const PLATFORM_DIMENSIONS = {
  facebook: { width: 1080, height: 1080, aspectRatio: '1/1' },
  instagram: { width: 1080, height: 1080, aspectRatio: '1/1' },
  tiktok: { width: 1080, height: 1920, aspectRatio: '9/16' },
};

export default function RecipeFacebookPost() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState<number>(100);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [viewMode, setViewMode] = useState<'cover' | 'full'>('cover');
  const cardRef = useRef<HTMLDivElement>(null);

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

  const fetchRecipes = async () => {
    try {
      const recipesDataJson = await import('../data/lonumedhu-recipes.json');
      setRecipes(recipesDataJson.default as Recipe[]);
    } catch (error) {
      console.error('Error loading recipe data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const downloadCard = async () => {
    const card = cardRef.current;
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
      link.download = `recipe-${selectedRecipe?.id || 'post'}-${viewMode}-${selectedPlatform}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <AdminNavbar />
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">ރަހަ ފޭސްބުކް ޕޯސްޓް - Recipe Facebook Post</h1>
          <p className="text-center text-gray-400">Loading recipes...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ރަހަ ފޭސްބުކް ޕޯސްޓް</h1>
          <p className="text-gray-400">Recipe Facebook Post Generator</p>
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

        {/* View Mode Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Select View Mode</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setViewMode('cover')}
              className={`p-4 rounded-xl border-2 transition-all ${
                viewMode === 'cover'
                  ? 'bg-sky-600 border-sky-500'
                  : 'bg-slate-700 border-slate-600 hover:border-sky-500'
              }`}
            >
              <ImageIcon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-semibold">Cover Image</p>
              <p className="text-xs text-gray-400">Simple image with title</p>
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`p-4 rounded-xl border-2 transition-all ${
                viewMode === 'full'
                  ? 'bg-green-600 border-green-500'
                  : 'bg-slate-700 border-slate-600 hover:border-sky-500'
              }`}
            >
              <ChefHat className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-semibold">Full Recipe</p>
              <p className="text-xs text-gray-400">Name, ingredients & instructions</p>
            </button>
          </div>
        </div>

        {/* Recipe Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold">Select Recipe</label>
            <button
              onClick={fetchRecipes}
              className="text-xs bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
          <select
            value={selectedRecipe?.id || ''}
            onChange={(e) => {
              const recipe = recipes.find(r => r.id === e.target.value);
              setSelectedRecipe(recipe || null);
            }}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">Select a recipe...</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.titleDv}
              </option>
            ))}
          </select>
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

        {/* Preview Card */}
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Download Button */}
            <button
              onClick={downloadCard}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 px-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg sticky top-4 z-50"
            >
              <Download className="w-6 h-6" />
              Download {viewMode === 'cover' ? 'Cover Image' : 'Full Recipe'} ({selectedPlatform})
            </button>

            <div
              ref={cardRef}
              className="rounded-2xl border-2 border-sky-600/30 shadow-2xl relative overflow-hidden"
              style={{ 
                width: `${PLATFORM_DIMENSIONS[selectedPlatform].width}px`, 
                height: `${PLATFORM_DIMENSIONS[selectedPlatform].height}px`, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                transform: selectedPlatform === 'tiktok' ? 'scale(0.35)' : 'scale(0.5)',
                transformOrigin: 'top center',
                backgroundImage: customImage ? `url(${customImage})` : selectedRecipe.image ? `url(${selectedRecipe.image})` : 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >

              {/* Transparent Overlay */}
              <div className="absolute inset-0 bg-black/60"></div>

              {/* Logo Overlay with white background */}
              <div className="absolute top-4 right-4 z-20 bg-white rounded-xl p-2 shadow-lg">
                <img
                  src="/logo.png"
                  alt="Hawa Daily"
                  className="w-10 h-10 object-contain"
                />
              </div>

              {/* Content */}
              {viewMode === 'cover' ? (
                <div
                  className="relative z-10 text-center space-y-4 p-8"
                  style={{
                    justifyContent: textPosition === 'top' ? 'flex-start' : textPosition === 'bottom' ? 'flex-end' : 'center',
                    fontSize: `${fontSize}%`
                  }}
                >
                  {/* Category Header */}
                  <div className="border-b border-white/30 pb-4" style={{ fontSize: '1rem' }}>
                    <p className="font-bold" style={{ color: textColor, fontSize: '1.5em' }}>{selectedRecipe.category}</p>
                  </div>

                  {/* Recipe Title */}
                  <div className="font-bold leading-relaxed" style={{ color: textColor, fontSize: '2.5em' }}>
                    {selectedRecipe.titleDv}
                  </div>

                  {/* Ingredients Preview */}
                  <div className="leading-relaxed" style={{ color: textColor, fontSize: '1.5em' }}>
                    {selectedRecipe.ingredients.dv.slice(0, 3).join(', ')}
                    {selectedRecipe.ingredients.dv.length > 3 && '...'}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/30 pt-4 space-y-2" style={{ fontSize: '0.875em' }}>
                    <p style={{ color: textColor, fontSize: '1em' }}>ހަވާ ޑެއިލީ | Hawa Daily</p>
                    <p style={{ color: textColor, fontSize: '0.75em' }}>ރަހަގެ ސިއްރުތަށް ބަލާލެއްވުމަށް ޕޭޖަށް ވަންނަވާ</p>
                    <p style={{ color: textColor, fontSize: '0.75em' }}>www.hawadaily.com/recipes</p>
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

                  {/* Slide Instruction */}
                  <div className="flex items-center justify-center gap-2 mt-32" style={{ color: textColor, fontSize: '1.8em' }}>
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    <span>ހަދާނެގޮތް ބައްލަވާ ލުމަށް ސްލައިޑް ކޮއްލަށްވާ</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-white p-6 space-y-4 overflow-y-auto" style={{ 
                  fontSize: `${fontSize}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  {/* Recipe Name at Top */}
                  <div className="text-center border-b border-white/30 pb-12 pt-8">
                    <p className="font-bold text-2xl mb-8" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '2.5em' : '2em' }}>{selectedRecipe.titleDv}</p>
                    <div className="flex justify-center gap-4 text-xs" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1em' : '0.8em' }}>
                      <span>⏱️ {selectedRecipe.prepTime}</span>
                      <span>🍳 {selectedRecipe.cookTime}</span>
                      <span>👥 {selectedRecipe.servings}</span>
                    </div>
                  </div>

                  {/* Ingredients in Middle */}
                  <div className="space-y-2 mb-6">
                    <h3 className="font-bold text-lg border-b border-white/30 pb-2" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '2em' : '1.5em' }}>(ބޭނުންވާ ތަކެތި)</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1.3em' : '1em', lineHeight: '1.6' }}>
                      {selectedRecipe.ingredients.dv.map((ingredient, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-sky-400">•</span>
                          <span>{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spacer for gap */}
                  <div style={{ height: selectedPlatform === 'tiktok' ? '80px' : '60px' }}></div>

                  {/* Instructions at Bottom */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg border-b border-white/30 pb-2" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '2em' : '1.5em' }}>ހައްދަވާނެ ގޮތް:</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1.3em' : '1em' }}>
                      {selectedRecipe.instructions.dv}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/30 pt-4 space-y-2 mt-4 text-center" style={{ fontSize: '0.875em' }}>
                    <p style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1.2em' : '1em' }}>ހަވާ ޑެއިލީ | Hawa Daily</p>
                    <p style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1em' : '0.75em' }}>ރަހަގެ ސިއްރުތަށް ބަލާލެއްވުމަށް ޕޭޖަށް ވަންނަވާ</p>
                    <p style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1em' : '0.75em' }}>www.hawadaily.com/recipes</p>
                    <div className="flex justify-center gap-4 items-center" style={{ color: textColor, fontSize: selectedPlatform === 'tiktok' ? '1em' : '0.75em' }}>
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
              )}
            </div>
          </motion.div>
        )}

        {!selectedRecipe && (
          <div className="text-center py-12 text-gray-400">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select a recipe above to generate a Facebook post</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
