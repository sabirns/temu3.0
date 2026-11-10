# Performance Investigation & Optimization Report

This document presents a comprehensive performance analysis of the Malayalam University React frontend. It separates **confirmed/measured metrics** from **suspected bottlenecks** and provides verification procedures.

---

## 1. Measured Performance Metrics (Production Build)

A production build executed with `vite v6.4.1` yielded the following chunk and asset measurements:

### JavaScript Bundle Distribution
| Chunk Asset | Raw Size | Gzip Size | Analysis & Role |
| :--- | :--- | :--- | :--- |
| **`vendor-react-*.js`** | **164.10 kB** | **53.69 kB** | Core vendor bundle (`react`, `react-dom`, `react-router-dom`) extracted via `rollupOptions.output.manualChunks`. |
| **`index-*.js`** | **81.43 kB** | **20.71 kB** | Main entry chunk (`main.jsx`, `App.jsx`, `Header.jsx`, `Footer.jsx`, `wordpressApi.js`). |
| **`DepartmentSingle-*.js`** | **50.63 kB** | **11.97 kB** | Largest single-page view chunk. Comprehensive tabbed layout with 24 tabs and multiple sub-views. |
| **`Home-*.js`** | **30.48 kB** | **8.86 kB** | Main portal view chunk (slider, news carousel, notifications ticker, about section). |
| **`FacultySingle-*.js`** | **14.27 kB** | **4.07 kB** | Faculty profile view chunk. |
| **`WordPressPage-*.js`** | **11.25 kB** | **4.15 kB** | Catch-all fallback template chunk. |
| **`landing-*.js`** | **9.10 kB** | **3.76 kB** | Intro landing page chunk. |
| **Other Route Chunks (22 pages)** | **1.5 kB - 8.7 kB** | **0.8 kB - 2.8 kB** | Highly optimal route code-splitting for all smaller views. |

### CSS Distribution
| Stylesheet Asset | Raw Size | Gzip Size | Analysis |
| :--- | :--- | :--- | :--- |
| **`index-*.css`** | **182.52 kB** | **30.35 kB** | Large global bundle containing reset, design tokens, mega-menu, header, footer, and animations. |
| **`pages-*.css`** | **77.58 kB** | **12.46 kB** | Page-specific layout utilities and inner hero styles. |
| **`DepartmentSingle-*.css`** | **13.84 kB** | **3.35 kB** | Scoped modern department portal styles. |
| **Other CSS Chunks** | **4.7 kB - 7.4 kB** | **1.4 kB - 2.0 kB** | Component-level styles for Landing, Faculties, and Activities. |

---

## 2. Confirmed Architectural Strengths

