import { motion } from 'framer-motion';
import { Recipe } from '../data/recipes';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  language: 'dv' | 'en';
}

export default function RecipeCard({ recipe, onClick, language }: RecipeCardProps) {
  const title = language === 'dv' ? recipe.titleDv : recipe.titleEn;
  const instructions = language === 'dv' ? recipe.instructions.dv : recipe.instructions.en;
  const ingredients = language === 'dv' ? recipe.ingredients.dv : recipe.ingredients.en;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border-2 border-[#0077b6] bg-white shadow-xl cursor-pointer"
      onClick={onClick}
      dir="rtl"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00b4d8] to-[#0077b6]" />

      {/* Recipe Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Logo */}
        <div className="absolute top-3 left-3">
          <img
            src="/logo.png"
            alt="Hawa Daily"
            className="h-10 w-auto"
          />
        </div>
      </div>

      <div className="relative p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-xl font-extrabold text-[#0077b6] transition group-hover:text-[#00b4d8] line-clamp-2 leading-tight">
              {title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-2 py-1 text-xs font-bold text-[#0077b6]">
                {recipe.category}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-2 py-1 text-xs font-bold text-[#00b4d8]">
                {recipe.prepTime}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-2 py-1 text-xs font-bold text-[#0077b6]">
                {recipe.cookTime}
              </span>
            </div>
          </div>

          {/* Ingredients Preview */}
          <div>
            <h4 className="text-sm font-bold text-[#005f73] mb-2">
              {language === 'dv' ? 'ތަކެތި:' : 'Ingredients:'}
            </h4>
            <ul className="text-sm text-[#005f73] space-y-1">
              {ingredients.slice(0, 3).map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#0077b6]">•</span>
                  <span className="line-clamp-1">{ingredient}</span>
                </li>
              ))}
              {ingredients.length > 3 && (
                <li className="text-xs text-[#0077b6] font-bold">
                  +{ingredients.length - 3} {language === 'dv' ? 'އިތުރު' : 'more'}
                </li>
              )}
            </ul>
          </div>

          {/* Instructions Preview */}
          <div>
            <h4 className="text-sm font-bold text-[#005f73] mb-2">
              {language === 'dv' ? 'ހެދުމުގެ ގޮތް:' : 'Instructions:'}
            </h4>
            <p className="text-sm text-[#005f73] line-clamp-2">
              {instructions}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#0077b6]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0077b6]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>{language === 'dv' ? 'އިތުރު ބައި ބައްލަވާ' : 'View details'}</span>
            </div>
            <div className="text-xs font-bold text-[#0077b6]">
              {recipe.servings}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
