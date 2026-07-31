// Company name to logo mapping
const companyLogos: Record<string, string> = {
  'Nova Maldives': 'https://blosense.files.wordpress.com/2022/08/nova-logo.png',
  'Constance Moofushi': 'https://blosense.files.wordpress.com/2024/01/constance-moofushi.webp',
  'JW Marriott Maldives Kaafu Atoll Island Resort': 'https://blosense.wordpress.com/wp-content/uploads/2025/09/jw-marriott-maldives-kaafu-atoll-island-resort-1.png',
  'The Halcyon Private Isles Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2025/10/the-halcyon-private-isles-logo-1.png',
  'Kuramathi Island Resort': 'https://blosense.wordpress.com/wp-content/uploads/2026/04/niva_kuramathi_logo_digital.webp',
  'The Westin Maldives Miriandhoo Resort': 'https://blosense.files.wordpress.com/2024/01/westin-maldives-logo.webp',
  'Patina Maldives': 'https://blosense.files.wordpress.com/2024/01/patina-maldives.webp',
  'Angsana Velavaru': 'https://blosense.files.wordpress.com/2024/01/angsana-velavaru-logo.webp',
  'InterContinental Maldives Maamunagau Resort': 'https://blosense.files.wordpress.com/2024/01/intercontinental-maldives-logo.webp',
  'RIU Hotels & Resorts Maldives': 'https://blosense.files.wordpress.com/2024/01/riu-logo.webp',
  'Kandima Maldives': 'https://blosense.files.wordpress.com/2024/01/kandima-logo.webp',
  'Alila Kothaifaru Maldives': 'https://blosense.files.wordpress.com/2024/01/alila-kothaifaru-maldives-logo.webp',
  'Sun Siyam Iru Fushi Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2026/07/sunsiyam_resort_logo_irufushi_primary_location_rgb_black.jpg',
  'Kandolhu Maldives': 'https://blosense.files.wordpress.com/2024/01/kandolhu-maldives.webp',
  'Avani Fares Maldives': 'https://blosense.files.wordpress.com/2024/01/avani-maldives.webp',
  'The Ritz-Carlton Maldives Fari Islands': 'https://blosense.files.wordpress.com/2024/01/ritz-carlton-maldives.webp',
  'Dhigali Maldives': 'https://blosense.files.wordpress.com/2024/01/dhigali-maldives-logo.webp',
  'Veligandu Maldives Resort Island': 'https://blosense.wordpress.com/wp-content/uploads/2026/02/veligandu-logo-03-2.png',
  'Noku Maldives Resort & Spa': 'https://blosense.wordpress.com/wp-content/uploads/2024/12/newlogo.webp',
  'Constance Halaveli': 'https://blosense.files.wordpress.com/2024/01/logo.jpg.webp',
  'Ifuru Island Maldives': 'https://blosense.files.wordpress.com/2024/01/ifuru-island-maldives-1.webp',
  'Ayada Maldives': 'https://blosense.files.wordpress.com/2024/01/ayada-maldives-logo.webp',
  'Fairmont Maldives Sirru Fen Fushi': 'https://blosense.files.wordpress.com/2024/04/sff-new-logo-1.webp',
  'LUX South Ari Atoll': 'https://blosense.files.wordpress.com/2024/01/lsaa_logo_grey.webp',
  'Huvafen Fushi': 'https://blosense.files.wordpress.com/2024/01/huvafen-fushi-maldives.webp',
  'Kudafushi Resort & Spa': 'https://blosense.files.wordpress.com/2024/01/kudafushi-resort-spa-logo.webp',
  'Rah Gili Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2025/09/rg-logo-raft.webp',
  'Emerald Maldives Resort & Spa': 'https://blosense.files.wordpress.com/2024/01/emerald-maldives-color-horizontal.webp',
  'Radisson Blu Resort Maldives': 'https://blosense.files.wordpress.com/2024/01/rdb-logo.webp',
  'Dusit Thani Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2024/09/dusit-logo.webp',
  'Cora Cora Maldives': 'https://blosense.files.wordpress.com/2024/01/cora-cora-maldives.webp',
  'Villa Haven': 'https://blosense.wordpress.com/wp-content/uploads/2024/08/villa-haven-logo-1.webp',
  'Le Meridien Maldives Resort & Spa': 'https://blosense.files.wordpress.com/2024/01/le-meridien-maldives-resort-spa.webp',
  'Furaveri Island Resort': 'https://blosense.files.wordpress.com/2024/01/furaveri-logo.webp',
  'Milaidhoo Island Maldives': 'https://blosense.files.wordpress.com/2024/01/milaidhoo_logo_final_blue-_1_.webp',
  'Six Senses Laamu': 'https://blosense.files.wordpress.com/2024/01/six-senses-laamu-_4_.webp',
  'Movenpick Resort Kuredhivaru Maldives': 'https://blosense.files.wordpress.com/2024/01/kuredhivaru-resort-logo.webp',
  'OUTRIGGER Maldives Maafushivaru Resort': 'https://blosense.files.wordpress.com/2024/01/outrigger-maldives.webp',
  'Meeru Island Resort & Spa': 'https://blosense.wordpress.com/wp-content/uploads/2025/11/meeru-primary-logo-color-01-rgb.webp',
  'Atmosphere Kanifushi Maldives': 'https://blosense.files.wordpress.com/2024/01/akm-official.webp',
  'Robinson Club Noonu': 'https://blosense.files.wordpress.com/2024/01/rcn-logo-blue-new.webp',
  'The Nautilus Maldives': 'https://blosense.files.wordpress.com/2024/01/nautilus-maldives-logo.webp',
  'Coco Collection': 'https://blosense.wordpress.com/wp-content/uploads/2024/11/cc-logo-1.jpg',
  'Velassaru Maldives': 'https://blosense.files.wordpress.com/2024/01/velassaru-maldives-logo.webp',
  'Velaa Private Island': 'https://blosense.files.wordpress.com/2024/01/velaa-private-island-logo.webp',
  'Amilla Fushi': 'https://blosense.files.wordpress.com/2024/01/amilla-logo.webp',
  'Centara Ras Fushi Resort & Spa Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2025/09/crf-logo-color.png',
  'Fiyavalhu Maldives': 'https://blosense.files.wordpress.com/2024/01/fiyavalhu-maldives.webp',
  'Coco Bodu Hithi': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Siyam World Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2025/09/0-02-03-32021a47c054e75c7ad655c4c8735d6c00f376b52575d476f791140d4c7039ea_11bf108bab6ea3e9.webp',
  'Grand Park Kodhipparu Maldives': 'https://blosense.files.wordpress.com/2024/01/grand-park-kodhipparu-maldives.webp',
  'Club Med Maldives': 'https://blosense.files.wordpress.com/2024/01/clubmed-maldives.webp',
  'Finolhu a Seaside Collection Resort': 'https://blosense.files.wordpress.com/2024/01/seaside-finolhu.webp',
  'Sun Siyam Iru Veli Maldives': 'https://blosense.files.wordpress.com/2024/01/sun-siyam-iru-veli-logo.webp',
  'Gili Lankanfushi Maldives': 'https://blosense.files.wordpress.com/2024/01/gili-lankanfushi-maldives-logo-1.webp',
  'SO Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2024/10/untitled-design.webp',
  'Baros Maldives': 'https://blosense.files.wordpress.com/2024/01/01_baros_logo.webp',
  'Ananea Madivaru Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2025/01/ananea-madivaru-maldives.webp',
  'One&Only Reethi Rah': 'https://blosense.files.wordpress.com/2024/01/one-and-only-reethi-rah.webp',
  'KAGI Maldives Resort & Spa': 'https://blosense.wordpress.com/wp-content/uploads/2024/08/kagi-new-logo_color-1-1.webp',
  'The Standard Huruvalhi Maldives': 'https://blosense.files.wordpress.com/2024/01/the-standard-logo.webp',
  'Sheraton Maldives Full Moon Resort & Spa': 'https://blosense.files.wordpress.com/2024/01/sheraton-maldives-logo.webp',
  'Coco Palm Dhuni Kolhu': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Crown & Champa Resorts': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Brennia Kottefaru': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Madifushi Private Island Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Kuda Vilingili Resort Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'COMO Maalifushi': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Emerald Faarufushi Resort & Spa': 'https://blosense.files.wordpress.com/2024/01/emerald-maldives-color-horizontal.webp',
  'Taj Exotica Resort & Spa Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Hawks Hotels': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Club Med Finolhu Villas': 'https://blosense.files.wordpress.com/2024/01/clubmed-maldives.webp',
  'Sandies Bathala Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'CROSSROADS Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Silver Sands Pvt.Ltd': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Smart Own': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Sun Siyam Olhuveli Maldives': 'https://blosense.wordpress.com/wp-content/uploads/2026/07/sunsiyam_resort_logo_irufushi_primary_location_rgb_black.jpg',
  'Cinnamon Dhonveli Maldives': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'The Westin Maldives': 'https://blosense.files.wordpress.com/2024/01/westin-maldives-logo.webp',
  'Park Hyatt Maldives Hadahaa': 'https://blosense.files.wordpress.com/2024/01/coco-bodu-hithi.webp',
  'Finolhu': 'https://blosense.files.wordpress.com/2024/01/seaside-finolhu.webp',
};

export default companyLogos;

// Helper function to get logo for a company name
export function getCompanyLogo(companyName: string): string {
  // Try exact match first
  if (companyLogos[companyName]) {
    return companyLogos[companyName];
  }
  
  // Try partial match (company name might be slightly different)
  const partialMatch = Object.keys(companyLogos).find(key => 
    companyName.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(companyName.toLowerCase())
  );
  
  if (partialMatch) {
    return companyLogos[partialMatch];
  }
  
  // Return a default placeholder or empty string
  return '';
}
