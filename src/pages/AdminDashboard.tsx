import { FormEvent, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, dbWithFallback } from '../firebase';
import { db as goldenTimeDb } from '../firebase-golden-time';
import { categories } from '../data/mockData';
import { fallbackJobs } from '../data/fallbackJobs';
import { getCompanyLogo } from '../data/companyLogos';

import { uploadImage, uploadVideo, uploadToGitHub, uploadToImgur, uploadVideoToImgur, uploadToImgBB, compressImage, deleteImage } from '../utils/cloudinary';
import { generateSlug } from '../utils/slug.js';
import { getVercelAnalytics } from '../api/vercel-analytics';

type AdminTab = 'articles' | 'manage' | 'analytics' | 'settings' | 'banners' | 'sidebar-promotions' | 'mid-article-promotions' | 'rephrase' | 'checklist' | 'flyers' | 'quotes' | 'social-videos' | 'recipes' | 'quran' | 'stories' | 'golden-time' | 'obituary' | 'funeral-poster' | 'advertisements' | 'hero-slides';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastCreatedArticleId, setLastCreatedArticleId] = useState<string | null>(null);
  const [articlesCount, setArticlesCount] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);
  const [visitorDetails, setVisitorDetails] = useState<any[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [weeklyVisitors, setWeeklyVisitors] = useState(0);
  const [monthlyVisitors, setMonthlyVisitors] = useState(0);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filteredVisitorCount, setFilteredVisitorCount] = useState(0);
  const [facebookInsights, setFacebookInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [recipesVisits, setRecipesVisits] = useState(0);
  const [jobsVisits, setJobsVisits] = useState(0);
  const [homeVisits, setHomeVisits] = useState(0);
  const [quranVisits, setQuranVisits] = useState(0);
  const [vercelAnalytics, setVercelAnalytics] = useState<any>(null);
  const [loadingVercelAnalytics, setLoadingVercelAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('articles');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'en' | 'dv'>('dv');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const translations = {
    en: {
      adminPanel: 'Admin Panel',
      adminDashboard: 'Admin Dashboard',
      news: 'News',
      visits: 'Visits',
      logout: 'Logout',
      createNews: 'Create News',
      analytics: 'Analytics',
      settings: 'Settings',
      imageGenerator: 'Image Generator',
      newsDescription: 'Create and publish news articles.',
      title: 'Title',
      titleDv: 'Title (Dhivehi)',
      category: 'Category',
      excerpt: 'Excerpt',
      excerptDv: 'Excerpt (Dhivehi)',
      photoUrl: 'Photo URL',
      readingTime: 'Reading Time',
      newsContent: 'News Content',
      paragraph1: 'Paragraph 1',
      paragraph1Dv: 'Paragraph 1 (Dhivehi)',
      paragraph2: 'Paragraph 2 (optional)',
      paragraph2Dv: 'Paragraph 2 (Dhivehi - optional)',
      paragraph3: 'Paragraph 3 (optional)',
      paragraph3Dv: 'Paragraph 3 (Dhivehi - optional)',
      paragraph1En: 'Paragraph 1 (English)',
      paragraph2En: 'Paragraph 2 (English - optional)',
      paragraph3En: 'Paragraph 3 (English - optional)',
      addParagraph: 'Add Paragraph',
      removeParagraph: 'Remove Paragraph',
      paragraph: 'Paragraph',
      paragraphDv: 'Paragraph (Dhivehi)',
      paragraphEn: 'Paragraph (English)',
      trending: 'Trending',
      breaking: 'Breaking',
      submit: 'Submit News',
      submitting: 'Submitting...',
      totalNews: 'Total News',
      totalVisits: 'Total Visits',
      uniqueVisitors: 'Unique Visitors',
      visitorLog: 'Visitor Log',
      noVisitors: 'No visitors',
      facebookPage: 'Facebook Page',
      pageViews: 'Page Views',
      pageLikes: 'Page Likes',
      pageFollowers: 'Page Followers',
      refreshInsights: 'Refresh Insights',
      loadingInsights: 'Loading...',
      device: 'Device',
      browser: 'Browser',
      os: 'OS',
      time: 'Time',
      screen: 'Screen',
      referrer: 'Referrer',
      sameDevice: 'Same Device',
      newDevice: 'New Device',
      translateTitle: 'English to Dhivehi Translation',
      translateDesc: 'Type or paste English text to translate to Dhivehi.',
      englishPlaceholder: 'Type English text here...',
      translate: 'Translate',
      translating: 'Translating...',
      dhivehi: 'Dhivehi',
      copy: 'Copy',
      loading: 'Loading...',
      notLoggedIn: 'Not logged in',
      pleaseLogin: 'Please login to access admin console.',
      typeEnglish: 'Please type English text.',
      translated: 'Translation complete.',
      translateError: 'Translation failed. Please try again.',
      copied: 'Copied to clipboard.',
      newsCreated: 'News created successfully!',
      newsError: 'Failed to create news. Please try again.',
      changePassword: 'Change Password',
      changePasswordDesc: 'Change your account password.',
      change: 'Change',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Delete your account and data.',
      delete: 'Delete',
      manageNews: 'Manage News',
      deleteNews: 'Delete News',
      deleteNewsDesc: 'Delete news articles from the system.',
      confirmDelete: 'Are you sure you want to delete this article?',
      newsDeleted: 'News deleted successfully!',
      newsDeleteError: 'Failed to delete news. Please try again.',
      postToFb: 'Post to FB',
      postingToFb: 'Posting...',
      postedToFb: 'Posted to Facebook!',
      postToFbError: 'Failed to post to Facebook. Please try again.',
      editNews: 'Edit News',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      newsUpdated: 'News updated successfully!',
      newsUpdateError: 'Failed to update news. Please try again.',
      manageBanners: 'Manage Banners',
      bannersDesc: 'Upload and manage promotional banners.',
      uploadBanner: 'Upload Banner',
      bannerTitle: 'Banner Title',
      bannerSubtitle: 'Banner Subtitle',
      bannerImage: 'Banner Image',
      selectImage: 'Select Image',
      uploading: 'Uploading...',
      bannerUploaded: 'Banner uploaded successfully!',
      bannerUploadError: 'Failed to upload banner. Please try again.',
      deleteBanner: 'Delete',
      confirmDeleteBanner: 'Are you sure you want to delete this banner?',
      bannerDeleted: 'Banner deleted successfully!',
      bannerDeleteError: 'Failed to delete banner. Please try again.',
      selectBanner: 'Select Banner',
      noBannerSelected: 'No banner selected',
      currentBanner: 'Currently Displayed Banner',
      bannerLocation: 'Banner Location',
      bannerSize: 'Banner Size',
      bannerPosition: 'Banner Position',
      positionTop: 'Top',
      positionMiddle: 'Middle',
      positionBottom: 'Bottom',
      locationHome: 'Home Page',
      locationArticle: 'Article Page',
      locationCategory: 'Category Page',
      sizeMobile: 'Mobile Only',
      sizeDesktop: 'Desktop Only',
      sizeBoth: 'Both Mobile & Desktop',
      noBanners: 'No banners yet',
      gradientLocation: 'Gradient Location',
      gradientTop: 'Top',
      gradientMiddle: 'Middle',
      gradientBottom: 'Bottom',
      manageAdvertisements: 'Manage Advertisements',
      advertisementsDesc: 'Upload and manage advertisement images for all slots.',
      uploadAdvertisement: 'Upload Advertisement',
      selectAdSlot: 'Select Advertisement Slot',
      advertisementImage: 'Advertisement Image',
      advertisementUploaded: 'Advertisement uploaded successfully!',
      advertisementUploadError: 'Failed to upload advertisement. Please try again.',
      deleteAdvertisement: 'Delete',
      confirmDeleteAdvertisement: 'Are you sure you want to delete this advertisement?',
      advertisementDeleted: 'Advertisement deleted successfully!',
      advertisementDeleteError: 'Failed to delete advertisement. Please try again.',
      noAdvertisementSelected: 'No slot selected',
      currentAdvertisement: 'Current Advertisement',
      manageHeroSlides: 'Manage Hero Slides',
      heroSlidesDesc: 'Select articles to display in the main page hero slider carousel.',
      selectHeroArticle: 'Select Article',
      addToHero: 'Add to Hero Slider',
      removeFromHero: 'Remove from Hero Slider',
      heroSlidesUpdated: 'Hero slides updated successfully!',
      heroSlidesError: 'Failed to update hero slides',
      noHeroSlides: 'No hero slides selected yet',
      postLaunchChecklist: 'Post-Launch Checklist',
      checklistDescription: '10 things to do after your website is live',
      addGoogleSearchConsole: 'Add Google Search Console',
      addGoogleTagManager: 'Add Google Tag Manager',
      addGoogleAnalytics: 'Add Google Analytics',
      addMicrosoftClarity: 'Add Microsoft Clarity',
      addBingWebmaster: 'Add Bing Webmaster',
      doKeywordResearch: 'Do keyword research',
      createKeywordClusters: 'Create keyword clusters',
      createMetaTitles: 'Create meta titles and description',
      createLocationPages: 'Create separate page for each location you serve',
      createServicePages: 'Create separate service page for each service',
      createUniqueContent: 'Create unique content for each page and make sure they are indexed',
      jobFlyers: 'Job Flyers',
      jobFlyersDesc: 'Create and download job flyers',
      selectJob: 'Select Job',
      generateFlyer: 'Generate Flyer',
      downloadFlyer: 'Download Flyer',
      generating: 'Generating...',
      noJobs: 'No jobs available',
      quotePosters: 'Quote Posters',
      quotePostersDesc: 'Create quote posters with photos and text',
      uploadPhoto: 'Upload Photo',
      quoteText: 'Quote Text',
      authorText: 'Author (optional)',
      generatePoster: 'Generate Poster',
      downloadPoster: 'Download Poster',
      platformSize: 'Platform Size',
      facebook: 'Facebook (1080x1350)',
      instagramSquare: 'Instagram Square (1080x1080)',
      instagramPortrait: 'Instagram Portrait (1080x1350)',
      imageControls: 'Image Controls',
      zoom: 'Zoom',
      positionX: 'Position X',
      positionY: 'Position Y',
      textControls: 'Text Controls',
      fontSize: 'Font Size',
      textPositionX: 'Text Position X',
      textPositionY: 'Text Position Y',
      fontColor: 'Font Color',
      textTransparency: 'Text Transparency',
      textBackgroundColor: 'Text Background Color',
      textBackgroundTransparency: 'Text Background Transparency',
      recipes: 'Recipes',
      recipesDesc: 'Manage and create recipes',
      recipeTitleDv: 'Recipe Title (Dhivehi)',
      recipeTitleEn: 'Recipe Title (English)',
      recipeImage: 'Recipe Image',
      recipeImageUrl: 'Recipe Image URL',
      recipeIngredientsDv: 'Ingredients (Dhivehi)',
      recipeIngredientsEn: 'Ingredients (English)',
      recipeInstructionsDv: 'Instructions (Dhivehi)',
      recipeInstructionsEn: 'Instructions (English)',
      recipeCategory: 'Category',
      recipePrepTime: 'Prep Time',
      recipeCookTime: 'Cook Time',
      recipeServings: 'Servings',
      addRecipe: 'Add Recipe',
      editRecipe: 'Edit Recipe',
      deleteRecipe: 'Delete Recipe',
      saveRecipe: 'Save Recipe',
      socialVideos: 'Social Media Videos',
      socialVideosDesc: 'Create videos for Facebook Reels, TikTok, YouTube Shorts & YouTube',
      uploadImages: 'Upload Images',
      reelText: 'Video Text',
      duration: 'Duration (seconds)',
      transition: 'Transition Effect',
      transitionFade: 'Fade',
      transitionSlide: 'Slide',
      transitionZoom: 'Zoom',
      generateReel: 'Generate Video',
      downloadReel: 'Download Video',
      selectPlatform: 'Select Platform',
      facebookReels: 'Facebook Reels',
      tiktok: 'TikTok',
      youtubeShorts: 'YouTube Shorts',
      youtubeVideo: 'YouTube Video',
      uploadAudio: 'Upload Audio/Music',
      hashtags: 'Hashtags',
      suggestedHashtags: 'Suggested Hashtags',
      selectArticle: 'Select Article',
      autoGenerate: 'Auto-generate from Article',
    },
    dv: {
      adminPanel: 'އެޑްމިން ޕެނަލް',
      adminDashboard: 'އެޑްމިން ޑޭޝްބޯޑް',
      news: 'ޚަބަރު',
      visits: 'ޒިޔާރަތްތައް',
      logout: 'ލޮގްއައުޓް',
      createNews: 'ޚަބަރު އުފައްދާ',
      analytics: 'ތަޙުލީލް',
      settings: 'ސެޓިންގްސް',
      imageGenerator: 'އިމޭޖް ޖެނެރޭޓަރ',
      newsDescription: 'ޚަބަރު ލިޔުމަށާއި ޝާއިޢު ކުރުމަށް',
      title: 'ސުރުޚީ',
      titleDv: 'ސުރުޚީ (ދިވެހި)',
      category: 'ބައި',
      excerpt: 'ކުރު ޚުލާސާ',
      excerptDv: 'ކުރު ޚުލާސާ (ދިވެހި)',
      photoUrl: 'ފޮޓޯ URL',
      readingTime: 'ކިޔާލުމަށް ނަގާ ވަގުތު',
      newsContent: 'ޚަބަރުގެ މައިގަނޑު',
      paragraph1: 'ޕެރެގްރާފް 1',
      paragraph1Dv: 'ޕެރެގްރާފް 1 (ދިވެހި)',
      paragraph2: 'ޕެރެގްރާފް 2 (އިޚްތިޔާރީ)',
      paragraph2Dv: 'ޕެރެގްރާފް 2 (ދިވެހި - އިޚްތިޔާރީ)',
      paragraph3: 'ޕެރެގްރާފް 3 (އިޚްތިޔާރީ)',
      paragraph3Dv: 'ޕެރެގްރާފް 3 (ދިވެހި - އިޚްތިޔާރީ)',
      paragraph1En: 'ޕެރެގްރާފް 1 (އިނގިރޭސި)',
      paragraph2En: 'ޕެރެގްރާފް 2 (އިނގިރޭސި - އިޚްތިޔާރީ)',
      paragraph3En: 'ޕެރެގްރާފް 3 (އިނގިރޭސި - އިޚްތިޔާރީ)',
      addParagraph: 'ޕެރެގްރާފް އިތުރުކުރޭ',
      removeParagraph: 'ޕެރެގްރާފް ފޮހޮލުކުރޭ',
      paragraph: 'ޕެރެގްރާފް',
      paragraphDv: 'ޕެރެގްރާފް (ދިވެހި)',
      paragraphEn: 'ޕެރެގްރާފް (އިނގިރޭސި)',
      trending: 'މަޝްހޫރު',
      breaking: 'އެންމެ ފަހުގެ',
      submit: 'ޚަބަރު ފޮނުވާ',
      submitting: 'ފޮނުވަނީ...',
      totalNews: 'ޖުމްލަ ޚަބަރު',
      totalVisits: 'ޖުމްލަ ޒިޔާރަތް',
      uniqueVisitors: 'ތަފާތު ޒިޔާރަތްތެރިން',
      visitorLog: 'ޒިޔާރަތް ލޮގް',
      noVisitors: 'ޒިޔާރަތްތެރިން ނެތް',
      facebookPage: 'ފޭސްބުކް ޕޭޖް',
      pageViews: 'ޕޭޖް ވިއުސް',
      pageLikes: 'ޕޭޖް ލައިކްސް',
      pageFollowers: 'ޕޭޖް ފޮލޯވަރސް',
      refreshInsights: 'އިންސައިޓްސް ރީފްރެޝް ކުރޭ',
      loadingInsights: 'ލޯޑް ވަނީ...',
      device: 'ޑިވައިސް',
      browser: 'ބްރައުޒަރު',
      os: 'އޯއެސް',
      time: 'ވަގުތު',
      screen: 'ސްކްރީން',
      referrer: 'ރިފަރަރު',
      sameDevice: 'އެއްވަނަސް ޑިވައިސް',
      newDevice: 'އަންނަ ޑިވައިސް',
      translateTitle: 'އިނގިރޭސިން ދިވެހިއަށް ތަރުޖަމާ',
      translateDesc: 'އިނގިރޭސި ލިޔުން ލިޔާ ނުވަތަ ޕޭސްޓް ކުރޭ',
      englishPlaceholder: 'މިތާނގައި އިނގިރޭސި ލިޔުން ލިޔާ...',
      translate: 'ތަރުޖަމާ ކުރޭ',
      translating: 'ތަރުޖަމާ ކުރަނީ...',
      dhivehi: 'ދިވެހި',
      copy: 'ކޮޕީ',
      loading: 'ލޯޑް ވަނީ...',
      notLoggedIn: 'ލޮގްއިން ނުވެފަ',
      pleaseLogin: 'އެޑްމިން ކޮންސޯލް ބެލުމަށް ލޮގްއިން ކުރޭ',
      typeEnglish: 'އިނގިރޭސި ލިޔުން ލިޔާ',
      translated: 'ތަރުޖަމާ ނިމިއްޖެ',
      translateError: 'ތަރުޖަމާ ކުރުމަށް ފެއިލް ވެއްޖެ. އަލުން މަސައްކަތް ކުރޭ',
      copied: 'ކްލިޕްބޯޑަށް ކޮޕީ ކުރެވިއްޖެ',
      newsCreated: 'ޚަބަރު ކުރެވިއްޖެ',
      newsError: 'ޚަބަރު ކުރުމަށް ފެއިލް ވެއްޖެ. އަލުން މަސައްކަތް ކުރޭ',
      changePassword: 'ޕާސްވޯޑް ބަދަލް ކުރޭ',
      changePasswordDesc: 'އަށް ޕާސްވޯޑް ބަދަލް ކުރޭ',
      change: 'ބަދަލް ކުރޭ',
      deleteAccount: 'އެކައުންޓް ޑިލީޓް ކުރޭ',
      deleteAccountDesc: 'އެކައުންޓް އަދި ޑޭޓާ ޑިލީޓް ކުރޭ',
      delete: 'ޑިލީޓް',
      manageNews: 'ޚަބަރު މެނޭޖް ކުރޭ',
      deleteNews: 'ޚަބަރު ޑިލީޓް ކުރޭ',
      deleteNewsDesc: 'ޚަބަރު ސިސްޓަމްއިން ޑިލީޓް ކުރޭ',
      confirmDelete: 'މި ޚަބަރު ޑިލީޓް ކުރާނީތަ؟',
      newsDeleted: 'ޚަބަރު ޑިލީޓް ކުރެވިއްޖެ',
      newsDeleteError: 'ޚަބަރު ޑިލީޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      postToFb: 'Facebook އަށް ޕޯސްޓް ކުރޭ',
      postingToFb: 'ޕޯސްޓް ކުރަނީ...',
      postedToFb: 'Facebook އަށް ޕޯސްޓް ކުރެވިއްޖެ',
      postToFbError: 'Facebook އަށް ޕޯސްޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      editNews: 'ޚަބަރު އެޑިޓް ކުރޭ',
      saveChanges: 'ބަދަލް ސޭވް ކުރޭ',
      cancel: 'ކެންސަލް',
      newsUpdated: 'ޚަބަރު އަޕްޑޭޓް ކުރެވިއްޖެ',
      newsUpdateError: 'ޚަބަރު އަޕްޑޭޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      manageBanners: 'ބެނަރު މެނޭޖް ކުރޭ',
      bannersDesc: 'ޕްރޮމޯޝަނަލް ބެނަރު އަޕްލޯޑް ކުރާ އަދި މެނޭޖް ކުރޭ',
      uploadBanner: 'ބެނަރު އަޕްލޯޑް ކުރޭ',
      bannerTitle: 'ބެނަރު ސުރުޚީ',
      bannerSubtitle: 'ބެނަރު ސަބްޓައިޓަލް',
      bannerImage: 'ބެނަރު ފޮޓޯ',
      selectImage: 'ފޮޓޯ ހޮވާ',
      uploading: 'އަޕްލޯޑް ކުރަނީ...',
      bannerUploaded: 'ބެނަރު އަޕްލޯޑް ކުރެވިއްޖެ',
      bannerUploadError: 'ބެނަރު އަޕްލޯޑް ކުރުމަށް ފެއިލް ވެއްޖެ. އަލުން މަސައްކަތް ކުރޭ',
      deleteBanner: 'ޑިލީޓް',
      confirmDeleteBanner: 'މި ބެނަރު ޑިލީޓް ކުރާނީތަ؟',
      bannerDeleted: 'ބެނަރު ޑިލީޓް ކުރެވިއްޖެ',
      bannerDeleteError: 'ބެނަރު ޑިލީޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      selectBanner: 'ބެނަރު ހޮވާ',
      noBannerSelected: 'ބެނަރެއް ހޮވާފައި ނެތް',
      currentBanner: 'މިހާރު ދައްކާ ބެނަރު',
      bannerLocation: 'ބެނަރު ހުސްކަން',
      bannerSize: 'ބެނަރު ސައިޒް',
      bannerPosition: 'ބެނަރު ހުސްކަން',
      positionTop: 'މައްޗު',
      positionMiddle: 'މެދު',
      positionBottom: 'ތިރީ',
      locationHome: 'މައި ޞަފްޙާ',
      locationArticle: 'ޚަބަރު ޞަފްޙާ',
      locationCategory: 'ކެޓަގަރީ ޞަފްޙާ',
      sizeMobile: 'މޮބައިލް',
      sizeDesktop: 'ޑެސްކްޓޮޕް',
      sizeBoth: 'ދެވަނަ (މޮބައިލް + ޑެސްކްޓޮޕް)',
      noBanners: 'ބެނަރުތައް ނެތް',
      gradientLocation: 'ގްރޭޑިއެންޓް ހުސްކަން',
      gradientTop: 'މައްޗު',
      gradientMiddle: 'މެދު',
      gradientBottom: 'ތިރީ',
      manageAdvertisements: 'އެޑްވެރްޓައިޒްމެންޓް މެނޭޖް ކުރޭ',
      advertisementsDesc: 'ހުރިހާ ސްލޮޓްތަކަށް އެޑްވެރްޓައިޒްމެންޓް އިމޭޖް އަޕްލޯޑް ކުރާ އަދި މެނޭޖް ކުރޭ',
      uploadAdvertisement: 'އެޑްވެރްޓައިޒްމެންޓް އަޕްލޯޑް ކުރޭ',
      selectAdSlot: 'އެޑްވެރްޓައިޒްމެންޓް ސްލޮޓް ހޮވާ',
      advertisementImage: 'އެޑްވެރްޓައިޒްމެންޓް އިމޭޖް',
      advertisementUploaded: 'އެޑްވެރްޓައިޒްމެންޓް އަޕްލޯޑް ކުރެވިއްޖެ',
      advertisementUploadError: 'އެޑްވެރްޓައިޒްމެންޓް އަޕްލޯޑް ކުރުމަށް ފެއިލް ވެއްޖެ',
      deleteAdvertisement: 'ޑިލީޓް',
      confirmDeleteAdvertisement: 'ތިބާގެ މި އެޑްވެރްޓައިޒްމެންޓް ޑިލީޓް ކުރަން ބޭނުމަކު؟',
      advertisementDeleted: 'އެޑްވެރްޓައިޒްމެންޓް ޑިލީޓް ކުރެވިއްޖެ',
      advertisementDeleteError: 'އެޑްވެރްޓައިޒްމެންޓް ޑިލީޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      noAdvertisementSelected: 'ސްލޮޓެއް ހޮވާފައި ނެތް',
      currentAdvertisement: 'މިހާރު އެޑްވެރްޓައިޒްމެންޓް',
      manageHeroSlides: 'ހީރޯ ސްލައިޑް މެނޭޖް ކުރޭ',
      heroSlidesDesc: 'މެއިން ޞަފްޙާގައި ދައްކާ ޚަބަރު ސްލައިޑަރުތައް ހޮވާ',
      selectHeroArticle: 'ޚަބަރު ހޮވާ',
      addToHero: 'ސްލައިޑަރުގައި އިތުރުކުރޭ',
      removeFromHero: 'ސްލައިޑަރުން ނަޖައްކުރޭ',
      heroSlidesUpdated: 'ސްލައިޑްތައް އަޕްޑޭޓް ކުރެވިއްޖެ',
      heroSlidesError: 'ސްލައިޑްތައް އަޕްޑޭޓް ކުރުމަށް ފެއިލް ވެއްޖެ',
      noHeroSlides: 'ސްލައިޑްތައް ހޮވާފައެއް ނެތް',
      postLaunchChecklist: 'ވެބްސައިޓް ލާންޗް ކުރުމަށް ފަހު ކުރެވޭ ކަންތައްތައް',
      checklistDescription: 'ވެބްސައިޓް ލައިވް ކުރުމަށް ފަހު 10 ކަންތައް',
      addGoogleSearchConsole: 'ގޫގަލް ސާޗް ކޮންސޯލް އިތުރުކުރޭ',
      addGoogleTagManager: 'ގޫގަލް ޓެގް މެނޭޖަރު އިތުރުކުރޭ',
      addGoogleAnalytics: 'ގޫގަލް އެނަލިޓިކްސް އިތުރުކުރޭ',
      addMicrosoftClarity: 'މައިކްރޮސޮފްޓް ކްލެރިޓީ އިތުރުކުރޭ',
      addBingWebmaster: 'ބިންގް ވެބްމާސްޓަރު އިތުރުކުރޭ',
      doKeywordResearch: 'ކީވޯޑް ރިސާރޗް ކުރޭ',
      createKeywordClusters: 'ކީވޯޑް ކްލަސްޓަރުތައް އުފައްދާ',
      createMetaTitles: 'މެޓާ ޓައިޓަލް އަދި ޑިސްކްރިޕްޝަން އުފައްދާ',
      createLocationPages: 'ކޮންމެ ހުސްކަމަކަށް ވެސް ތަނެއް ހަދާ',
      createServicePages: 'ކޮންމެ ޚިދުމަތަކަށް ވެސް ޞަފްޙާއެއް ހަދާ',
      createUniqueContent: 'ކޮންމެ ޞަފްޙާއަކަށް ވެސް އަންހެން ކޮންޓެންޓް ހަދާ އަދި އިންޑެކްސް ކުރިއަށް ގެންދާ',
      jobFlyers: 'ވަޒީފާ ފްލައިއަރުތައް',
      jobFlyersDesc: 'ވަޒީފާ ފްލައިއަރުތައް ހަދާ އަދި ޑައުންލޯޑް ކުރޭ',
      selectJob: 'ވަޒީފާ ހޮވާ',
      generateFlyer: 'ފްލައިއަރު ހަދާ',
      downloadFlyer: 'ފްލައިއަރު ޑައުންލޯޑް ކުރޭ',
      generating: 'ހަދަނީ...',
      noJobs: 'ވަޒީފާތައް ނެތް',
      quotePosters: 'ކޮޓް ޕޯސްޓަރުތައް',
      quotePostersDesc: 'ފޮޓޯ އަދި ލިޔުން އާއި އެއްކޮށައިގައި ކޮޓް ޕޯސްޓަރުތައް ހަދާ',
      uploadPhoto: 'ފޮޓޯ އަޕްލޯޑް ކުރޭ',
      quoteText: 'ކޮޓް ލިޔުން',
      authorText: 'ލިޔެކިއްވާ',
      generatePoster: 'ޕޯސްޓަރު ހަދާ',
      downloadPoster: 'ޕޯސްޓަރު ޑައުންލޯޑް ކުރޭ',
      platformSize: 'ޕްލެޓްފޯމް ސައިޒް',
      facebook: 'ފޭސްބުކް (1080x1350)',
      instagramSquare: 'އިންސްޓަގްރާމް ސަކުއަރު (1080x1080)',
      instagramPortrait: 'އިންސްޓަގްރާމް ޕޯޓްރެއިޓް (1080x1350)',
      imageControls: 'އިމޭޖް ކޮންޓްރޯލުތައް',
      zoom: 'ޒޫމް',
      positionX: 'ޕޮޒިޝަން X',
      positionY: 'ޕޮޒިޝަން Y',
      textControls: 'ލިޔުން ކޮންޓްރޯލުތައް',
      fontSize: 'ފޮންޓް ސައިޒް',
      textPositionX: 'ލިޔުން ޕޮޒިޝަން X',
      textPositionY: 'ލިޔުން ޕޮޒިޝަން Y',
      fontColor: 'ފޮންޓް ކައުލަރ',
      textTransparency: 'ލިޔުން ޝައްޕާރަންސީ',
      textBackgroundColor: 'ލިޔުން ބެކްގްރައުންޑް ކައުލަރ',
      textBackgroundTransparency: 'ލިޔުން ބެކްގްރައުންޑް ޝައްޕާރަންސީ',
      socialVideos: 'ސޯޝަލް މީޑިއާ ވީޑިއޯތައް',
      socialVideosDesc: 'ފޭސްބުކް ރީލްސް، ޓިކްޓޮކް، ޔޫޓިއުބް ޝޯޓްސް އާއި ޔޫޓިއުބް ވީޑިއޯތައަށް ވީޑިއޯތައް ހަދާ',
      uploadImages: 'ފޮޓޯ އަޕްލޯޑް ކުރޭ',
      reelText: 'ވީޑިއޯ ލިޔުން',
      duration: 'ދުވަސްވެށެ (ސިކުންސް)',
      transition: 'ޓްރާންޒިޝަން',
      transitionFade: 'ފޭޑް',
      transitionSlide: 'ސްލައިޑް',
      transitionZoom: 'ޒޫމް',
      generateReel: 'ވީޑިއޯ ހަދާ',
      downloadReel: 'ވީޑިއޯ ޑައުންލޯޑް ކުރޭ',
      selectPlatform: 'ޕްލެޓްފޯމް އިޚިލާކުރޭ',
      facebookReels: 'ފޭސްބުކް ރީލްސް',
      tiktok: 'ޓިކްޓޮކް',
      youtubeShorts: 'ޔޫޓިއުބް ޝޯޓްސް',
      youtubeVideo: 'ޔޫޓިއުބް ވީެޑިއޯ',
      uploadAudio: 'އޯޑިއޯ/މިއުޒިކް އަޕްލޯޑް ކުރޭ',
      hashtags: 'ހޭޝްޓެގްތައް',
      suggestedHashtags: 'ހެޔްދެއްކުރާ ހޭޝްޓެގްތައް',
      selectArticle: 'ޚަބަރު އިޚިލާކުރޭ',
      autoGenerate: 'ޚަބަރުން އޮޓޯ ޖެނެރޭޓް ކުރޭ',
      recipes: 'ރެސިޕީތައް',
      recipesDesc: 'ރެސިޕީތައް މެނޭޖް ކުރާއި އުފައްދާ',
      recipeTitleDv: 'ރެސިޕީގެ ސުރުޚީ (ދިވެހި)',
      recipeTitleEn: 'ރެސިޕީގެ ސުރުޚީ (އިނގިލިޝް)',
      recipeImage: 'ރެސިޕީގެ ފޮޓޯ',
      recipeImageUrl: 'ރެސިޕީގެ ފޮޓޯ URL',
      recipeIngredientsDv: 'ތަކެތި (ދިވެހި)',
      recipeIngredientsEn: 'ތަކެތި (އިނގިލިޝް)',
      recipeInstructionsDv: 'ހެދުމުގެ ގޮތް (ދިވެހި)',
      recipeInstructionsEn: 'ހެދުމުގެ ގޮތް (އިނގިލިޝް)',
      recipeCategory: 'ބައި',
      recipePrepTime: 'ހެދުމުގެ ވަގުތު',
      recipeCookTime: 'ފިއްޓުވަގުތު',
      recipeServings: 'ބައިތައް',
      addRecipe: 'ރެސިޕީ އިތުރުކުރޭ',
      editRecipe: 'ރެސިޕީ އަންޑޭޓް ކުރޭ',
      deleteRecipe: 'ރެސިޕީ ފޮހޮވާ',
      saveRecipe: 'ރެސިޕީ ސޭވް ކުރޭ',
    },
  };

  const t = translations[language];

  const [title, setTitle] = useState('');
  const [titleDv, setTitleDv] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptDv, setExcerptDv] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadOption, setVideoUploadOption] = useState<'cloudinary' | 'github'>('github');
  const [imageUploadOption, setImageUploadOption] = useState<'imgbb' | 'cloudinary'>('imgbb');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [readingTime, setReadingTime] = useState(language === 'en' ? '5 min' : '5މިނިޓް');
  const [body, setBody] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [trending, setTrending] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [englishText, setEnglishText] = useState('');
  const [dhivehiText, setDhivehiText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleDv, setEditTitleDv] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editExcerptDv, setEditExcerptDv] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editYoutubeLink, setEditYoutubeLink] = useState('');
  const [editTiktokLink, setEditTiktokLink] = useState('');
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editVideoUploadOption, setEditVideoUploadOption] = useState<'cloudinary' | 'github'>('github');
  const [editImageUploadOption, setEditImageUploadOption] = useState<'imgbb' | 'cloudinary'>('imgbb');
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [editBodyEn, setEditBodyEn] = useState('');
  const [editReadingTime, setEditReadingTime] = useState('5މިނިޓް');
  const [editTrending, setEditTrending] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editBreaking, setEditBreaking] = useState(false);
  
  // News Rephrase state
  const [rephraseUrl, setRephraseUrl] = useState('');
  const [fetchedContent, setFetchedContent] = useState('');
  const [fetchedTitle, setFetchedTitle] = useState('');
  const [fetchedExcerpt, setFetchedExcerpt] = useState('');
  const [fetchedBody, setFetchedBody] = useState('');
  const [rephrasedTitle, setRephrasedTitle] = useState('');
  const [rephrasedExcerpt, setRephrasedExcerpt] = useState('');
  const [rephrasedBody, setRephrasedBody] = useState('');
  const [rephrasedTitleDv, setRephrasedTitleDv] = useState('');
  const [rephrasedExcerptDv, setRephrasedExcerptDv] = useState('');
  const [rephrasedBodyDv, setRephrasedBodyDv] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  
  // Authors list for dropdown
  const [authors, setAuthors] = useState<string[]>([]);
  
  // Image Generator state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [overlayText2, setOverlayText2] = useState('');
  const [bannerColor, setBannerColor] = useState('#000000');
  const [gradientColor, setGradientColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontStyle, setFontStyle] = useState<'normal' | 'bold' | 'italic' | 'bold italic'>('bold');
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'>('top-right');
  const [logoOpacity, setLogoOpacity] = useState(100);
  const [textPosition, setTextPosition] = useState<'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right' | 'middle-center' | 'middle-left' | 'middle-right'>('bottom-center');
  const [textPosition2, setTextPosition2] = useState<'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right' | 'middle-center' | 'middle-left' | 'middle-right'>('bottom-center');
  const [gradientLocation, setGradientLocation] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Post-launch checklist state
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: 'addGoogleSearchConsole', completed: false },
    { id: 2, text: 'addGoogleTagManager', completed: false },
    { id: 3, text: 'addGoogleAnalytics', completed: false },
    { id: 4, text: 'addMicrosoftClarity', completed: false },
    { id: 5, text: 'addBingWebmaster', completed: false },
    { id: 6, text: 'doKeywordResearch', completed: false },
    { id: 7, text: 'createKeywordClusters', completed: false },
    { id: 8, text: 'createMetaTitles', completed: false },
    { id: 9, text: 'createLocationPages', completed: false },
    { id: 10, text: 'createServicePages', completed: false },
    { id: 11, text: 'createUniqueContent', completed: false },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dhivehiFontRef = useRef<FontFace | null>(null);
  
  // Job Flyers state
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [flyerCanvas, setFlyerCanvas] = useState<HTMLCanvasElement | null>(null);
  const [generatingFlyer, setGeneratingFlyer] = useState(false);
  const [flyerPlatform, setFlyerPlatform] = useState<'facebook' | 'instagram-square' | 'instagram-portrait'>('facebook');
  
  // Quote Posters state
  const [quotePhoto, setQuotePhoto] = useState<File | null>(null);
  const [quotePhotoUrl, setQuotePhotoUrl] = useState<string>('');
  const [quoteHeading, setQuoteHeading] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCanvas, setQuoteCanvas] = useState<HTMLCanvasElement | null>(null);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [quotePlatform, setQuotePlatform] = useState<'facebook' | 'instagram-square' | 'instagram-portrait'>('facebook');
  
  // Quote Poster controls
  const [imageZoom, setImageZoom] = useState(100);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [textSize, setTextSize] = useState(49);
  const [headingSize, setHeadingSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.25);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [headingX, setHeadingX] = useState(50);
  const [headingY, setHeadingY] = useState(50);
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textTransparency, setTextTransparency] = useState(100);
  const [textBackgroundColor, setTextBackgroundColor] = useState('#000000');
  const [textBackgroundTransparency, setTextBackgroundTransparency] = useState(50);
  const [headingTextColor, setHeadingTextColor] = useState('#ffffff');
  const [headingBackgroundColor, setHeadingBackgroundColor] = useState('#000000');
  const [headingBackgroundTransparency, setHeadingBackgroundTransparency] = useState(50);
  const [quoteLogos, setQuoteLogos] = useState([
    { id: 1, x: 85, y: 85, opacity: 90, image: '/HAWA LOGO.jpg' }
  ]);

  // Social video state - moved before useEffect to fix initialization error
  const [videoPlatform, setVideoPlatform] = useState<'facebook-reels' | 'tiktok' | 'youtube-shorts' | 'youtube-video'>('facebook-reels');
  const [reelImages, setReelImages] = useState<File[]>([]);
  const [reelImageUrls, setReelImageUrls] = useState<string[]>([]);
  const [reelText, setReelText] = useState('');
  const [textSlides, setTextSlides] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingSlides, setIsPlayingSlides] = useState(false);
  const [reelDuration, setReelDuration] = useState(5);
  const [reelTransition, setReelTransition] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [reelCanvas, setReelCanvas] = useState<HTMLCanvasElement | null>(null);
  const [generatingReel, setGeneratingReel] = useState(false);
  const [reelVideoUrl, setReelVideoUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hashtags, setHashtags] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [imageControls, setImageControls] = useState<{ [key: number]: { zoom: number; x: number; y: number } }>({});
  const [selectedImageControl, setSelectedImageControl] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [reelLogoPosition, setReelLogoPosition] = useState({ x: 50, y: 50 });
  const [reelLogoOpacity, setReelLogoOpacity] = useState(80);
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null);

  // Auto-slide animation for text slides
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlayingSlides && textSlides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev >= textSlides.length - 1) {
            setIsPlayingSlides(false);
            return 0;
          }
          return prev + 1;
        });
      }, reelDuration * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingSlides, textSlides.length, reelDuration]);

  // Update reelText when current slide changes
  useEffect(() => {
    if (textSlides.length > 0) {
      setReelText(textSlides[currentSlideIndex]);
    }
  }, [currentSlideIndex, textSlides]);

  // Function to split text into slides for TikTok
  const splitTextIntoSlides = (text: string, maxCharsPerSlide: number = 100): string[] => {
    if (!text) return [];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const slides: string[] = [];
    let currentSlide = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if ((currentSlide + ' ' + trimmedSentence).length <= maxCharsPerSlide) {
        currentSlide = currentSlide ? currentSlide + '. ' + trimmedSentence : trimmedSentence;
      } else {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = trimmedSentence;
        
        // If a single sentence is too long, split it by words
        if (trimmedSentence.length > maxCharsPerSlide) {
          const words = trimmedSentence.split(' ');
          currentSlide = '';
          for (const word of words) {
            if ((currentSlide + ' ' + word).length <= maxCharsPerSlide) {
              currentSlide = currentSlide ? currentSlide + ' ' + word : word;
            } else {
              if (currentSlide) {
                slides.push(currentSlide);
              }
              currentSlide = word;
            }
          }
        }
      }
    }
    
    if (currentSlide) {
      slides.push(currentSlide);
    }
    
    return slides.length > 0 ? slides : [text.slice(0, maxCharsPerSlide)];
  };

  // Update article selection handler to split text into slides
  const handleArticleSelect = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setSelectedArticle(article || null);
    
    if (article && autoGenerate) {
      // Use full article content for slides, not just title
      const fullText = article.content || article.title || '';
      const slides = splitTextIntoSlides(fullText, 80); // 80 chars per slide for TikTok
      setTextSlides(slides);
      setReelText(slides[0] || article.title || '');
      setHashtags(`#${article.category || 'news'} #${language === 'dv' ? 'ހަވާދަވެރިން' : 'HawaDaily'} #${language === 'dv' ? 'ދިވެހިބަސް' : 'Maldives'}`);
    }
  };

  // Recipes state
  const [recipesList, setRecipesList] = useState<any[]>([]);
  const [recipeTitleDv, setRecipeTitleDv] = useState('');
  const [recipeTitleEn, setRecipeTitleEn] = useState('');
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [recipeImageUrl, setRecipeImageUrl] = useState('');
  const [recipeImageUrlInput, setRecipeImageUrlInput] = useState('');
  const [recipeIngredientsDv, setRecipeIngredientsDv] = useState('');
  const [recipeIngredientsEn, setRecipeIngredientsEn] = useState('');
  const [recipeInstructionsDv, setRecipeInstructionsDv] = useState('');
  const [recipeInstructionsEn, setRecipeInstructionsEn] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('');
  const [recipePrepTime, setRecipePrepTime] = useState('');
  const [recipeCookTime, setRecipeCookTime] = useState('');
  const [recipeServings, setRecipeServings] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [submittingRecipe, setSubmittingRecipe] = useState(false);
  const [savingAllRecipes, setSavingAllRecipes] = useState(false);
  const [importingHedhikaa, setImportingHedhikaa] = useState(false);
  const [importingNadiyasKitchen, setImportingNadiyasKitchen] = useState(false);
  const [importingLonumedhu, setImportingLonumedhu] = useState(false);
  const [bulkUploadingImages, setBulkUploadingImages] = useState(false);
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([]);

  // Live preview update
  useEffect(() => {
    if (quotePhotoUrl && quoteCanvas) {
      generateQuotePoster();
    }
  }, [imageZoom, imageX, imageY, textSize, headingSize, lineHeight, textAlign, headingX, headingY, textX, textY, textColor, textTransparency, textBackgroundColor, textBackgroundTransparency, headingTextColor, headingBackgroundColor, headingBackgroundTransparency, quoteLogos, quotePlatform, quoteHeading, quoteText]);

  // Load Dhivehi font
  useEffect(() => {
    const font = new FontFace('Dhivehi', 'url(/fonts/Dhivehi.ttf)');
    font.load().then((loadedFont) => {
      dhivehiFontRef.current = loadedFont;
      document.fonts.add(loadedFont);
    }).catch((error) => {
      console.error('Failed to load Dhivehi font:', error);
    });
  }, []);

  // Fetch jobs for flyers
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(
          collection(db, 'jobs'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(jobsQuery);
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Use fallback jobs if Firebase fails
        setJobs(fallbackJobs);
      }
    };

    fetchJobs();
  }, []);

  // Fetch recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesQuery = query(collection(db, 'recipes'), orderBy('id'));
        const snapshot = await getDocs(recipesQuery);
        const recipesData = snapshot.docs.map(doc => doc.data());
        setRecipesList(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  // Fetch page visit stats
  useEffect(() => {
    const fetchPageStats = async () => {
      try {
        const pages = ['recipes', 'jobs', 'home', 'quran'];
        const stats = await Promise.all(
          pages.map(async (page) => {
            try {
              const countRef = doc(db, 'page-stats', page, 'visits', 'count');
              const countSnap = await getDoc(countRef);
              return { page, count: countSnap.data()?.count || 0 };
            } catch (error) {
              console.error(`Error fetching ${page} stats:`, error);
              return { page, count: 0 };
            }
          })
        );

        stats.forEach(({ page, count }) => {
          if (page === 'recipes') setRecipesVisits(count);
          if (page === 'jobs') setJobsVisits(count);
          if (page === 'home') setHomeVisits(count);
          if (page === 'quran') setQuranVisits(count);
        });
      } catch (error) {
        console.error('Error fetching page stats:', error);
      }
    };

    fetchPageStats();
  }, []);

  // Real-time preview regeneration
  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Add gradient overlay (transparent at one end, color at the other)
      const gradientHeight = canvas.height / 2;
      let gradientStartY, gradientEndY;
      
      // Calculate gradient position based on selected location
      // The gradient always fades from transparent to opaque in the same direction
      switch (gradientLocation) {
        case 'top':
          gradientStartY = 0;
          gradientEndY = gradientHeight;
          break;
        case 'middle':
          gradientStartY = (canvas.height - gradientHeight) / 2;
          gradientEndY = gradientStartY + gradientHeight;
          break;
        case 'bottom':
        default:
          gradientStartY = canvas.height - gradientHeight;
          gradientEndY = canvas.height;
          break;
      }
      
      const gradient = ctx.createLinearGradient(0, gradientStartY, 0, gradientEndY);
      
      // Parse hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };
      
      const rgb = hexToRgb(gradientColor);
      
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);      // 100% transparent (top)
      gradient.addColorStop(0.15, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);  // 95% transparent
      gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);   // 85% transparent
      gradient.addColorStop(0.45, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);  // 65% transparent
      gradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);    // 40% transparent
      gradient.addColorStop(0.75, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);   // 20% transparent
      gradient.addColorStop(0.9, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`);   // 5% transparent
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);      // 0% transparent (fully opaque)
      ctx.fillStyle = gradient;
      ctx.fillRect(0, gradientStartY, canvas.width, gradientHeight);

      const logo = new Image();
      logo.onload = () => {
        const logoSize = Math.min(canvas.width, canvas.height) * 0.15;
        const logoPadding = 20;
        
        // Calculate logo position (3x3 grid)
        let logoX, logoY;
        const [vertical, horizontal] = logoPosition.split('-');
        
        switch (horizontal) {
          case 'left':
            logoX = logoPadding;
            break;
          case 'center':
            logoX = (canvas.width - logoSize) / 2;
            break;
          case 'right':
            logoX = canvas.width - logoSize - logoPadding;
            break;
          default:
            logoX = canvas.width - logoSize - logoPadding;
        }
        
        switch (vertical) {
          case 'top':
            logoY = logoPadding;
            break;
          case 'middle':
            logoY = (canvas.height - logoSize) / 2;
            break;
          case 'bottom':
            logoY = canvas.height - logoSize - logoPadding;
            break;
          default:
            logoY = logoPadding;
        }
        
        // Apply logo opacity
        ctx.globalAlpha = logoOpacity / 100;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.globalAlpha = 1;

        // Draw text lines with independent positions
        const fontName = dhivehiFontRef.current ? 'Dhivehi' : 'Arial';
        ctx.font = `${fontStyle} ${fontSize}px ${fontName}`;

        const textHeight = fontSize * 1.5;
        const bannerPadding = 20;
        const textSpacing = 10;
        
        // Calculate positions for both text lines
        let text1Y, text2Y;
        const [text1Vertical, text1Horizontal] = textPosition.split('-');
        const [text2Vertical, text2Horizontal] = textPosition2.split('-');
        
        // Calculate Y position helper
        const calculateY = (vertical: string, offset: number = 0) => {
          switch (vertical) {
            case 'top':
              return 20 + textHeight + offset;
            case 'middle':
              return canvas.height / 2 + textHeight / 2 + offset;
            case 'bottom':
              return canvas.height - 20 + offset;
            default:
              const isBottom = vertical === 'bottom';
              return isBottom ? canvas.height - 20 + offset : canvas.height - 20 + offset;
          }
        };
        
        // If both texts exist and share the same vertical position, stack them
        if (overlayText && overlayText2 && text1Vertical === text2Vertical) {
          const baseY = calculateY(text1Vertical);
          text1Y = baseY - textHeight - textSpacing;
          text2Y = baseY;
        } else {
          text1Y = overlayText ? calculateY(text1Vertical) : 0;
          text2Y = overlayText2 ? calculateY(text2Vertical) : 0;
        }
        
        // Draw first text line if exists
        if (overlayText) {
          let textX;
          
          switch (text1Horizontal) {
            case 'left':
              textX = bannerPadding + 50;
              ctx.textAlign = 'left';
              break;
            case 'center':
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
              break;
            case 'right':
              textX = canvas.width - bannerPadding - 50;
              ctx.textAlign = 'right';
              break;
            default:
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
          }
          
          ctx.textBaseline = 'bottom';
          const textMetrics = ctx.measureText(overlayText);
          const textWidth = textMetrics.width;

          let bannerX, bannerWidth;
          if (ctx.textAlign === 'center') {
            bannerX = textX - textWidth / 2 - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else if (ctx.textAlign === 'left') {
            bannerX = textX - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else {
            bannerX = textX - textWidth - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          }

          // Remove text background - gradient overlay provides contrast
          ctx.fillStyle = fontColor;
          ctx.fillText(overlayText, textX, text1Y);
        }
        
        // Draw second text line if exists with independent position
        if (overlayText2) {
          let textX;
          
          switch (text2Horizontal) {
            case 'left':
              textX = bannerPadding + 50;
              ctx.textAlign = 'left';
              break;
            case 'center':
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
              break;
            case 'right':
              textX = canvas.width - bannerPadding - 50;
              ctx.textAlign = 'right';
              break;
            default:
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
          }
          
          ctx.textBaseline = 'bottom';
          const textMetrics = ctx.measureText(overlayText2);
          const textWidth = textMetrics.width;

          let bannerX, bannerWidth;
          if (ctx.textAlign === 'center') {
            bannerX = textX - textWidth / 2 - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else if (ctx.textAlign === 'left') {
            bannerX = textX - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else {
            bannerX = textX - textWidth - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          }

          // Remove text background - gradient overlay provides contrast
          ctx.fillStyle = fontColor;
          ctx.fillText(overlayText2, textX, text2Y);
        }

        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
      };

      logo.onerror = () => {
        // Add gradient overlay (transparent at one end, color at the other)
        const gradientHeight = canvas.height / 2;
        let gradientStartY, gradientEndY;
        
        // Calculate gradient position based on selected location
        // The gradient always fades from transparent to opaque in the same direction
        switch (gradientLocation) {
          case 'top':
            gradientStartY = 0;
            gradientEndY = gradientHeight;
            break;
          case 'middle':
            gradientStartY = (canvas.height - gradientHeight) / 2;
            gradientEndY = gradientStartY + gradientHeight;
            break;
          case 'bottom':
          default:
            gradientStartY = canvas.height - gradientHeight;
            gradientEndY = canvas.height;
            break;
        }
        
        const gradient = ctx.createLinearGradient(0, gradientStartY, 0, gradientEndY);
        
        // Parse hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 0, g: 0, b: 0 };
        };
        
        const rgb = hexToRgb(gradientColor);
        
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);      // 100% transparent (top)
        gradient.addColorStop(0.15, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);  // 95% transparent
        gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);   // 85% transparent
        gradient.addColorStop(0.45, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);  // 65% transparent
        gradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);    // 40% transparent
        gradient.addColorStop(0.75, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);   // 20% transparent
        gradient.addColorStop(0.9, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`);   // 5% transparent
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);      // 0% transparent (fully opaque)
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradientStartY, canvas.width, gradientHeight);

        // Draw text lines without logo with independent positions
        const fontName = dhivehiFontRef.current ? 'Dhivehi' : 'Arial';
        ctx.font = `${fontStyle} ${fontSize}px ${fontName}`;

        const textHeight = fontSize * 1.5;
        const bannerPadding = 20;
        const textSpacing = 10;
        
        // Calculate positions for both text lines
        let text1Y, text2Y;
        const [text1Vertical, text1Horizontal] = textPosition.split('-');
        const [text2Vertical, text2Horizontal] = textPosition2.split('-');
        
        // Calculate Y position helper
        const calculateY = (vertical: string, offset: number = 0) => {
          switch (vertical) {
            case 'top':
              return 20 + textHeight + offset;
            case 'middle':
              return canvas.height / 2 + textHeight / 2 + offset;
            case 'bottom':
              return canvas.height - 20 + offset;
            default:
              return canvas.height - 20 + offset;
          }
        };
        
        // If both texts exist and share the same vertical position, stack them
        if (overlayText && overlayText2 && text1Vertical === text2Vertical) {
          const baseY = calculateY(text1Vertical);
          text1Y = baseY - textHeight - textSpacing;
          text2Y = baseY;
        } else {
          text1Y = overlayText ? calculateY(text1Vertical) : 0;
          text2Y = overlayText2 ? calculateY(text2Vertical) : 0;
        }
        
        // Draw first text line if exists
        if (overlayText) {
          let textX;
          
          switch (text1Horizontal) {
            case 'left':
              textX = bannerPadding + 50;
              ctx.textAlign = 'left';
              break;
            case 'center':
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
              break;
            case 'right':
              textX = canvas.width - bannerPadding - 50;
              ctx.textAlign = 'right';
              break;
            default:
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
          }
          
          ctx.textBaseline = 'bottom';
          const textMetrics = ctx.measureText(overlayText);
          const textWidth = textMetrics.width;

          let bannerX, bannerWidth;
          if (ctx.textAlign === 'center') {
            bannerX = textX - textWidth / 2 - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else if (ctx.textAlign === 'left') {
            bannerX = textX - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else {
            bannerX = textX - textWidth - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          }

          // Remove text background - gradient overlay provides contrast
          ctx.fillStyle = fontColor;
          ctx.fillText(overlayText, textX, text1Y);
        }
        
        // Draw second text line if exists with independent position
        if (overlayText2) {
          let textX;
          
          switch (text2Horizontal) {
            case 'left':
              textX = bannerPadding + 50;
              ctx.textAlign = 'left';
              break;
            case 'center':
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
              break;
            case 'right':
              textX = canvas.width - bannerPadding - 50;
              ctx.textAlign = 'right';
              break;
            default:
              textX = canvas.width / 2;
              ctx.textAlign = 'center';
          }
          
          ctx.textBaseline = 'bottom';
          const textMetrics = ctx.measureText(overlayText2);
          const textWidth = textMetrics.width;

          let bannerX, bannerWidth;
          if (ctx.textAlign === 'center') {
            bannerX = textX - textWidth / 2 - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else if (ctx.textAlign === 'left') {
            bannerX = textX - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          } else {
            bannerX = textX - textWidth - bannerPadding;
            bannerWidth = textWidth + bannerPadding * 2;
          }

          // Remove text background - gradient overlay provides contrast
          ctx.fillStyle = fontColor;
          ctx.fillText(overlayText2, textX, text2Y);
        }

        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
      };

      logo.src = '/HAWA LOGO.jpg';
    };

    img.src = uploadedImage;
  }, [uploadedImage, overlayText, overlayText2, bannerColor, gradientColor, fontSize, fontColor, fontStyle, logoPosition, logoOpacity, textPosition, textPosition2, gradientLocation]);

  // Article image upload state
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [uploadingArticle, setUploadingArticle] = useState(false);
  const [editArticleFile, setEditArticleFile] = useState<File | null>(null);
  const [uploadingEditArticle, setUploadingEditArticle] = useState(false);
  
  // Banner management state
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerLocation, setBannerLocation] = useState<'home' | 'article' | 'category'>('home');
  const [bannerPosition, setBannerPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const [bannerSize, setBannerSize] = useState<'mobile' | 'desktop' | 'both'>('both');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');

  // Sidebar promotion management state
  const [sidebarPromotions, setSidebarPromotions] = useState<any[]>([]);
  const [sidebarPromotionFile, setSidebarPromotionFile] = useState<File | null>(null);
  const [sidebarPromotionTitle, setSidebarPromotionTitle] = useState('');
  const [sidebarPromotionLink, setSidebarPromotionLink] = useState('');
  const [sidebarPromotionSlot, setSidebarPromotionSlot] = useState<'slot1' | 'slot2'>('slot1');
  const [uploadingSidebarPromotion, setUploadingSidebarPromotion] = useState(false);
  const [sidebarPromotionError, setSidebarPromotionError] = useState('');

  // Mid-article promotion management state
  const [midArticlePromotions, setMidArticlePromotions] = useState<any[]>([]);
  const [midArticlePromotionFile, setMidArticlePromotionFile] = useState<File | null>(null);
  const [midArticlePromotionTitle, setMidArticlePromotionTitle] = useState('');
  const [midArticlePromotionLink, setMidArticlePromotionLink] = useState('');
  const [uploadingMidArticlePromotion, setUploadingMidArticlePromotion] = useState(false);
  const [midArticlePromotionError, setMidArticlePromotionError] = useState('');

  // Advertisement management state
  const [advertisements, setAdvertisements] = useState<any>({});
  const [advertisementFile, setAdvertisementFile] = useState<File | null>(null);
  const [selectedAdSlot, setSelectedAdSlot] = useState<string>('');
  const [uploadingAdvertisement, setUploadingAdvertisement] = useState(false);
  const [advertisementError, setAdvertisementError] = useState('');

  const advertisementSlots = [
    { id: 'ad-doctors-left-tall-160x384', label: 'Doctors Left Tall (160x384)', page: 'Doctors Duty', side: 'Left' },
    { id: 'ad-doctors-left-medium-160x256', label: 'Doctors Left Medium (160x256)', page: 'Doctors Duty', side: 'Left' },
    { id: 'ad-doctors-left-medium-160x256-2', label: 'Doctors Left Medium 2 (160x256)', page: 'Doctors Duty', side: 'Left' },
    { id: 'ad-doctors-right-tall-160x384', label: 'Doctors Right Tall (160x384)', page: 'Doctors Duty', side: 'Right' },
    { id: 'ad-doctors-right-medium-160x256', label: 'Doctors Right Medium (160x256)', page: 'Doctors Duty', side: 'Right' },
    { id: 'ad-doctors-right-medium-160x256-2', label: 'Doctors Right Medium 2 (160x256)', page: 'Doctors Duty', side: 'Right' },
    { id: 'ad-recipes-left-tall-160x384', label: 'Recipes Left Tall (160x384)', page: 'Recipes', side: 'Left' },
    { id: 'ad-recipes-left-medium-160x256', label: 'Recipes Left Medium (160x256)', page: 'Recipes', side: 'Left' },
    { id: 'ad-recipes-left-medium-160x256-2', label: 'Recipes Left Medium 2 (160x256)', page: 'Recipes', side: 'Left' },
    { id: 'ad-recipes-right-tall-160x384', label: 'Recipes Right Tall (160x384)', page: 'Recipes', side: 'Right' },
    { id: 'ad-recipes-right-medium-160x256', label: 'Recipes Right Medium (160x256)', page: 'Recipes', side: 'Right' },
    { id: 'ad-recipes-right-medium-160x256-2', label: 'Recipes Right Medium 2 (160x256)', page: 'Recipes', side: 'Right' },
  ];

  // Hero slides management state
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [selectedHeroArticle, setSelectedHeroArticle] = useState<string>('');
  const [updatingHeroSlides, setUpdatingHeroSlides] = useState(false);
  const [heroSlidesError, setHeroSlidesError] = useState('');

  // Stories management state
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [storyAuthor, setStoryAuthor] = useState('');
  const [storyCoverImage, setStoryCoverImage] = useState<File | null>(null);
  const [storyYoutubeLink, setStoryYoutubeLink] = useState('');
  const [storyTiktokLink, setStoryTiktokLink] = useState('');
  const [storyStatus, setStoryStatus] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [storyReleaseDate, setStoryReleaseDate] = useState('');
  const [storyLocked, setStoryLocked] = useState(true);
  const [editingStory, setEditingStory] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [storyError, setStoryError] = useState('');

  // Golden Time management state
  const [goldenTimeArticles, setGoldenTimeArticles] = useState<any[]>([]);
  const [selectedGoldenTimeArticle, setSelectedGoldenTimeArticle] = useState<any | null>(null);
  const [goldenTimeTitle, setGoldenTimeTitle] = useState('');
  const [goldenTimeDescription, setGoldenTimeDescription] = useState('');
  const [goldenTimeAuthor, setGoldenTimeAuthor] = useState('ހަވާ ޑެއިލީ');
  const [goldenTimeCoverImage, setGoldenTimeCoverImage] = useState<File | null>(null);
  const [goldenTimeYear, setGoldenTimeYear] = useState('');
  const [goldenTimeCategory, setGoldenTimeCategory] = useState('ދިރިއުޅުމުގެ ވައްޓަފާޅު، ކުޑަކުދިން، ސަގާފަތް');
  const [goldenTimeContent, setGoldenTimeContent] = useState('');
  const [goldenTimeYoutubeLink, setGoldenTimeYoutubeLink] = useState('');
  const [goldenTimeTiktokLink, setGoldenTimeTiktokLink] = useState('');
  const [editingGoldenTime, setEditingGoldenTime] = useState(false);
  const [uploadingGoldenTime, setUploadingGoldenTime] = useState(false);
  const [goldenTimeError, setGoldenTimeError] = useState('');
  const [savedAuthors, setSavedAuthors] = useState<string[]>([]);
  const [addGoldenTimeLogo, setAddGoldenTimeLogo] = useState(false);
  const [goldenTimeLogoOpacity, setGoldenTimeLogoOpacity] = useState(0.9);
  const [goldenTimeLogoXPercent, setGoldenTimeLogoXPercent] = useState(90);
  const [goldenTimeLogoYPercent, setGoldenTimeLogoYPercent] = useState(90);
  const [goldenTimeLogoSizePercent, setGoldenTimeLogoSizePercent] = useState(15);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [migratingSlugs, setMigratingSlugs] = useState(false);
  const [migrationResult, setMigrationResult] = useState('');

  // Obituary maker state
  const [obituaryName, setObituaryName] = useState('');
  const [obituaryAddress, setObituaryAddress] = useState('');
  const [obituaryBirthYear, setObituaryBirthYear] = useState('');
  const [obituaryDeathYear, setObituaryDeathYear] = useState('');
  const [obituaryPortrait, setObituaryPortrait] = useState<File | null>(null);
  const [obituaryPreview, setObituaryPreview] = useState<string | null>(null);
  const [generatingObituary, setGeneratingObituary] = useState(false);

  // Funeral poster state
  const [funeralName, setFuneralName] = useState('');
  const [funeralAddress, setFuneralAddress] = useState('');
  const [funeralAge, setFuneralAge] = useState('');
  const [funeralPrayerLocation, setFuneralPrayerLocation] = useState('');
  const [funeralBurialLocation, setFuneralBurialLocation] = useState('');
  const [funeralDeathDate, setFuneralDeathDate] = useState('');
  const [funeralPrayerDate, setFuneralPrayerDate] = useState('');
  const [funeralPhoto, setFuneralPhoto] = useState<File | null>(null);
  const [funeralContact1, setFuneralContact1] = useState('');
  const [funeralContact2, setFuneralContact2] = useState('');
  const [funeralPreview, setFuneralPreview] = useState<string | null>(null);
  const [generatingFuneralPoster, setGeneratingFuneralPoster] = useState(false);

  // Generate obituary preview
  const generateObituary = async () => {
    if (!obituaryName) {
      alert('ނަން ފުރިހަމަ ކުރައްވާ / Please enter name');
      return;
    }

    setGeneratingObituary(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Set canvas size (1:1.5 aspect ratio, 800x1200)
      canvas.width = 1600;
      canvas.height = 1800;

      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = '/images/backgorund thauziaya.jfif';
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Load top image
      const topImg = new Image();
      topImg.crossOrigin = 'anonymous';
      topImg.src = '/images/Inna-lillahi-wa-inna-ilayhi-rajiun-scaled.png';
      
      await new Promise((resolve, reject) => {
        topImg.onload = resolve;
        topImg.onerror = reject;
      });

      // Draw top image centered maintaining aspect ratio
      const maxTopWidth = canvas.width * 0.5;
      const topImgRatio = topImg.width / topImg.height;
      let topImgWidth = topImg.width;
      let topImgHeight = topImg.height;
      
      if (topImgWidth > maxTopWidth) {
        topImgWidth = maxTopWidth;
        topImgHeight = topImgWidth / topImgRatio;
      }
      
      const topImgX = (canvas.width - topImgWidth) / 2;
      ctx.drawImage(topImg, topImgX, 60, topImgWidth, topImgHeight);

      // Load logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/logo.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });

      // Draw logo at bottom right maintaining aspect ratio
      const maxLogoWidth = 200;
      const logoRatio = logoImg.width / logoImg.height;
      let logoWidth = logoImg.width;
      let logoHeight = logoImg.height;
      
      if (logoWidth > maxLogoWidth) {
        logoWidth = maxLogoWidth;
        logoHeight = logoWidth / logoRatio;
      }
      
      ctx.drawImage(logoImg, canvas.width - logoWidth - 30, canvas.height - logoHeight - 30, logoWidth, logoHeight);

      // Draw portrait if uploaded
      if (obituaryPortrait) {
        const portraitDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(obituaryPortrait);
        });

        const portraitImg = new Image();
        await new Promise((resolve) => {
          portraitImg.onload = resolve;
          portraitImg.src = portraitDataUrl;
        });

        // Draw portrait in rectangle shape centered
        const portraitX = (canvas.width - 400) / 2;
        const portraitY = 360;
        const portraitSize = 400;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(portraitX, portraitY, portraitSize, portraitSize);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(portraitImg, portraitX, portraitY, portraitSize, portraitSize);
        ctx.restore();

        // Draw border around portrait
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.rect(portraitX, portraitY, portraitSize, portraitSize);
        ctx.stroke();
      }

      if (document.fonts && 'load' in document.fonts) {
        await document.fonts.ready;
        await document.fonts.load('700 84px "Dhivehi"');
        await document.fonts.load('400 40px "Dhivehi"');
        await document.fonts.load('700 56px "Dhivehi"');
      }

      // Set text styles
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw name
      ctx.font = '700 64px "Dhivehi", sans-serif';
      ctx.fillText(obituaryName, canvas.width / 2, 840);

      // Draw address
      ctx.font = '400 52px "Dhivehi", sans-serif';
      if (obituaryAddress) {
        ctx.fillText(obituaryAddress, canvas.width / 2, 940);
      }

      // Draw birth and death years
      ctx.font = '700 56px sans-serif';
      if (obituaryBirthYear && obituaryDeathYear) {
        ctx.fillText(`${obituaryBirthYear} - ${obituaryDeathYear}`, canvas.width / 2, 1040);
      } else if (obituaryBirthYear) {
        ctx.fillText(obituaryBirthYear, canvas.width / 2, 1040);
      } else if (obituaryDeathYear) {
        ctx.fillText(obituaryDeathYear, canvas.width / 2, 1040);
      }

      // Draw condolence message with Dhivehi font and wrapping
      ctx.font = '620 60px "Dhivehi", sans-serif';
      ctx.textAlign = 'center';
      const message = `އަޅުގަނޑުމެން (ހަވާ ޑެއިލީ) ގެ އިޙުލާޞްތެރި ތަޢުޒިޔާ

${obituaryName}ގެ ލޮބުވެތި މައިންބަފައިންނާ ޢާއިލާއަށް ދަންނަވަން
މާތް ﷲގެ ރުއްސެވުމާއި ފުއްސެވުމުގައި، އަދި ސުވަރުގޭގެ މަތިވެރި ނިޢުމަތާއި ރަޙްމަތުގައި ލަހައްޓަވާށި

އާމިން`;

      const maxWidth = canvas.width - 240;
      const wrappedLineHeight = 100;
      const paragraphSpacing = -6;
      const x = canvas.width / 2;
      let y = 1140;

      // Split by explicit line breaks first
      const paragraphs = message.split('\n');

      for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        let line = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = line ? `${line} ${words[i]}` : words[i];
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, y);
            line = words[i];
            y += wrappedLineHeight;
          } else {
            line = testLine;
          }
        }

        if (line) {
          ctx.fillText(line, x, y);
          y += wrappedLineHeight;
        }

        // Add extra spacing between paragraphs
        y += paragraphSpacing;
      }

      // Set preview
      setObituaryPreview(canvas.toDataURL('image/jpeg', 0.9));
    } catch (error) {
      console.error('Error generating obituary:', error);
      alert('އުނިކުރެއްވުނީ / Error generating obituary');
    } finally {
      setGeneratingObituary(false);
    }
  };

  // Generate funeral poster preview
  const generateFuneralPoster = async () => {
    if (!funeralName) {
      alert('ނަން ފުރިހަމަ ކުރައްވާ / Please enter name');
      return;
    }

    setGeneratingFuneralPoster(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Set canvas size (800x1000 scaled to 1600x2000 for high quality)
      canvas.width = 1600;
      canvas.height = 2000;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load fonts
      if (document.fonts && 'load' in document.fonts) {
        await document.fonts.ready;
        await document.fonts.load('700 60px "Dhivehi"');
        await document.fonts.load('400 40px "Dhivehi"');
        await document.fonts.load('700 50px "Dhivehi"');
        await document.fonts.load('700 40px "Dhivehi"');
      }

      // Top section - Photo on left
      if (funeralPhoto) {
        const photoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(funeralPhoto);
        });

        const photoImg = new Image();
        await new Promise((resolve) => {
          photoImg.onload = resolve;
          photoImg.src = photoDataUrl;
        });

        // Draw photo with border
        const photoX = 80;
        const photoY = 80;
        const photoWidth = 288;
        const photoHeight = 384;

        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
      }

      // Top section - Center/Right header
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Bismillah
      ctx.font = '700 60px serif';
      ctx.fillText('﷽', canvas.width / 2, 100);

      // KASHUNAMAADHUMV
      ctx.font = '700 50px sans-serif';
      ctx.fillText('KASHUNAMAADHUMV', canvas.width / 2, 180);

      // صلاة الجنازة
      ctx.font = '400 40px sans-serif';
      ctx.fillText('صلاة الجنازة', canvas.width / 2, 240);

      // Main title
      ctx.font = '700 60px "Dhivehi", sans-serif';
      ctx.fillText('ޖނާޒާގެ މަޢުލޫމާތު', canvas.width / 2, 320);

      // Middle section - Right aligned details
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const detailX = canvas.width - 100;
      let detailY = 500;
      const detailSpacing = 120;
      const labelValueSpacing = 50;

      ctx.font = '400 40px "Dhivehi", sans-serif';
      ctx.fillStyle = '#6b7280';

      // Name
      ctx.fillText(':މަރުޙޫމްގެ ނަން', detailX, detailY);
      detailY += labelValueSpacing;
      ctx.fillStyle = '#000000';
      ctx.font = '700 50px "Dhivehi", sans-serif';
      ctx.fillText(funeralName, detailX - 20, detailY);
      detailY += detailSpacing;

      // Address
      if (funeralAddress) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText(':ގެއެވެސް/މަންޒިލް', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralAddress, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Age
      if (funeralAge) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText('އުމުރު:', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralAge, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Prayer location
      if (funeralPrayerLocation) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText(':ކަށުނަމާދު', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralPrayerLocation, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Burial location
      if (funeralBurialLocation) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText(':ވަޅުލުން', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralBurialLocation, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Death date
      if (funeralDeathDate) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText(':ނިޔާވި ތާރީޚް', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralDeathDate, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Prayer date (red)
      if (funeralPrayerDate) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 40px "Dhivehi", sans-serif';
        ctx.fillText(':ކަށުނަމާދު ތާރީޚް', detailX, detailY);
        detailY += labelValueSpacing;
        ctx.fillStyle = '#dc2626';
        ctx.font = '700 50px "Dhivehi", sans-serif';
        ctx.fillText(funeralPrayerDate, detailX - 20, detailY);
        detailY += detailSpacing;
      }

      // Footer section
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const footerY = canvas.height - 250;

      // Contact header
      ctx.fillStyle = '#000000';
      ctx.font = '400 35px "Dhivehi", sans-serif';
      ctx.fillText('ކަށުނަމާދުގެ ކަންތައްތައް ހަމަޖެއްސުމުގައި', canvas.width / 2, footerY);

      // Phone numbers
      ctx.font = '700 50px sans-serif';
      const contactText = funeralContact1 && funeralContact2 
        ? `${funeralContact1} / ${funeralContact2}`
        : funeralContact1 || funeralContact2 || '';
      ctx.fillText(contactText, canvas.width / 2, footerY + 70);

      // Black bottom bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 30px "Dhivehi", sans-serif';
      ctx.fillText('ނިޔާވެފައިވާ ފަރާތްތަކުގެ މަޢުލޫމާތު ހިއްޞާކުރުން، ކަށުނަމާދާއި ކަފުންކުރުމުގެ ކަންތައްތައް...', canvas.width / 2, canvas.height - 60);

      // Set preview
      setFuneralPreview(canvas.toDataURL('image/jpeg', 0.9));
    } catch (error) {
      console.error('Error generating funeral poster:', error);
      alert('އުނިކުރެއްވުނީ / Error generating funeral poster');
    } finally {
      setGeneratingFuneralPoster(false);
    }
  };

  // Download obituary
  const downloadObituary = () => {
    if (!obituaryPreview) return;
    
    const link = document.createElement('a');
    link.download = `obituary-${obituaryName}.jpg`;
    link.href = obituaryPreview;
    link.click();
  };

  // Download funeral poster
  const downloadFuneralPoster = () => {
    if (!funeralPreview) return;
    
    const link = document.createElement('a');
    link.download = `funeral-poster-${funeralName}.jpg`;
    link.href = funeralPreview;
    link.click();
  };

  // Auto-generate preview when fields change
  useEffect(() => {
    if (obituaryName) {
      generateObituary();
    }
  }, [obituaryName, obituaryAddress, obituaryBirthYear, obituaryDeathYear, obituaryPortrait]);

  // Auto-generate funeral poster preview when fields change
  useEffect(() => {
    if (funeralName) {
      generateFuneralPoster();
    }
  }, [funeralName, funeralAddress, funeralAge, funeralPrayerLocation, funeralBurialLocation, funeralDeathDate, funeralPrayerDate, funeralPhoto, funeralContact1, funeralContact2]);

  // Generate preview when image or logo settings change
  useEffect(() => {
    if (!goldenTimeCoverImage) {
      setPreviewImageUrl(null);
      return;
    }

    const generatePreview = async () => {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return;
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            if (addGoldenTimeLogo) {
              const logo = new Image();
              logo.onload = () => {
                const logoWidth = Math.min(img.width * (goldenTimeLogoSizePercent / 100), 300);
                const logoHeight = (logoWidth / logo.width) * logo.height;
                const logoX = (canvas.width * goldenTimeLogoXPercent) / 100 - (logoWidth / 2);
                const logoY = (canvas.height * goldenTimeLogoYPercent) / 100 - (logoHeight / 2);
                
                ctx.globalAlpha = goldenTimeLogoOpacity;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);
                ctx.globalAlpha = goldenTimeLogoOpacity;
                ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
                
                setPreviewImageUrl(canvas.toDataURL('image/jpeg', 0.9));
              };
              logo.onerror = () => {
                setPreviewImageUrl(canvas.toDataURL('image/jpeg', 0.9));
              };
              logo.src = '/HAWA LOGO.jpg';
            } else {
              setPreviewImageUrl(canvas.toDataURL('image/jpeg', 0.9));
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(goldenTimeCoverImage);
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    };

    generatePreview();
  }, [goldenTimeCoverImage, addGoldenTimeLogo, goldenTimeLogoOpacity, goldenTimeLogoXPercent, goldenTimeLogoYPercent, goldenTimeLogoSizePercent]);

  // Episodes management state
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeContent, setEpisodeContent] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [uploadingEpisode, setUploadingEpisode] = useState(false);
  const [episodeError, setEpisodeError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Load saved authors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('goldenTimeAuthors');
    if (saved) {
      setSavedAuthors(JSON.parse(saved));
    }
  }, []);

  // Save authors to localStorage
  const saveAuthor = (authorName: string) => {
    if (authorName && !savedAuthors.includes(authorName)) {
      const updated = [...savedAuthors, authorName];
      setSavedAuthors(updated);
      localStorage.setItem('goldenTimeAuthors', JSON.stringify(updated));
    }
  };

  const loadDashboard = async () => {
    try {
      // Get all articles for display (removed limit to show all past news)
      const articleSnapshot = await getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc')));
      const articlesData = articleSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setArticles(articlesData);
      
      // Extract unique authors from articles
      const uniqueAuthors = Array.from(new Set(articlesData.map((a: any) => a.author).filter(Boolean)));
      setAuthors(uniqueAuthors);
      
      // Load banners
      const bannerSnapshot = await getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc')));
      const bannersData = bannerSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setBanners(bannersData);

      // Load advertisements
      const advertisementsDoc = await getDoc(doc(db, 'advertisements', 'slots'));
      if (advertisementsDoc.exists()) {
        setAdvertisements(advertisementsDoc.data() || {});
      }

      // Load hero slides
      const heroSlidesDoc = await getDoc(doc(db, 'hero-slides', 'config'));
      if (heroSlidesDoc.exists()) {
        setHeroSlides(heroSlidesDoc.data()?.slides || []);
      }

      // Load sidebar promotions
      const promotionSnapshot = await getDocs(query(collection(db, 'sidebar-promotions'), orderBy('createdAt', 'desc')));
      const promotionsData = promotionSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setSidebarPromotions(promotionsData);

      // Load mid-article promotions
      const midArticlePromotionSnapshot = await getDocs(query(collection(db, 'mid-article-promotions'), orderBy('createdAt', 'desc')));
      const midArticlePromotionsData = midArticlePromotionSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setMidArticlePromotions(midArticlePromotionsData);

      // Load stories
      const storiesSnapshot = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setStories(storiesData);

      // Load golden time articles
      const goldenTimeSnapshot = await getDocs(query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc')));
      const goldenTimeData = goldenTimeSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setGoldenTimeArticles(goldenTimeData);
    } catch (error) {
      console.warn('Unable to load dashboard data', error);
    }
  };

  // Load articles count in real-time
  useEffect(() => {
    if (!user) return;

    const articlesQuery = query(collection(db, 'articles'));
    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      setArticlesCount(snapshot.size);
    }, (error) => {
      console.error('Error fetching articles count:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Load visitor tracking data from Firestore (real-time)
  useEffect(() => {
    if (!user) return;

    const visitorQuery = query(collection(db, 'visitors'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(visitorQuery, (snapshot) => {
      const visitors = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setVisitorDetails(visitors);

      // Calculate unique visitors based on deviceFingerprint (more accurate than userAgent)
      const uniqueFingerprints = new Set(visitors.map((item: any) => item.deviceFingerprint)).size;
      setUniqueVisitors(uniqueFingerprints);

      // Calculate time-based visitor statistics
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyFingerprints = new Set();
      const weeklyFingerprints = new Set();
      const monthlyFingerprints = new Set();

      visitors.forEach((visitor: any) => {
        const visitTime = visitor.timestamp?.toDate ? visitor.timestamp.toDate() : new Date(visitor.timestamp);
        
        if (visitTime >= oneDayAgo) {
          dailyFingerprints.add(visitor.deviceFingerprint);
        }
        if (visitTime >= oneWeekAgo) {
          weeklyFingerprints.add(visitor.deviceFingerprint);
        }
        if (visitTime >= oneMonthAgo) {
          monthlyFingerprints.add(visitor.deviceFingerprint);
        }
      });

      setDailyVisitors(dailyFingerprints.size);
      setWeeklyVisitors(weeklyFingerprints.size);
      setMonthlyVisitors(monthlyFingerprints.size);
    }, (error) => {
      console.error('Error fetching visitors:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate filtered visitors based on date range
  useEffect(() => {
    if (visitorDetails.length === 0) {
      setFilteredVisitorCount(0);
      return;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          setFilteredVisitorCount(0);
          return;
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const filteredFingerprints = new Set();
    visitorDetails.forEach((visitor: any) => {
      const visitTime = visitor.timestamp?.toDate ? visitor.timestamp.toDate() : new Date(visitor.timestamp);
      if (visitTime >= startDate && visitTime <= endDate) {
        filteredFingerprints.add(visitor.deviceFingerprint);
      }
    });

    setFilteredVisitorCount(filteredFingerprints.size);
  }, [visitorDetails, dateRange, customStartDate, customEndDate]);

  // Load Facebook insights
  const loadFacebookInsights = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    if (loadingInsights) return;
    setLoadingInsights(true);
    try {
      // Facebook insights removed
      setFacebookInsights(null);
    } catch (error) {
      console.error('Error loading Facebook insights:', error);
    } finally {
      setLoadingInsights(false);
    }
    return false;
  };

  // Load Vercel Analytics
  const loadVercelAnalytics = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    if (loadingVercelAnalytics) return;
    setLoadingVercelAnalytics(true);
    try {
      const result = await getVercelAnalytics();
      if (result) {
        setVercelAnalytics(result);
      } else {
        console.error('Failed to load Vercel Analytics');
      }
    } catch (error) {
      console.error('Error loading Vercel Analytics:', error);
    } finally {
      setLoadingVercelAnalytics(false);
    }
  };

  // Helper function to parse user agent for old records
  const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return { deviceType: 'Unknown', browser: 'Unknown', os: 'Unknown' };

    const uaLower = userAgent.toLowerCase();

    // Detect device type
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipod/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Detect browser
    let browser = 'other';
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

    return { deviceType, browser, os };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        loadDashboard();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleTranslate = async () => {
    if (!englishText.trim()) {
      setMessage(t.typeEnglish);
      return;
    }
    setTranslating(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|dv`
      );
      const data = await response.json();
      if (data.responseStatus === 200) {
        setDhivehiText(data.responseData.translatedText);
        setMessage(t.translated);
      } else {
        setMessage(t.translateError);
      }
    } catch (error) {
      setMessage(t.translateError);
      console.error(error);
    } finally {
      setTranslating(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMessage(t.logout);
    navigate('/admin');
  };

  const handleCreateArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setMessage(t.notLoggedIn);
      return;
    }

    setSubmitting(true);
    try {
      // Upload image if file is selected
      let finalImageUrl = imageUrl;
      if (articleFile) {
        setUploadingArticle(true);
        try {
          // Compress image before upload
          const compressedFile = await compressImage(articleFile, 1920, 0.8);
          
          if (imageUploadOption === 'imgbb') {
            try {
              finalImageUrl = await uploadToImgBB(compressedFile);
            } catch (imgbbError) {
              console.error('ImgBB upload failed, trying Cloudinary:', imgbbError);
              finalImageUrl = await uploadImage(compressedFile, 'articles');
            }
          } else {
            finalImageUrl = await uploadImage(compressedFile, 'articles');
          }
        } catch (uploadError) {
          setMessage(t.newsError + ': Failed to upload image');
          setSubmitting(false);
          setUploadingArticle(false);
          return;
        }
        setUploadingArticle(false);
      }
      
      // Upload video if file is selected
      let finalVideoUrl = videoUrl;
      if (videoFile) {
        setUploadingVideo(true);
        try {
          if (videoUploadOption === 'cloudinary') {
            finalVideoUrl = await uploadVideo(videoFile, 'videos');
          } else {
            finalVideoUrl = await uploadToGitHub(videoFile, videoFile.name);
          }
        } catch (uploadError) {
          setMessage(t.newsError + ': Failed to upload video');
          setSubmitting(false);
          setUploadingVideo(false);
          return;
        }
        setUploadingVideo(false);
      }
      
      // Generate numeric ID starting from 1000
      const articlesSnapshot = await getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(1)));
      let nextId = 1000;
      if (!articlesSnapshot.empty) {
        const lastArticle = articlesSnapshot.docs[0].data();
        const lastId = parseInt(lastArticle.id || '0');
        if (!isNaN(lastId) && lastId >= 1000) {
          nextId = lastId + 1;
        }
      }
      
      const articleId = nextId.toString();
      const slug = generateSlug(titleDv || title);
      
      await dbWithFallback.writeOperation(async (dbInstance) => {
        return setDoc(doc(dbInstance, 'articles', articleId), {
          id: articleId,
          slug,
          title: titleDv || title,
          titleEn: title,
          excerpt: excerptDv || excerpt,
          excerptEn: excerpt,
          category,
          image: finalImageUrl,
          video: finalVideoUrl,
          youtubeLink,
          tiktokLink,
          publishedAt: new Date().toLocaleDateString('dv'),
          author: author || 'Admin',
          views: 0,
          readingTime,
          body,
          bodyEn,
          trending,
          featured,
          breakingNews: breaking,
          createdAt: serverTimestamp(),
        });
      });

      setLastCreatedArticleId(articleId);
      setMessage(t.newsCreated);

      // Add author to authors list if new
      if (author && !authors.includes(author)) {
        setAuthors([...authors, author]);
      }

      // Don't reload dashboard to allow viewing console logs
      // loadDashboard();

      setTitle('');
      setTitleDv('');
      setExcerpt('');
      setExcerptDv('');
      setAuthor('');
      setImageUrl('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80');
      setArticleFile(null);
      setVideoUrl('');
      setYoutubeLink('');
      setTiktokLink('');
      setVideoFile(null);
      setBody('');
      setBodyEn('');
      setTrending(false);
      setFeatured(false);
      setBreaking(false);
      // Don't reload dashboard to allow viewing console logs
      // loadDashboard();
    } catch (error) {
      setMessage(t.newsError);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (articleId: string, facebookPostId?: string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    try {
      // Fetch article to get image URL
      const articleDoc = await getDoc(doc(db, 'articles', articleId));
      if (articleDoc.exists()) {
        const articleData = articleDoc.data();
        if (articleData?.image) {
          try {
            // Check if image is from Cloudinary
            if (articleData.image.includes('cloudinary.com')) {
              // Extract public_id from Cloudinary URL
              const urlParts = articleData.image.split('/');
              const filename = urlParts[urlParts.length - 1];
              const publicId = filename.split('.')[0];
              await deleteImage(publicId);
            } else {
              // For ImgBB/Imgur, we can only delete from database
              console.log('Image deletion not supported for non-Cloudinary URLs');
            }
          } catch (cloudinaryError) {
            console.error('Failed to delete image:', cloudinaryError);
            // Continue with database deletion even if image deletion fails
          }
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, 'articles', articleId));
      
      setMessage(t.newsDeleted);
      loadDashboard();
    } catch (error) {
      setMessage(t.newsDeleteError);
      console.error(error);
    }
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setEditTitle(article.titleEn || '');
    setEditTitleDv(article.title || '');
    setEditExcerpt(article.excerptEn || '');
    setEditExcerptDv(article.excerpt || '');
    setEditImageUrl(article.image || '');
    setEditCategory(article.category || '');
    setEditAuthor(article.author || '');
    setEditVideoUrl(article.video || '');
    setEditYoutubeLink(article.youtubeLink || '');
    setEditTiktokLink(article.tiktokLink || '');
    setEditBody(Array.isArray(article.body) ? article.body.join(' ') : (article.body || ''));
    setEditBodyEn(Array.isArray(article.bodyEn) ? article.bodyEn.join(' ') : (article.bodyEn || ''));
    setEditReadingTime(article.readingTime || '5މިނިޓް');
    setEditTrending(article.trending || false);
    setEditFeatured(article.featured || false);
    setEditBreaking(article.breaking || false);
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingArticle) return;

    try {
      // Upload image if file is selected
      let finalImageUrl = editImageUrl;
      if (editArticleFile) {
        setUploadingEditArticle(true);
        try {
          // Compress image before upload
          const compressedFile = await compressImage(editArticleFile, 1920, 0.8);
          
          if (editImageUploadOption === 'imgbb') {
            try {
              finalImageUrl = await uploadToImgBB(compressedFile);
            } catch (imgbbError) {
              console.error('ImgBB upload failed, trying Cloudinary:', imgbbError);
              finalImageUrl = await uploadImage(compressedFile, 'articles');
            }
          } else {
            finalImageUrl = await uploadImage(compressedFile, 'articles');
          }
        } catch (uploadError) {
          setMessage(t.newsUpdateError + ': Failed to upload image');
          setUploadingEditArticle(false);
          return;
        }
        setUploadingEditArticle(false);
      }
      
      // Upload video if file is selected
      let finalVideoUrl = editVideoUrl;
      if (editVideoFile) {
        setUploadingEditVideo(true);
        try {
          if (editVideoUploadOption === 'cloudinary') {
            finalVideoUrl = await uploadVideo(editVideoFile, 'videos');
          } else {
            finalVideoUrl = await uploadToGitHub(editVideoFile, editVideoFile.name);
          }
        } catch (uploadError) {
          setMessage(t.newsUpdateError + ': Failed to upload video');
          setUploadingEditVideo(false);
          return;
        }
        setUploadingEditVideo(false);
      }
      
      const slug = generateSlug(editTitleDv || editTitle);
      
      await updateDoc(doc(db, 'articles', editingArticle.id), {
        slug,
        title: editTitleDv || editTitle,
        titleEn: editTitle,
        excerpt: editExcerptDv || editExcerpt,
        excerptEn: editExcerpt,
        image: finalImageUrl,
        video: finalVideoUrl,
        youtubeLink: editYoutubeLink,
        tiktokLink: editTiktokLink,
        category: editCategory,
        author: editAuthor || 'Admin',
        body: editBody,
        bodyEn: editBodyEn,
        readingTime: editReadingTime,
        trending: editTrending,
        featured: editFeatured,
        breakingNews: editBreaking,
      });

      setMessage(t.newsUpdated);
      setEditingArticle(null);
      setEditArticleFile(null);
      loadDashboard();
    } catch (error) {
      setMessage(t.newsUpdateError);
      console.error(error);
    }
  };

  const handleToggleFeatured = async (article: any) => {
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        featured: !article.featured
      });
      setMessage(article.featured ? 'Featured removed' : 'Featured added');
      loadDashboard();
    } catch (error) {
      setMessage('Error updating featured status');
      console.error(error);
    }
  };

  const handleToggleBreaking = async (article: any) => {
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        breakingNews: !article.breakingNews
      });
      setMessage(article.breakingNews ? 'Breaking news removed' : 'Breaking news added');
      loadDashboard();
    } catch (error) {
      setMessage('Error updating breaking status');
      console.error(error);
    }
  };

  const handleBannerUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bannerFile || !user) {
      setMessage('Please select an image');
      return;
    }

    // Validate image size based on selected size option
    const img = new Image();
    const imageUrl = URL.createObjectURL(bannerFile);
    
    img.onload = async () => {
      const width = img.width;
      const height = img.height;
      URL.revokeObjectURL(imageUrl);

      // Validation rules
      const isMobile = window.innerWidth < 768;
      let isValid = true;
      let errorMessage = '';

      if (bannerSize === 'mobile') {
        // Mobile banners should be optimized for mobile (max 768px width)
        if (width > 768) {
          isValid = false;
          errorMessage = 'Mobile banners should be max 768px wide. Please resize the image or select "Both Mobile & Desktop" option.';
        }
      } else if (bannerSize === 'desktop') {
        // Desktop banners should be at least 768px wide
        if (width < 768) {
          isValid = false;
          errorMessage = 'Desktop banners should be at least 768px wide. Please use a larger image or select "Both Mobile & Desktop" option.';
        }
      }
      // 'both' option accepts any size

      if (!isValid) {
        setBannerError(errorMessage);
        setMessage(errorMessage);
        return;
      }

      // Proceed with upload if validation passes
      await uploadToCloudinary();
    };

    img.onerror = () => {
      setBannerError('Failed to load image. Please try a different file.');
      setMessage('Failed to load image. Please try a different file.');
    };

    img.src = imageUrl;
  };

  const uploadToCloudinary = async () => {
    if (!bannerFile) return;

    setUploadingBanner(true);
    setBannerError('');
    try {
      // Compress image before upload
      const compressedFile = await compressImage(bannerFile, 1920, 0.8);
      
      // Upload to Cloudinary
      const imageUrl = await uploadImage(compressedFile, 'banners');
      
      // Save to Firebase
      const bannerRef = await addDoc(collection(db, 'banners'), {
        title: bannerTitle,
        subtitle: bannerSubtitle,
        link: bannerLink,
        image: imageUrl,
        location: bannerLocation,
        position: bannerPosition,
        size: bannerSize,
        createdAt: serverTimestamp(),
      });

      setMessage(t.bannerUploaded);
      setBannerFile(null);
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerLink('');
      setBannerLocation('home');
      setBannerPosition('top');
      setBannerSize('both');
      loadDashboard();
    } catch (error) {
      setMessage(t.bannerUploadError);
      console.error(error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUploadAdvertisement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertisementFile || !selectedAdSlot) {
      setAdvertisementError('Please select a slot and upload an image');
      return;
    }

    setUploadingAdvertisement(true);
    setAdvertisementError('');
    try {
      // Compress image before upload
      const compressedFile = await compressImage(advertisementFile, 1920, 0.8);
      
      // Upload to Cloudinary
      const imageUrl = await uploadImage(compressedFile, 'advertisements');
      
      // Save to Firebase
      await setDoc(doc(db, 'advertisements', 'slots'), {
        ...advertisements,
        [selectedAdSlot]: {
          image: imageUrl,
          updatedAt: serverTimestamp(),
        }
      }, { merge: true });

      setMessage(t.advertisementUploaded);
      setAdvertisementFile(null);
      setSelectedAdSlot('');
      loadDashboard();
    } catch (error) {
      setMessage(t.advertisementUploadError);
      console.error(error);
    } finally {
      setUploadingAdvertisement(false);
    }
  };

  const handleDeleteAdvertisement = async (slotId: string) => {
    if (!window.confirm(t.confirmDeleteAdvertisement)) return;

    try {
      // Delete image from Cloudinary if it exists
      const adData = advertisements[slotId];
      if (adData?.image) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = adData.image.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = filename.split('.')[0];
          await deleteImage(publicId);
        } catch (cloudinaryError) {
          console.error('Failed to delete image from Cloudinary:', cloudinaryError);
          // Continue with database deletion even if image deletion fails
        }
      }

      // Delete from database
      await setDoc(doc(db, 'advertisements', 'slots'), {
        ...advertisements,
        [slotId]: null
      }, { merge: true });

      setMessage(t.advertisementDeleted);
      loadDashboard();
    } catch (error) {
      setMessage(t.advertisementDeleteError);
      console.error(error);
    }
  };

  const handleAddToHero = async () => {
    if (!selectedHeroArticle) {
      setHeroSlidesError('Please select an article to add');
      return;
    }

    const article = articles.find(a => a.id === selectedHeroArticle);
    if (!article) {
      setHeroSlidesError('Article not found');
      return;
    }

    setUpdatingHeroSlides(true);
    setHeroSlidesError('');
    try {
      const updatedSlides = [...heroSlides, { articleId: article.id, title: article.title, image: article.image, category: article.category, excerpt: article.excerpt }];
      await setDoc(doc(db, 'hero-slides', 'config'), {
        slides: updatedSlides,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setMessage(t.heroSlidesUpdated);
      setHeroSlides(updatedSlides);
      setSelectedHeroArticle('');
      loadDashboard();
    } catch (error) {
      setMessage(t.heroSlidesError);
      console.error(error);
    } finally {
      setUpdatingHeroSlides(false);
    }
  };

  const handleRemoveFromHero = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to remove this article from hero slides?')) return;

    setUpdatingHeroSlides(true);
    setHeroSlidesError('');
    try {
      const updatedSlides = heroSlides.filter(slide => slide.articleId !== articleId);
      await setDoc(doc(db, 'hero-slides', 'config'), {
        slides: updatedSlides,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setMessage(t.heroSlidesUpdated);
      setHeroSlides(updatedSlides);
      loadDashboard();
    } catch (error) {
      setMessage(t.heroSlidesError);
      console.error(error);
    } finally {
      setUpdatingHeroSlides(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm(t.confirmDeleteBanner)) {
      return;
    }

    try {
      // Fetch banner to get image URL
      const bannerDoc = await getDoc(doc(db, 'banners', bannerId));
      if (bannerDoc.exists()) {
        const bannerData = bannerDoc.data();
        if (bannerData?.image) {
          try {
            // Extract public_id from Cloudinary URL
            const urlParts = bannerData.image.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = filename.split('.')[0];
            await deleteImage(publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete image from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if image deletion fails
          }
        }
      }

      await deleteDoc(doc(db, 'banners', bannerId));
      setMessage(t.bannerDeleted);
      loadDashboard();
    } catch (error) {
      setMessage(t.bannerDeleteError);
      console.error(error);
    }
  };

  const handleSidebarPromotionUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!sidebarPromotionFile) {
      setSidebarPromotionError('Please select an image');
      return;
    }

    setUploadingSidebarPromotion(true);
    setSidebarPromotionError('');

    try {
      // Compress image before upload
      const compressedFile = await compressImage(sidebarPromotionFile, 1920, 0.8);
      const imageUrl = await uploadToImgBB(compressedFile);
      
      await addDoc(collection(db, 'sidebar-promotions'), {
        title: sidebarPromotionTitle,
        link: sidebarPromotionLink,
        image: imageUrl,
        slot: sidebarPromotionSlot,
        createdAt: serverTimestamp(),
      });

      setMessage('Sidebar promotion uploaded successfully!');
      setSidebarPromotionFile(null);
      setSidebarPromotionTitle('');
      setSidebarPromotionLink('');
      setSidebarPromotionSlot('slot1');
      loadDashboard();
    } catch (error) {
      setSidebarPromotionError('Failed to upload sidebar promotion');
      console.error(error);
    } finally {
      setUploadingSidebarPromotion(false);
    }
  };

  const handleDeleteSidebarPromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this sidebar promotion?')) {
      return;
    }

    try {
      // Fetch promotion to get image URL
      const promotionDoc = await getDoc(doc(db, 'sidebar-promotions', promotionId));
      if (promotionDoc.exists()) {
        const promotionData = promotionDoc.data();
        if (promotionData?.image) {
          try {
            // Extract public_id from ImgBB/Imgur URL (these services don't support deletion via API in the same way)
            // For ImgBB/Imgur, we can only delete from database
            console.log('Image deletion not supported for ImgBB/Imgur URLs');
          } catch (cloudinaryError) {
            console.error('Failed to delete image:', cloudinaryError);
          }
        }
      }

      await deleteDoc(doc(db, 'sidebar-promotions', promotionId));
      setMessage('Sidebar promotion deleted successfully!');
      loadDashboard();
    } catch (error) {
      setMessage('Failed to delete sidebar promotion');
      console.error(error);
    }
  };

  const handleMidArticlePromotionUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!midArticlePromotionFile) {
      setMidArticlePromotionError('Please select an image');
      return;
    }

    setUploadingMidArticlePromotion(true);
    setMidArticlePromotionError('');

    try {
      // Compress image before upload
      const compressedFile = await compressImage(midArticlePromotionFile, 1920, 0.8);
      const imageUrl = await uploadToImgBB(compressedFile);
      
      await addDoc(collection(db, 'mid-article-promotions'), {
        title: midArticlePromotionTitle,
        link: midArticlePromotionLink,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      setMessage('Mid-article promotion uploaded successfully!');
      setMidArticlePromotionFile(null);
      setMidArticlePromotionTitle('');
      setMidArticlePromotionLink('');
      loadDashboard();
    } catch (error) {
      setMidArticlePromotionError('Failed to upload mid-article promotion');
      console.error(error);
    } finally {
      setUploadingMidArticlePromotion(false);
    }
  };

  const handleDeleteMidArticlePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this mid-article promotion?')) {
      return;
    }

    try {
      // Fetch promotion to get image URL
      const promotionDoc = await getDoc(doc(db, 'mid-article-promotions', promotionId));
      if (promotionDoc.exists()) {
        const promotionData = promotionDoc.data();
        if (promotionData?.image) {
          try {
            // Extract public_id from ImgBB/Imgur URL (these services don't support deletion via API in the same way)
            // For ImgBB/Imgur, we can only delete from database
            console.log('Image deletion not supported for ImgBB/Imgur URLs');
          } catch (cloudinaryError) {
            console.error('Failed to delete image:', cloudinaryError);
          }
        }
      }

      await deleteDoc(doc(db, 'mid-article-promotions', promotionId));
      setMessage('Mid-article promotion deleted successfully!');
      loadDashboard();
    } catch (error) {
      setMessage('Failed to delete mid-article promotion');
      console.error(error);
    }
  };

  const handleFixNegativeCounts = async () => {
    if (!confirm('This will reset all negative like/dislike counts to 0. Continue?')) {
      return;
    }

    try {
      setMessage('Fixing negative counts...');
      const articlesSnapshot = await getDocs(collection(db, 'articles'));
      let fixedCount = 0;

      for (const articleDoc of articlesSnapshot.docs) {
        const articleId = articleDoc.id;
        
        // Fix likes
        const likesDoc = await getDoc(doc(db, 'articles', articleId, 'likes', 'count'));
        if (likesDoc.exists() && likesDoc.data().count < 0) {
          await setDoc(doc(db, 'articles', articleId, 'likes', 'count'), { count: 0 });
          fixedCount++;
        }
        
        // Fix dislikes
        const dislikesDoc = await getDoc(doc(db, 'articles', articleId, 'dislikes', 'count'));
        if (dislikesDoc.exists() && dislikesDoc.data().count < 0) {
          await setDoc(doc(db, 'articles', articleId, 'dislikes', 'count'), { count: 0 });
          fixedCount++;
        }
      }

      setMessage(`Fixed ${fixedCount} negative counts to 0`);
    } catch (error) {
      setMessage('Failed to fix negative counts');
      console.error(error);
    }
  };

  const handleMigrateSlugs = async () => {
    if (!confirm('This will add slugs to existing stories and golden-time articles that don\'t have them. Continue?')) {
      return;
    }

    setMigratingSlugs(true);
    setMigrationResult('Starting migration...');
    
    try {
      let storiesUpdated = 0;
      let storiesSkipped = 0;
      let goldenTimeUpdated = 0;
      let goldenTimeSkipped = 0;

      // Migrate stories
      const storiesSnapshot = await getDocs(collection(db, 'stories'));
      for (const storyDoc of storiesSnapshot.docs) {
        const story = storyDoc.data();
        
        if (story.slug) {
          storiesSkipped++;
          continue;
        }
        
        const slug = generateSlug(story.title);
        await updateDoc(doc(db, 'stories', storyDoc.id), { slug });
        storiesUpdated++;
      }

      // Migrate golden-time articles
      const goldenTimeSnapshot = await getDocs(collection(goldenTimeDb, 'golden-time'));
      for (const articleDoc of goldenTimeSnapshot.docs) {
        const article = articleDoc.data();
        
        if (article.slug) {
          goldenTimeSkipped++;
          continue;
        }
        
        const slug = generateSlug(article.title);
        await updateDoc(doc(goldenTimeDb, 'golden-time', articleDoc.id), { slug });
        goldenTimeUpdated++;
      }

      setMigrationResult(
        `Migration complete!\n\nStories: ${storiesUpdated} updated, ${storiesSkipped} skipped\nGolden Time: ${goldenTimeUpdated} updated, ${goldenTimeSkipped} skipped`
      );
      setMessage('Migration completed successfully!');
    } catch (error) {
      setMigrationResult(`Migration failed: ${error}`);
      setMessage('Migration failed');
      console.error(error);
    } finally {
      setMigratingSlugs(false);
    }
  };

  // Story management handlers
  const handleCreateStory = async () => {
    if (!storyTitle.trim() || !storyCoverImage) {
      setStoryError('Please provide title and cover image');
      return;
    }

    try {
      setUploadingStory(true);
      setStoryError('');

      // Compress image before upload
      const compressedFile = await compressImage(storyCoverImage, 1920, 0.8);
      const coverImageUrl = await uploadToImgBB(compressedFile);
      const slug = generateSlug(storyTitle);

      await addDoc(collection(db, 'stories'), {
        slug,
        title: storyTitle,
        description: storyDescription,
        author: storyAuthor,
        youtubeLink: storyYoutubeLink,
        tiktokLink: storyTiktokLink,
        coverImage: coverImageUrl,
        status: storyStatus,
        releaseDate: storyReleaseDate || null,
        locked: storyLocked,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      resetStoryForm();
      setMessage('Story created successfully');

      // Reload stories
      const storiesSnapshot = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setStories(storiesData);
    } catch (error) {
      setStoryError('Failed to create story');
      console.error(error);
    } finally {
      setUploadingStory(false);
    }
  };

  const handleEditStory = (story: any) => {
    setSelectedStory(story);
    setStoryTitle(story.title);
    setStoryDescription(story.description || '');
    setStoryAuthor(story.author || '');
    setStoryYoutubeLink(story.youtubeLink || '');
    setStoryTiktokLink(story.tiktokLink || '');
    setStoryStatus(story.status || 'upcoming');
    setStoryReleaseDate(story.releaseDate || '');
    setStoryLocked(story.locked !== false);
    setStoryCoverImage(null);
    setEditingStory(true);
  };

  const handleUpdateStory = async () => {
    if (!selectedStory || !storyTitle.trim()) {
      setStoryError('Please provide title');
      return;
    }

    try {
      setUploadingStory(true);
      setStoryError('');

      const slug = generateSlug(storyTitle);

      const updateData: any = {
        slug,
        title: storyTitle,
        description: storyDescription,
        author: storyAuthor,
        youtubeLink: storyYoutubeLink,
        tiktokLink: storyTiktokLink,
        status: storyStatus,
        releaseDate: storyReleaseDate || null,
        locked: storyLocked,
        updatedAt: serverTimestamp(),
      };

      if (storyCoverImage) {
        // Compress image before upload
        const compressedFile = await compressImage(storyCoverImage, 1920, 0.8);
        const coverImageUrl = await uploadToImgBB(compressedFile);
        updateData.coverImage = coverImageUrl;
      }

      await updateDoc(doc(db, 'stories', selectedStory.id), updateData);

      resetStoryForm();
      setMessage('Story updated successfully');

      // Reload stories
      const storiesSnapshot = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setStories(storiesData);
    } catch (error) {
      setStoryError('Failed to update story');
      console.error(error);
    } finally {
      setUploadingStory(false);
    }
  };

  const resetStoryForm = () => {
    setStoryTitle('');
    setStoryDescription('');
    setStoryAuthor('');
    setStoryYoutubeLink('');
    setStoryTiktokLink('');
    setStoryCoverImage(null);
    setStoryStatus('upcoming');
    setStoryReleaseDate('');
    setStoryLocked(true);
    setEditingStory(false);
    setSelectedStory(null);
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story and all its episodes?')) {
      return;
    }

    try {
      // Fetch story to get image URL
      const storyDoc = await getDoc(doc(db, 'stories', storyId));
      if (storyDoc.exists()) {
        const storyData = storyDoc.data();
        if (storyData?.coverImage) {
          try {
            // Extract public_id from ImgBB/Imgur URL (these services don't support deletion via API in the same way)
            // For ImgBB/Imgur, we can only delete from database
            console.log('Image deletion not supported for ImgBB/Imgur URLs');
          } catch (cloudinaryError) {
            console.error('Failed to delete image:', cloudinaryError);
          }
        }
      }

      // Delete all episodes
      const episodesSnapshot = await getDocs(collection(db, 'stories', storyId, 'episodes'));
      for (const episodeDoc of episodesSnapshot.docs) {
        await deleteDoc(doc(db, 'stories', storyId, 'episodes', episodeDoc.id));
      }

      // Delete story
      await deleteDoc(doc(db, 'stories', storyId));
      setMessage('Story deleted successfully');

      // Reload stories
      const storiesSnapshot = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setStories(storiesData);

      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
        setEpisodes([]);
      }
    } catch (error) {
      setMessage('Failed to delete story');
      console.error(error);
    }
  };

  const handleSelectStory = async (story: any) => {
    setSelectedStory(story);
    try {
      const episodesSnapshot = await getDocs(query(collection(db, 'stories', story.id, 'episodes'), orderBy('episodeNumber', 'asc')));
      const episodesData = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setEpisodes(episodesData);
      setEpisodeNumber(episodesData.length + 1);
    } catch (error) {
      console.error('Failed to load episodes', error);
    }
  };

  // Episode management handlers
  const handleCreateEpisode = async () => {
    if (!selectedStory || !episodeTitle.trim() || !episodeContent.trim()) {
      setEpisodeError('Please select a story and provide title and content');
      return;
    }

    try {
      setUploadingEpisode(true);
      setEpisodeError('');

      await addDoc(collection(db, 'stories', selectedStory.id, 'episodes'), {
        title: episodeTitle,
        content: episodeContent,
        episodeNumber: episodeNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setEpisodeTitle('');
      setEpisodeContent('');
      setEpisodeNumber(episodeNumber + 1);
      setMessage('Episode created successfully');

      // Reload episodes
      const episodesSnapshot = await getDocs(query(collection(db, 'stories', selectedStory.id, 'episodes'), orderBy('episodeNumber', 'asc')));
      const episodesData = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setEpisodes(episodesData);
    } catch (error) {
      setEpisodeError('Failed to create episode');
      console.error(error);
    } finally {
      setUploadingEpisode(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!selectedStory || !confirm('Are you sure you want to delete this episode?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'stories', selectedStory.id, 'episodes', episodeId));
      setMessage('Episode deleted successfully');

      // Reload episodes
      const episodesSnapshot = await getDocs(query(collection(db, 'stories', selectedStory.id, 'episodes'), orderBy('episodeNumber', 'asc')));
      const episodesData = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setEpisodes(episodesData);
    } catch (error) {
      setMessage('Failed to delete episode');
      console.error(error);
    }
  };

  // Golden Time handlers
  const resetGoldenTimeForm = () => {
    setGoldenTimeTitle('');
    setGoldenTimeDescription('');
    setGoldenTimeAuthor('ހަވާ ޑެއިލީ');
    setGoldenTimeCoverImage(null);
    setGoldenTimeYear('');
    setGoldenTimeCategory('ދިރިއުޅުމުގެ ވައްޓަފާޅު، ކުޑަކުދިން، ސަގާފަތް');
    setGoldenTimeContent('');
    setGoldenTimeError('');
    setAddGoldenTimeLogo(false);
    setGoldenTimeLogoOpacity(0.9);
    setGoldenTimeLogoXPercent(90);
    setGoldenTimeLogoYPercent(90);
    setGoldenTimeLogoSizePercent(15);
    setPreviewImageUrl(null);
  };

  const handleCreateGoldenTime = async () => {
    if (!goldenTimeTitle || !goldenTimeDescription || !goldenTimeContent) {
      setGoldenTimeError('Please fill in required fields');
      return;
    }

    setUploadingGoldenTime(true);
    setGoldenTimeError('');

    try {
      let coverImageUrl = '';
      if (goldenTimeCoverImage) {
        const compressedFile = await compressImage(goldenTimeCoverImage, 1920, 0.8);
        coverImageUrl = await uploadToImgBB(compressedFile, {
          enabled: addGoldenTimeLogo,
          opacity: goldenTimeLogoOpacity,
          xPercent: goldenTimeLogoXPercent,
          yPercent: goldenTimeLogoYPercent,
          sizePercent: goldenTimeLogoSizePercent
        });
      }

      await addDoc(collection(goldenTimeDb, 'golden-time'), {
        slug: generateSlug(goldenTimeTitle),
        title: goldenTimeTitle,
        description: goldenTimeDescription,
        author: goldenTimeAuthor,
        coverImage: coverImageUrl,
        year: goldenTimeYear ? Number(goldenTimeYear) : null,
        category: goldenTimeCategory,
        content: goldenTimeContent,
        youtubeLink: goldenTimeYoutubeLink,
        tiktokLink: goldenTimeTiktokLink,
        createdAt: serverTimestamp(),
      });

      // Save author for future use
      saveAuthor(goldenTimeAuthor);

      resetGoldenTimeForm();
      setMessage('Article created successfully');

      // Reload golden time articles
      const goldenTimeSnapshot = await getDocs(query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc')));
      const goldenTimeData = goldenTimeSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setGoldenTimeArticles(goldenTimeData);
    } catch (error) {
      setGoldenTimeError('Failed to create article');
      console.error(error);
    } finally {
      setUploadingGoldenTime(false);
    }
  };

  const handleSelectGoldenTimeArticle = (article: any) => {
    setSelectedGoldenTimeArticle(article);
    setGoldenTimeTitle(article.title);
    setGoldenTimeDescription(article.description);
    setGoldenTimeAuthor(article.author || '');
    setGoldenTimeYear(article.year?.toString() || '');
    setGoldenTimeCategory(article.category || '');
    setGoldenTimeContent(article.content || '');
    setGoldenTimeYoutubeLink(article.youtubeLink || '');
    setGoldenTimeTiktokLink(article.tiktokLink || '');
    setEditingGoldenTime(true);
  };

  const handleUpdateGoldenTime = async () => {
    if (!selectedGoldenTimeArticle || !goldenTimeTitle || !goldenTimeDescription || !goldenTimeContent) {
      setGoldenTimeError('Please fill in required fields');
      return;
    }

    setUploadingGoldenTime(true);
    setGoldenTimeError('');

    try {
      const slug = generateSlug(goldenTimeTitle);

      const updateData: any = {
        slug,
        title: goldenTimeTitle,
        description: goldenTimeDescription,
        author: goldenTimeAuthor,
        year: goldenTimeYear ? Number(goldenTimeYear) : null,
        category: goldenTimeCategory,
        content: goldenTimeContent,
        youtubeLink: goldenTimeYoutubeLink,
        tiktokLink: goldenTimeTiktokLink,
      };

      if (goldenTimeCoverImage) {
        const compressedFile = await compressImage(goldenTimeCoverImage, 1920, 0.8);
        const coverImageUrl = await uploadToImgBB(compressedFile, {
          enabled: addGoldenTimeLogo,
          opacity: goldenTimeLogoOpacity,
          xPercent: goldenTimeLogoXPercent,
          yPercent: goldenTimeLogoYPercent,
          sizePercent: goldenTimeLogoSizePercent
        });
        updateData.coverImage = coverImageUrl;
      }

      await updateDoc(doc(goldenTimeDb, 'golden-time', selectedGoldenTimeArticle.id), updateData);

      // Save author for future use
      saveAuthor(goldenTimeAuthor);

      resetGoldenTimeForm();
      setEditingGoldenTime(false);
      setSelectedGoldenTimeArticle(null);
      setMessage('Article updated successfully');

      // Reload golden time articles
      const goldenTimeSnapshot = await getDocs(query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc')));
      const goldenTimeData = goldenTimeSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setGoldenTimeArticles(goldenTimeData);
    } catch (error) {
      setGoldenTimeError('Failed to update article');
      console.error(error);
    } finally {
      setUploadingGoldenTime(false);
    }
  };

  const handleDeleteGoldenTime = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      // Fetch article to get image URL
      const articleDoc = await getDoc(doc(goldenTimeDb, 'golden-time', articleId));
      if (articleDoc.exists()) {
        const articleData = articleDoc.data();
        if (articleData?.coverImage) {
          try {
            // Extract public_id from ImgBB/Imgur URL (these services don't support deletion via API in the same way)
            // For ImgBB/Imgur, we can only delete from database
            console.log('Image deletion not supported for ImgBB/Imgur URLs');
          } catch (cloudinaryError) {
            console.error('Failed to delete image:', cloudinaryError);
          }
        }
      }

      await deleteDoc(doc(goldenTimeDb, 'golden-time', articleId));
      setMessage('Article deleted successfully');

      // Reload golden time articles
      const goldenTimeSnapshot = await getDocs(query(collection(goldenTimeDb, 'golden-time'), orderBy('createdAt', 'desc')));
      const goldenTimeData = goldenTimeSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setGoldenTimeArticles(goldenTimeData);

      if (selectedGoldenTimeArticle?.id === articleId) {
        setSelectedGoldenTimeArticle(null);
        resetGoldenTimeForm();
        setEditingGoldenTime(false);
      }
    } catch (error) {
      setMessage('Failed to delete article');
      console.error(error);
    }
  };

  const visitorCount = visitorDetails?.length ?? 0;
  const topVisitors = Array.isArray(visitorDetails) ? visitorDetails.slice(0, 8) : [];

  // PWA Install Handler
  const handleInstallClick = async () => {
    console.log('Install button clicked, deferredPrompt:', deferredPrompt);
    if (!deferredPrompt) {
      console.log('No deferred prompt available - showing manual instructions');
      alert('To install the admin panel:\n\n1. Open this page in Chrome/Edge on your mobile device\n2. Tap the menu (three dots)\n3. Select "Add to Home Screen" or "Install App"\n\nOr use Chrome on desktop and click the install icon in the address bar.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
      alert('Installation failed. Please try adding to home screen manually from browser menu.');
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      setShowInstallButton(false);
    } else {
      // Show install button even if beforeinstallprompt hasn't fired yet
      // The button will handle the case where prompt is not available
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-fill Image Generator text with Dhivehi title
  useEffect(() => {
    if (titleDv && !overlayText) {
      setOverlayText(titleDv);
    }
  }, [titleDv]);

  // Generate flyer function
  const generateFlyer = async () => {
    if (!selectedJob || !flyerCanvas) return;

    setGeneratingFlyer(true);

    try {
      const canvas = flyerCanvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get dimensions based on platform
      const dimensions = flyerPlatform === 'instagram-square'
        ? { width: 1080, height: 1080 }
        : flyerPlatform === 'instagram-portrait'
        ? { width: 1080, height: 1350 }
        : { width: 1200, height: 630 }; // Facebook landscape

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0077b6');
      gradient.addColorStop(0.5, '#00b4d8');
      gradient.addColorStop(1, '#0077b6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate scale factor based on height
      const scaleFactor = canvas.height / 1350;

      // Draw decorative circles
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.1, canvas.height * 0.2, Math.round(200 * scaleFactor), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width * 0.9, canvas.height * 0.8, Math.round(150 * scaleFactor), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw company name in styled box (primary approach due to CORS)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      const boxWidth = Math.round(350 * scaleFactor);
      const boxHeight = Math.round(100 * scaleFactor);
      ctx.fillRect(canvas.width / 2 - boxWidth / 2, Math.round(60 * scaleFactor), boxWidth, boxHeight);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width / 2 - boxWidth / 2, Math.round(60 * scaleFactor), boxWidth, boxHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(28 * scaleFactor)}px Arial`;
      const companyName = selectedJob.company || 'Company Name';
      ctx.fillText(companyName, canvas.width / 2, Math.round(110 * scaleFactor));

      // Set text properties
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw "HIRING NOW" badge
      ctx.fillStyle = '#ff6b6b';
      ctx.font = `bold ${Math.round(28 * scaleFactor)}px Arial`;
      const badgeWidth = ctx.measureText('HIRING NOW').width + Math.round(40 * scaleFactor);
      ctx.fillRect(canvas.width / 2 - badgeWidth / 2, Math.round(220 * scaleFactor), badgeWidth, Math.round(45 * scaleFactor));
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HIRING NOW', canvas.width / 2, Math.round(242 * scaleFactor));

      // Draw job title
      ctx.fillStyle = '#ffffff';
      const title = selectedJob.title || selectedJob.titleEn || selectedJob.titleDv || 'Job Title';
      ctx.font = `bold ${Math.round(55 * scaleFactor)}px Arial`;
      ctx.fillText(title, canvas.width / 2, Math.round(320 * scaleFactor));

      // Draw company
      if (selectedJob.company) {
        ctx.font = `bold ${Math.round(38 * scaleFactor)}px Arial`;
        ctx.fillStyle = '#caf0f8';
        ctx.fillText(selectedJob.company, canvas.width / 2, Math.round(380 * scaleFactor));
      }

      // Draw location
      if (selectedJob.location) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.round(32 * scaleFactor)}px Arial`;
        ctx.fillText(`📍 ${selectedJob.location}`, canvas.width / 2, Math.round(450 * scaleFactor));
      }

      // Draw salary
      if (selectedJob.salary) {
        ctx.font = `${Math.round(32 * scaleFactor)}px Arial`;
        ctx.fillText(`💰 ${selectedJob.salary}`, canvas.width / 2, Math.round(510 * scaleFactor));
      }

      // Draw description (truncated)
      if (selectedJob.description) {
        ctx.font = `${Math.round(24 * scaleFactor)}px Arial`;
        const desc = selectedJob.description.substring(0, 120) + '...';
        ctx.fillText(desc, canvas.width / 2, Math.round(580 * scaleFactor));
      }

      // Draw app logo box with larger styling
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      const appLogoBoxWidth = Math.round(280 * scaleFactor);
      const appLogoBoxHeight = Math.round(80 * scaleFactor);
      ctx.fillRect(canvas.width / 2 - appLogoBoxWidth / 2, Math.round(630 * scaleFactor), appLogoBoxWidth, appLogoBoxHeight);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width / 2 - appLogoBoxWidth / 2, Math.round(630 * scaleFactor), appLogoBoxWidth, appLogoBoxHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(24 * scaleFactor)}px Arial`;
      ctx.fillText('HAWA DAILY', canvas.width / 2, Math.round(670 * scaleFactor));

      // Draw apply URL
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(36 * scaleFactor)}px Arial`;
      ctx.fillText('www.hawadaily.com/jobs', canvas.width / 2, Math.round(780 * scaleFactor));

      // Draw "Apply Now" button
      const buttonWidth = Math.round(300 * scaleFactor);
      const buttonHeight = Math.round(60 * scaleFactor);
      const buttonX = canvas.width / 2 - buttonWidth / 2;
      const buttonY = Math.round(820 * scaleFactor);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(32 * scaleFactor)}px Arial`;
      ctx.fillText('APPLY NOW', canvas.width / 2, buttonY + buttonHeight / 2);

      // Draw date
      ctx.fillStyle = '#caf0f8';
      ctx.font = `${Math.round(20 * scaleFactor)}px Arial`;
      const date = new Date().toLocaleDateString();
      ctx.fillText(date, canvas.width / 2, Math.round(920 * scaleFactor));

    } catch (error) {
      console.error('Error generating flyer:', error);
    } finally {
      setGeneratingFlyer(false);
    }
  };

  // Download flyer function
  const downloadFlyer = async () => {
    if (!flyerCanvas) return;

    try {
      const dataUrl = flyerCanvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'job-flyer.png', { type: 'image/png' });
      
      // Compress image before download
      const compressedFile = await compressImage(file, 1920, 0.8);
      
      const link = document.createElement('a');
      link.download = `job-flyer-${selectedJob?.id || 'flyer'}.jpg`;
      link.href = URL.createObjectURL(compressedFile);
      link.click();
    } catch (error) {
      console.error('Error compressing/downloading flyer:', error);
    }
  };

  // Recipe management functions
  const clearRecipeForm = () => {
    setRecipeTitleDv('');
    setRecipeTitleEn('');
    setRecipeImage(null);
    setRecipeImageUrl('');
    setRecipeImageUrlInput('');
    setRecipeIngredientsDv('');
    setRecipeIngredientsEn('');
    setRecipeInstructionsDv('');
    setRecipeInstructionsEn('');
    setRecipeCategory('');
    setRecipePrepTime('');
    setRecipeCookTime('');
    setRecipeServings('');
    setEditingRecipe(null);
  };

  const handleSaveRecipe = async () => {
    setSubmittingRecipe(true);

    try {
      let imageUrl = recipeImageUrl || '';
      
      // Upload image to ImgBB if a file is selected
      if (recipeImage && !recipeImageUrl.startsWith('http')) {
        try {
          setMessage('Uploading image to CDN...');
          // Compress image before upload
          const compressedFile = await compressImage(recipeImage, 1920, 0.8);
          imageUrl = await uploadToImgBB(compressedFile);
          setRecipeImageUrl(imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image to ImgBB:', uploadError);
          setMessage('Failed to upload image. Using local preview.');
        }
      }

      const ingredientsDv = recipeIngredientsDv.split('\n').filter(i => i.trim());
      const ingredientsEn = recipeIngredientsEn.split('\n').filter(i => i.trim());

      const newRecipe = {
        id: editingRecipe ? editingRecipe.id : `recipe-${Date.now()}`,
        titleDv: recipeTitleDv,
        titleEn: recipeTitleEn,
        image: imageUrl,
        category: recipeCategory,
        prepTime: recipePrepTime,
        cookTime: recipeCookTime,
        servings: recipeServings,
        ingredients: {
          dv: ingredientsDv,
          en: ingredientsEn
        },
        instructions: {
          dv: recipeInstructionsDv,
          en: recipeInstructionsEn
        }
      };

      if (editingRecipe) {
        // Update existing recipe in local state
        setRecipesList(recipesList.map(r => r.id === editingRecipe.id ? newRecipe : r));
        setMessage('Recipe updated successfully!');
      } else {
        // Add new recipe to local state
        setRecipesList([...recipesList, newRecipe]);
        setMessage('Recipe added successfully!');
      }

      clearRecipeForm();
    } catch (error) {
      console.error('Error saving recipe:', error);
      setMessage('Failed to save recipe. Please try again.');
    } finally {
      setSubmittingRecipe(false);
    }
  };

  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
    setRecipeTitleDv(recipe.titleDv);
    setRecipeTitleEn(recipe.titleEn);
    setRecipeImageUrl(recipe.image);
    setRecipeIngredientsDv(recipe.ingredients.dv.join('\n'));
    setRecipeIngredientsEn(recipe.ingredients.en.join('\n'));
    setRecipeInstructionsDv(recipe.instructions.dv);
    setRecipeInstructionsEn(recipe.instructions.en);
    setRecipeCategory(recipe.category);
    setRecipePrepTime(recipe.prepTime);
    setRecipeCookTime(recipe.cookTime);
    setRecipeServings(recipe.servings);
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      // Fetch recipe to get image URL
      const recipe = recipesList.find(r => r.id === id);
      if (recipe?.image) {
        try {
          // Extract public_id from ImgBB/Imgur URL (these services don't support deletion via API in the same way)
          // For ImgBB/Imgur, we can only delete from database
          console.log('Image deletion not supported for ImgBB/Imgur URLs');
        } catch (cloudinaryError) {
          console.error('Failed to delete image:', cloudinaryError);
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, 'recipes', id));
      setRecipesList(recipesList.filter(r => r.id !== id));
      setMessage('Recipe deleted successfully!');
    } catch (error) {
      setMessage('Failed to delete recipe');
      console.error(error);
    }
  };

  const handleSaveAllRecipesToFirebase = async () => {
    if (!confirm('Are you sure you want to save all recipes to Firebase? This may overwrite existing data.')) {
      return;
    }

    setSavingAllRecipes(true);
    setMessage('Saving recipes to Firebase...');

    try {
      const recipesCollection = collection(db, 'recipes');
      let successCount = 0;
      let errorCount = 0;

      for (const recipe of recipesList) {
        try {
          await setDoc(doc(recipesCollection, recipe.id), {
            ...recipe,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          successCount++;
        } catch (error) {
          console.error(`Error saving recipe ${recipe.id}:`, error);
          errorCount++;
        }
      }

      setMessage(`Successfully saved ${successCount} recipes to Firebase. ${errorCount > 0 ? `${errorCount} recipes failed.` : ''}`);
    } catch (error) {
      console.error('Error saving recipes to Firebase:', error);
      setMessage('Error saving recipes to Firebase. Please try again.');
    } finally {
      setSavingAllRecipes(false);
    }
  };

  const handleImportHedhikaaRecipes = async () => {
    if (!confirm('Are you sure you want to import hedhikaa recipes? This will add them to the current list.')) {
      return;
    }

    setImportingHedhikaa(true);
    setMessage('Importing hedhikaa recipes...');

    try {
      const response = await fetch('/src/data/hedhikaa-recipes.json');
      const hedhikaaRecipes = await response.json();
      
      // Add hedhikaa recipes to the current list
      const existingIds = new Set(recipesList.map(r => r.id));
      const newRecipes = hedhikaaRecipes.filter((r: any) => !existingIds.has(r.id));
      
      setRecipesList([...recipesList, ...newRecipes]);
      setMessage(`Successfully imported ${newRecipes.length} hedhikaa recipes.`);
    } catch (error) {
      console.error('Error importing hedhikaa recipes:', error);
      setMessage('Error importing hedhikaa recipes. Please try again.');
    } finally {
      setImportingHedhikaa(false);
    }
  };

  const handleImportNadiyasKitchenRecipes = async () => {
    if (!confirm('Are you sure you want to import nadiyaskitchen recipes? This will add them to the current list.')) {
      return;
    }

    setImportingNadiyasKitchen(true);
    setMessage('Importing nadiyaskitchen recipes...');

    try {
      const response = await fetch('/src/data/nadiyaskitchen-recipes.json');
      const nadiyasKitchenRecipes = await response.json();
      
      // Add nadiyaskitchen recipes to the current list
      const existingIds = new Set(recipesList.map(r => r.id));
      const newRecipes = nadiyasKitchenRecipes.filter((r: any) => !existingIds.has(r.id));
      
      setRecipesList([...recipesList, ...newRecipes]);
      setMessage(`Successfully imported ${newRecipes.length} nadiyaskitchen recipes.`);
    } catch (error) {
      console.error('Error importing nadiyaskitchen recipes:', error);
      setMessage('Error importing nadiyaskitchen recipes. Please try again.');
    } finally {
      setImportingNadiyasKitchen(false);
    }
  };

  const handleBulkImageUpload = async () => {
    if (bulkImageFiles.length === 0) {
      setMessage('Please select images to upload.');
      return;
    }

    setBulkUploadingImages(true);
    setMessage(`Uploading ${bulkImageFiles.length} images to CDN...`);

    try {
      const uploadResults = [];
      
      for (let i = 0; i < bulkImageFiles.length; i++) {
        const file = bulkImageFiles[i];
        try {
          // Compress image before upload
          const compressedFile = await compressImage(file, 1920, 0.8);
          const cdnUrl = await uploadToImgBB(compressedFile);
          uploadResults.push({
            fileName: file.name,
            cdnUrl: cdnUrl,
            success: true
          });
          setMessage(`Uploaded ${i + 1}/${bulkImageFiles.length} images...`);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          uploadResults.push({
            fileName: file.name,
            cdnUrl: null,
            success: false
          });
        }
      }

      const successCount = uploadResults.filter(r => r.success).length;
      const failCount = uploadResults.filter(r => !r.success).length;
      
      setMessage(`Successfully uploaded ${successCount} images. ${failCount > 0 ? `${failCount} failed.` : ''}`);
      
      // Save upload results to console for reference
      console.log('Bulk upload results:', uploadResults);
    } catch (error) {
      console.error('Error in bulk upload:', error);
      setMessage('Error uploading images. Please try again.');
    } finally {
      setBulkUploadingImages(false);
      setBulkImageFiles([]);
    }
  };

  const handleImportLonumedhuRecipes = async () => {
    if (!confirm('Are you sure you want to import lonumedhu recipes? This will update existing recipes with new titles (brand names removed).')) {
      return;
    }

    setImportingLonumedhu(true);
    setMessage('Importing lonumedhu recipes with updated titles...');

    try {
      const response = await fetch('/src/data/lonumedhu-recipes.json');
      const lonumedhuRecipes = await response.json();
      
      // Update existing recipes with new titles
      const updatedRecipes = recipesList.map(r => {
        const updated = lonumedhuRecipes.find((lr: any) => lr.id === r.id);
        if (updated) {
          return { ...r, titleDv: updated.titleDv, titleEn: updated.titleEn };
        }
        return r;
      });
      
      setRecipesList(updatedRecipes);
      setMessage(`Successfully updated ${lonumedhuRecipes.length} lonumedhu recipe titles. Click "Save All Recipes to Firebase" to update Firestore.`);
    } catch (error) {
      console.error('Error importing lonumedhu recipes:', error);
      setMessage('Error importing lonumedhu recipes. Please try again.');
    } finally {
      setImportingLonumedhu(false);
    }
  };

  // Handle quote photo upload
  const handleQuotePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuotePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuotePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Social Media Video
  const generateFacebookReel = async () => {
    if (!reelCanvas) return;

    setGeneratingReel(true);
    try {
      const canvas = reelCanvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size based on platform
      let canvasWidth = 1080;
      let canvasHeight = 1920;
      
      if (videoPlatform === 'youtube-video') {
        canvasWidth = 1920;
        canvasHeight = 1080;
      } else {
        // Facebook Reels, TikTok, YouTube Shorts all use 9:16 portrait
        canvasWidth = 1080;
        canvasHeight = 1920;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Preload logo
      const logo = new Image();
      logo.src = '/HAWA LOGO.jpg';
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve();
        logo.onerror = () => resolve(); // Continue even if logo fails to load
      });

      // Use text slides if available, otherwise use images
      const useTextSlides = textSlides.length > 0;
      const images = reelImageUrls.length > 0 ? await Promise.all(
        reelImageUrls.map(url => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
              // Create a placeholder if image fails to load
              const placeholder = new Image();
              placeholder.width = 1080;
              placeholder.height = 1920;
              resolve(placeholder);
            };
            img.src = url;
          });
        })
      ) : [];

      // Calculate duration based on text slides or images
      const totalSegments = useTextSlides ? textSlides.length : Math.max(images.length, 1);
      const durationPerSegment = reelDuration;
      const fps = 30;
      const totalFrames = (durationPerSegment * totalSegments * fps);

      // Create MediaRecorder with audio if available
      const stream = canvas.captureStream(fps);
      
      // Add audio to stream if audio file is provided
      if (audioUrl) {
        try {
          const audioContext = new AudioContext();
          const audioElement = new Audio(audioUrl);
          audioElement.loop = true;
          const source = audioContext.createMediaElementSource(audioElement);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination);
          
          // Add audio tracks to the stream
          const audioStream = destination.stream;
          audioStream.getAudioTracks().forEach(track => {
            stream.addTrack(track);
          });
          
          // Start playing audio
          audioElement.play().catch(e => console.log('Audio play error:', e));
        } catch (audioError) {
          console.log('Audio setup error:', audioError);
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setReelVideoUrl(url);
        setGeneratingReel(false);
      };

      mediaRecorder.start();

      // Animation loop
      let currentFrame = 0;
      const framesPerSegment = durationPerSegment * fps;
      const animate = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        const segmentIndex = Math.floor(currentFrame / framesPerSegment);
        const nextSegmentIndex = Math.min(segmentIndex + 1, totalSegments - 1);
        const progress = (currentFrame % framesPerSegment) / framesPerSegment;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background image if available
        if (images.length > 0) {
          const imageIndex = segmentIndex % images.length;
          const nextImageIndex = (segmentIndex + 1) % images.length;
          const currentImage = images[imageIndex];
          const nextImage = images[nextImageIndex];
          const controls = imageControls[imageIndex] || { zoom: 1, x: 0, y: 0 };

          ctx.globalAlpha = 1;

          if (reelTransition === 'fade') {
            ctx.globalAlpha = 1 - progress;
            drawImageCover(ctx, currentImage, canvas.width, canvas.height, controls.zoom, controls.x, controls.y);
            ctx.globalAlpha = progress;
            drawImageCover(ctx, nextImage, canvas.width, canvas.height, controls.zoom, controls.x, controls.y);
          } else if (reelTransition === 'slide') {
            if (progress < 0.1) {
              drawImageCover(ctx, currentImage, canvas.width, canvas.height, controls.zoom, controls.x, controls.y);
            } else {
              drawImageCover(ctx, nextImage, canvas.width, canvas.height, controls.zoom, controls.x, controls.y);
            }
          } else if (reelTransition === 'zoom') {
            const scale = (1 + progress * 0.5) * controls.zoom;
            ctx.save();
            ctx.translate(canvas.width / 2 + controls.x, canvas.height / 2 + controls.y);
            ctx.scale(scale, scale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawImageCover(ctx, currentImage, canvas.width, canvas.height, 1, 0, 0);
            ctx.restore();
          }
        } else {
          // Solid background if no images
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw text overlay - use current text slide
        if (useTextSlides && textSlides[segmentIndex]) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 15;
          
          // Word wrap text
          const text = textSlides[segmentIndex];
          const maxWidth = canvas.width - 100;
          const words = text.split(' ');
          let line = '';
          let y = canvas.height - 200;
          const lineHeight = 60;
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
              ctx.fillText(line, canvas.width / 2, y);
              line = words[i] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, canvas.width / 2, y);
          ctx.shadowBlur = 0;
        } else if (reelText) {
          // Fallback to single text if no slides
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.fillText(reelText, canvas.width / 2, canvas.height - 100);
          ctx.shadowBlur = 0;
        }

        // Draw logo
        ctx.globalAlpha = 0.9;
        const logoSize = 80;
        const logoPadding = 20;
        ctx.drawImage(logo, canvas.width - logoSize - logoPadding, canvas.height - logoSize - logoPadding, logoSize, logoSize);
        ctx.globalAlpha = 1;

        currentFrame++;
        requestAnimationFrame(animate);
      };

      animate();
    } catch (error) {
      console.error('Error generating reel:', error);
      setGeneratingReel(false);
    }
  };

  // Helper function to draw image with cover fit
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number,
    zoom: number = 1,
    offsetX: number = 0,
    offsetY: number = 0
  ) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas - fit to height, crop sides
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgRatio;
      drawX = (canvasWidth - drawWidth) / 2 + offsetX;
      drawY = offsetY;
    } else {
      // Image is taller than canvas - fit to width, crop top/bottom
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgRatio;
      drawX = offsetX;
      drawY = (canvasHeight - drawHeight) / 2 + offsetY;
    }

    // Apply zoom
    const zoomedWidth = drawWidth * zoom;
    const zoomedHeight = drawHeight * zoom;
    const zoomedX = drawX - (zoomedWidth - drawWidth) / 2;
    const zoomedY = drawY - (zoomedHeight - drawHeight) / 2;

    ctx.drawImage(img, zoomedX, zoomedY, zoomedWidth, zoomedHeight);
  };

  // Download Facebook Reel
  const downloadFacebookReel = () => {
    if (!reelVideoUrl) return;

    const a = document.createElement('a');
    a.href = reelVideoUrl;
    a.download = 'facebook-reel.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate Quote Poster
  const generateQuotePoster = () => {
    if (!quoteCanvas || !quotePhotoUrl) return;

    setGeneratingPoster(true);
    try {
      const canvas = quoteCanvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get dimensions based on platform
      const dimensions = quotePlatform === 'instagram-square' 
        ? { width: 1080, height: 1080 }
        : quotePlatform === 'instagram-portrait'
        ? { width: 1080, height: 1350 }
        : { width: 1200, height: 630 }; // Facebook landscape
      
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Load and draw the uploaded photo
      const img = new Image();
      img.onload = () => {
        // Calculate cover crop with custom controls
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let sx, sy, sWidth, sHeight;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas - crop sides
          sHeight = img.height;
          sWidth = img.height * canvasRatio;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          // Image is taller than canvas - crop top/bottom
          sWidth = img.width;
          sHeight = img.width / canvasRatio;
          sx = 0;
          sy = (img.height - sHeight) / 2;
        }
        
        // Apply custom position offset
        const zoomFactor = imageZoom / 100;
        const offsetX = (imageX / 100) * sWidth * 0.5;
        const offsetY = (imageY / 100) * sHeight * 0.5;
        
        // Apply zoom by adjusting source dimensions
        const zoomedSWidth = sWidth / zoomFactor;
        const zoomedSHeight = sHeight / zoomFactor;
        const zoomedSx = sx + (sWidth - zoomedSWidth) / 2 + offsetX;
        const zoomedSy = sy + (sHeight - zoomedSHeight) / 2 + offsetY;
        
        // Draw cropped image to fill canvas with controls
        ctx.drawImage(img, zoomedSx, zoomedSy, zoomedSWidth, zoomedSHeight, 0, 0, canvas.width, canvas.height);

        // Set text properties with custom controls
        const alphaValue = textTransparency / 100;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = alphaValue;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';

        // Calculate scale factor based on height
        const scaleFactor = canvas.height / 1350;

        // Draw quote text with custom controls
        const fontName = dhivehiFontRef.current ? 'Dhivehi' : 'Arial';
        const customTextSize = Math.round(textSize * scaleFactor);
        ctx.font = `bold ${customTextSize}px ${fontName}`;

        // Calculate text position based on controls
        let textPosX;
        if (textAlign === 'center') {
          textPosX = (textX / 100) * canvas.width;
        } else if (textAlign === 'right') {
          textPosX = canvas.width - Math.round(100 * scaleFactor);
        } else {
          textPosX = Math.round(100 * scaleFactor);
        }
        const textPosY = (textY / 100) * canvas.height;

        // Auto-calculate line gap based on font size and line height
        const autoLineGap = Math.round(customTextSize * lineHeight);

        // Wrap text if too long - respect newlines
        const maxTextWidth = canvas.width - Math.round(135 * scaleFactor);
        const lines = [];
        
        // Split by newlines first
        const paragraphs = quoteText.split('\n');
        let currentY = textPosY;
        
        for (const paragraph of paragraphs) {
          const words = paragraph.split(' ');
          let line = '';
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && i > 0) {
              lines.push({ text: line, y: currentY });
              line = words[i] + ' ';
              currentY += autoLineGap;
            } else {
              line = testLine;
            }
          }
          lines.push({ text: line, y: currentY });
          currentY += autoLineGap; // Extra gap between paragraphs
        }

        // Draw text background
        const bgAlphaValue = textBackgroundTransparency / 100;
        ctx.globalAlpha = bgAlphaValue;
        ctx.fillStyle = textBackgroundColor;

        const padding = Math.round(20 * scaleFactor);
        const firstLineY = lines[0].y;
        const lastLineY = lines[lines.length - 1].y;
        const bgHeight = lastLineY - firstLineY + autoLineGap + padding * 2;
        const bgY = firstLineY - autoLineGap / 2 - padding;

        ctx.fillRect(
          textPosX - maxTextWidth / 2 - padding,
          bgY,
          maxTextWidth + padding * 2,
          bgHeight
        );

        // Reset alpha for text
        ctx.globalAlpha = alphaValue;
        ctx.fillStyle = textColor;

        // Draw heading if provided
        if (quoteHeading) {
          // Calculate heading position based on controls
          let headingPosX;
          if (textAlign === 'center') {
            headingPosX = (headingX / 100) * canvas.width;
          } else if (textAlign === 'right') {
            headingPosX = canvas.width - Math.round(100 * scaleFactor);
          } else {
            headingPosX = Math.round(100 * scaleFactor);
          }
          const headingPosY = (headingY / 100) * canvas.height;

          // Draw heading background
          const headingBgAlphaValue = headingBackgroundTransparency / 100;
          ctx.globalAlpha = headingBgAlphaValue;
          ctx.fillStyle = headingBackgroundColor;
          
          ctx.font = `bold ${Math.round(headingSize * scaleFactor)}px ${fontName}`;
          const headingMetrics = ctx.measureText(quoteHeading);
          const headingPadding = Math.round(15 * scaleFactor);
          const headingBgWidth = headingMetrics.width + headingPadding * 2;
          const headingBgHeight = Math.round(headingSize * scaleFactor) + headingPadding * 2;
          
          ctx.fillRect(
            headingPosX - headingBgWidth / 2,
            headingPosY - headingBgHeight / 2,
            headingBgWidth,
            headingBgHeight
          );

          // Draw heading text
          ctx.globalAlpha = alphaValue;
          ctx.fillStyle = headingTextColor;
          ctx.fillText(quoteHeading, headingPosX, headingPosY);
        }

        // Reset font to main text size
        ctx.font = `bold ${customTextSize}px ${fontName}`;

        // Draw text lines
        lines.forEach((lineData) => {
          ctx.fillText(lineData.text, textPosX, lineData.y);
        });

        // Reset alpha
        ctx.globalAlpha = 1;

        // Draw logos
        quoteLogos.forEach((logoConfig) => {
          const logo = new Image();
          logo.onload = () => {
            const logoSize = Math.round(108 * scaleFactor);
            const logoPadding = Math.round(27 * scaleFactor);
            ctx.globalAlpha = logoConfig.opacity / 100;
            const logoPosX = (logoConfig.x / 100) * (canvas.width - logoSize);
            const logoPosY = (logoConfig.y / 100) * (canvas.height - logoSize);
            ctx.drawImage(logo, logoPosX, logoPosY, logoSize, logoSize);
            ctx.globalAlpha = 1;
          };
          logo.onerror = () => {
            // Logo failed to load, continue without it
          };
          logo.src = logoConfig.image;
        });

      };
      img.src = quotePhotoUrl;

    } catch (error) {
      console.error('Error generating quote poster:', error);
    } finally {
      setTimeout(() => setGeneratingPoster(false), 500);
    }
  };

  // Download quote poster function
  const downloadQuotePoster = async () => {
    if (!quoteCanvas) return;
    
    try {
      const dataUrl = quoteCanvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'quote-poster.png', { type: 'image/png' });
      
      // Compress image before download
      const compressedFile = await compressImage(file, 1920, 0.8);
      
      const link = document.createElement('a');
      link.download = `quote-poster-${Date.now()}.jpg`;
      link.href = URL.createObjectURL(compressedFile);
      link.click();
    } catch (error) {
      console.error('Error compressing/downloading quote poster:', error);
    }
  };

  // Tab groups for sidebar navigation
  const tabGroups = [
    {
      title: 'Content',
      tabs: [
        { id: 'articles' as const, label: t.createNews, icon: '📝' },
        { id: 'manage' as const, label: t.manageNews, icon: '📋' },
        { id: 'recipes' as const, label: t.recipes, icon: '🍳' },
        { id: 'stories' as const, label: 'ސްޓޯރީތައް', icon: '📖' },
        { id: 'golden-time' as const, label: 'ދިވެހި ރަން ޒަމާން', icon: '⏳' },
        { id: 'obituary' as const, label: 'ތަޢުޒިޔާ މޭކަރ', icon: '🕯️' },
        { id: 'funeral-poster' as const, label: 'ޖނާޒާގެ މަޢުލޫމާތު', icon: '📋' },
      ]
    },
    {
      title: 'Promotions',
      tabs: [
        { id: 'hero-slides' as const, label: t.manageHeroSlides, icon: '🖼️' },
        { id: 'banners' as const, label: t.manageBanners, icon: '🎨' },
        { id: 'sidebar-promotions' as const, label: 'Sidebar', icon: '📱' },
        { id: 'mid-article-promotions' as const, label: 'Mid-Article', icon: '📄' },
        { id: 'advertisements' as const, label: t.manageAdvertisements, icon: '📢' },
      ]
    },
    {
      title: 'Social Media',
      tabs: [
        { id: 'social-videos' as const, label: t.socialVideos, icon: '🎬' },
        { id: 'flyers' as const, label: t.jobFlyers, icon: '📄' },
        { id: 'quotes' as const, label: t.quotePosters, icon: '💬' },
        { id: 'quran' as const, label: 'ޤުރްއާން', icon: '📿' },
      ]
    },
    {
      title: 'Tools',
      tabs: [
        { id: 'rephrase' as const, label: 'ޚަބަރު ރީފްރޭޒް', icon: '🔄' },
        { id: 'checklist' as const, label: t.postLaunchChecklist, icon: '✅' },
      ]
    },
    {
      title: 'Analytics & Settings',
      tabs: [
        { id: 'analytics' as const, label: t.analytics, icon: '📊' },
        { id: 'settings' as const, label: t.settings, icon: '⚙️' },
      ]
    }
  ];

  if (user === undefined) {
    return (
      <div className={`rounded-[32px] border border-gray-200 bg-white p-8 shadow-soft ${language === 'dv' ? 'text-right' : 'text-left'}`} dir={language === 'dv' ? 'rtl' : 'ltr'}>
        <h2 className="text-2xl font-semibold text-gray-900">{t.loading}</h2>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className={`rounded-[32px] border border-gray-200 bg-white p-8 shadow-soft ${language === 'dv' ? 'text-right' : 'text-left'}`} dir={language === 'dv' ? 'rtl' : 'ltr'}>
        <h2 className="text-2xl font-semibold text-gray-900">{t.notLoggedIn}</h2>
        <p className="mt-4 text-gray-600">{t.pleaseLogin}</p>
      </div>
    );
  }

  return (
    <motion.div className={`flex gap-6 ${language === 'dv' ? 'text-right' : 'text-left'}`} dir={language === 'dv' ? 'rtl' : 'ltr'} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Sidebar Navigation */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-4 py-4">
          {tabGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group.title}</h4>
              <div className="space-y-1">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-brand-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Header */}
        <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{t.adminPanel}</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{t.adminDashboard}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {showInstallButton && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-purple-500 bg-purple-500/20 text-purple-700 transition hover:bg-purple-500/30"
                  aria-label="Install app"
                  title="Install Admin Panel App"
                >
                  📲
                </button>
              )}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}
                className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                aria-label="Toggle language"
                title="Toggle language"
              >
                {language === 'en' ? '🇬🇧' : '🇲🇻'}
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
              {user && (
              <div className="rounded-3xl bg-gray-100 p-3 sm:p-4 text-xs sm:text-sm text-gray-700 shadow-soft">
                <p>{t.news}: {articlesCount}</p>
                <p>{t.visits}: {visitorCount}</p>
                <button
                  onClick={handleLogout}
                  className="mt-2 sm:mt-3 w-full rounded-2xl border border-rose-600 px-2 sm:px-3 py-2 text-rose-600 transition hover:bg-rose-600/20"
                >
                  {t.logout}
                </button>
              </div>
            )}
            </div>
          </div>
          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300">
              {message}
            </div>
          )}
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-1 sm:gap-2 border-b border-gray-300 pb-3 sm:pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {(['articles', 'manage', 'hero-slides', 'banners', 'sidebar-promotions', 'mid-article-promotions', 'advertisements', 'analytics', 'settings', 'rephrase', 'checklist', 'flyers', 'quotes', 'social-videos', 'recipes', 'quran', 'stories', 'golden-time', 'obituary', 'funeral-poster'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-brand-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {tab === 'articles' && t.createNews}
              {tab === 'manage' && t.manageNews}
              {tab === 'hero-slides' && t.manageHeroSlides}
              {tab === 'banners' && t.manageBanners}
              {tab === 'sidebar-promotions' && 'Sidebar Promotions'}
              {tab === 'mid-article-promotions' && 'Mid-Article Promotions'}
              {tab === 'advertisements' && t.manageAdvertisements}
              {tab === 'analytics' && t.analytics}
              {tab === 'settings' && t.settings}
              {tab === 'rephrase' && 'ޚަބަރު ރީފްރޭޒް (Rephrase)'}
              {tab === 'checklist' && t.postLaunchChecklist}
              {tab === 'flyers' && t.jobFlyers}
              {tab === 'quotes' && t.quotePosters}
              {tab === 'social-videos' && t.socialVideos}
              {tab === 'recipes' && t.recipes}
              {tab === 'quran' && 'ޤުރްއާން (Quran)'}
              {tab === 'stories' && 'ސްޓޯރީތައް (Stories)'}
              {tab === 'golden-time' && 'ދިވެހި ރަން ޒަމާން'}
              {tab === 'obituary' && 'ތަޢުޒިޔާ މޭކަރ'}
              {tab === 'funeral-poster' && 'ޖނާޒާގެ މަޢުލޫމާތު'}
            </button>
          ))}
        </div>
        {activeTab === 'articles' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.createNews}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.newsDescription}</p>
            <form onSubmit={handleCreateArticle} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.titleDv}</label>
                  <input
                    value={titleDv}
                    onChange={(e) => setTitleDv(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="ޚަބަރުގެ ހެޑްލައިން ލިޔުން..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.title}</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="Type headline in English..."
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Category (English)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.titleEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">ލިޔެފައިވާ ފަރާތް (Author)</label>
                <input
                  list="authors-list"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="ލިޔެފައިވާ ފަރާތުގެ ނަން..."
                />
                <datalist id="authors-list">
                  {authors.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.excerptDv}</label>
                <input
                  value={excerptDv}
                  onChange={(e) => setExcerptDv(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="ޚަބަރުގެ ކުރުތަކެއް ލިޔުން..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.excerpt}</label>
                <input
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="Type short description in English..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.photoUrl}</label>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Image Upload Service</label>
                  <select
                    value={imageUploadOption}
                    onChange={(e) => setImageUploadOption(e.target.value as 'imgbb' | 'cloudinary')}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  >
                    <option value="imgbb">ImgBB (Free, Unlimited)</option>
                    <option value="cloudinary">Cloudinary (New Account)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArticleFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                />
              </div>

              {/* Social Media Links */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">YouTube Link (Optional)</label>
                  <input
                    type="url"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">TikTok Link (Optional)</label>
                  <input
                    type="url"
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://tiktok.com/@user/video/..."
                  />
                </div>
              </div>

              {/* Image Generator Section */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">އިމޭޖް ޖެނެރޭޓަރ (Image Generator)</h4>
                
                {/* Sample Image Option */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800');
                      setGeneratedImage(null);
                      setMessage('Sample image loaded');
                    }}
                    className="w-full rounded-2xl border border-purple-500 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-500/30"
                  >
                    ސެމްޕަލް އިމޭޖް ލޯޑް ކުރުން (Load Sample Image)
                  </button>
                </div>
                
                {/* Upload Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">އިމޭޖް އަޕްލޯޑް ކުރުން</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setUploadedImage(event.target?.result as string);
                          setGeneratedImage(null);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  />
                </div>

                {/* Text Input Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ޓެކްސްޓް އިންޕުޓް</label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="އެއްވެސް ޓެކްސްޓެއް ލިޔުން..."
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500 mb-2"
                  />
                  <input
                    type="text"
                    value={overlayText2}
                    onChange={(e) => setOverlayText2(e.target.value)}
                    placeholder="ދެވަނަ ރޯގަލް (އޮޕްޝަނަލް)"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  />
                </div>

                {/* Logo Position Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ލޮގޯ ޕޮޒިޝަން</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setLogoPosition(pos as any)}
                        className={`rounded-lg px-3 py-2 text-xs transition ${
                          logoPosition === pos
                            ? 'bg-brand-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Opacity Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ލޮގޯ އޮޕެސިޓީ</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(Number(e.target.value))}
                      className="flex-1 h-2 rounded-lg bg-gray-300 appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 w-16 text-right">{logoOpacity}%</span>
                  </div>
                </div>

                {/* Text Position Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ޓެކްސްޓް ޕޮޒިޝަން (ފުރަތަމަ ރޯގަލް)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setTextPosition(pos as any)}
                        className={`rounded-lg px-3 py-2 text-xs transition ${
                          textPosition === pos
                            ? 'bg-brand-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Position 2 Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ޓެކްސްޓް ޕޮޒިޝަން (ދެވަނަ ރޯގަލް)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setTextPosition2(pos as any)}
                        className={`rounded-lg px-3 py-2 text-xs transition ${
                          textPosition2 === pos
                            ? 'bg-brand-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ބެނަރ ކަލަރ</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={bannerColor}
                      onChange={(e) => setBannerColor(e.target.value)}
                      className="h-10 w-16 rounded-lg border border-gray-300 bg-white cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{bannerColor}</span>
                  </div>
                </div>

                {/* Gradient Color Picker Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ގްރޭޑިއެންޓް ކަލަރ</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={gradientColor}
                      onChange={(e) => setGradientColor(e.target.value)}
                      className="h-10 w-16 rounded-lg border border-gray-300 bg-white cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{gradientColor}</span>
                  </div>
                </div>

                {/* Gradient Location Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.gradientLocation}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGradientLocation('top')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        gradientLocation === 'top'
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t.gradientTop}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradientLocation('middle')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        gradientLocation === 'middle'
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t.gradientMiddle}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradientLocation('bottom')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        gradientLocation === 'bottom'
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t.gradientBottom}
                    </button>
                  </div>
                </div>

                {/* Font Size Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ފޮންޓް ސައިޒް</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-2 rounded-lg bg-gray-300 appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 w-16 text-right">{fontSize}px</span>
                  </div>
                </div>

                {/* Font Color Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ފޮންޓް ކަލަރ</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="h-10 w-16 rounded-lg border border-gray-300 bg-white cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{fontColor}</span>
                  </div>
                </div>

                {/* Font Style Section */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ފޮންޓް ސްޓައިލް</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['normal', 'bold', 'italic', 'bold italic'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setFontStyle(style as any)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          fontStyle === style
                            ? 'bg-brand-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {style.replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Preview Section */}
                {uploadedImage && (
                  <div className="mb-4 rounded-2xl border border-gray-300 bg-white p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">ޕްރިވިއު</h5>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="text-xs font-medium text-gray-600">އޮރިޖިނަލް އިމޭޖް</h6>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!uploadedImage) return;
                              try {
                                // Convert data URL to blob
                                const response = await fetch(uploadedImage);
                                const blob = await response.blob();
                                const file = new File([blob], 'original-image.png', { type: 'image/png' });
                                
                                // Compress image before download
                                const compressedFile = await compressImage(file, 1920, 0.8);
                                
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(compressedFile);
                                link.download = `original-image-${Date.now()}.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch (error) {
                                console.error('Error compressing/downloading image:', error);
                              }
                            }}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            ޑައުންލޯޑް
                          </button>
                        </div>
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="h-auto w-full rounded-lg border border-gray-300"
                        />
                      </div>
                      {generatedImage && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="text-xs font-medium text-gray-600">ޖެނެރޭޓް ކުރެވުނު އިމޭޖް</h6>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!generatedImage) return;
                                try {
                                  // Convert data URL to blob
                                  const response = await fetch(generatedImage);
                                  const blob = await response.blob();
                                  const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                                  
                                  // Compress image before download
                                  const compressedFile = await compressImage(file, 1920, 0.8);
                                  
                                  const link = document.createElement('a');
                                  link.href = URL.createObjectURL(compressedFile);
                                  link.download = `generated-image-${Date.now()}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } catch (error) {
                                  console.error('Error compressing/downloading image:', error);
                                }
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              ޑައުންލޯޑ෰
                            </button>
                          </div>
                          <img
                            src={generatedImage}
                            alt="Generated"
                            className="h-auto w-full rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Download Button */}
                {generatedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!generatedImage) return;
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `generated-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mb-2 w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    އިމޭޖް ޑައުންލޯޑް ކުރުން
                  </button>
                )}

                {/* Use in Article Button */}
                {generatedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      fetch(generatedImage)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                          setArticleFile(file);
                          setMessage('Generated image added to article');
                        });
                    }}
                    className="w-full rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
                  >
                    މި އިމޭޖް ބޭނުން ކުރާ (Use This Image)
                  </button>
                )}

                {/* Hidden Canvas */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">ވީޑިއޯ URL (Video URL)</label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">ވީޑިއޯ އަޕްލޯޑް (Upload Video)</label>
                <div className="mt-2 space-y-2">
                  <select
                    value={videoUploadOption}
                    onChange={(e) => setVideoUploadOption(e.target.value as 'cloudinary' | 'github')}
                    className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  >
                    <option value="github">GitHub (Free, Unlimited)</option>
                    <option value="cloudinary">Cloudinary (Over Limit)</option>
                  </select>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    disabled={uploadingVideo}
                  />
                  {uploadingVideo && <p className="text-xs text-gray-600">Uploading video...</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.readingTime}</label>
                <select
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((min) => (
                    <option key={min} value={`${min}މިނިޓް`}>
                      {min} މިނިޓް / {min} min
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.newsContent}</label>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{t.paragraphDv}</label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[200px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500"
                        placeholder="ޚަބަރުގެ މައްޗާ ލިޔުން..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{t.paragraphEn}</label>
                      <textarea
                        value={bodyEn}
                        onChange={(e) => setBodyEn(e.target.value)}
                        className="min-h-[200px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500"
                        placeholder="Type article content in English..."
                      />
                    </div>
                  </div>
                  
                  {/* Live Preview */}
                  <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">ޕްރިވިއު (Preview)</h4>
                      <span className="text-xs text-gray-500">އެހެން ވެހެ ފެންނަނީ އެއްވެސް ގޮތަކުން</span>
                    </div>
                    <div className="space-y-6">
                      <h1 className="text-2xl font-bold leading-[2.5] text-[#0077b6]">{titleDv || title}</h1>
                      <p className="text-sm leading-7 text-[#00b4d8]">{excerptDv || excerpt}</p>
                      <div className="space-y-6">
                        {(() => {
                          const bodyText = body || bodyEn;
                          if (!bodyText) return <p className="text-sm text-gray-400">ޕްރިވިއުގައި ދައްކާނީ...</p>;

                          // Split text into paragraphs after every 2 full stops (same logic as ArticlePage)
                          const paragraphs: string[] = [];
                          let currentParagraph = '';
                          let fullStopCount = 0;

                          for (let i = 0; i < bodyText.length; i++) {
                            const char = bodyText[i];
                            currentParagraph += char;

                            if (char === '.') {
                              fullStopCount++;
                              if (fullStopCount === 2) {
                                paragraphs.push(currentParagraph.trim());
                                currentParagraph = '';
                                fullStopCount = 0;
                              }
                            }
                          }

                          // Add any remaining text
                          if (currentParagraph.trim()) {
                            paragraphs.push(currentParagraph.trim());
                          }

                          return paragraphs.map((paragraph: string, index: number) => (
                            paragraph && (
                              <p key={index} className="text-base leading-8 text-slate-700">{paragraph}</p>
                            )
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={(e) => setTrending(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white"
                  />
                  {t.trending}
                </label>
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white"
                  />
                  Featured
                </label>
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={breaking}
                    onChange={(e) => setBreaking(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white"
                  />
                  {t.breaking}
                </label>
              </div>
              <button
                disabled={submitting}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t.submitting : t.submit}
              </button>

              {/* Article Created Actions */}
              {lastCreatedArticleId && (
                <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                  <h4 className="font-semibold text-green-800 mb-3">ޚަބަރު ޝާއިޢު ވެއްޖެ! (Article Published)</h4>
                  <div className="space-y-3">
                    <a
                      href={`/article/${lastCreatedArticleId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      👁️ ޚަބަރު ބަލާ (View Article)
                    </a>
                    <a
                      href="https://www.youtube.com/@HawaDaily"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      ▶️ YouTube Channel
                    </a>
                    <a
                      href="https://www.tiktok.com/@hawadaily"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-black px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                    >
                      🎵 TikTok Channel
                    </a>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.manageNews}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.deleteNewsDesc}</p>
            <div className="mt-6 space-y-3">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <div key={article.id} className="rounded-2xl border border-gray-300 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{article.title}</h4>
                        <p className="mt-1 text-xs text-gray-600">{article.publishedAt}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          <span className="text-gray-600">👁️ {article.views || 0} views</span>
                          {article.facebookPostId ? (
                            <span className="text-emerald-600">✓ Posted to Facebook</span>
                          ) : (
                            <span className="text-gray-500">Not posted to Facebook</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {article.featured && (
                          <button
                            onClick={() => handleToggleFeatured(article)}
                            className="rounded-xl border border-amber-600 px-3 py-1.5 text-sm text-amber-600 transition hover:bg-amber-600/20"
                            title="Remove Featured"
                          >
                            ⭐ Featured
                          </button>
                        )}
                        {article.breakingNews && (
                          <button
                            onClick={() => handleToggleBreaking(article)}
                            className="rounded-xl border border-red-600 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-600/20"
                            title="Remove Breaking"
                          >
                            🔴 Breaking
                          </button>
                        )}
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="rounded-xl border border-emerald-600 px-3 py-1.5 text-sm text-emerald-600 transition hover:bg-emerald-600/20"
                        >
                          {t.editNews}
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.facebookPostId)}
                          className="rounded-xl border border-rose-600 px-3 py-1.5 text-sm text-rose-600 transition hover:bg-rose-600/20"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">{t.noVisitors}</p>
              )}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.manageBanners}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.bannersDesc}</p>
            
            {/* Upload Form */}
            <form onSubmit={handleBannerUpload} className="mt-6 space-y-4">
              {bannerError && (
                <div className="rounded-2xl border border-rose-600 bg-rose-600/10 p-4 text-rose-400">
                  {bannerError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.bannerTitle}</label>
                <input
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder={t.bannerTitle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.bannerSubtitle}</label>
                <input
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder={t.bannerSubtitle}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="mt-2 flex-1 rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com"
                  />
                  {bannerLink && (
                    <a
                      href={bannerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.bannerLocation}</label>
                  <select
                    value={bannerLocation}
                    onChange={(e) => setBannerLocation(e.target.value as 'home' | 'article' | 'category')}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    <option value="home">{t.locationHome}</option>
                    <option value="article">{t.locationArticle}</option>
                    <option value="category">{t.locationCategory}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.bannerPosition}</label>
                  <select
                    value={bannerPosition}
                    onChange={(e) => setBannerPosition(e.target.value as 'top' | 'middle' | 'bottom')}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    <option value="top">{t.positionTop}</option>
                    <option value="middle">{t.positionMiddle}</option>
                    <option value="bottom">{t.positionBottom}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.bannerSize}</label>
                  <select
                    value={bannerSize}
                    onChange={(e) => setBannerSize(e.target.value as 'mobile' | 'desktop' | 'both')}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    <option value="mobile">{t.sizeMobile}</option>
                    <option value="desktop">{t.sizeDesktop}</option>
                    <option value="both">{t.sizeBoth}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.bannerImage}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                />
              </div>
              <button
                disabled={uploadingBanner}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingBanner ? t.uploading : t.uploadBanner}
              </button>
            </form>

            {/* Banners List */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.manageBanners}</h4>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {banners.length > 0 ? (
                  banners.map((banner) => (
                    <div key={banner.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
                      <img src={banner.image} alt={banner.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <h5 className="font-semibold text-gray-900 text-sm">{banner.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{banner.subtitle}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{banner.location}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{banner.position}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{banner.size}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="mt-3 w-full rounded-2xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600/20"
                      >
                        {t.deleteBanner}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">{t.noBanners}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Promotions Tab */}
        {activeTab === 'sidebar-promotions' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">Sidebar Promotions</h3>
            <p className="mt-2 text-sm text-gray-600">Manage promotional banners displayed in the home page sidebar</p>
            
            {/* Upload Form */}
            <form onSubmit={handleSidebarPromotionUpload} className="mt-6 space-y-4">
              {sidebarPromotionError && (
                <div className="rounded-2xl border border-rose-600 bg-rose-600/10 p-4 text-rose-400">
                  {sidebarPromotionError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <input
                  value={sidebarPromotionTitle}
                  onChange={(e) => setSidebarPromotionTitle(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="Promotion title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Link URL</label>
                <div className="flex gap-2">
                  <input
                    value={sidebarPromotionLink}
                    onChange={(e) => setSidebarPromotionLink(e.target.value)}
                    className="mt-2 flex-1 rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com"
                  />
                  {sidebarPromotionLink && (
                    <a
                      href={sidebarPromotionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Slot</label>
                <select
                  value={sidebarPromotionSlot}
                  onChange={(e) => setSidebarPromotionSlot(e.target.value as 'slot1' | 'slot2')}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                >
                  <option value="slot1">Slot 1 (Top)</option>
                  <option value="slot2">Slot 2 (Bottom)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSidebarPromotionFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                />
              </div>
              <button
                disabled={uploadingSidebarPromotion}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingSidebarPromotion ? 'Uploading...' : 'Upload Promotion'}
              </button>
            </form>

            {/* Promotions List */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Promotions</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                {sidebarPromotions.length > 0 ? (
                  sidebarPromotions.map((promotion) => (
                    <div key={promotion.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
                      <img src={promotion.image} alt={promotion.title} className="w-full h-40 object-cover rounded-lg mb-3" style={{ aspectRatio: '1/1.5' }} />
                      <h5 className="font-semibold text-gray-900 text-sm">{promotion.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">Slot: {promotion.slot === 'slot1' ? 'Slot 1 (Top)' : 'Slot 2 (Bottom)'}</p>
                      {promotion.link && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{promotion.link}</p>
                      )}
                      <button
                        onClick={() => handleDeleteSidebarPromotion(promotion.id)}
                        className="mt-3 w-full rounded-2xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600/20"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No sidebar promotions yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mid-Article Promotions Tab */}
        {activeTab === 'mid-article-promotions' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">Mid-Article Promotions</h3>
            <p className="mt-2 text-sm text-gray-600">Manage promotional banners displayed between article body sections (max height: 200px)</p>
            
            {/* Upload Form */}
            <form onSubmit={handleMidArticlePromotionUpload} className="mt-6 space-y-4">
              {midArticlePromotionError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                  {midArticlePromotionError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <input
                  type="text"
                  value={midArticlePromotionTitle}
                  onChange={(e) => setMidArticlePromotionTitle(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="Promotion title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={midArticlePromotionLink}
                    onChange={(e) => setMidArticlePromotionLink(e.target.value)}
                    className="mt-2 flex-1 rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com"
                  />
                  {midArticlePromotionLink && (
                    <a
                      href={midArticlePromotionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMidArticlePromotionFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                />
              </div>
              <button
                disabled={uploadingMidArticlePromotion}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingMidArticlePromotion ? 'Uploading...' : 'Upload Promotion'}
              </button>
            </form>

            {/* Promotions List */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Promotions</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                {midArticlePromotions.length > 0 ? (
                  midArticlePromotions.map((promotion) => (
                    <div key={promotion.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
                      <img src={promotion.image} alt={promotion.title} className="w-full h-auto object-cover rounded-lg mb-3" style={{ maxHeight: '200px' }} />
                      <h5 className="font-semibold text-gray-900 text-sm">{promotion.title}</h5>
                      {promotion.link && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{promotion.link}</p>
                      )}
                      <button
                        onClick={() => handleDeleteMidArticlePromotion(promotion.id)}
                        className="mt-3 w-full rounded-2xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600/20"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No mid-article promotions yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advertisements Tab */}
        {activeTab === 'advertisements' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.manageAdvertisements}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.advertisementsDesc}</p>
            
            {/* Upload Form */}
            <form onSubmit={handleUploadAdvertisement} className="mt-6 space-y-4">
              {advertisementError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                  {advertisementError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.selectAdSlot}</label>
                <select
                  value={selectedAdSlot}
                  onChange={(e) => setSelectedAdSlot(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                >
                  <option value="">{t.noAdvertisementSelected}</option>
                  {advertisementSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} - {slot.page} ({slot.side})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.advertisementImage}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAdvertisementFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                />
              </div>
              <button
                disabled={uploadingAdvertisement}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingAdvertisement ? t.uploading : t.uploadAdvertisement}
              </button>
            </form>

            {/* Advertisements List */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.currentAdvertisement}</h4>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {advertisementSlots.map((slot) => {
                  const adData = advertisements[slot.id];
                  return (
                    <div key={slot.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">{slot.label}</h5>
                      <p className="text-xs text-gray-600 mb-3">{slot.page} - {slot.side}</p>
                      {adData?.image ? (
                        <>
                          <img src={adData.image} alt={slot.label} className="w-full h-auto object-cover rounded-lg mb-3" />
                          <button
                            onClick={() => handleDeleteAdvertisement(slot.id)}
                            className="w-full rounded-2xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600/20"
                          >
                            {t.deleteAdvertisement}
                          </button>
                        </>
                      ) : (
                        <div className="rounded-lg bg-gray-100 p-8 text-center text-sm text-gray-500">
                          No image uploaded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hero Slides Tab */}
        {activeTab === 'hero-slides' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.manageHeroSlides}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.heroSlidesDesc}</p>
            
            {/* Add to Hero Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleAddToHero(); }} className="mt-6 space-y-4">
              {heroSlidesError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                  {heroSlidesError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700">{t.selectHeroArticle}</label>
                <select
                  value={selectedHeroArticle}
                  onChange={(e) => setSelectedHeroArticle(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                >
                  <option value="">{t.noAdvertisementSelected}</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                disabled={updatingHeroSlides}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingHeroSlides ? t.uploading : t.addToHero}
              </button>
            </form>

            {/* Hero Slides List */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.currentAdvertisement}</h4>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {heroSlides.length > 0 ? (
                  heroSlides.map((slide) => (
                    <div key={slide.articleId} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
                      <img src={slide.image} alt={slide.title} className="w-full h-auto object-cover rounded-lg mb-3" />
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">{slide.title}</h5>
                      <button
                        onClick={() => handleRemoveFromHero(slide.articleId)}
                        className="w-full rounded-2xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600/20"
                      >
                        {t.removeFromHero}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">{t.noHeroSlides}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
              <h3 className="text-2xl font-bold text-gray-900">{t.editNews}</h3>
              <form onSubmit={handleSaveEdit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">{t.titleDv}</label>
                    <input
                      value={editTitleDv}
                      onChange={(e) => setEditTitleDv(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ޚަބަރުގެ ހެޑްލައިން ލިޔުން..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">{t.title}</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Type headline in English..."
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">{t.category}</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Category (English)</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">ލިޔެފައިވާ ފަރާތް (Author)</label>
                  <input
                    list="edit-authors-list"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="ލިޔެފައިވާ ފަރާތުގެ ނަން..."
                  />
                  <datalist id="edit-authors-list">
                    {authors.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.excerptDv}</label>
                  <input
                    value={editExcerptDv}
                    onChange={(e) => setEditExcerptDv(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="ޚަބަރުގެ ކުރުތަކެއް ލިޔުން..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.excerpt}</label>
                  <input
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="Type short description in English..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.photoUrl}</label>
                  <input
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Image Upload Service</label>
                  <select
                    value={editImageUploadOption}
                    onChange={(e) => setEditImageUploadOption(e.target.value as 'cloudinary' | 'imgbb')}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  >
                    <option value="imgbb">ImgBB (Free, Unlimited)</option>
                    <option value="cloudinary">Cloudinary (Over Limit)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditArticleFile(e.target.files?.[0] || null)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">ވީޑިއޯ URL (Video URL)</label>
                  <input
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">ވީޑިއޯ އަޕްލޯޑް (Upload Video)</label>
                  <div className="mt-2 space-y-2">
                    <select
                      value={editVideoUploadOption}
                      onChange={(e) => setEditVideoUploadOption(e.target.value as 'cloudinary' | 'github')}
                      className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="github">GitHub (Free, Unlimited)</option>
                      <option value="cloudinary">Cloudinary (Over Limit)</option>
                    </select>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      disabled={uploadingEditVideo}
                    />
                    {uploadingEditVideo && <p className="text-xs text-gray-600">Uploading video...</p>}
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">YouTube Link (Optional)</label>
                    <input
                      type="url"
                      value={editYoutubeLink}
                      onChange={(e) => setEditYoutubeLink(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">TikTok Link (Optional)</label>
                    <input
                      type="url"
                      value={editTiktokLink}
                      onChange={(e) => setEditTiktokLink(e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="https://tiktok.com/@user/video/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">{t.readingTime}</label>
                  <select
                    value={editReadingTime}
                    onChange={(e) => setEditReadingTime(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((min) => (
                      <option key={min} value={`${min}މިނިޓް`}>
                        {min} މިނިޓް / {min} min
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.newsContent}</label>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t.paragraphDv}</label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="min-h-[200px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500"
                          placeholder="ޚަބަރުގެ މައްޗާ ލިޔުން..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t.paragraphEn}</label>
                        <textarea
                          value={editBodyEn}
                          onChange={(e) => setEditBodyEn(e.target.value)}
                          className="min-h-[200px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500"
                          placeholder="Type article content in English..."
                        />
                      </div>
                    </div>
                    
                    {/* Live Preview for Edit */}
                    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-700">ޕްރިވިއު (Preview)</h4>
                        <span className="text-xs text-gray-500">އެހެން ވެހެ ފެންނަނީ އެއްވެސް ގޮތަކުން</span>
                      </div>
                      <div className="space-y-6">
                        <h1 className="text-2xl font-bold leading-[2.5] text-[#0077b6]">{editTitleDv || editTitle}</h1>
                        <p className="text-sm leading-7 text-[#00b4d8]">{editExcerptDv || editExcerpt}</p>
                        <div className="space-y-6">
                          {(() => {
                            const bodyText = editBody || editBodyEn;
                            if (!bodyText) return <p className="text-sm text-gray-400">ޕްރިވިއުގައި ދައްކާނީ...</p>;

                            // Split text into paragraphs after every 2 full stops (same logic as ArticlePage)
                            const paragraphs: string[] = [];
                            let currentParagraph = '';
                            let fullStopCount = 0;

                            for (let i = 0; i < bodyText.length; i++) {
                              const char = bodyText[i];
                              currentParagraph += char;

                              if (char === '.') {
                                fullStopCount++;
                                if (fullStopCount === 2) {
                                  paragraphs.push(currentParagraph.trim());
                                  currentParagraph = '';
                                  fullStopCount = 0;
                                }
                              }
                            }

                            // Add any remaining text
                            if (currentParagraph.trim()) {
                              paragraphs.push(currentParagraph.trim());
                            }

                            return paragraphs.map((paragraph: string, index: number) => (
                              paragraph && (
                                <p key={index} className="text-base leading-8 text-slate-700">{paragraph}</p>
                              )
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={editTrending}
                      onChange={(e) => setEditTrending(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-white"
                    />
                    {t.trending}
                  </label>
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-white"
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={editBreaking}
                      onChange={(e) => setEditBreaking(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-white"
                    />
                    {t.breaking}
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                  >
                    {t.saveChanges}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingArticle(null)}
                    className="flex-1 rounded-3xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-semibold text-gray-900">{t.analytics}</h3>
              
              {/* Date Range Selector */}
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateRange('today')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      dateRange === 'today' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    މިދުވަސް (Today)
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      dateRange === 'week' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ހަފުތަކެއް (Week)
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      dateRange === 'month' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    މަހެއް (Month)
                  </button>
                  <button
                    onClick={() => setDateRange('custom')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      dateRange === 'custom' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    އިޚްތިޔާރީ (Custom)
                  </button>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
                  <p className="text-sm text-sky-700">
                    {dateRange === 'today' ? 'މިދުވަސްގެ ވިސިޓަރުން' : 
                     dateRange === 'week' ? 'ހަފުތަކެއްގެ ވިސިޓަރުން' : 
                     dateRange === 'month' ? 'މަހެއްގެ ވިސިޓަރުން' : 
                     'އިޚްތިޔާރީ ވިސިޓަރުން'}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-sky-900">{filteredVisitorCount}</p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-600">{t.totalNews}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{articlesCount}</p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-600">{t.totalVisits}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{visitorCount}</p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-600">{t.uniqueVisitors}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{uniqueVisitors}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4 border border-orange-200">
                  <p className="text-sm text-orange-700">ރެސިޕީ ޒިޔާރަތްތައް (Recipes Visits)</p>
                  <p className="mt-2 text-3xl font-bold text-orange-900">{recipesVisits}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-700">ވަޒީފާ ޒިޔާރަތްތައް (Jobs Visits)</p>
                  <p className="mt-2 text-3xl font-bold text-blue-900">{jobsVisits}</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4 border border-green-200">
                  <p className="text-sm text-green-700">މައި ސަފުހާ ޒިޔާރަތްތައް (Home Page Visits)</p>
                  <p className="mt-2 text-3xl font-bold text-green-900">{homeVisits}</p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
                  <p className="text-sm text-purple-700">ޤުރުއާން ސަފުހާ ޒިޔާރަތްތައް (Quran Page Visits)</p>
                  <p className="mt-2 text-3xl font-bold text-purple-900">{quranVisits}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{t.facebookPage}</h3>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    loadFacebookInsights();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      loadFacebookInsights();
                    }
                  }}
                  className={`rounded-2xl border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 cursor-pointer select-none ${loadingInsights ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingInsights ? t.loadingInsights : t.refreshInsights}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {facebookInsights ? (
                  <>
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600">{t.pageViews}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{facebookInsights.page_views || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600">{t.pageLikes}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{facebookInsights.page_likes || 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600">{t.pageFollowers}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{facebookInsights.page_followers || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-600">{loadingInsights ? t.loadingInsights : 'Click refresh to load insights'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Vercel Analytics</h3>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    loadVercelAnalytics();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      loadVercelAnalytics();
                    }
                  }}
                  className={`rounded-2xl border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 cursor-pointer select-none ${loadingVercelAnalytics ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingVercelAnalytics ? 'Loading...' : 'Refresh'}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {vercelAnalytics ? (
                  <>
                    <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
                      <p className="text-sm text-sky-700">Visitors</p>
                      <p className="mt-2 text-3xl font-bold text-sky-900">{vercelAnalytics.visitors}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600">Page Views</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{vercelAnalytics.pageViews}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600">Bounce Rate</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{vercelAnalytics.bounceRate}%</p>
                    </div>
                    
                    {/* Top Pages */}
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600 mb-3">Top Pages</p>
                      <div className="space-y-2">
                        {vercelAnalytics.topPages.slice(0, 5).map((page: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate flex-1">{page.path}</span>
                            <span className="font-semibold text-gray-900 ml-2">{page.visitors}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Referrers */}
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600 mb-3">Referrers</p>
                      <div className="space-y-2">
                        {vercelAnalytics.referrers.slice(0, 5).map((ref: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate flex-1">{ref.referrer}</span>
                            <span className="font-semibold text-gray-900 ml-2">{ref.visitors}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Countries */}
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600 mb-3">Countries</p>
                      <div className="space-y-2">
                        {vercelAnalytics.countries.slice(0, 5).map((country: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate flex-1">{country.country}</span>
                            <span className="font-semibold text-gray-900 ml-2">{country.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Devices */}
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600 mb-3">Devices</p>
                      <div className="space-y-2">
                        {vercelAnalytics.devices.map((device: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate flex-1">{device.device}</span>
                            <span className="font-semibold text-gray-900 ml-2">{device.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operating Systems */}
                    <div className="rounded-2xl bg-gray-100 p-4">
                      <p className="text-sm text-gray-600 mb-3">Operating Systems</p>
                      <div className="space-y-2">
                        {vercelAnalytics.operatingSystems.map((os: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate flex-1">{os.os}</span>
                            <span className="font-semibold text-gray-900 ml-2">{os.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(vercelAnalytics.lastUpdated).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <div className="rounded-2xl bg-gray-100 p-4">
                    <p className="text-sm text-gray-600">{loadingVercelAnalytics ? 'Loading Vercel Analytics...' : 'Click refresh to load Vercel Analytics'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-semibold text-gray-900">{t.visitorLog}</h3>
              <div className="mt-4 space-y-3 text-sm max-h-96 overflow-y-auto">
                {topVisitors.length > 0 ? (
                  topVisitors.map((visitor) => {
                    const parsed = parseUserAgent(visitor.userAgent);
                    return (
                      <div key={visitor.id} className="rounded-2xl border border-gray-300 bg-gray-100 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{visitor.path || 'Home'}</p>
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              <p><span className="text-gray-500">{t.device}:</span> {visitor.deviceType || parsed.deviceType}</p>
                              <p><span className="text-gray-500">{t.browser}:</span> {visitor.browser || parsed.browser}</p>
                              <p><span className="text-gray-500">{t.os}:</span> {visitor.os || parsed.os}</p>
                              <p><span className="text-gray-500">{t.screen}:</span> {visitor.screenResolution || visitor.viewport || 'Not available'}</p>
                              <p><span className="text-gray-500">{t.referrer}:</span> {visitor.referrer || 'Direct'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {visitor.timestamp ? new Date(visitor.timestamp.seconds * 1000).toLocaleString() : visitor.visitTime || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{visitor.timezone || 'Unknown'}</p>
                            <p className="mt-1 text-xs text-gray-600">
                              {visitor.isNewVisitor ? '🆕 New' : '↩️ Return'}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              {visitor.isSameDevice !== undefined ? (visitor.isSameDevice ? `📱 ${t.sameDevice}` : `🆕 ${t.newDevice}`) : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600">{t.noVisitors}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.settings}</h3>
            <div className="mt-6 space-y-6">
              {/* Migrate Slugs Button */}
              <div className="rounded-2xl border border-brand-300 bg-brand-50 p-4">
                <h4 className="font-semibold text-gray-900">Add Slugs to Existing Documents</h4>
                <p className="mt-2 text-sm text-gray-600">Add URL-friendly slugs to existing stories and golden-time articles that don't have them</p>
                <button
                  onClick={handleMigrateSlugs}
                  disabled={migratingSlugs}
                  className="mt-3 w-full rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {migratingSlugs ? 'Migrating...' : 'Migrate Slugs'}
                </button>
                {migrationResult && (
                  <div className="mt-3 rounded-xl border border-gray-300 bg-white p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{migrationResult}</pre>
                  </div>
                )}
              </div>

              {/* Fix Negative Counts Button */}
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4">
                <h4 className="font-semibold text-gray-900">Fix Negative Like/Dislike Counts</h4>
                <p className="mt-2 text-sm text-gray-600">Reset all negative like/dislike counts in the database to 0</p>
                <button
                  onClick={handleFixNegativeCounts}
                  className="mt-3 w-full rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                >
                  Fix Negative Counts
                </button>
              </div>

              <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4">
                <h4 className="font-semibold text-gray-900">{t.translateTitle}</h4>
                <p className="mt-2 text-sm text-gray-600">{t.translateDesc}</p>
                <div className="mt-4 space-y-3">
                  <textarea
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    className="min-h-[80px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                    placeholder={t.englishPlaceholder}
                  />
                  <button
                    onClick={handleTranslate}
                    disabled={translating || !englishText.trim()}
                    className="w-full rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {translating ? t.translating : t.translate}
                  </button>
                  {dhivehiText && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <p className="text-sm font-semibold text-emerald-600 mb-2">{t.dhivehi}:</p>
                      <p className="text-gray-900">{dhivehiText}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dhivehiText);
                          setMessage(t.copied);
                        }}
                        className="mt-3 rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-200"
                      >
                        {t.copy}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4">
                <h4 className="font-semibold text-gray-900">{t.changePassword}</h4>
                <p className="mt-2 text-sm text-gray-600">{t.changePasswordDesc}</p>
                <button className="mt-4 rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
                  {t.change}
                </button>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4">
                <h4 className="font-semibold text-gray-900">{t.deleteAccount}</h4>
                <p className="mt-2 text-sm text-gray-600">{t.deleteAccountDesc}</p>
                <button className="mt-4 rounded-2xl border border-rose-600 px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-600/20">
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rephrase Tab */}
        {activeTab === 'rephrase' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">ޚަބަރު އުފެއްދާ (Create News)</h3>
            <p className="mt-2 text-sm text-gray-600">ޚަބަރު ކޮޕީ ކުރާ އަދި އުފެއްދާ</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">ޚަބަރު ކޮޕީ ކުރާ (Paste News Content)</label>
                <textarea
                  value={fetchedContent}
                  onChange={(e) => setFetchedContent(e.target.value)}
                  className="mt-2 min-h-[300px] w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  placeholder="ޚަބަރު ކޮޕީ ކުރާ... (އެކްސާޕްޓް އަދި ބޮޑީ އެކުލަވާލާ)"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  // Parse the pasted content to extract title, excerpt, and body
                  const lines = fetchedContent.split('\n').filter(line => line.trim());
                  
                  // Helper function to clean markdown formatting
                  const cleanMarkdown = (text: string) => {
                    return text
                      .replace(/#{1,6}\s*/g, '')      // Remove heading markers (#, ##, etc.)
                      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove **bold** but keep content
                      .replace(/\*(.+?)\*/g, '$1')     // Remove *italic* but keep content
                      .replace(/`(.+?)`/g, '$1')       // Remove `code` but keep content
                      .replace(/~~(.+?)~~/g, '$1')     // Remove ~~strikethrough~~ but keep content
                      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove [link](url) but keep text
                      .replace(/!\[.+?\]\(.+?\)/g, '')  // Remove images
                      .replace(/^>\s*/gm, '')          // Remove blockquotes
                      .replace(/\n{3,}/g, '\n\n')      // Reduce multiple newlines
                      .trim();
                  };
                  
                  // Find title - look for markdown heading or first non-empty line
                  let title = '';
                  let startIndex = 0;
                  
                  // First, check if the first line is a section header like "ހެޑްލައިން"
                  if (lines[0]?.trim() === 'ހެޑްލައިން') {
                    // Skip the section header
                    startIndex = 1;
                    console.log('Found ހެޑްލައިން header, skipping it');
                    // Skip empty lines after heading
                    while (startIndex < lines.length && !lines[startIndex]?.trim()) {
                      startIndex++;
                    }
                    console.log('After skipping empty lines, startIndex:', startIndex);
                    if (startIndex < lines.length) {
                      title = cleanMarkdown(lines[startIndex]).trim();
                      startIndex++;
                      console.log('Title set to:', title);
                    }
                  } else if (lines[0]?.match(/^#{1,6}\s*\*\*(.+?)\*\*$/)) {
                    // First line is a heading like ### **ހެޑިންގ**
                    // This is just a section marker, skip it and look for the actual title
                    startIndex = 1;
                    // Skip empty lines after heading
                    while (startIndex < lines.length && !lines[startIndex]?.trim()) {
                      startIndex++;
                    }
                    // Check if next non-empty line is bold text (the actual title)
                    const boldMatch = lines[startIndex]?.match(/^\*\*(.+?)\*\*$/);
                    if (boldMatch) {
                      title = boldMatch[1].trim();
                      startIndex++;
                    } else if (lines[startIndex]) {
                      // Use the next line as title and clean any markdown
                      const nextLineClean = cleanMarkdown(lines[startIndex]);
                      title = nextLineClean;
                      startIndex++;
                    }
                  } else if (lines[0]?.match(/^#{1,6}\s*(.+)$/)) {
                    // First line is a plain heading like ### Heading
                    // This is just a section marker, skip it
                    startIndex = 1;
                    // Skip empty lines after heading
                    while (startIndex < lines.length && !lines[startIndex]?.trim()) {
                      startIndex++;
                    }
                    // Check if next non-empty line is bold text (the actual title)
                    const boldMatch = lines[startIndex]?.match(/^\*\*(.+?)\*\*$/);
                    if (boldMatch) {
                      title = boldMatch[1].trim();
                      startIndex++;
                    } else if (lines[startIndex]) {
                      // Use the next line as title and clean any markdown
                      const nextLineClean = cleanMarkdown(lines[startIndex]);
                      title = nextLineClean;
                      startIndex++;
                    }
                  } else {
                    // Check if first line is just bold (**Title**)
                    const boldMatch = lines[0]?.match(/^\*\*(.+?)\*\*$/);
                    if (boldMatch) {
                      title = boldMatch[1].trim();
                      startIndex = 1;
                    } else if (lines[0]) {
                      // Use first line as title and clean any markdown
                      const firstLineClean = cleanMarkdown(lines[0]);
                      title = firstLineClean;
                      startIndex = 1;
                    }
                  }
                  
                  // If title is still empty after parsing, try to get it from the first non-heading line
                  if (!title && lines.length > 0) {
                    // Check if the first line is a heading (## ހެޑްލައިން)
                    if (lines[0]?.match(/^#{1,6}\s+/)) {
                      // Use the heading as title (cleaned)
                      title = cleanMarkdown(lines[0]);
                      startIndex = 1;
                    } else {
                      // Skip any heading lines and get the first actual content
                      let contentIndex = 0;
                      while (contentIndex < lines.length && lines[contentIndex]?.match(/^#{1,6}\s*/)) {
                        contentIndex++;
                      }
                      // Skip empty lines
                      while (contentIndex < lines.length && !lines[contentIndex]?.trim()) {
                        contentIndex++;
                      }
                      if (contentIndex < lines.length) {
                        title = cleanMarkdown(lines[contentIndex]);
                        startIndex = contentIndex + 1;
                      }
                    }
                  }
                  
                  console.log('Parsing result:', { title, startIndex, lines: lines.slice(0, 10) });
                  
                  // Find the "އެކްސާޕްޓް" (Excerpt) section - handle plain text and markdown format
                  const excerptIndex = lines.findIndex((line, index) => 
                    index >= startIndex && (
                      line.trim() === 'އެކްސާޕްޓް' || 
                      line.trim() === '### **އެކްސާޕްޓް**' || 
                      line.trim() === '**އެކްސާޕްޓް**' || 
                      line.trim() === '### އެކްސާޕްޓް' ||
                      line.trim() === '## **އެކްސާޕްޓް**' ||
                      line.trim() === '# **އެކްސާޕްޓް**' ||
                      line.trim() === '## އެކްސާޕްޓް' ||
                      line.trim() === '# އެކްސާޕްޓް'
                    )
                  );
                  
                  console.log('Excerpt index:', excerptIndex, excerptIndex !== -1 ? lines[excerptIndex] : 'Not found');
                  
                  // Find the "ބޮޑީ" (Body) section - handle plain text and markdown format
                  const bodyIndex = lines.findIndex((line, index) => 
                    index >= startIndex && (
                      line.trim() === 'ބޮޑީ' || 
                      line.trim() === '### **ބޮޑީ**' || 
                      line.trim() === '**ބޮޑީ**' || 
                      line.trim() === '### ބޮޑީ' ||
                      line.trim() === '## **ބޮޑީ**' ||
                      line.trim() === '# **ބޮޑީ**' ||
                      line.trim() === '## ބޮޑީ' ||
                      line.trim() === '# ބޮޑީ'
                    )
                  );
                  
                  console.log('Body index:', bodyIndex, bodyIndex !== -1 ? lines[bodyIndex] : 'Not found');
                  
                  let excerpt = '';
                  let body = '';
                  
                  if (excerptIndex !== -1 && bodyIndex !== -1) {
                    // Excerpt is between "އެކްސާޕްޓް" and "ބޮޑީ"
                    excerpt = lines.slice(excerptIndex + 1, bodyIndex).join('\n').trim();
                    // Body is after "ބޮޑީ"
                    body = lines.slice(bodyIndex + 1).join('\n').trim();
                  } else if (excerptIndex !== -1) {
                    // Only excerpt found, rest is body
                    excerpt = lines.slice(excerptIndex + 1).join('\n').trim();
                    body = excerpt;
                  } else if (bodyIndex !== -1) {
                    // Only body found, everything before it is excerpt
                    excerpt = lines.slice(startIndex, bodyIndex).join('\n').trim();
                    body = lines.slice(bodyIndex + 1).join('\n').trim();
                  } else {
                    // No sections found, use everything after title as body
                    body = lines.slice(startIndex).join('\n').trim();
                    excerpt = body.split('\n')[0]?.substring(0, 300) || '';
                  }
                  
                  // Clean markdown formatting from all fields
                  title = cleanMarkdown(title);
                  excerpt = cleanMarkdown(excerpt);
                  body = cleanMarkdown(body);
                  
                  console.log('Parsed:', { title, excerpt, body }); // Debug log
                  
                  // Auto-fill the create article form
                  setTitle(title);
                  setTitleDv(title);
                  setExcerpt(excerpt);
                  setExcerptDv(excerpt);
                  setBody(body);
                  setBodyEn(body);
                  setActiveTab('articles');
                  setMessage('Content auto-filled to Create News');
                }}
                disabled={!fetchedContent.trim()}
                className="w-full rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
              >
                ޚަބަރު އުފެއްދާ (Create News)
              </button>
            </div>
          </div>
        )}

        {/* Post-Launch Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.postLaunchChecklist}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.checklistDescription}</p>
            
            <div className="mt-6 space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setChecklistItems(prev =>
                        prev.map(i =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i
                        )
                      );
                    }}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 transition-colors ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {t[item.text as keyof typeof t]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-200">
              <p className="text-sm text-sky-700">
                <strong>Progress:</strong> {checklistItems.filter(i => i.completed).length} / {checklistItems.length} completed
              </p>
              <div className="mt-2 h-2 bg-sky-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${(checklistItems.filter(i => i.completed).length / checklistItems.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Job Flyers Tab */}
        {activeTab === 'flyers' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.jobFlyers}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.jobFlyersDesc}</p>
            
            <div className="mt-6 space-y-6">
              {/* Job Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.selectJob}</label>
                <select
                  value={selectedJob?.id || ''}
                  onChange={(e) => {
                    const job = jobs.find(j => j.id === e.target.value);
                    setSelectedJob(job || null);
                  }}
                  className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                >
                  <option value="">{t.selectJob}</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title || job.titleEn || job.titleDv || 'Untitled Job'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Size Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.platformSize}</label>
                <select
                  value={flyerPlatform}
                  onChange={(e) => setFlyerPlatform(e.target.value as 'facebook' | 'instagram-square' | 'instagram-portrait')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="facebook">{t.facebook}</option>
                  <option value="instagram-square">{t.instagramSquare}</option>
                  <option value="instagram-portrait">{t.instagramPortrait}</option>
                </select>
              </div>

              {/* Flyer Preview */}
              {selectedJob && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
                    <canvas
                      ref={(canvas) => setFlyerCanvas(canvas)}
                      width={1080}
                      height={1350}
                      className="w-full h-auto rounded-lg shadow-md"
                      style={{ display: 'none' }}
                    />
                    <div
                      id="flyer-preview"
                      className="w-full h-auto rounded-lg shadow-md bg-gradient-to-br from-blue-500 to-cyan-400 p-8 text-white"
                      style={{ minHeight: '400px' }}
                    >
                      <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">{selectedJob.title || selectedJob.titleEn || selectedJob.titleDv || 'Job Title'}</h2>
                        {selectedJob.company && (
                          <p className="text-xl font-semibold">{selectedJob.company}</p>
                        )}
                        {selectedJob.location && (
                          <p className="text-lg">📍 {selectedJob.location}</p>
                        )}
                        {selectedJob.salary && (
                          <p className="text-lg">💰 {selectedJob.salary}</p>
                        )}
                        {selectedJob.description && (
                          <p className="text-sm mt-4 opacity-90">{selectedJob.description.substring(0, 200)}...</p>
                        )}
                        <div className="mt-6 pt-4 border-t border-white/30">
                          <p className="text-sm">Apply at: hawadaily.com/jobs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={generateFlyer}
                      disabled={generatingFlyer}
                      className="flex-1 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                    >
                      {generatingFlyer ? t.generating : t.generateFlyer}
                    </button>
                    <button
                      onClick={downloadFlyer}
                      disabled={!flyerCanvas || generatingFlyer}
                      className="flex-1 rounded-full border-2 border-brand-500 px-6 py-3 font-semibold text-brand-500 transition hover:bg-brand-50 disabled:opacity-50"
                    >
                      {t.downloadFlyer}
                    </button>
                  </div>
                </div>
              )}

              {!selectedJob && jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t.noJobs}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quote Posters Tab */}
        {activeTab === 'quotes' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.quotePosters}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.quotePostersDesc}</p>
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Inputs and Controls */}
              <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.uploadPhoto}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQuotePhotoUpload}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                {/* Quote Heading (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ހެޑްލައިން (Heading)</label>
                  <input
                    type="text"
                    value={quoteHeading}
                    onChange={(e) => setQuoteHeading(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                    placeholder="Enter heading..."
                  />
                  {/* Heading Controls */}
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ސައިޒް ({headingSize}px)</label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={headingSize}
                        onChange={(e) => setHeadingSize(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ޕޮޒިޝަން X ({headingX}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={headingX}
                        onChange={(e) => setHeadingX(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ޕޮޒިޝަން Y ({headingY}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={headingY}
                        onChange={(e) => setHeadingY(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                  </div>
                  {/* Heading Background Color Controls */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ހެޑްލައިން ބެކްގްރައުންޑް ކަލަރ</label>
                      <input
                        type="color"
                        value={headingBackgroundColor}
                        onChange={(e) => setHeadingBackgroundColor(e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ހެޑްލައިން ބެކްގްރައުންޑް ޝައްޕާރަންސީ ({headingBackgroundTransparency}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={headingBackgroundTransparency}
                        onChange={(e) => setHeadingBackgroundTransparency(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                  </div>
                  {/* Heading Text Color Control */}
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">ހެޑްލައިން ޓެކްސްޓް ކަލަރ</label>
                    <input
                      type="color"
                      value={headingTextColor}
                      onChange={(e) => setHeadingTextColor(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quote Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.quoteText}</label>
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 min-h-[80px] text-sm"
                    placeholder="Enter your quote... (Press Enter for new line)"
                  />
                  {/* Text Style Controls */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.fontSize} ({textSize}px)</label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ލައިން ހައިޓް ({lineHeight}x)</label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Position and Alignment */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">ކޮޓް ލިޔުން އެޑްޖަސްޓްމެންޓް (Text Adjustments)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.textPositionX} ({textX}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={textX}
                        onChange={(e) => setTextX(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.textPositionY} ({textY}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={textY}
                        onChange={(e) => setTextY(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">އެލައިންމެންޓް</label>
                      <select
                        value={textAlign}
                        onChange={(e) => setTextAlign(e.target.value as 'left' | 'center' | 'right')}
                        className="w-full rounded border border-gray-300 bg-white px-1 py-1 text-[10px] text-gray-900 outline-none focus:border-brand-500"
                      >
                        <option value="center">މެދު</option>
                        <option value="left">ކަނާ</option>
                        <option value="right">ކަންތި</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Color Controls */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">ކަލަރ އެޑްޖަސްޓްމެންޓް (Color Adjustments)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">ކަލަރ</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.textTransparency} ({textTransparency}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={textTransparency}
                        onChange={(e) => setTextTransparency(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.textBackgroundColor}</label>
                      <input
                        type="color"
                        value={textBackgroundColor}
                        onChange={(e) => setTextBackgroundColor(e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.textBackgroundTransparency} ({textBackgroundTransparency}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={textBackgroundTransparency}
                        onChange={(e) => setTextBackgroundTransparency(Number(e.target.value))}
                        className="w-full h-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Controls */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-700">ލޯގޯ ކޮންޓްރޯލް (Logo Controls)</h4>
                    <button
                      type="button"
                      onClick={() => setQuoteLogos([...quoteLogos, { id: Date.now(), x: 50, y: 50, opacity: 90, image: '/HAWA LOGO.jpg' }])}
                      className="text-[10px] bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600"
                    >
                      + Add Logo
                    </button>
                  </div>
                  {quoteLogos.map((logo, index) => (
                    <div key={logo.id} className="mb-3 p-2 border border-gray-200 rounded bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-gray-600">Logo {index + 1}</span>
                        {quoteLogos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuoteLogos(quoteLogos.filter(l => l.id !== logo.id))}
                            className="text-[10px] text-rose-600 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-1">X ({logo.x}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={logo.x}
                            onChange={(e) => {
                              const newLogos = [...quoteLogos];
                              newLogos[index].x = Number(e.target.value);
                              setQuoteLogos(newLogos);
                            }}
                            className="w-full h-5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-1">Y ({logo.y}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={logo.y}
                            onChange={(e) => {
                              const newLogos = [...quoteLogos];
                              newLogos[index].y = Number(e.target.value);
                              setQuoteLogos(newLogos);
                            }}
                            className="w-full h-5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-1">Opacity ({logo.opacity}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={logo.opacity}
                            onChange={(e) => {
                              const newLogos = [...quoteLogos];
                              newLogos[index].opacity = Number(e.target.value);
                              setQuoteLogos(newLogos);
                            }}
                            className="w-full h-5"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">Logo Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const newLogos = [...quoteLogos];
                                newLogos[index].image = event.target?.result as string;
                                setQuoteLogos(newLogos);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-[10px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={generateQuotePoster}
                    disabled={generatingPoster || !quotePhotoUrl}
                    className="flex-1 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {generatingPoster ? t.generating : t.generatePoster}
                  </button>
                  <button
                    onClick={downloadQuotePoster}
                    disabled={!quoteCanvas || generatingPoster}
                    className="flex-1 rounded-full border-2 border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-50 disabled:opacity-50"
                  >
                    {t.downloadPoster}
                  </button>
                </div>
              </div>

              {/* Right Column - Poster Preview */}
              <div className="flex flex-col items-center justify-center gap-4">
                {quotePhotoUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 w-full max-w-sm">
                    <canvas
                      ref={(canvas) => setQuoteCanvas(canvas)}
                      width={1080}
                      height={1350}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                {!quotePhotoUrl && (
                  <div className="text-center py-12 text-gray-400">
                    <p>ތައްޔާރު ކުރުމަށް ފައިލް އާލޯޑް ކުރައްވާ</p>
                    <p className="text-sm mt-1">Upload a photo to preview</p>
                  </div>
                )}

                {/* Platform Size Selector */}
                <div className="w-full max-w-sm">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.platformSize}</label>
                  <select
                    value={quotePlatform}
                    onChange={(e) => setQuotePlatform(e.target.value as 'facebook' | 'instagram-square' | 'instagram-portrait')}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  >
                    <option value="facebook">{t.facebook}</option>
                    <option value="instagram-square">{t.instagramSquare}</option>
                    <option value="instagram-portrait">{t.instagramPortrait}</option>
                  </select>
                </div>

                {/* Image Controls - Under Preview */}
                {quotePhotoUrl && (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 w-full max-w-sm">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">ފައިލް އެޑްޖަސްޓްމެންޓް (Image Adjustments)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.zoom} ({imageZoom}%)</label>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={imageZoom}
                          onChange={(e) => setImageZoom(Number(e.target.value))}
                          className="w-full h-5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.positionX} ({imageX}%)</label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={imageX}
                          onChange={(e) => setImageX(Number(e.target.value))}
                          className="w-full h-5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">{t.positionY} ({imageY}%)</label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={imageY}
                          onChange={(e) => setImageY(Number(e.target.value))}
                          className="w-full h-5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Media Videos Tab */}
        {activeTab === 'social-videos' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">{t.socialVideos}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.socialVideosDesc}</p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Inputs and Controls */}
              <div className="space-y-4">
                {/* Platform Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.selectPlatform}</label>
                  <select
                    value={videoPlatform}
                    onChange={(e) => setVideoPlatform(e.target.value as 'facebook-reels' | 'tiktok' | 'youtube-shorts' | 'youtube-video')}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  >
                    <option value="facebook-reels">{t.facebookReels}</option>
                    <option value="tiktok">{t.tiktok}</option>
                    <option value="youtube-shorts">{t.youtubeShorts}</option>
                    <option value="youtube-video">{t.youtubeVideo}</option>
                  </select>
                </div>

                {/* Article Selector for Auto-generate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.selectArticle}</label>
                  <select
                    value={selectedArticle?.id || ''}
                    onChange={(e) => handleArticleSelect(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  >
                    <option value="">Select an article...</option>
                    {articles.map(article => (
                      <option key={article.id} value={article.id}>
                        {article.title || article.titleEn || 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-generate Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoGenerate"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="autoGenerate" className="text-sm text-gray-700">{t.autoGenerate}</label>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.uploadImages}</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setReelImages(files);
                      const urls = files.map(file => URL.createObjectURL(file));
                      setReelImageUrls(urls);
                      // Initialize controls for new images
                      const newControls: { [key: number]: { zoom: number; x: number; y: number } } = {};
                      urls.forEach((_, index) => {
                        newControls[index] = { zoom: 1, x: 0, y: 0 };
                      });
                      setImageControls(newControls);
                    }}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  />
                  {reelImageUrls.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {reelImageUrls.length} image(s) selected
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setReelVideoFile(file);
                        setReelVideoUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  />
                  {reelVideoUrl && (
                    <div className="mt-2">
                      <video src={reelVideoUrl} controls className="w-full max-h-40 rounded" />
                      <div className="mt-2 text-xs text-gray-500">Video loaded</div>
                    </div>
                  )}
                </div>

                {/* Image Controls */}
                {reelImageUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image Controls</label>
                    <div className="space-y-2">
                      <select
                        value={selectedImageControl || 0}
                        onChange={(e) => setSelectedImageControl(Number(e.target.value))}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                      >
                        {reelImageUrls.map((_, index) => (
                          <option key={index} value={index}>Image {index + 1}</option>
                        ))}
                      </select>
                      
                      {selectedImageControl !== null && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Zoom: {imageControls[selectedImageControl]?.zoom?.toFixed(1) || 1}</label>
                            <input
                              type="range"
                              min="0.5"
                              max="3"
                              step="0.1"
                              value={imageControls[selectedImageControl]?.zoom || 1}
                              onChange={(e) => {
                                setImageControls(prev => ({
                                  ...prev,
                                  [selectedImageControl]: {
                                    ...prev[selectedImageControl],
                                    zoom: Number(e.target.value)
                                  }
                                }));
                              }}
                              className="w-full h-2"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">X Position: {imageControls[selectedImageControl]?.x || 0}</label>
                            <input
                              type="range"
                              min="-500"
                              max="500"
                              step="10"
                              value={imageControls[selectedImageControl]?.x || 0}
                              onChange={(e) => {
                                setImageControls(prev => ({
                                  ...prev,
                                  [selectedImageControl]: {
                                    ...prev[selectedImageControl],
                                    x: Number(e.target.value)
                                  }
                                }));
                              }}
                              className="w-full h-2"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Y Position: {imageControls[selectedImageControl]?.y || 0}</label>
                            <input
                              type="range"
                              min="-500"
                              max="500"
                              step="10"
                              value={imageControls[selectedImageControl]?.y || 0}
                              onChange={(e) => {
                                setImageControls(prev => ({
                                  ...prev,
                                  [selectedImageControl]: {
                                    ...prev[selectedImageControl],
                                    y: Number(e.target.value)
                                  }
                                }));
                              }}
                              className="w-full h-2"
                            />
                          </div>
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setImageControls(prev => ({
                                  ...prev,
                                  [selectedImageControl]: { zoom: 1, x: 0, y: 0 }
                                }));
                              }}
                              className="text-xs text-brand-600 hover:text-brand-700"
                            >
                              Reset Controls
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Audio Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.uploadAudio}</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAudioFile(file);
                        setAudioUrl(URL.createObjectURL(file));
                        setIsPlayingAudio(false);
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  />
                  {audioUrl && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const audio = new Audio(audioUrl);
                            if (isPlayingAudio) {
                              audio.pause();
                              setIsPlayingAudio(false);
                            } else {
                              audio.play();
                              setIsPlayingAudio(true);
                              audio.onended = () => setIsPlayingAudio(false);
                            }
                          }}
                          className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600"
                        >
                          {isPlayingAudio ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <span className="text-xs text-gray-500">Audio loaded</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  />
                  {logoUrl && (
                    <div className="mt-2">
                      <img src={logoUrl} alt="Logo" className="h-12 w-auto rounded" />
                      <div className="mt-2 text-xs text-gray-500">Logo loaded</div>
                    </div>
                  )}
                </div>

                {/* Logo Controls */}
                {logoUrl && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Controls</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">X Position: {reelLogoPosition.x}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={reelLogoPosition.x}
                          onChange={(e) => setReelLogoPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                          className="w-full h-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Y Position: {reelLogoPosition.y}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={reelLogoPosition.y}
                          onChange={(e) => setReelLogoPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                          className="w-full h-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Opacity: {reelLogoOpacity}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={reelLogoOpacity}
                          onChange={(e) => setReelLogoOpacity(Number(e.target.value))}
                          className="w-full h-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.reelText}</label>
                  <textarea
                    value={reelText}
                    onChange={(e) => setReelText(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 min-h-[80px] text-sm"
                    placeholder="Enter text for..."
                  />
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.hashtags}</label>
                  <textarea
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 min-h-[60px] text-sm"
                    placeholder="#hashtag1 #hashtag2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const platformHashtags = {
                        'facebook-reels': ['#HawaDaily', '#Maldives', '#News', '#Dhivehi', '#LocalNews', '#FacebookReels'],
                        'tiktok': ['#HawaDaily', '#Maldives', '#News', '#Dhivehi', '#FYP', '#ForYou', '#Trending'],
                        'youtube-shorts': ['#HawaDaily', '#Maldives', '#News', '#Dhivehi', '#Shorts', '#YouTubeShorts'],
                        'youtube-video': ['#HawaDaily', '#Maldives', '#News', '#Dhivehi', '#YouTube', '#Video']
                      };
                      setHashtags(platformHashtags[videoPlatform].join(' '));
                    }}
                    className="mt-1 text-xs text-brand-600 hover:text-brand-700"
                  >
                    {t.suggestedHashtags}
                  </button>
                </div>

                {/* Caption Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Caption Preview</label>
                  <div className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
                    {reelText && (
                      <div>
                        <p className="font-semibold">{reelText}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          {hashtags}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Platform: {videoPlatform.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    )}
                    {!reelText && (
                      <p className="text-gray-400">Add text to see caption preview</p>
                    )}
                  </div>
                </div>

                {/* Text Slides Preview */}
                {textSlides.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Text Slides ({textSlides.length} slides)
                    </label>
                    <div className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-3">
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => {
                            setIsPlayingSlides(!isPlayingSlides);
                            if (!isPlayingSlides) {
                              setCurrentSlideIndex(0);
                            }
                          }}
                          className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600"
                        >
                          {isPlayingSlides ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button
                          onClick={() => {
                            setIsPlayingSlides(false);
                            setCurrentSlideIndex(0);
                          }}
                          className="rounded-full bg-gray-500 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-600"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white min-h-[120px] flex items-center justify-center">
                        <p className="text-center text-sm font-medium text-gray-800">
                          {textSlides[currentSlideIndex]}
                        </p>
                      </div>
                      <div className="flex gap-1 mt-2 justify-center">
                        {textSlides.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition ${
                              index === currentSlideIndex ? 'bg-brand-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.duration} ({reelDuration}s)</label>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    value={reelDuration}
                    onChange={(e) => setReelDuration(Number(e.target.value))}
                    className="w-full h-5"
                  />
                </div>

                {/* Transition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t.transition}</label>
                  <select
                    value={reelTransition}
                    onChange={(e) => setReelTransition(e.target.value as 'fade' | 'slide' | 'zoom')}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 text-sm"
                  >
                    <option value="fade">{t.transitionFade}</option>
                    <option value="slide">{t.transitionSlide}</option>
                    <option value="zoom">{t.transitionZoom}</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={generateFacebookReel}
                    disabled={generatingReel || (reelImageUrls.length === 0 && textSlides.length === 0)}
                    className="flex-1 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {generatingReel ? t.generating : t.generateReel}
                  </button>
                  <button
                    onClick={downloadFacebookReel}
                    disabled={!reelVideoUrl || generatingReel}
                    className="flex-1 rounded-full border-2 border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-50 disabled:opacity-50"
                  >
                    {t.downloadReel}
                  </button>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="flex flex-col items-center justify-center gap-4">
                {reelImageUrls.length > 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 w-full max-w-sm">
                    <canvas
                      ref={(canvas) => setReelCanvas(canvas)}
                      width={videoPlatform === 'youtube-video' ? 1920 : 1080}
                      height={videoPlatform === 'youtube-video' ? 1080 : 1920}
                      className="w-full h-auto rounded-lg shadow-md"
                      style={{ display: reelVideoUrl ? 'none' : 'block' }}
                    />
                    {reelVideoUrl && (
                      <video
                        src={reelVideoUrl}
                        controls
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    )}
                  </div>
                )}
                {reelImageUrls.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>ތައްޔާރު ކުރުމަށް ފޮޓޯ އާލޯޑް ކުރައްވާ</p>
                    <p className="text-sm mt-1">Upload images to preview</p>
                  </div>
                )}

                {/* Image Grid Preview */}
                {reelImageUrls.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 w-full max-w-sm">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">އިމޭޖް ޕްރިވިއު (Image Preview)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {reelImageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Reel image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{t.recipes}</h3>
                <p className="mt-2 text-sm text-gray-600">{t.recipesDesc}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleImportLonumedhuRecipes}
                  disabled={importingLonumedhu}
                  className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {importingLonumedhu ? 'Importing...' : 'Update Lonumedhu Titles'}
                </button>
                <button
                  onClick={handleImportHedhikaaRecipes}
                  disabled={importingHedhikaa}
                  className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {importingHedhikaa ? 'Importing...' : 'Import Hedhikaa'}
                </button>
                <button
                  onClick={handleImportNadiyasKitchenRecipes}
                  disabled={importingNadiyasKitchen}
                  className="rounded-full bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:opacity-50"
                >
                  {importingNadiyasKitchen ? 'Importing...' : 'Import NadiyasKitchen'}
                </button>
                <button
                  onClick={handleSaveAllRecipesToFirebase}
                  disabled={savingAllRecipes}
                  className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {savingAllRecipes ? 'Saving...' : 'Save All to Firebase'}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Recipe Form */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  {editingRecipe ? t.editRecipe : t.addRecipe}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeTitleDv}</label>
                    <input
                      type="text"
                      value={recipeTitleDv}
                      onChange={(e) => setRecipeTitleDv(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ރެސިޕީގެ ސުރުޚީ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeTitleEn}</label>
                    <input
                      type="text"
                      value={recipeTitleEn}
                      onChange={(e) => setRecipeTitleEn(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Recipe Title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeCategory}</label>
                    <select
                      value={recipeCategory}
                      onChange={(e) => setRecipeCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="">Select Category</option>
                      <option value="breakfast">Breakfast / ހެދުމަށް</option>
                      <option value="main">Main / މެއިން</option>
                      <option value="dessert">Dessert / ޑިޒަޓް</option>
                      <option value="side">Side / ސައިޑް</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeImage}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRecipeImage(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setRecipeImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeImageUrl}</label>
                    <input
                      type="text"
                      value={recipeImageUrlInput}
                      onChange={(e) => {
                        setRecipeImageUrlInput(e.target.value);
                        setRecipeImageUrl(e.target.value);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {(recipeImageUrl || recipeImageUrlInput) && (
                    <div className="md:col-span-2">
                      <img
                        src={recipeImageUrl || recipeImageUrlInput}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipePrepTime}</label>
                    <input
                      type="text"
                      value={recipePrepTime}
                      onChange={(e) => setRecipePrepTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="15 މިނިޓް / 15 min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeCookTime}</label>
                    <input
                      type="text"
                      value={recipeCookTime}
                      onChange={(e) => setRecipeCookTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="30 މިނިޓް / 30 min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeServings}</label>
                    <input
                      type="text"
                      value={recipeServings}
                      onChange={(e) => setRecipeServings(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="4 ބައި / 4 servings"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeIngredientsDv}</label>
                    <textarea
                      value={recipeIngredientsDv}
                      onChange={(e) => setRecipeIngredientsDv(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 h-32"
                      placeholder="1 ކުޅި ބިސް&#10;4 ބިސް&#10;¾ ކަޕް ހިކިން..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeIngredientsEn}</label>
                    <textarea
                      value={recipeIngredientsEn}
                      onChange={(e) => setRecipeIngredientsEn(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 h-32"
                      placeholder="1 Egg&#10;4 Eggs&#10;¾ Cup Sugar..."
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeInstructionsDv}</label>
                    <textarea
                      value={recipeInstructionsDv}
                      onChange={(e) => setRecipeInstructionsDv(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 h-32"
                      placeholder="ބިސް ހަނދާ، ހިކިން އަދި ވޭނިލާ އެއްކޮށް ކަރައިން މިކްސް ކުރާށެވެ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t.recipeInstructionsEn}</label>
                    <textarea
                      value={recipeInstructionsEn}
                      onChange={(e) => setRecipeInstructionsEn(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500 h-32"
                      placeholder="Beat eggs, sugar and vanilla together..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleSaveRecipe}
                    disabled={submittingRecipe}
                    className="flex-1 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submittingRecipe ? t.generating : t.saveRecipe}
                  </button>
                  {editingRecipe && (
                    <button
                      onClick={() => {
                        setEditingRecipe(null);
                        clearRecipeForm();
                      }}
                      className="rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      {t.cancel}
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Image Upload Section */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Bulk Image Upload to CDN</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Select multiple recipe images to upload to ImgBB CDN</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setBulkImageFiles(files);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>
                  {bulkImageFiles.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Selected {bulkImageFiles.length} image{bulkImageFiles.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  <button
                    onClick={handleBulkImageUpload}
                    disabled={bulkUploadingImages || bulkImageFiles.length === 0}
                    className="w-full rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {bulkUploadingImages ? 'Uploading...' : `Upload ${bulkImageFiles.length} Images to CDN`}
                  </button>
                  <p className="text-xs text-gray-500">
                    Images will be uploaded to ImgBB CDN. Check console for upload results with CDN URLs.
                  </p>
                </div>
              </div>

              {/* Recipes List */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Existing Recipes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipesList.map((recipe) => (
                    <div key={recipe.id} className="border border-gray-200 rounded-lg bg-white p-4">
                      <img
                        src={recipe.image}
                        alt={recipe.titleDv}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h5 className="font-bold text-gray-900">{recipe.titleDv}</h5>
                      <p className="text-sm text-gray-600">{recipe.titleEn}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleEditRecipe(recipe)}
                          className="flex-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-600"
                        >
                          {t.editRecipe}
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="flex-1 rounded-full border-2 border-red-500 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          {t.deleteRecipe}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quran Tab */}
        {activeTab === 'quran' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">ޤުރްއާން (Quran)</h3>
                <p className="mt-2 text-sm text-gray-600">Generate Facebook posts with Arabic and Dhivehi translations</p>
              </div>
              <button
                onClick={() => window.open('/quran/facebook-post', '_blank')}
                className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
              >
                Open Quran Post Generator
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">ރަހަ ފޭސްބުކް ޕޯސްޓް (Recipe Facebook Post)</h3>
                <p className="mt-2 text-sm text-gray-600">Generate Facebook posts for recipes with images and details</p>
              </div>
              <button
                onClick={() => window.open('/recipes/facebook-post', '_blank')}
                className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Open Recipe Post Generator
              </button>
            </div>

            <div className="mt-6 border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-blue-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  Select any Surah from the Quran
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  Choose specific verses to create posts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  Download each verse as an image
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  Arabic text with Dhivehi translation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                  Perfect for Facebook sharing
                </li>
              </ul>
            </div>

            <div className="mt-6 border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h4>
              <button
                onClick={async () => {
                  try {
                    console.log('Starting Quran data upload...');
                    const quranData = await import('../data/quran-full.json');
                    const quranArray = Array.isArray(quranData.default) ? quranData.default : [];
                    console.log('Loaded Quran data:', quranArray.length, 'surahs');
                    
                    const { collection, addDoc, getFirestore } = await import('firebase/firestore');
                    const db = getFirestore();
                    const quranCollection = collection(db, 'quran');
                    
                    let count = 0;
                    for (const surah of quranArray) {
                      await addDoc(quranCollection, surah);
                      count++;
                      if (count % 10 === 0) {
                        console.log(`Uploaded ${count} surahs...`);
                      }
                    }
                    
                    console.log(`Successfully uploaded all ${count} surahs to Firebase Firestore`);
                    alert(`Successfully uploaded ${count} surahs to Firebase Firestore`);
                  } catch (error) {
                    console.error('Error uploading Quran data:', error);
                    alert('Error uploading Quran data. Check console for details.');
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              >
                Upload Quran Data to Firebase
              </button>
              <p className="mt-2 text-xs text-gray-600">
                Uploads quran-full.json to Firebase Firestore collection 'quran' to reduce bundle size
              </p>
            </div>
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">ސްޓޯރީތައް (Stories)</h3>
            <p className="mt-2 text-sm text-gray-600">Create and manage stories with multiple episodes</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Create Story Form */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingStory ? 'Edit Story' : 'Create New Story'}
                </h4>
                {storyError && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                    {storyError}
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Title</label>
                    <input
                      type="text"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Story title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={storyDescription}
                      onChange={(e) => setStoryDescription(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Story description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Author</label>
                    <input
                      type="text"
                      value={storyAuthor}
                      onChange={(e) => setStoryAuthor(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Author name..."
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">YouTube Link (Optional)</label>
                      <input
                        type="url"
                        value={storyYoutubeLink}
                        onChange={(e) => setStoryYoutubeLink(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">TikTok Link (Optional)</label>
                      <input
                        type="url"
                        value={storyTiktokLink}
                        onChange={(e) => setStoryTiktokLink(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="https://tiktok.com/@user/video/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={storyStatus}
                      onChange={(e) => setStoryStatus(e.target.value as 'upcoming' | 'ongoing' | 'completed')}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Release Date</label>
                    <input
                      type="date"
                      value={storyReleaseDate}
                      onChange={(e) => setStoryReleaseDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="storyLocked"
                      checked={storyLocked}
                      onChange={(e) => setStoryLocked(e.target.checked)}
                      className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <label htmlFor="storyLocked" className="text-sm text-gray-700">
                      Lock story (content hidden until unlocked by admin)
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Cover Image {editingStory ? '(leave empty to keep current)' : ''}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setStoryCoverImage(e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      required={!editingStory}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingStory ? handleUpdateStory : handleCreateStory}
                      disabled={uploadingStory}
                      className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingStory ? 'Saving...' : editingStory ? 'Update Story' : 'Create Story'}
                    </button>
                    {editingStory && (
                      <button
                        onClick={resetStoryForm}
                        className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stories List */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Stories ({stories.length})</h4>
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {stories.length === 0 ? (
                    <p className="text-sm text-gray-500">No stories yet</p>
                  ) : (
                    stories.map((story) => (
                      <div
                        key={story.id}
                        className={`rounded-xl border p-3 cursor-pointer transition ${
                          selectedStory?.id === story.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectStory(story)}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{story.title}</h5>
                            {story.author && (
                              <p className="mt-1 text-xs text-gray-500">by {story.author}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">{story.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                story.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                                story.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {story.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStory(story);
                              }}
                              className="text-brand-600 hover:text-brand-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStory(story.id);
                              }}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Episodes Section */}
            {selectedStory && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Episodes for: {selectedStory.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{episodes.length} episodes</p>
                  </div>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>

                {/* Create Episode Form */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  {episodeError && (
                    <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                      {episodeError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Episode Number</label>
                      <input
                        type="number"
                        value={episodeNumber}
                        onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Title</label>
                      <input
                        type="text"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="Episode title..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Content</label>
                      <textarea
                        value={episodeContent}
                        onChange={(e) => setEpisodeContent(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="Episode content..."
                        rows={6}
                        required
                      />
                    </div>
                    <button
                      onClick={handleCreateEpisode}
                      disabled={uploadingEpisode}
                      className="w-full rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingEpisode ? 'Creating...' : 'Add Episode'}
                    </button>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {episodes.length === 0 ? (
                    <p className="text-sm text-gray-500">No episodes yet</p>
                  ) : (
                    episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="rounded-xl border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                                Ep. {episode.episodeNumber}
                              </span>
                              <h5 className="font-semibold text-gray-900">{episode.title}</h5>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{episode.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEpisode(episode.id)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Golden Time Tab */}
        {activeTab === 'obituary' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">ތަޢުޒިޔާ މޭކަރ (Obituary Maker)</h3>
            <p className="mt-2 text-sm text-gray-600">Create obituary images with 1:1.5 aspect ratio (portrait)</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Obituary Form */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">ތަޢުޒިޔާ ހުރިހާ މަޢުލަވެސް</h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ނަން (Name)</label>
                    <input
                      type="text"
                      value={obituaryName}
                      onChange={(e) => setObituaryName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ނަން..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">އާއިލާ (Address)</label>
                    <input
                      type="text"
                      value={obituaryAddress}
                      onChange={(e) => setObituaryAddress(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="އާއިލާ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">އުފެދުނު އަހަރު (Birth Year)</label>
                    <select
                      value={obituaryBirthYear}
                      onChange={(e) => setObituaryBirthYear(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="">އަހަރު އިހްސާސްކުރޭ...</option>
                      {Array.from({ length: 126 }, (_, i) => 1900 + i).reverse().map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ފަރާތުން ދިޔަ އަހަރު (Death Year)</label>
                    <select
                      value={obituaryDeathYear}
                      onChange={(e) => setObituaryDeathYear(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="">އަހަރު އިހްސާސްކުރޭ...</option>
                      {Array.from({ length: 127 }, (_, i) => 1900 + i).reverse().map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ފޮޓޯ (Portrait)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setObituaryPortrait(e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generateObituary}
                      disabled={generatingObituary}
                      className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {generatingObituary ? 'ހުރިހާކަމެއް...' : 'ތަޢުޒިޔާ ހުރިހާކުރޭ'}
                    </button>
                    {obituaryPreview && (
                      <button
                        onClick={downloadObituary}
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                      >
                        ޑައުންލޯޑް
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">ޕްރިވިއު (Preview)</h4>
                {obituaryPreview ? (
                  <div className="mt-4">
                    <img
                      src={obituaryPreview}
                      alt="Obituary Preview"
                      className="w-full rounded-lg border border-gray-300"
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                    <p className="text-sm text-gray-500">ޕްރިވިއު ފެނޭނީ ތަޢުޒިޔާ ހުރިހާކުރުމަށްފަހު</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Funeral Poster Tab */}
        {activeTab === 'funeral-poster' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">ޖނާޒާގެ މަޢުލޫމާތު (Funeral Announcement Poster)</h3>
            <p className="mt-2 text-sm text-gray-600">Create funeral announcement posters</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Funeral Poster Form */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">މަޢުލަވެސް</h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">މަރުޙޫމްގެ ނަން (Name)</label>
                    <input
                      type="text"
                      value={funeralName}
                      onChange={(e) => setFuneralName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ނަން..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ގެއެވެސް/މަންޒިލް (Address)</label>
                    <input
                      type="text"
                      value={funeralAddress}
                      onChange={(e) => setFuneralAddress(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="މ. ނިއުހޯޕް / 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">އުމުރު (Age)</label>
                    <input
                      type="text"
                      value={funeralAge}
                      onChange={(e) => setFuneralAge(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="09 އަހަރު"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ކަށުނަމާދު (Prayer Location)</label>
                    <input
                      type="text"
                      value={funeralPrayerLocation}
                      onChange={(e) => setFuneralPrayerLocation(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ހުޅުމާލެ ޢަޞްރު (ސަހަރާ މިސްކިތް) ގައި"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ވަޅުލުން (Burial Location)</label>
                    <input
                      type="text"
                      value={funeralBurialLocation}
                      onChange={(e) => setFuneralBurialLocation(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="ހުޅުމާލެ ސަހަރާ މިސްކިތް"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ނިޔާވި ތާރީޚް (Death Date)</label>
                    <input
                      type="text"
                      value={funeralDeathDate}
                      onChange={(e) => setFuneralDeathDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="19 ޛުލްޙިއްޖާ 1448 (01 ސެޕްޓެމްބަރު 2026)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ކަށުނަމާދު ތާރީޚް (Prayer Date)</label>
                    <input
                      type="text"
                      value={funeralPrayerDate}
                      onChange={(e) => setFuneralPrayerDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="01-09-2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ފޮޓޯ (Photo)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFuneralPhoto(e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ކޮންޓެކްޓް 1 (Contact 1)</label>
                    <input
                      type="text"
                      value={funeralContact1}
                      onChange={(e) => setFuneralContact1(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="7992266"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">ކޮންޓެކްޓް 2 (Contact 2)</label>
                    <input
                      type="text"
                      value={funeralContact2}
                      onChange={(e) => setFuneralContact2(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="9394545"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generateFuneralPoster}
                      disabled={generatingFuneralPoster}
                      className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {generatingFuneralPoster ? 'ހުރިހާކަމެއް...' : 'ޕޯސްޓަރ ހުރިހާކުރޭ'}
                    </button>
                    {funeralPreview && (
                      <button
                        onClick={downloadFuneralPoster}
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                      >
                        ޑައުންލޯޑް
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">ޕްރިވިއު (Preview)</h4>
                {funeralPreview ? (
                  <div className="mt-4">
                    <img
                      src={funeralPreview}
                      alt="Funeral Poster Preview"
                      className="w-full rounded-lg border border-gray-300"
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                    <p className="text-sm text-gray-500">ޕްރިވިއު ފެނޭނީ ޕޯސްޓަރ ހުރިހާކުރުމަށްފަހު</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Golden Time Tab */}
        {activeTab === 'golden-time' && (
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-gray-900">ދިވެހި ރަން ޒަމާން (Maldives Golden Time)</h3>
            <p className="mt-2 text-sm text-gray-600">Create and manage articles about life in Maldives during the 1990s</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Create/Edit Golden Time Article Form */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingGoldenTime ? 'Edit Article' : 'Create New Article'}
                </h4>
                {goldenTimeError && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                    {goldenTimeError}
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Title</label>
                    <input
                      type="text"
                      value={goldenTimeTitle}
                      onChange={(e) => setGoldenTimeTitle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Article title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={goldenTimeDescription}
                      onChange={(e) => setGoldenTimeDescription(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Brief description..."
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Author</label>
                    <input
                      type="text"
                      list="saved-authors"
                      value={goldenTimeAuthor}
                      onChange={(e) => setGoldenTimeAuthor(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Author name..."
                    />
                    <datalist id="saved-authors">
                      {savedAuthors.map((author) => (
                        <option key={author} value={author} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Year</label>
                    <select
                      value={goldenTimeYear}
                      onChange={(e) => setGoldenTimeYear(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 21 }, (_, i) => 1980 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Category</label>
                    <input
                      type="text"
                      value={goldenTimeCategory}
                      onChange={(e) => setGoldenTimeCategory(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="e.g., Lifestyle, Culture, Politics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGoldenTimeCoverImage(e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">YouTube Link (Optional)</label>
                      <input
                        type="url"
                        value={goldenTimeYoutubeLink}
                        onChange={(e) => setGoldenTimeYoutubeLink(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">TikTok Link (Optional)</label>
                      <input
                        type="url"
                        value={goldenTimeTiktokLink}
                        onChange={(e) => setGoldenTimeTiktokLink(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                        placeholder="https://tiktok.com/@user/video/..."
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addGoldenTimeLogo}
                        onChange={(e) => setAddGoldenTimeLogo(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Add Logo to Cover Image</span>
                    </label>
                    {addGoldenTimeLogo && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Opacity: {goldenTimeLogoOpacity.toFixed(1)}</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={goldenTimeLogoOpacity}
                            onChange={(e) => setGoldenTimeLogoOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">X Position: {goldenTimeLogoXPercent}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={goldenTimeLogoXPercent}
                            onChange={(e) => setGoldenTimeLogoXPercent(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Y Position: {goldenTimeLogoYPercent}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={goldenTimeLogoYPercent}
                            onChange={(e) => setGoldenTimeLogoYPercent(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Logo Size: {goldenTimeLogoSizePercent}%</label>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="1"
                            value={goldenTimeLogoSizePercent}
                            onChange={(e) => setGoldenTimeLogoSizePercent(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                    {previewImageUrl && (
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-600 mb-2">Preview</label>
                        <img
                          src={previewImageUrl}
                          alt="Preview with logo"
                          className="w-full rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Content</label>
                    <textarea
                      value={goldenTimeContent}
                      onChange={(e) => setGoldenTimeContent(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500"
                      placeholder="Full article content..."
                      rows={6}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingGoldenTime ? handleUpdateGoldenTime : handleCreateGoldenTime}
                      disabled={uploadingGoldenTime}
                      className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingGoldenTime ? 'Saving...' : editingGoldenTime ? 'Update Article' : 'Create Article'}
                    </button>
                    {editingGoldenTime && (
                      <button
                        onClick={() => {
                          setEditingGoldenTime(false);
                          setSelectedGoldenTimeArticle(null);
                          resetGoldenTimeForm();
                        }}
                        className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Golden Time Articles List */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Articles ({goldenTimeArticles.length})</h4>
                <div className="mt-4 space-y-3 max-h-[800px] overflow-y-auto">
                  {goldenTimeArticles.length === 0 ? (
                    <p className="text-sm text-gray-500">No articles yet</p>
                  ) : (
                    goldenTimeArticles.map((article) => (
                      <div
                        key={article.id}
                        className="rounded-xl border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-start gap-3">
                          {article.coverImage && (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900 truncate">{article.title}</h5>
                              {article.year && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                  {article.year}
                                </span>
                              )}
                            </div>
                            {article.category && (
                              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {article.category}
                              </span>
                            )}
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{article.description}</p>
                            {article.author && (
                              <p className="mt-1 text-xs text-gray-500">by {article.author}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleSelectGoldenTimeArticle(article)}
                            className="flex-1 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGoldenTime(article.id)}
                            className="flex-1 rounded-xl border border-rose-500 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
