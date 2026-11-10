# React Application Architecture

This document provides a technical overview of the **Malayalam University (Thunchath Ezhuthachan Malayalam University)** headless frontend application architecture.

---

## 1. Core Framework & Tooling

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Core UI rendering engine |
| **React DOM** | `^18.3.1` | Web rendering and Portal management |
| **React Router DOM** | `^6.28.0` | Client-side routing, URL synchronization, and history management |
| **Vite** | `^6.0.1` | Next-generation build tool and local development server |
| **ESLint** | `^9.15.0` | Code quality and linting |

---

## 2. Entry Points & Lifecycle

```
index.html
  └── src/main.jsx
        └── src/App.jsx
              ├── LinkInterceptor (Global click handler)
              ├── ScrollToTop (Route change scroll restoration)
              ├── LangFont (Body typography switcher)
              ├── DocumentTitle (Dynamic <title> tag manager)
              └── AppContent
                    ├── PageInfoProvider (Context for Polylang translation metadata)
                    ├── Header (Top bar, ticker, mega menu, search modal, language switch)
                    ├── Suspense (PageLoader fallback)
                    │     └── Routes (Dynamic & Lazy route definitions)
                    ├── Footer (Footer directory, map, social links)
                    └── FloatingSocial (Docked quick social links)
```

