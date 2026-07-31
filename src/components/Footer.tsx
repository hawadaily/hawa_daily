import { Link } from 'react-router-dom';
import { categories } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300">
      <div className="mx-auto max-w-[1600px] px-4 py-16 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5">
                <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="h-full w-full rounded-2xl object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">ހަވާ ޑެއިލީ</h3>
                <p className="text-sm text-slate-400">ދިވެހި ބަހުން ލޯކަލް ޚަބަރު</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              މޯލްޑިވްސްގެ ލޯކަލް ޚަބަރު، ވީޑިއޯ އަދި ފަހު އަޕްޑޭޓްތައް
            </p>
          </div>

          {/* Categories - Hidden on mobile */}
          <div className="hidden space-y-6 lg:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">ބައިތައް</h4>
            <div className="space-y-3 text-sm">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/categories/${category.id}`} className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                  {category.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links - Hidden on mobile */}
          <div className="hidden space-y-6 lg:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">ކުރިއަށް ލިންކްތައް</h4>
            <div className="space-y-3 text-sm">
              <Link to="/" className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                މައި ޞަފްޙާ
              </Link>
              <Link to="/categories" className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                ބައިތައް
              </Link>
              <Link to="/videos" className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                ވީޑިއޯތައް
              </Link>
              <Link to="/notifications" className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                ނޮޓިފިކޭޝަންތައް
              </Link>
              <Link to="/profile" className="block text-slate-400 transition hover:text-white hover:translate-x-1">
                ޕްރޮފައިލް
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-400">© 2026 ހަވާ ނޫސް. ހުރިހާ ހައްގުތައް ހިމާޔަތްކޮށްފައި.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
