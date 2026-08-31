import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface PromoBannerProps {
  location?: 'home' | 'article' | 'category';
  position?: 'top' | 'middle' | 'bottom';
}

interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  location: 'home' | 'article' | 'category';
  position: 'top' | 'middle' | 'bottom';
  size: 'mobile' | 'desktop' | 'both';
}

export default function PromoBanner({ location = 'home', position = 'top' }: PromoBannerProps) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const bannersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerData));
        
        // Filter by location, position, and size
        const filteredBanners = bannersData.filter(
          (banner) => banner.location === location &&
          banner.position === position &&
          (banner.size === 'both' || 
           (isMobile && banner.size === 'mobile') || 
           (!isMobile && banner.size === 'desktop'))
        );
        
        setBanners(filteredBanners);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, [location, position, isMobile]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Filter banners to only show those with successfully loaded images
  const validBanners = banners.filter(banner => loadedImages.has(banner.image));
  
  if (validBanners.length === 0) return null;

  const currentBanner = validBanners[currentIndex];

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  const handleImageError = (imageUrl: string) => {
    console.error(`Failed to load banner image: ${imageUrl}`);
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  };

  return (
    <div className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-[#0077b6] to-[#00b4d8]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <picture>
            <source media="(min-width: 768px)" srcSet={currentBanner.image} />
            <img
              src={currentBanner.image}
              alt={currentBanner.title}
              className="w-full h-full object-contain"
              style={{ objectPosition: 'center' }}
              onLoad={() => handleImageLoad(currentBanner.image)}
              onError={() => handleImageError(currentBanner.image)}
            />
          </picture>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {validBanners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + validBanners.length) % validBanners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % validBanners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
