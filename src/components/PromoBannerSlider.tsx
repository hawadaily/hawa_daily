import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoBanner {
  id: string;
  image: string;
  alt: string;
  link?: string;
}

const promoBanners: PromoBanner[] = [
  {
    id: '1',
    image: 'https://res.cloudinary.com/g5gx7fe7/image/upload/v1783509577/banners/a56wq5ae0zvyesnnsqcc.png',
    alt: 'Promotional Banner 1',
    link: '/'
  },
  {
    id: '2',
    image: 'https://res.cloudinary.com/g5gx7fe7/image/upload/v1783509577/banners/a56wq5ae0zvyesnnsqcc.png',
    alt: 'Promotional Banner 2',
    link: '/'
  }
];

export default function PromoBannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const BannerWrapper = ({ children }: { children: React.ReactNode }) => {
    const currentBanner = promoBanners[currentIndex];
    if (currentBanner.link) {
      return <Link to={currentBanner.link}>{children}</Link>;
    }
    return <>{children}</>;
  };

  return (
    <BannerWrapper>
      <div 
        className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-[#0077b6] to-[#00b4d8]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full"
          >
            <picture>
              <source 
                media="(min-width: 768px)" 
                srcSet={promoBanners[currentIndex].image}
              />
              <img 
                src={promoBanners[currentIndex].image}
                alt={promoBanners[currentIndex].alt}
                className="w-full h-full object-contain"
                style={{ objectPosition: 'center center' }}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {promoBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setCurrentIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          aria-label="Previous slide"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setCurrentIndex((prev) => (prev + 1) % promoBanners.length);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          aria-label="Next slide"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </BannerWrapper>
  );
}
