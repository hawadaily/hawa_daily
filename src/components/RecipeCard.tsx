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

  const handleShare = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = window.location.href;
    const shareText = `${title}\n\n${language === 'dv' ? 'ތަކެތި:' : 'Ingredients:'}\n${ingredients.slice(0, 3).join('\n')}\n\n${language === 'dv' ? 'ހެދުމުގެ ގޮތް:' : 'Instructions:'}\n${instructions.substring(0, 200)}...`;
    
    let shareUrlFinal = '';
    
    switch (platform) {
      case 'facebook':
        shareUrlFinal = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrlFinal = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'viber':
        shareUrlFinal = `viber://forward?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll copy to clipboard
        navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
        alert(language === 'dv' ? 'ރެސިޕީ ކޮޕީ ކުރެވިއްޖެ! އިންސްޓަގްރާމްގައި ޕޭސްޓް ކުރޭ' : 'Recipe copied! Paste it in Instagram');
        return;
      default:
        return;
    }
    
    window.open(shareUrlFinal, '_blank', 'width=600,height=400');
  };

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
            src="/HAWA LOGO.jpg"
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
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-[#0077b6]">
                {recipe.servings}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => handleShare('facebook', e)}
                  className="p-1.5 rounded-full bg-[#1877f2] text-white hover:bg-[#1877f2]/80 transition"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => handleShare('whatsapp', e)}
                  className="p-1.5 rounded-full bg-[#25d366] text-white hover:bg-[#25d366]/80 transition"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => handleShare('viber', e)}
                  className="p-1.5 rounded-full bg-[#7360f2] text-white hover:bg-[#7360f2]/80 transition"
                  title="Viber"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.398.002C9.473.028 5.331.344 3.024 2.467 1.303 4.173.693 6.729.626 9.965c-.067 3.236-.153 9.288 5.683 10.951h.005l-.004 2.488s-.039.998.622 1.202c.795.25 1.248-.511 2.008-1.329.413-.445.981-1.097 1.412-1.594 3.895.338 6.864-.417 7.202-.517.795-.258 5.279-.834 6.013-6.842.756-6.229-.367-10.182-2.4-11.964-.223-.197-1.649-1.348-5.341-1.418-.396-.008-.831-.012-1.284-.01zm.138 1.898c.393-.001.777.002 1.126.009 3.168.06 4.686.96 4.867 1.121 1.705 1.483 2.586 4.9 1.932 10.267-.529 4.353-3.733 4.877-4.401 5.098-.276.081-2.847.736-6.233.472 0 0-2.473 2.993-3.251 3.772-.123.123-.265.171-.36.154-.119-.022-.151-.154-.149-.356l.018-4.088c-4.919-1.361-4.632-6.336-4.578-9.015.054-2.68.546-4.848 1.98-6.259 1.925-1.771 5.598-2.039 7.25-2.045zm.072 2.927c-.063 0-.114.051-.114.114v4.288c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114V4.941c0-.063-.051-.114-.114-.114h-1.714zm4.286 0c-.063 0-.114.051-.114.114v2.571c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114V4.941c0-.063-.051-.114-.114-.114h-1.714zm-6.857 1.143c-.063 0-.114.051-.114.114v1.428c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114v-1.428c0-.063-.051-.114-.114-.114H9.837zm9.143 0c-.063 0-.114.051-.114.114v1.428c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114v-1.428c0-.063-.051-.114-.114-.114h-1.714z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => handleShare('instagram', e)}
                  className="p-1.5 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-80 transition"
                  title="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
