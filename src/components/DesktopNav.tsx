import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type DesktopNavProps = {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  language: 'en' | 'dv';
  setLanguage: (language: 'en' | 'dv') => void;
};

export default function DesktopNav({ theme, setTheme, language, setLanguage }: DesktopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-200/60 bg-white/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-6">
        {/* Globe icon on the left */}
        <div className="flex items-center gap-4">
          <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="h-12 w-12 object-contain" />
        </div>
        {/* Center navigation links */}
        <nav className="flex-1 flex justify-start">
          <ul className="flex flex-wrap items-center justify-start gap-3 rounded-full bg-white/90 px-4 py-2 text-lg font-semibold text-slate-800 shadow-soft ring-1 ring-slate-200/80 backdrop-blur-sm">
            <li><Link to="/" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">މައި ޞަފްޙާ</Link></li>
            <li><Link to="/categories" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">ބައިތައް</Link></li>
            <li><Link to="/jobs" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">ވަޒީފާ</Link></li>
            <li><Link to="/videos" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">ވީޑިއޯތައް</Link></li>
            <li><Link to="/notifications" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">ނޮޓިފިކޭޝަންތައް</Link></li>
            <li><Link to="/profile" className="rounded-full px-4 py-2 transition duration-200 hover:bg-slate-100 hover:text-sky-600">ޕްރޮފައިލް</Link></li>
          </ul>
        </nav>
        {/* Logo on the right */}
        <Link to="/" className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft text-xl lg:text-2xl font-black uppercase tracking-[0.2em] text-slate-900 transition hover:border-slate-300">
          <img src="/HAWA LOGO.jpg" alt="Hawa Daily logo" className="h-12 w-12 rounded-3xl object-cover" />
          <div className="hidden xl:block">
            <p className="text-xs text-slate-400">Hawa Daily</p>
            <p className="text-sm text-slate-700">ހަވާ ޑެއިލީ</p>
          </div>
        </Link>
        {/* Language and Theme toggles */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            aria-label="Toggle language"
            title="Toggle language"
          >
            {language === 'en' ? '🇬🇧' : '🇲🇻'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
