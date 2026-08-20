import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ChefHat, Image as ImageIcon } from 'lucide-react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

interface Recipe {
  id: string;
  title: string;
  category: string;
  image: string;
  ingredients: string[];
  instructions: string[];
}

export default function RecipeFacebookPost() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState<number>(100);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const db = getFirestore();
        const recipesCollection = collection(db, 'recipes');
        const querySnapshot = await getDocs(recipesCollection);
        const recipeList: Recipe[] = [];
        querySnapshot.forEach((doc) => {
          recipeList.push(doc.data() as Recipe);
        });
        setRecipes(recipeList);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const downloadCard = async () => {
    const card = cardRef.current;
    if (!card) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: '#0f172a',
      });
      
      const link = document.createElement('a');
      link.download = `recipe-${selectedRecipe?.id || 'post'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">ރަހަ ފޭސްބުކް ޕޯސްޓް - Recipe Facebook Post</h1>
          <p className="text-center text-gray-400">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ރަހަ ފޭސްބުކް ޕޯސްޓް</h1>
          <p className="text-gray-400">Recipe Facebook Post Generator</p>
        </motion.div>

        {/* Recipe Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <label className="block text-sm font-semibold mb-3">Select Recipe</label>
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
                {recipe.title}
              </option>
            ))}
          </select>
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

        {/* Preview Card */}
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div
              ref={cardRef}
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
              ) : selectedRecipe.image ? (
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
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
                {/* Category Header */}
                <div className="border-b border-white/30 pb-4">
                  <p className="text-lg font-bold" style={{ color: textColor }}>{selectedRecipe.category}</p>
                </div>

                {/* Recipe Title */}
                <div className="text-2xl md:text-3xl font-bold leading-relaxed" style={{ color: textColor }}>
                  {selectedRecipe.title}
                </div>

                {/* Ingredients Preview */}
                <div className="text-sm md:text-base leading-relaxed" style={{ color: textColor }}>
                  {selectedRecipe.ingredients.slice(0, 3).join(', ')}
                  {selectedRecipe.ingredients.length > 3 && '...'}
                </div>

                {/* Footer */}
                <div className="border-t border-white/30 pt-4 space-y-2">
                  <p className="text-sm" style={{ color: textColor }}>ހަވާ ޑެއިލީ | Hawa Daily</p>
                  <p className="text-xs" style={{ color: textColor }}>ރަހަގެ ސިއްރު ހުންނަވާނީ މިފަހުން</p>
                  <p className="text-xs" style={{ color: textColor }}>www.hawadaily.com/recipes</p>
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
              onClick={downloadCard}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 px-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Download className="w-6 h-6" />
              Download Recipe Post
            </button>
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
  );
}
