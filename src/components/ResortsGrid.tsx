import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Resort {
  name: string;
  logo: string;
  link: string;
}

const resorts: Resort[] = [
  { name: 'Nova Maldives', logo: 'https://blosense.files.wordpress.com/2022/08/nova-logo.png', link: 'https://www.job-maldives.com/p/nova-maldives.html' },
  { name: 'Constance Moofushi', logo: 'https://blosense.files.wordpress.com/2024/01/constance-moofushi.webp', link: 'https://chp.tbe.taleo.net/chp01/ats/careers/searchResults.jsp?org=CONSHOTE&cws=45' },
  { name: 'JW Marriott Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/09/jw-marriott-maldives-kaafu-atoll-island-resort-1.png', link: 'https://www.marriott.com/en-us/hotels/mlejm-jw-marriott-maldives-kaafu-atoll-island-resort/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0' },
  { name: 'The Halcyon Private Isles', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/10/the-halcyon-private-isles-logo-1.png', link: 'https://www.job-maldives.com/p/the-halcyon-private-isles-maldives.html' },
  { name: 'Kuramathi Island Resort', logo: 'https://blosense.wordpress.com/wp-content/uploads/2026/04/niva_kuramathi_logo_digital.webp', link: 'https://www.job-maldives.com/p/kuramathi-island-resort-jobs.html' },
  { name: 'The Westin Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/westin-maldives-logo.webp', link: 'https://www.job-maldives.com/p/the-westin-maldives-miriandhoo.html' },
  { name: 'Patina Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/patina-maldives.webp', link: 'https://www.job-maldives.com/p/patina-maldives.html' },
  { name: 'Angsana Velavaru', logo: 'https://blosense.files.wordpress.com/2024/01/angsana-velavaru-logo.webp', link: 'https://www.job-maldives.com/p/angsana-velavaru-jobs.html' },
  { name: 'InterContinental Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/intercontinental-maldives-logo.webp', link: 'https://www.job-maldives.com/p/intercontinental-maldives-maamunagau.html' },
  { name: 'RIU Hotels Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/riu-logo.webp', link: 'https://www.job-maldives.com/p/riu-hotels-and-resorts-maldives.html' },
  { name: 'Kandima Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/kandima-logo.webp', link: 'https://www.job-maldives.com/p/kandima-maldives.html' },
  { name: 'Alila Kothaifaru Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/alila-kothaifaru-maldives-logo.webp', link: 'https://www.job-maldives.com/2021/07/career-opportunities-at-alila.html' },
  { name: 'Sun Siyam Iru Fushi', logo: 'https://blosense.wordpress.com/wp-content/uploads/2026/07/sunsiyam_resort_logo_irufushi_primary_location_rgb_black.jpg', link: 'https://www.job-maldives.com/p/the-sun-siyam-iru-fushi-maldives.html' },
  { name: 'Kandolhu Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/kandolhu-maldives.webp', link: 'https://www.job-maldives.com/p/kandolhu-island.html' },
  { name: 'Avani Fares Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/avani-maldives.webp', link: 'https://www.job-maldives.com/p/avani-fares-maldives.html' },
  { name: 'The Ritz-Carlton Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/ritz-carlton-maldives.webp', link: 'https://www.job-maldives.com/p/the-ritz-carlton-maldives-fari-islands.html' },
  { name: 'Dhigali Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/dhigali-maldives-logo.webp', link: 'https://www.job-maldives.com/p/dhigali-maldives.html' },
  { name: 'Veligandu Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2026/02/veligandu-logo-03-2.png', link: 'https://www.job-maldives.com/p/veligandu-maldives-resort-island.html' },
  { name: 'Noku Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/12/newlogo.webp', link: 'https://www.job-maldives.com/p/noku-maldives-resort-spa.html' },
  { name: 'Constance Halaveli', logo: 'https://blosense.files.wordpress.com/2024/01/logo.jpg.webp', link: 'https://www.job-maldives.com/p/constance-halaveli-maldives-jobs.html' },
  { name: 'Ifuru Island Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/ifuru-island-maldives-1.webp', link: 'https://www.job-maldives.com/p/ifuru-island-maldives.html' },
  { name: 'Ayada Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/ayada-maldives-logo.webp', link: 'https://www.job-maldives.com/2011/12/ayada-maldives-jobs.html' },
  { name: 'Fairmont Maldives', logo: 'https://blosense.files.wordpress.com/2024/04/sff-new-logo-1.webp', link: 'https://www.job-maldives.com/p/fairmont-maldives-sirru-fen-fushi.html' },
  { name: 'LUX South Ari Atoll', logo: 'https://blosense.files.wordpress.com/2024/01/lsaa_logo_grey.webp', link: 'https://www.job-maldives.com/p/lux-south-ari-atoll.html' },
  { name: 'Huvafen Fushi', logo: 'https://blosense.files.wordpress.com/2024/01/huvafen-fushi-maldives.webp', link: 'https://www.job-maldives.com/p/huvafen-fushi-jobs.html' },
  { name: 'Kudafushi Resort', logo: 'https://blosense.files.wordpress.com/2024/01/kudafushi-resort-spa-logo.webp', link: 'https://www.job-maldives.com/p/kudafushi-resort-spa.html' },
  { name: 'Rah Gili Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/09/rg-logo-raft.webp', link: 'https://www.job-maldives.com/p/rah-gili-maldives.html' },
  { name: 'Emerald Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/emerald-maldives-color-horizontal.webp', link: 'https://www.job-maldives.com/p/emerald-maldives-resort-spa.html' },
  { name: 'Radisson Blu Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/rdb-logo.webp', link: 'https://www.job-maldives.com/p/radisson-blu-resort-maldives.html' },
  { name: 'Dusit Thani Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/09/dusit-logo.webp', link: 'https://www.job-maldives.com/p/dusit-thani-maldives-jobs.html' },
  { name: 'Cora Cora Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/cora-cora-maldives.webp', link: 'https://www.job-maldives.com/p/cora-cora-maldives.html' },
  { name: 'Villa Haven', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/08/villa-haven-logo-1.webp', link: 'https://www.job-maldives.com/p/villa-haven.html' },
  { name: 'Le Meridien Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/le-meridien-maldives-resort-spa.webp', link: 'https://www.job-maldives.com/p/le-meridien-maldives-resort-spa.html' },
  { name: 'Furaveri Island Resort', logo: 'https://blosense.files.wordpress.com/2024/01/furaveri-logo.webp', link: 'https://www.furaveri.com/' },
  { name: 'Milaidhoo Island Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/milaidhoo_logo_final_blue-_1_.webp', link: 'https://www.job-maldives.com/p/milaidhoo-island-maldives_6.html' },
  { name: 'Six Senses Laamu', logo: 'https://blosense.files.wordpress.com/2024/01/six-senses-laamu-_4_.webp', link: 'https://www.job-maldives.com/p/six-senses-laamu-jobs.html' },
  { name: 'Movenpick Kuredhivaru', logo: 'https://blosense.files.wordpress.com/2024/01/kuredhivaru-resort-logo.webp', link: 'https://www.job-maldives.com/p/mvenpick-resort-kuredhivaru-maldives.html' },
  { name: 'Outrigger Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/outrigger-maldives.webp', link: 'https://www.job-maldives.com/p/outrigger-maldives-maafushivaru-resort.html' },
  { name: 'Meeru Island Resort', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/11/meeru-primary-logo-color-01-rgb.webp', link: 'https://www.job-maldives.com/p/meeru-island-resort-spa.html' },
  { name: 'Atmosphere Kanifushi', logo: 'https://blosense.files.wordpress.com/2024/01/akm-official.webp', link: 'https://www.job-maldives.com/p/atmosphere-kanifushi-maldives.html' },
  { name: 'Robinson Club Noonu', logo: 'https://blosense.files.wordpress.com/2024/01/rcn-logo-blue-new.webp', link: 'https://www.job-maldives.com/p/robinson-club-noonu.html' },
  { name: 'The Nautilus Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/nautilus-maldives-logo.webp', link: 'https://www.job-maldives.com/p/the-nautilus-maldives.html' },
  { name: 'Coco Collection', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/11/cc-logo-1.jpg', link: 'https://www.job-maldives.com/p/coco-collection.html' },
  { name: 'Velassaru Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/velassaru-maldives-logo.webp', link: 'https://www.job-maldives.com/p/velassaru-maldives.html' },
  { name: 'Velaa Private Island', logo: 'https://blosense.files.wordpress.com/2024/01/velaa-private-island-logo.webp', link: 'https://www.job-maldives.com/p/about-velaa-velaa-private-island-is.html' },
  { name: 'Amilla Fushi', logo: 'https://blosense.files.wordpress.com/2024/01/amilla-logo.webp', link: 'https://www.job-maldives.com/p/amilla-fushi.html' },
  { name: 'Centara Ras Fushi', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/09/crf-logo-color.png', link: 'https://www.job-maldives.com/p/centara-ras-fushi-resort-spa-maldives.html' },
  { name: 'Fiyavalhu Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/fiyavalhu-maldives.webp', link: 'https://www.job-maldives.com/p/fiyavalhu-maldives.html' },
  { name: 'Coco Bodu Hithi', logo: 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp', link: 'https://cocoboduhithi.com/' },
  { name: 'Siyam World Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/09/0-02-03-32021a47c054e75c7ad655c4c8735d6c00f376b52575d476f791140d4c7039ea_11bf108bab6ea3e9.webp', link: 'https://www.job-maldives.com/p/siyam-world-maldives.html' },
  { name: 'Grand Park Kodhipparu', logo: 'https://blosense.files.wordpress.com/2024/01/grand-park-kodhipparu-maldives.webp', link: 'https://www.job-maldives.com/p/grand-park-kodhipparu-maldives.html' },
  { name: 'Club Med Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/clubmed-maldives.webp', link: 'https://www.job-maldives.com/p/club-med-maldives-jobs.html' },
  { name: 'Seaside Finolhu', logo: 'https://blosense.files.wordpress.com/2024/01/seaside-finolhu.webp', link: 'https://www.job-maldives.com/p/finolhu.html' },
  { name: 'Sun Siyam Iru Veli', logo: 'https://blosense.files.wordpress.com/2024/01/sun-siyam-iru-veli-logo.webp', link: 'https://www.job-maldives.com/p/sun-siyam-iru-veli-maldives.html' },
  { name: 'Gili Lankanfushi Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/gili-lankanfushi-maldives-logo-1.webp', link: 'https://www.job-maldives.com/p/gili-lankanfushi-maldives-jobs.html' },
  { name: 'SO Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/10/untitled-design.webp', link: 'https://www.job-maldives.com/p/so-maldives.html' },
  { name: 'Baros Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/01_baros_logo.webp', link: 'https://www.job-maldives.com/p/baros-maldives-jobs.html' },
  { name: 'Ananea Madivaru Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2025/01/ananea-madivaru-maldives.webp', link: 'https://www.job-maldives.com/p/ananea-madivaru-maldives.html' },
  { name: 'One&Only Reethi Rah', logo: 'https://blosense.files.wordpress.com/2024/01/one-and-only-reethi-rah.webp', link: 'https://www.job-maldives.com/p/one-only-reethi-rah.html' },
  { name: 'Kagi Maldives', logo: 'https://blosense.wordpress.com/wp-content/uploads/2024/08/kagi-new-logo_color-1-1.webp', link: 'https://www.job-maldives.com/' },
  { name: 'The Standard Huruvalhi Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/the-standard-logo.webp', link: 'https://www.job-maldives.com/p/the-standard-huruvalhi-maldives.html' },
  { name: 'Sheraton Maldives', logo: 'https://blosense.files.wordpress.com/2024/01/sheraton-maldives-logo.webp', link: 'https://www.job-maldives.com/p/sheraton-maldives-full-moon-resort-spa.html' },
];

export default function ResortsGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shuffledResorts, setShuffledResorts] = useState<Resort[]>([]);
  const logosPerSlide = 6;

  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...resorts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledResorts(shuffled);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || shuffledResorts.length === 0) return;

    const totalSlides = Math.ceil(shuffledResorts.length / logosPerSlide);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [shuffledResorts.length, isPaused, logosPerSlide]);

  if (shuffledResorts.length === 0) return null;

  const totalSlides = Math.ceil(shuffledResorts.length / logosPerSlide);
  const currentResorts = shuffledResorts.slice(
    currentIndex * logosPerSlide,
    (currentIndex + 1) * logosPerSlide
  );

  return (
    <div 
      className="relative w-full h-24 md:h-32 bg-gradient-to-r from-sky-600 to-blue-700 rounded-xl overflow-hidden shadow-lg text-left"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="ltr"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
        >
          <div className="grid grid-cols-3 gap-3 w-full max-w-4xl">
            {currentResorts.map((resort) => (
              <a
                key={resort.name}
                href={resort.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white/90 rounded-lg p-2 min-h-[40px] hover:bg-white transition-all duration-200 hover:scale-105"
                title={resort.name}
              >
                <img
                  src={resort.logo}
                  alt={resort.name}
                  loading="lazy"
                  className="max-w-full max-h-[32px] w-auto h-auto object-contain"
                />
              </a>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % totalSlides)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}
