import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Download, X, Home as HomeIcon, FolderOpen, ChefHat, BookOpen, User } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Videos from './pages/Videos';
import Quran from './pages/Quran';
import Profile from './pages/Profile';
import ArticlePage from './pages/ArticlePage';
import Recipes from './pages/Recipes';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import QuranFacebookPost from './pages/QuranFacebookPost';
import RecipeFacebookPost from './pages/RecipeFacebookPost';
import RecipeDetail from './pages/RecipeDetail';
import AdminDashboard from './pages/AdminDashboard';
import DesktopNav from './components/DesktopNav';
import MobileNav from './components/MobileNav';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import NewsTicker from './components/NewsTicker';
import QuranVerseSlider from './components/QuranVerseSlider';

function App() {
  const [language, setLanguage] = useState<'en' | 'dv'>('dv');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const location = useLocation();

  // Set text direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'dv' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  // Track visitor - only once per session
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if this session has already been tracked
        const sessionTracked = sessionStorage.getItem('sessionTracked');
        if (sessionTracked) return;

        const visitorId = localStorage.getItem('visitorId');
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisitDate');

        const isNewVisitor = !visitorId || lastVisit !== today;

        // Generate device fingerprint
        const userAgent = navigator.userAgent;
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const deviceFingerprint = btoa(`${userAgent}|${screenRes}|${navigator.language}`).substring(0, 32);

        // Get previous device ID
        const previousDeviceId = localStorage.getItem('deviceId');
        const isSameDevice = previousDeviceId === deviceFingerprint;

        // Detect device type
        console.log('User Agent:', userAgent);

        let deviceType = 'desktop';
        if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
          deviceType = 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
          deviceType = 'tablet';
        }

        // Detect browser
        let browser = 'other';
        const uaLower = userAgent.toLowerCase();
        if (uaLower.includes('chrome') && !uaLower.includes('edg')) browser = 'chrome';
        else if (uaLower.includes('firefox')) browser = 'firefox';
        else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'safari';
        else if (uaLower.includes('edg')) browser = 'edge';
        else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'opera';

        // Detect OS
        let os = 'other';
        if (uaLower.includes('windows nt')) os = 'windows';
        else if (uaLower.includes('mac os x')) os = 'macos';
        else if (uaLower.includes('linux')) os = 'linux';
        else if (uaLower.includes('android')) os = 'android';
        else if (uaLower.includes('ios') || uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'ios';

        console.log('Detected:', { deviceType, browser, os, deviceFingerprint, isSameDevice });

        const visitorData = {
          path: location.pathname,
          userAgent,
          language: navigator.language,
          isNewVisitor,
          deviceType,
          browser,
          os,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          referrer: document.referrer || 'direct',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          visitTime: new Date().toLocaleTimeString(),
          deviceFingerprint,
          isSameDevice,
          timestamp: serverTimestamp(),
        };

        await addDoc(collection(db, 'visitors'), visitorData);

        // Mark this session as tracked
        sessionStorage.setItem('sessionTracked', 'true');

        // Set visitor ID, device ID, and last visit date
        if (!visitorId) {
          localStorage.setItem('visitorId', Date.now().toString());
        }
        localStorage.setItem('deviceId', deviceFingerprint);
        localStorage.setItem('lastVisitDate', today);
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, []);

  return (
    <div className="min-h-screen bg-[#caf0f8] text-slate-800">
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6" />
              <div>
                <p className="font-bold text-sm">
                  {language === 'en' ? 'Install Hawa Daily' : 'ހަވާ ޑެއިލީ އިންސްޓޯލް ކުރޭ'}
                </p>
                <p className="text-xs opacity-90">
                  {language === 'en' ? 'Add to home screen for better experience' : 'ބޭނުން ހެޔް އިތުރު ހެޔް ތައްޔާރުކުރުމަށް'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                {language === 'en' ? 'Install' : 'އިންސްޓޯލް'}
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      <AdBanner />
      {!location.pathname.includes('/facebook-post') && <NewsTicker />}
      {!location.pathname.includes('/facebook-post') && <QuranVerseSlider />}
      <DesktopNav language={language} setLanguage={setLanguage} />
      <MobileNav language={language} setLanguage={setLanguage} />
      <BottomNav
        links={[
          { label: language === 'en' ? 'Home' : 'މައި ޞަފްޙާ', path: '/', icon: HomeIcon },
          { label: language === 'en' ? 'Categories' : 'ބައިތައް', path: '/categories', icon: FolderOpen },
          { label: language === 'en' ? 'Recipes' : 'ރަހަގެ ސިއްރު', path: '/recipes', icon: ChefHat },
          { label: language === 'en' ? 'Quran' : 'الْقُرْآنا ترجمة', path: '/quran', icon: BookOpen },
          { label: language === 'en' ? 'Profile' : 'ޕްރޮފައިލް', path: '/profile', icon: User },
        ]}
        activePath={location.pathname}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto max-w-[1600px] px-4 pb-24 pt-0 lg:px-6 lg:mt-0"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/quran" element={<Quran />} />
            <Route path="/quran/facebook-post" element={<QuranFacebookPost />} />
            <Route path="/recipes/facebook-post" element={<RecipeFacebookPost />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
