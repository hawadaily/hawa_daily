import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type MobileNavProps = {
  language: 'en' | 'dv';
  setLanguage: (lang: 'en' | 'dv') => void;
};

const categories = [
  { id: 'local', title: 'ލޯކަލް', color: 'bg-[#0077b6]' },
  { id: 'politics', title: 'ސިޔާސީ', color: 'bg-[#00b4d8]' },
  { id: 'sports', title: 'ކުޅިވަރު', color: 'bg-[#90e0ef]' },
  { id: 'islamic', title: 'އިސްލާމީ', color: 'bg-[#0077b6]' },
  { id: 'business', title: 'ވިޔަފާރި', color: 'bg-[#00b4d8]' },
  { id: 'technology', title: 'ޓެކްނޮލޮޖީ', color: 'bg-[#90e0ef]' },
  { id: 'world', title: 'ދުނިޔެ', color: 'bg-[#0077b6]' },
  { id: 'entertainment', title: 'މަޖާ', color: 'bg-[#00b4d8]' },
  { id: 'health', title: 'ސިއްޙަތު', color: 'bg-[#90e0ef]' },
  { id: 'education', title: 'ތަޢުލީމް', color: 'bg-[#0077b6]' },
];

export default function MobileNav({ language, setLanguage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="lg:hidden sticky top-0 z-50 border-b border-[#90e0ef] bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-[#0077b6]">
            {language === 'en' ? 'Hawa Daily' : 'ހަވާ ޑެއިލީ'}
          </span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#0077b6] focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#90e0ef] bg-[#caf0f8]"
          >
            <div className="space-y-2 px-3 py-4">
              <div className="mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#0077b6]">ބައިތައް</p>
                    <h2 className="mt-1 text-base sm:text-lg font-bold text-[#0077b6]">ހުރިހާ ބައިތައް</h2>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      to={`/categories/${category.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`cursor-pointer rounded-lg border border-[#90e0ef] px-2 py-2 ${category.color} bg-opacity-20 transition hover:border-[#00b4d8]`}
                    >
                      <p className="text-[8px] uppercase tracking-[0.2em] text-[#0077b6]">{category.id}</p>
                      <h3 className="mt-0.5 text-xs font-semibold text-[#0077b6]">{category.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#0077b6]">ވަޒީފާ</p>
                    <h2 className="mt-1 text-base sm:text-lg font-bold text-[#0077b6]">ވަޒީފާ ތައް</h2>
                  </div>
                </div>
                <Link 
                  to="/jobs"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 block cursor-pointer rounded-lg border border-[#90e0ef] bg-[#00b4d8]/20 px-3 py-3 transition hover:border-[#00b4d8] hover:bg-[#00b4d8]/30"
                >
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#0077b6]">jobs</p>
                  <h3 className="mt-0.5 text-xs font-semibold text-[#0077b6]">މޯލްޑިވްސް ވަޒީފާ ތައް</h3>
                </Link>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-[#90e0ef] bg-[#caf0f8]/50 px-3 py-2">
                <span className="text-xs text-[#0077b6]">
                  {language === 'en' ? 'Language' : 'ބަސް'}
                </span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
                  className="text-xs font-semibold text-[#00b4d8] transition hover:text-[#0077b6]"
                >
                  {language === 'en' ? '🇲🇻' : '🇬🇧'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
