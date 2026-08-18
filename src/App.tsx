import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Videos from './pages/Videos';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ArticlePage from './pages/ArticlePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ImageGenerator from './pages/ImageGenerator';
import Jobs from './pages/Jobs';
import Weather from './pages/Weather';
import Recipes from './pages/Recipes';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminRoute from './components/AdminRoute';
import DesktopNav from './components/DesktopNav';
import MobileNav from './components/MobileNav';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import NewsTicker from './components/NewsTicker';
import { Home as HomeIcon, FolderOpen, ChefHat, Briefcase, Cloud, Video, User } from 'lucide-react';

function App() {
  const [language, setLanguage] = useState<'en' | 'dv'>('dv');

  // Redirect app store users to hawadaily.com
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check if user is coming from App Store or Google Play in-app browser
    if (/FBAN|FBAV|Twitter|Instagram|WhatsApp|Line|WeChat|MicroMessenger/i.test(userAgent) ||
        /GSA|Android.*Version\/[0-9]\.[0-9]/i.test(userAgent) ||
        /iPhone|iPad|iPod/i.test(userAgent) && /Safari/i.test(userAgent) === false) {
      // Check if already on hawadaily.com to prevent redirect loop
      if (window.location.hostname !== 'www.hawadaily.com' && window.location.hostname !== 'hawadaily.com') {
        window.location.href = 'https://www.hawadaily.com/';
      }
    }
  }, []);
  const location = useLocation();

  // Set text direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'dv' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

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
      <AdBanner />
      <NewsTicker />
      <DesktopNav language={language} setLanguage={setLanguage} />
      <MobileNav language={language} setLanguage={setLanguage} />
      <BottomNav
        links={[
          { label: language === 'en' ? 'Home' : 'މައި ޞަފްޙާ', path: '/', icon: HomeIcon },
          { label: language === 'en' ? 'Categories' : 'ބައިތައް', path: '/categories', icon: FolderOpen },
          { label: language === 'en' ? 'Recipes' : 'ރަހަގެ ސިއްރު', path: '/recipes', icon: ChefHat },
          { label: language === 'en' ? 'Jobs' : 'ވަޒީފާ', path: '/jobs', icon: Briefcase },
          { label: language === 'en' ? 'Weather' : 'މޫސުން', path: '/weather', icon: Cloud },
          { label: language === 'en' ? 'Videos' : 'ވީޑިއޯތައް', path: '/videos', icon: Video },
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
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/image-generator" element={<AdminRoute><ImageGenerator /></AdminRoute>} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;
