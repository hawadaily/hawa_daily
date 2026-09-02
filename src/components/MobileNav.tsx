import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type MobileNavProps = {
  language: 'en' | 'dv';
  setLanguage: (lang: 'en' | 'dv') => void;
};

const categories = [
  { id: 'local', title: 'ލޯކަލް', color: 'from-[#0077b6] to-[#00b4d8]' },
  { id: 'politics', title: 'ސިޔާސީ', color: 'from-[#00b4d8] to-[#90e0ef]' },
  { id: 'sports', title: 'ކުޅިވަރު', color: 'from-[#90e0ef] to-[#caf0f8]' },
  { id: 'islamic', title: 'އިސްލާމީ', color: 'from-[#0077b6] to-[#00b4d8]' },
  { id: 'business', title: 'ވިޔަފާރި', color: 'from-[#00b4d8] to-[#90e0ef]' },
  { id: 'technology', title: 'ޓެކްނޮލޮޖީ', color: 'from-[#90e0ef] to-[#caf0f8]' },
  { id: 'world', title: 'ދުނިޔެ', color: 'from-[#0077b6] to-[#00b4d8]' },
  { id: 'entertainment', title: 'މަޖާ', color: 'from-[#00b4d8] to-[#90e0ef]' },
  { id: 'health', title: 'ސިއްޙަތު', color: 'from-[#90e0ef] to-[#caf0f8]' },
  { id: 'education', title: 'ތަޢުލީމް', color: 'from-[#0077b6] to-[#00b4d8]' },
];

export default function MobileNav({ language, setLanguage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-1">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="relative h-10 w-10 object-contain rounded-xl bg-white p-1.5 shadow-md" />
          </div>
          <span className="text-xl font-bold text-[#0077b6] text-center">
            {language === 'en' ? 'Hawa Daily' : 'ހަވާ ޑެއިލީ'}
          </span>
        </Link>
        
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] text-[#0077b6] transition-all duration-300 hover:from-[#90e0ef] hover:to-[#00b4d8] hover:scale-105 shadow-md"
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="h-5 w-5"
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
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#90e0ef]/30 bg-gradient-to-b from-[#caf0f8]/50 to-white"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Main Navigation */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#0077b6] font-semibold mb-3">މެއިން</p>
                <div className="space-y-2">
                  {[
                    { to: '/', label: 'މައި ޞަފްޙާ' },
                    { to: '/recipes', label: 'ރަހަގެ ސިއްރު' },
                    { to: '/stories', label: 'ވާހަކަ' },
                    { to: '/golden-time', label: 'ރަން ޒަމާން' },
                    { to: '/quran', label: 'الْقُرْآنا ترجمة' },
                    { to: '/profile', label: 'ޕްރޮފައިލް' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#0077b6] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#caf0f8] hover:to-[#90e0ef] hover:shadow-md"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>


              {/* Language Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-[#90e0ef]/30 bg-gradient-to-r from-[#caf0f8]/50 to-[#90e0ef]/30 px-4 py-3">
                <span className="text-xs font-medium text-[#0077b6]">
                  {language === 'en' ? 'Language' : 'ބަސް'}
                </span>
                <motion.button
                  onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
                  className="text-lg transition-transform hover:scale-110"
                  whileTap={{ scale: 0.9 }}
                >
                  {language === 'en' ? '🇲🇻' : '🇬🇧'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
