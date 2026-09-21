# Changelog

All notable changes to the Hawainn Khabaru news portal are documented in this file.

## [2.3.0] - 2026-09-21 - Image Upload Fallback System

### 🔧 Technical Changes
- **Changed image upload fallback** from Imgur to Cloudinary
  - Primary: ImgBB (when available)
  - Fallback: Cloudinary (when ImgBB is down)
  - Automatic switching between services without manual intervention
- **Fixed Cloudinary upload issue** - Removed `folder` parameter
  - Unsigned Cloudinary presets don't support folder parameter
  - Images now upload successfully to Cloudinary root folder
- **Updated Cloudinary credentials** to new account
  - Cloud name: `qzlla1ky`
  - Upload preset: `hawadaily`
  - Added to Vercel environment variables

### 📝 Updated Files
- `src/utils/cloudinary.ts` - Changed fallback logic + removed folder parameter
- `.env` - Updated Cloudinary credentials

### 🐛 Fixes
- Fixed Cloudinary upload failures caused by unsupported folder parameter
- Resolved ImgBB downtime issues with automatic Cloudinary fallback

### 🚀 Deployment
- ✅ Changes pushed to GitHub (commit `25c0401`)
- ✅ Vercel environment variables updated with new Cloudinary credentials
- ✅ Automatic fallback system now active

### ⚠️ Known Issues
- Firebase Firestore quota exceeded - requires upgrade to Blaze plan
- ImgBB currently under maintenance (503 errors) - Cloudinary fallback active

---

## [2.2.0] - 2026-07-12 - Image Generator Enhancements & Bug Fixes

### 🎨 New Features
- **Enhanced Image Generator** in Admin Dashboard
  - Multi-line text support (2 independent text lines)
  - Logo positioning with 9-position grid (3x3 layout)
  - Logo opacity control (0-100% transparency slider)
  - Independent text positioning for each line (9 positions each)
  - Real-time preview updates as you type/adjust
  - Logo source changed to `/logo.png` (consistent with PWA icons)

### 🐛 Bug Fixes
- **Fixed React rendering error** - "Objects are not valid as a React child"
  - Firebase Timestamp objects no longer rendered directly in JSX
  - All timestamps now properly formatted via `getRelativeTime()` function
  - Fixed in ArticlePage.tsx related articles section
- **Fixed timestamp display** for newly posted articles
  - Articles now show correct relative times (e.g., "minutes ago" instead of "23 hours ago")
  - Firebase `createdAt` field properly mapped to `publishedAt`
  - Updated across Home.tsx, Categories.tsx, ArticlePage.tsx, Videos.tsx
- **Fixed TypeScript error** - Changed `HTMLFontFace` to `FontFace` type
  - Corrected type annotation for Dhivehi font loading
  - Build now passes TypeScript checks

### 📝 Updated Files
- `src/pages/AdminDashboard.tsx` - Image generator enhancements
- `src/pages/ArticlePage.tsx` - React error fix + timestamp handling
- `src/pages/Home.tsx` - Timestamp mapping fix
- `src/pages/Categories.tsx` - Timestamp handling update
- `src/pages/Videos.tsx` - Firestore query fix (removed orderBy to avoid index error)
- `src/components/ArticleCard.tsx` - Timestamp formatting update
- `src/pages/Notifications.tsx` - Timestamp calculation fix

### 🚀 Deployment
- ✅ All changes pushed to GitHub
- ✅ Vercel auto-deployed successfully
- ✅ Build passing without TypeScript errors

---

## [2.1.0] - 2026-07-07 - Serverless Backend Migration

### 🚀 Major Changes
- **Migrated backend to Vercel Functions** - No external server required anymore
- All API endpoints now run as serverless functions on Vercel
- Single deployment platform for frontend and backend (everything on Vercel)
- Automatic scaling with zero configuration

### ✨ New Features
- **Automatic Facebook Token Refresh** - Tokens automatically refresh before each Facebook operation
  - No more manual token updates needed
  - Tokens persist to `.env` automatically
  - Works with long-lived tokens (60-day expiration)
- **Auto-Posting to Facebook** - Articles automatically post to Facebook when created
  - Admin creates article → appears on Facebook page instantly
  - Includes article title, excerpt, featured image, and link
  - Non-blocking (failures don't prevent article creation)
- **Manual Token Refresh Endpoint** - POST `/api/facebook/refresh-token` to manually refresh

### 🔧 Technical Changes
- Created `/api/facebook/` directory with Vercel Functions:
  - `post.mjs` - POST endpoint for creating Facebook posts
  - `[postId].mjs` - DELETE endpoint for removing Facebook posts
  - `insights.mjs` - GET endpoint for Facebook page analytics
  - `refresh-token.mjs` - POST endpoint for manual token refresh
- Updated frontend to use relative API routes (`/api/facebook/...`)
- All functions handle CORS automatically
- Token refresh happens transparently before each operation

### 📝 Updated Files
- `README.md` - Complete rewrite with current features
- `src/utils/facebook.ts` - Updated to use Vercel Functions
- `src/pages/AdminDashboard.tsx` - Auto-posting on article creation
- `.env.example` - Added Facebook configuration template

### 🐛 Fixes
- Fixed TypeScript type annotation in server endpoint (server.mjs)
- CRLF/LF line ending warning resolved

### 📦 Deployment
- ✅ Changes pushed to GitHub (commit `5603dd6`)
- ✅ Vercel auto-deploys on git push
- ✅ No credit card required - uses Vercel free tier
- ✅ All environment variables configured in Vercel dashboard

### 🔐 Security
- Facebook credentials stored server-side only
- No sensitive data in frontend code
- Token refresh happens on backend
- `.env` file properly ignored in git

---

## [2.0.0] - 2026-07-06 - Facebook Integration & Token Refresh

### ✨ New Features
- **Facebook Auto-Posting** - Articles automatically posted to Facebook
  - When admin creates an article, it posts to Facebook page
  - Includes title, excerpt, image, and article link
- **Server-Side Token Refresh** - Automatic token refresh mechanism
  - Token exchanges before each Facebook operation
  - Extends token validity automatically
  - Fallback to current token if refresh fails

### 🔧 Technical Changes
- Added `saveAccessToken()` function to persist tokens
- Added `getValidPageAccessToken()` for auto-refresh
- New `/api/facebook/refresh-token` endpoint
- Modified POST, DELETE, and GET endpoints to refresh tokens

### 📝 Updated Files
- `server.mjs` - Token refresh implementation
- `src/pages/AdminDashboard.tsx` - Auto-posting logic
- `src/utils/facebook.ts` - Updated API calls
- `.env.example` - Facebook configuration

### 💾 Database Updates
- Facebook Page ID: 1233961369780982
- App ID: 2209454326568914

### 🚀 Deployment
- Express backend running on port 3001
- Token refresh before every Facebook operation
- Tokens persisted to `.env` for next server restart

---

## [1.5.0] - Previous Release

### Features
- Mobile-first PWA
- Admin dashboard
- Firebase backend
- Cloudinary integration
- Article management
- Category system
- Visitor analytics
- Push notifications
- Dark mode
- Dhivehi RTL support

---

## Version Format

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features, backwards compatible
- **PATCH** - Bug fixes

## Future Roadmap

- [ ] Comment system integration with Facebook comments
- [ ] Social sharing buttons
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advertisement integration
- [ ] Email newsletter subscription
- [ ] Trending topics widget
- [ ] Related articles recommendations

## Notes

- Facebook tokens have 60-day expiration (auto-refreshed)
- Vercel free tier includes up to 2M function invocations/month
- All dependencies kept up to date via npm
