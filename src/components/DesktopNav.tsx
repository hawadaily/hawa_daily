import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type DesktopNavProps = {
  language: 'en' | 'dv';
  setLanguage: (language: 'en' | 'dv') => void;
};

export default function DesktopNav({ language, setLanguage }: DesktopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden lg:block bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between gap-8 px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="relative h-14 w-14 object-contain rounded-2xl bg-white p-2 shadow-lg" />
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-bold text-[#0077b6] tracking-tight">Hawa Daily</p>
              <p className="text-xs text-[#00b4d8] font-medium">ހަވާ ޑެއިލީ</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1">
            <ul className="flex items-center justify-center gap-1">
              {[
                { to: '/', label: 'މައި ޞަފްޙާ' },
                { to: '/recipes', label: 'ރަހަގެ ސިއްރު' },
                { to: '/stories', label: 'ވާހަކަ' },
                { to: '/real-stories', label: 'ހަޤީޤީ ވާހަކަ' },
                { to: '/golden-time', label: 'ރަން ޒަމާން' },
                { to: '/doctors-duty', label: 'ޑޮކްޓަރުންގެ ޑިއުޓީ' },
                { to: '/quran', label: 'الْقُرْآنا ترجمة' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="relative px-5 py-2.5 text-sm font-semibold text-[#0077b6] transition-all duration-300 hover:text-[#00b4d8] rounded-xl hover:bg-[#caf0f8]/50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Toggle */}
          <motion.button
            onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] text-xl transition-all duration-300 hover:from-[#90e0ef] hover:to-[#00b4d8] hover:scale-110 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle language"
            title="Toggle language"
          >
            <span className="relative">{language === 'en' ? '🇬🇧' : '🇲🇻'}</span>
          </motion.button>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-50" />
    </header>
  );
}
