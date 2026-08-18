import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';

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

export default function Recipes() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [language, setLanguage] = useState<'dv' | 'en'>('dv');
  const [filter, setFilter] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'ހެދުނުގެ ނާސްތާ', 'ކުޅިކާ ތަކެތި', 'ފޮނިކާ ތަކެތި', 'ކުދި ކެއުންތަށް'];
  const ingredients = ['all', 'ބޯވަ', 'ބީފް', 'މަސް', 'ކުކުޅު', 'މައިސް', 'ކައްކައުން', 'ފެން', 'ތެޔޮ', 'ހަކުރު', 'ލޮނު', 'ބިސް', 'ލުނބޯ ހުތް', 'މުގުރި އަސޭމިރުސް', 'ރާނބާފަތް', 'ކިރު', 'ޗީޒް'];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesQuery = query(collection(db, 'recipes'), orderBy('id'));
        const querySnapshot = await getDocs(recipesQuery);
        const recipesData = querySnapshot.docs.map(doc => doc.data() as Recipe);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();

    // Track page visit
    const trackPageVisit = async () => {
      try {
        const pageStatsRef = doc(db, 'page-stats', 'recipes');
        const countRef = doc(pageStatsRef, 'visits', 'count');
        await setDoc(countRef, { count: increment(1) }, { merge: true });
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };

    trackPageVisit();
  }, []);

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesCategory = filter === 'all' || recipe.category === filter;
    const matchesSearch = search === '' || 
      recipe.titleDv.toLowerCase().includes(search.toLowerCase()) ||
      recipe.titleEn.toLowerCase().includes(search.toLowerCase());
    const matchesIngredient = selectedIngredient === 'all' || 
      recipe.ingredients.dv.some(ing => ing.toLowerCase().includes(selectedIngredient.toLowerCase())) ||
      recipe.ingredients.en.some(ing => ing.toLowerCase().includes(selectedIngredient.toLowerCase()));
    return matchesCategory && matchesSearch && matchesIngredient;
  });

  const translations = {
    dv: {
      title: 'ރަހަގެ ސިއްރު',
      subtitle: 'މޮޅު ރަހަތައް ހަދާން އެހީގައި',
      all: 'ހުރިހާ',
      'ހެދުނުގެ ނާސްތާ': 'ހެދުނުގެ ނާސްތާ',
      'ކުޅިކާ ތަކެތި': 'ކުޅިކާ ތަކެތި',
      'ފޮނިކާ ތަކެތި': 'ފޮނިކާ ތަކެތި',
      'ކުދި ކެއުންތަށް': 'ކުދި ކެއުންތަށް',
      ingredients: 'ތަކެތި',
      instructions: 'ހެދުމުގެ ގޮތް',
      prepTime: 'ހެދުމުގެ ވަގުތު',
      cookTime: 'ފިއްޓުވަގުތު',
      servings: 'ބައިތައް',
      close: 'ނިއްމާލާ',
      noRecipes: 'ރެސިޕީތައް ނެތް',
      searchPlaceholder: 'ރެސިޕީ ހޯދާ...',
      allIngredients: 'ހުރިހާ ތަކެތި',
      'ބޯވަ': 'ބޯވަ',
      'ބީފް': 'ބީފް',
      'މަސް': 'މަސް',
      'ކުކުޅު': 'ކުކުޅު',
      'މައިސް': 'މައިސް',
      'ކައްކައުން': 'ކައްކައުން',
      'ފެން': 'ފެން',
      'ތެޔޮ': 'ތެޔޮ',
      'ހަކުރު': 'ހަކުރު',
      'ލޮނު': 'ލޮނު',
      'ބިސް': 'ބިސް',
      'ލުނބޯ ހުތް': 'ލުނބޯ ހުތް',
      'މުގުރި އަސޭމިރުސް': 'މުގުރި އަސޭމިރުސް',
      'ރާނބާފަތް': 'ރާނބާފަތް',
      'ކިރު': 'ކިރު',
      'ޗީޒް': 'ޗީޒް'
    },
    en: {
      title: 'Recipe Secrets',
      subtitle: 'Learn to cook delicious meals',
      all: 'All',
      'ހެދުނުގެ ނާސްތާ': 'Breakfast',
      'ކުޅިކާ ތަކެތި': 'Main',
      'ފޮނިކާ ތަކެތި': 'Dessert',
      'ކުދި ކެއުންތަށް': 'Side',
      ingredients: 'Ingredients',
      instructions: 'Instructions',
      prepTime: 'Prep Time',
      cookTime: 'Cook Time',
      servings: 'Servings',
      close: 'Close',
      noRecipes: 'No recipes found',
      searchPlaceholder: 'Search recipes...',
      allIngredients: 'All Ingredients',
      'ބޯވަ': 'Beef',
      'ބީފް': 'Fish',
      'މަސް': 'Egg',
      'ކުކުޅު': 'Onion',
      'މައިސް': 'Rice',
      'ކައްކައުން': 'Coconut',
      'ފެން': 'Water',
      'ތެޔޮ': 'Oil',
      'ހަކުރު': 'Sugar',
      'ލޮނު': 'Salt',
      'ބިސް': 'Biscuit',
      'ލުނބޯ ހުތް': 'Lemon Juice',
      'މުގުރި އަސޭމިރުސް': 'Mustard Seeds',
      'ރާނބާފަތް': 'Pandan Leaf',
      'ކިރު': 'Milk',
      'ޗީޒް': 'Cheese'
    }
  };

  const t = translations[language];

  return (
    <motion.section
      className="pt-24 bg-[#caf0f8] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={language === 'dv' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="sticky top-20 z-40 bg-[#caf0f8]/95 backdrop-blur-sm border-b-2 border-[#0077b6] pb-4 mb-6 shadow-md px-6">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#0077b6] font-bold">
              {language === 'dv' ? 'ރަހަ' : 'Recipes'}
            </p>
            <h2 className="mt-1 text-3xl font-extrabold text-[#0077b6]">{t.title}</h2>
            <p className="mt-1 text-sm text-[#005f73]">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'dv' ? 'en' : 'dv')}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0077b6] bg-[#0077b6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#005f73]"
            >
              {language === 'dv' ? 'EN' : 'ދިވެހި'}
            </button>
          </div>
        </div>

        {/* Search, Ingredient Filter and Category Filter */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-full border-2 border-[#0077b6] bg-white px-4 py-2 text-sm text-[#005f73] focus:border-[#005f73] focus:outline-none"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  filter === category
                    ? 'bg-[#0077b6] text-white'
                    : 'bg-[#0077b6]/10 text-[#0077b6] hover:bg-[#0077b6]/20'
                }`}
              >
                {t[category as keyof typeof t]}
              </button>
            ))}
          </div>

          {/* Ingredient Filter */}
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ingredient => (
              <button
                key={ingredient}
                onClick={() => setSelectedIngredient(ingredient)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  selectedIngredient === ingredient
                    ? 'bg-[#00b4d8] text-white'
                    : 'bg-[#00b4d8]/10 text-[#00b4d8] hover:bg-[#00b4d8]/20'
                }`}
              >
                {ingredient === 'all' ? t.allIngredients : t[ingredient as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-[1600px] mx-auto px-6 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#005f73]">{language === 'dv' ? 'ލޯޑް ކުރަމުން...' : 'Loading...'}</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#005f73]">{t.noRecipes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                language={language}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              dir={language === 'dv' ? 'rtl' : 'ltr'}
            >
              {/* Recipe Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={selectedRecipe.image}
                  alt={language === 'dv' ? selectedRecipe.titleDv : selectedRecipe.titleEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {/* Logo */}
                <div className="absolute top-4 left-4">
                  <img
                    src="/HAWA LOGO.jpg"
                    alt="Hawa Daily"
                    className="h-12 w-auto"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-extrabold text-white">
                    {language === 'dv' ? selectedRecipe.titleDv : selectedRecipe.titleEn}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-3 py-1 text-sm font-bold text-[#0077b6]">
                    {selectedRecipe.category}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-3 py-1 text-sm font-bold text-[#00b4d8]">
                    {t.prepTime}: {selectedRecipe.prepTime}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-3 py-1 text-sm font-bold text-[#0077b6]">
                    {t.cookTime}: {selectedRecipe.cookTime}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-3 py-1 text-sm font-bold text-[#00b4d8]">
                    {t.servings}: {selectedRecipe.servings}
                  </span>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-lg font-bold text-[#0077b6] mb-3">{t.ingredients}</h4>
                  <ul className="space-y-2">
                    {(language === 'dv' ? selectedRecipe.ingredients.dv : selectedRecipe.ingredients.en).map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2 text-[#005f73]">
                        <span className="text-[#0077b6] font-bold mt-1">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-lg font-bold text-[#0077b6] mb-3">{t.instructions}</h4>
                  <p className="text-[#005f73] leading-relaxed whitespace-pre-line">
                    {language === 'dv' ? selectedRecipe.instructions.dv : selectedRecipe.instructions.en}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full rounded-full bg-[#0077b6] px-6 py-3 font-bold text-white transition hover:bg-[#005f73]"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