1. **Route-Level Code-Splitting**:
   - Every single page component in [`src/App.jsx`](file:///home/sabir/projects/mu/src/App.jsx#L12-L41) is loaded using `React.lazy()` with `<Suspense fallback={<PageLoader />}>`.
   - Users visiting `/landing` or `/home` do not download the 50 kB `DepartmentSingle` code until navigating to that route.
2. **In-Flight Request Deduplication**:
   - `fetchWithCache` in [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L10-L38) maintains a `pendingRequests` Map. If multiple components request the same page or menu simultaneously, only one network request is initiated.
3. **In-Memory TTL Caching**:
   - `apiCache` caches API responses in memory for 3 minutes (10 minutes for menus), drastically reducing repeated requests during intra-site navigation.
4. **Isolated Vendor Chunking**:
   - `vite.config.js` splits React and React Router into `vendor-react`, preventing invalidation of library code when application code changes.

---

## 3. Implemented Optimizations & Resolved Bottlenecks

### A. Network & API Request Waterfalls (RESOLVED)
1. **Parallel ACF Media Resolution Loops in `Home.jsx`**:
   - Replaced sequential `for ... of` loops in [`src/pages/Home.jsx`](file:///home/sabir/projects/mu/src/pages/Home.jsx) with `Promise.all()` calling the new [`fetchMedia(id)`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L1297) method.
   - All button images and icons now resolve in parallel with deduplication and in-memory caching.
2. **Eliminated Cache Busting Queries**:
   - Removed `_t: Date.now()` timestamp queries from all API fetchers in [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js).
   - This allows browser caching, reverse proxy caching (Nginx/Varnish), and CDN caching (Cloudflare) to function as intended.
3. **Unified Caching Under `fetchWithCache`**:
   - Upgraded all API methods ([`fetchDepartments`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L214), [`fetchFaculties`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L340), [`fetchPosts`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L380), [`fetchCourses`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L252), [`fetchActivities`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L233), [`fetchGallery`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L609), [`fetchNaacPosts`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L735), [`fetchPublications`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L790), etc.) to use `fetchWithCache`.
   - Repeated route navigation now immediately serves data from in-memory cache without repeating network calls.
4. **Static Import Optimization in Header & Footer**:
   - Replaced dynamic `await import()` in [`src/components/Header.jsx`](file:///home/sabir/projects/mu/src/components/Header.jsx) and [`src/components/Footer.jsx`](file:///home/sabir/projects/mu/src/components/Footer.jsx) with top-level static imports.
   - Eliminated Vite rollup dynamic-import warnings and reduced entry chunk size (`index-*.js`) from 81.43 kB to 76.54 kB.

### B. Server & Asset Delivery Optimizations (RESOLVED)
1. **GZIP Compression in `.htaccess`**:
   - Configured `mod_deflate` in [`public/.htaccess`](file:///home/sabir/projects/mu/public/.htaccess) to compress HTML, CSS, JavaScript, JSON, SVG, and web fonts. Transfer sizes for initial payloads decrease by ~75%.
2. **Immutable Long-Term Caching**:
   - Configured 1-year `immutable` `Cache-Control` headers for all Vite-hashed assets (`.js`, `.css`, web fonts, images) in [`public/.htaccess`](file:///home/sabir/projects/mu/public/.htaccess) and [`public/vercel.json`](file:///home/sabir/projects/mu/public/vercel.json).
   - `index.html` configured with `no-cache` to ensure users always receive latest app shell updates instantly.
3. **Non-Blocking Font Loading**:
   - Converted Google Fonts in [`index.html`](file:///home/sabir/projects/mu/index.html) to asynchronous loading via `<link rel="preload">` and `media="print" onload="this.media='all'"`, removing font CSS from the critical render-blocking path.
4. **Lazy Loading Images**:
   - Added `loading="lazy"` and `decoding="async"` across homepage card images and icons.

### C. Additional Opportunities & Recommendations
1. **Uncompressed Monolithic CSS Payload**:
   - `index.css` compiles to **182 kB** (raw) and `pages.css` to **77 kB** (raw). Combined, over **260 kB** of CSS is parsed on initial load.
   - *Problem*: CSS is render-blocking. Splitting non-critical CSS or lazy loading `pages.css` would improve First Contentful Paint (FCP).
2. **Google Fonts Self-Hosting**:
   - Self-hosting fonts using WOFF2 format locally in `public/fonts/` eliminates third-party network dependencies.
3. **DOM Queries in Scroll & Resize Handlers**:
   - [`WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx#L262-L275) adds a `scroll` listener that calls `getBoundingClientRect()` on all `.page-reveal` elements on every scroll tick without `requestAnimationFrame` or `IntersectionObserver`.
   - *Recommendation*: Refactor `.page-reveal` scroll listener to use modern native `IntersectionObserver`.
2. **DOM-Scraping Menu Link Extraction**:
   - In [`WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx#L218-L255), if page content is empty, it runs a recursive `setTimeout` poll querying `document.querySelectorAll('#mega-menu-custom a')`.
   - *Recommendation*: Pass menu structure via context or service rather than scraping the live DOM tree.

---

## 4. Verification & Profiling Steps

To test and measure performance in the real environment:

### Step 1: Network Waterfall Analysis
1. Open Google Chrome DevTools -> **Network** tab.
2. Select **Disable cache** and set Throttling to **Fast 3G** or **Slow 4G**.
3. Navigate to `/ml/home` and observe the waterfall chart.
4. Verify whether `/media/:id` requests execute in parallel or sequentially.
5. Check if `_t=` queries result in `200 OK` (cache miss) instead of `304 Not Modified` or `(from disk cache)`.

### Step 2: Lighthouse Audit
1. In Chrome DevTools, open the **Lighthouse** tab.
2. Select **Mode: Navigation**, **Device: Mobile**, **Categories: Performance**.
3. Run the audit against both the Landing Page (`/landing`) and Department Portal (`/ml/department/malayalam-kavitha`).
4. Key target thresholds:
   - **First Contentful Paint (FCP)**: < 1.8s
   - **Largest Contentful Paint (LCP)**: < 2.5s
   - **Total Blocking Time (TBT)**: < 200ms
   - **Cumulative Layout Shift (CLS)**: < 0.1

### Step 3: Bundle Visualization
To visualize chunk contents and identify oversized imports:
```bash
npm install -D rollup-plugin-visualizer
```
Add to `vite.config.js`:
```javascript
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [react(), visualizer({ open: true, filename: 'bundle-stats.html' })]
```
Run `npm run build` to open the interactive bundle treemap.
