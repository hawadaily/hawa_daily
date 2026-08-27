import { Link } from 'react-router-dom';
import { categories } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="border-t border-[#90e0ef] bg-gradient-to-b from-[#caf0f8] to-white text-[#0077b6]">
      <div className="mx-auto max-w-[1600px] px-4 py-16 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6] p-0.5 shadow-lg">
                <img src="/HAWA LOGO.jpg" alt="Hawa Daily" className="h-full w-full rounded-2xl object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0077b6]">ހަވާ ޑެއިލީ</h3>
                <p className="text-sm text-[#00b4d8]">ދިވެހި ބަހުން ލޯކަލް ޚަބަރު</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#0077b6]">
              މޯލްޑިވްސްގެ ލޯކަލް ޚަބަރު، ވީޑިއޯ އަދި ފަހު އަޕްޑޭޓްތައް
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=61591869200851" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#caf0f8] text-[#0077b6] transition hover:bg-[#00b4d8] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/hawadailymv/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#caf0f8] text-[#0077b6] transition hover:bg-[#00b4d8] hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories - Hidden on mobile */}
          <div className="hidden space-y-6 lg:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#0077b6]">ބައިތައް</h4>
            <div className="space-y-3 text-sm">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/categories/${category.id}`} className="flex items-center gap-2 text-[#00b4d8] transition hover:text-[#0077b6] hover:translate-x-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {category.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links - Hidden on mobile */}
          <div className="hidden space-y-6 lg:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#0077b6]">ކުރިއަށް ލިންކްތައް</h4>
            <div className="space-y-3 text-sm">
              <Link to="/" className="flex items-center gap-2 text-[#00b4d8] transition hover:text-[#0077b6] hover:translate-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                މައި ޞަފްޙާ
              </Link>
              <Link to="/categories" className="flex items-center gap-2 text-[#00b4d8] transition hover:text-[#0077b6] hover:translate-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                ބައިތައް
              </Link>
              <Link to="/jobs" className="flex items-center gap-2 text-[#00b4d8] transition hover:text-[#0077b6] hover:translate-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ވަޒީފާ
              </Link>
              <Link to="/videos" className="flex items-center gap-2 text-[#00b4d8] transition hover:text-[#0077b6] hover:translate-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                ވީޑިއޯތައް
              </Link>
            </div>
          </div>

          {/* App Download */}
          <div className="hidden space-y-6 lg:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#0077b6]">އެޕް ޑައުންލޯޑް</h4>
            <div className="space-y-3">
              <a href="#" className="inline-flex items-center gap-3 rounded-xl border border-[#90e0ef] bg-[#caf0f8] px-4 py-3 transition hover:bg-[#90e0ef] hover:border-[#00b4d8]">
                <svg className="h-8 w-8 text-[#0077b6]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-[#00b4d8]">Download on the</p>
                  <p className="text-sm font-bold text-[#0077b6]">App Store</p>
                </div>
              </a>
              <a href="#" className="inline-flex items-center gap-3 rounded-xl border border-[#90e0ef] bg-[#caf0f8] px-4 py-3 transition hover:bg-[#90e0ef] hover:border-[#00b4d8]">
                <svg className="h-8 w-8 text-[#0077b6]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-[#00b4d8]">GET IT ON</p>
                  <p className="text-sm font-bold text-[#0077b6]">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#90e0ef] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[#00b4d8]">© 2026 ހަވާ ނޫސް. ހުރިހާ ހައްގުތައް ހިމާޔަތްކޮށްފައި.</p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-[#00b4d8] transition hover:text-[#0077b6]">Privacy Policy</Link>
              <Link to="/terms" className="text-[#00b4d8] transition hover:text-[#0077b6]">Terms of Service</Link>
              <Link to="/contact" className="text-[#00b4d8] transition hover:text-[#0077b6]">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
