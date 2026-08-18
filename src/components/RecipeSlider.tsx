import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '../data/recipes';

interface RecipeSliderProps {
  recipes: Recipe[];
  onViewDetails?: (recipe: Recipe) => void;
  language?: 'dv' | 'en';
}

export default function RecipeSlider({ recipes, onViewDetails, language = 'dv' }: RecipeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);

  // Update displayed recipes when recipes prop changes
  useEffect(() => {
    if (recipes.length > 0) {
      setDisplayedRecipes(recipes.slice(0, 5));
      setCurrentIndex(0);
    }
  }, [recipes]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || displayedRecipes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayedRecipes.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [displayedRecipes.length, isPaused]);

  if (displayedRecipes.length === 0) return null;

  const currentRecipe = displayedRecipes[currentIndex];
  const title = language === 'dv' ? currentRecipe.titleDv : currentRecipe.titleEn;

  return (
    <div 
      className="relative w-full h-40 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-xl overflow-hidden shadow-lg text-left"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="rtl"
    >
      {/* Background pattern */}
      <div className="absolute right-0 top-0 w-40 h-40 opacity-10">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="currentColor" className="text-white"/>
          <path d="M100 20 L120 80 L180 80 L130 120 L150 180 L100 140 L50 180 L70 120 L20 80 L80 80 Z" fill="currentColor" className="text-white"/>
        </svg>
      </div>

      {/* Heading */}
      <div className="absolute top-2 left-3 text-white text-[10px] md:text-xs font-bold">
        ރަހަގެ ސިއްރު
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center px-4 md:px-8 cursor-pointer"
          onClick={() => onViewDetails?.(currentRecipe)}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            {/* Recipe Image */}
            <div className="flex-shrink-0">
              <img 
                src={currentRecipe.image} 
                alt={title}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
            </div>
            
            <div className="text-white text-center">
              <h3 className="text-xs md:text-sm font-bold line-clamp-2">
                {title}
              </h3>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {displayedRecipes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={(event) => {
          event.stopPropagation();
          setCurrentIndex((prev) => (prev - 1 + displayedRecipes.length) % displayedRecipes.length);
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setCurrentIndex((prev) => (prev + 1) % displayedRecipes.length);
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}