### Entry Point Files
- [`index.html`](file:///home/sabir/projects/mu/index.html): Defines HTML shell, initial `lang="ml"`, preconnects to Google Fonts (`Inter`, `Noto Sans Malayalam`, `Montserrat`), and mounts `#root`.
- [`src/main.jsx`](file:///home/sabir/projects/mu/src/main.jsx): Boots the React application inside `<StrictMode>` and imports global styles from [`src/styles/index.css`](file:///home/sabir/projects/mu/src/styles/index.css).
- [`src/App.jsx`](file:///home/sabir/projects/mu/src/App.jsx): Root orchestrator containing the Router, route-level code splitting via `React.lazy`, global link interceptor, document title management, and conditional layout rendering (e.g. suppressing header/footer on the landing page).

---

## 3. Directory Structure

```
mu/
├── index.html                  # HTML entry point with font preloading
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite server & Rollup manualChunks configuration
├── public/                     # Static assets and web server rewrite rules
│   ├── .htaccess               # Apache URL rewrite rules for SPA routing
│   ├── _redirects              # Netlify / Cloudflare Pages SPA rewrite rule
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── images/                 # Static images, icons, and landing slides
├── src/
│   ├── main.jsx                # React root bootstrapper
│   ├── App.jsx                 # Central router & global wrappers
│   ├── components/             # Reusable UI & layout components
│   │   ├── About.jsx           # University about section with parallax letters
│   │   ├── DocumentTitle.jsx   # Dynamic browser document title updater
│   │   ├── FloatingSocial.jsx  # Floating quick-access social bar
│   │   ├── Footer.jsx          # Global footer with contact & external links
│   │   ├── GutenbergContent.jsx# Interactive Gutenberg content block hydrator
│   │   ├── Header.jsx          # Header, ticker, mega-menu, mobile navigation
│   │   ├── ScrollToTop.jsx     # Route transition scroll position reset
│   │   ├── SocialActivitiesGrid.jsx # Activity cards grid with video modal
│   │   └── WordPressMenu.jsx   # WordPress menu helpers
│   ├── config/
│   │   ├── wpConfig.js         # WordPress API endpoint and site config
│   │   └── wordpressPages.js   # Static fallback page IDs and menus
│   ├── hooks/
│   │   └── useWordPress.js     # React hooks for fetching WP pages
│   ├── pages/                  # Route-level views (lazy loaded)
│   │   ├── landing.jsx         # 30-second countdown intro landing page
│   │   ├── Home.jsx            # University homepage with slider and portals
│   │   ├── Departments.jsx     # Departments list overview
│   │   ├── DepartmentSingle.jsx# Comprehensive department view (73KB)
│   │   ├── Faculties.jsx       # Academic faculties catalog
│   │   ├── FacultySingle.jsx   # Individual faculty profile with CV tabs
│   │   ├── FacultyDepartmentSingle.jsx # Single faculty department view
│   │   ├── Galleries.jsx       # Photo & video gallery listing
│   │   ├── GallerySingle.jsx   # Single gallery album with lightbox
│   │   ├── News.jsx            # University news listing
│   │   ├── NewsSingle.jsx      # Single news article view
│   │   ├── Notifications.jsx   # Announcements and circulars
│   │   ├── NotificationSingle.jsx # Single notification detail
│   │   ├── Naac.jsx            # NAAC redirector / landing
│   │   ├── NaacSingle.jsx      # NAAC category & criterion explorer
│   │   ├── IqacDashboard.jsx   # IQAC redirector / overview
│   │   ├── IqacSingle.jsx      # IQAC criteria explorer
│   │   ├── NssDashboard.jsx    # NSS portal dashboard
│   │   ├── NssSingle.jsx       # NSS activity and details
│   │   ├── Publications.jsx    # University publications catalog
│   │   ├── PublicationSingle.jsx # Book publication detail view
│   │   ├── PublicationCategory.jsx # Category-filtered publications
│   │   ├── Activities.jsx      # University activities catalog
│   │   ├── ActivitySingle.jsx  # Single activity view
│   │   ├── CourseSingle.jsx    # Academic programme syllabus view
│   │   ├── InitiativesPage.jsx # Special projects and initiatives
│   │   └── Search.jsx          # Global search results page
│   ├── services/
│   │   ├── PageInfoContext.jsx # Context for storing active page translation IDs
│   │   └── wordpressApi.js     # Comprehensive WordPress REST API service (44KB)
│   ├── styles/                 # Vanilla CSS design system
│   │   ├── index.css           # Global tokens, reset, typography, and theme
│   │   ├── pages.css           # General layout and page styles
│   │   ├── department-modern.css # Department tabbed layout styling
│   │   ├── faculties.css       # Faculty listing and single styles
│   │   ├── floatingSocial.css  # Floating social dock styling
│   │   ├── landing.css         # Intro landing screen animation styles
│   │   ├── megaMenu.css        # Desktop & mobile mega menu CSS
│   │   ├── megaCenter.css      # Centering styles for mega menus
│   │   ├── normalMenu.css      # Fallback standard dropdown styling
│   │   └── social-activities.css # Social activities grid styles
│   └── templates/              # Dynamic content templates
│       ├── WordPressPage.jsx   # Fallback template for any WP hierarchical page
│       ├── ContactUs.jsx       # Contact page with dynamic ACF fields & map
│       └── ChildPagesGrid.jsx  # Child pages grid template
```

---

## 4. Dependencies & Runtime Requirements

From [`package.json`](file:///home/sabir/projects/mu/package.json):

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.15.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.15.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "globals": "^15.12.0",
    "vite": "^6.0.1"
  }
}
```

The application is intentionally lightweight, with **zero heavy UI libraries** (no Bootstrap, no Tailwind, no Material UI, no Axios). All networking is done with native `fetch`, state with React built-ins, and styles with Vanilla CSS.

---

## 5. State Management Architecture

State in this application is intentionally organized into 3 decoupled layers:

```
                    ┌──────────────────────────────┐
                    │       URL / Route State      │
                    │  (useParams, useSearchParams) │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    PageInfoContext (Global) │
                    │ { id, postType, transSlugs } │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Component State (useState) │
                    │ (page, loading, error, tabs) │
                    └─────────────────────────────┘
```

1. **URL as Single Source of Truth**:
   - Language is derived from URL paths (`/ml/...` vs `/en/...`).
   - Page identity is derived from `:slug`, `:id`, or hierarchical splat `*`.
   - Filters, search terms, and tab selectors are stored in URL parameters (`?q=...`, `?lang=...`).
2. **Global Translation Context ([`PageInfoContext`](file:///home/sabir/projects/mu/src/services/PageInfoContext.jsx))**:
   - Manages `{ id, postType, translationSlugs }`.
   - Populated by whatever single page or template is currently active.
   - Read by [`src/components/Header.jsx`](file:///home/sabir/projects/mu/src/components/Header.jsx) to enable intelligent Polylang language switching between translated post slugs.
3. **Local Component State**:
   - Managed via standard React hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
   - Handles data fetching, UI accordions, tab selections, lightboxes, and loading skeletons.

---

## 6. Custom Hooks & Service Layer

- **[`src/hooks/useWordPress.js`](file:///home/sabir/projects/mu/src/hooks/useWordPress.js)**:
  - `useWordPressPage(pageId)`: Reactively fetches a single WordPress page by numeric ID.
  - `useWordPressPages(params)`: Fetches a collection of WordPress pages.
- **[`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js)**:
  - Contains all API queries, in-memory caching (`apiCache`), request deduplication (`pendingRequests`), URL rewriting, and data formatters.
- **[`src/services/PageInfoContext.jsx`](file:///home/sabir/projects/mu/src/services/PageInfoContext.jsx)**:
  - Context provider and hook (`usePageInfo()`) for coordinating Polylang translation slugs between page components and the global navigation header.

---

## 7. Deployment Configuration

### Environment Variables
Configured in `.env` or CI/CD environment:
- `VITE_WP_API_URL`: Optional override for WordPress REST API base (defaults to `WP_CONFIG.API_URL` from [`src/config/wpConfig.js`](file:///home/sabir/projects/mu/src/config/wpConfig.js)).

### Build Configuration ([`vite.config.js`](file:///home/sabir/projects/mu/vite.config.js))
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Static Hosting & SPA Rewrites
Because React Router handles deep routes client-side, the server must rewrite all non-file requests to `/index.html`:
1. **Vercel** ([`public/vercel.json`](file:///home/sabir/projects/mu/public/vercel.json)):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. **Netlify / Cloudflare Pages** ([`public/_redirects`](file:///home/sabir/projects/mu/public/_redirects)):
   ```
   /*    /index.html   200
   ```
3. **Apache HTTP Server** ([`public/.htaccess`](file:///home/sabir/projects/mu/public/.htaccess)):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_FILENAME} !-l
     RewriteRule . /index.html [L]
   </IfModule>
   ```
4. **Nginx** ([`nginx.conf`](file:///home/sabir/projects/mu/nginx.conf)):
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
