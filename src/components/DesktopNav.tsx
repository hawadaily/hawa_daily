import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type DesktopNavProps = {
  language: 'en' | 'dv';
  setLanguage: (language: 'en' | 'dv') => void;
};

export default function DesktopNav({ language, setLanguage }: DesktopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-[#90e0ef] bg-white/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-6">
        {/* Globe icon on the left */}
        <div className="flex items-center gap-4">
          <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="h-12 w-12 object-contain" />
        </div>
        {/* Center navigation links */}
        <nav className="flex-1 flex justify-start">
          <ul className="flex flex-wrap items-center justify-start gap-3 rounded-full bg-[#caf0f8]/90 px-4 py-2 text-lg font-semibold text-[#0077b6] shadow-soft ring-1 ring-[#90e0ef]/80 backdrop-blur-sm">
            <li><Link to="/" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">މައި ޞަފްޙާ</Link></li>
            <li><Link to="/categories" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">ބައިތައް</Link></li>
            <li><Link to="/jobs" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">ވަޒީފާ</Link></li>
            <li><Link to="/weather" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">މޫސުން</Link></li>
            <li><Link to="/videos" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">ވީޑިއޯތައް</Link></li>
            <li><Link to="/notifications" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">ނޮޓިފިކޭޝަންތައް</Link></li>
            <li><Link to="/profile" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[#90e0ef] hover:text-[#0077b6]">ޕްރޮފައިލް</Link></li>
          </ul>
        </nav>
        {/* Logo on the right */}
        <Link to="/" className="group inline-flex items-center gap-3 rounded-2xl border border-[#90e0ef] bg-[#caf0f8] p-4 shadow-soft text-xl lg:text-2xl font-black uppercase tracking-[0.2em] text-[#0077b6] transition hover:border-[#00b4d8]">
          <img src="/HAWA LOGO.jpg" alt="Hawa Daily logo" className="h-12 w-12 rounded-3xl object-cover" />
          <div className="hidden xl:block">
            <p className="text-xs text-[#00b4d8]">Hawa Daily</p>
            <p className="text-sm text-[#0077b6]">ހަވާ ޑެއިލީ</p>
          </div>
        </Link>
        {/* Language toggle */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#90e0ef] bg-[#caf0f8] text-[#0077b6] transition hover:border-[#00b4d8] hover:text-[#0077b6]"
            aria-label="Toggle language"
            title="Toggle language"
          >
            {language === 'en' ? '🇬🇧' : '🇲🇻'}
          </button>
        </div>
      </div>
    </header>
  );
}
