# Antigravity AI Agent Rules & Engineering Playbook

This document defines mandatory guidelines, architecture constraints, and rules for all AI agents working on the **Malayalam University (Thunchath Ezhuthachan Malayalam University)** headless React frontend repository (`mu-react`).

---

## 1. Core Operating Principles

1. **Frontend-Only Workspace Scope**:
   - The WordPress CMS backend is hosted in a completely separate repository and directory.
   - Do **NOT** assume WordPress source code or local PHP runtime is present in this workspace.
   - Frontend changes must strictly adhere to the established REST API contract in [docs/INTEGRATION.md](file:///home/sabir/projects/mu/docs/INTEGRATION.md).

2. **Inspect Before You Implement**:
   - Always check existing components in [`src/components/`](file:///home/sabir/projects/mu/src/components/), [`src/templates/`](file:///home/sabir/projects/mu/src/templates/), and [`src/pages/`](file:///home/sabir/projects/mu/src/pages/) before writing new code.
   - Reuse existing utilities from [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js) and layout blocks rather than re-implementing custom fetchers or styling.

3. **Never Invent or Guess WordPress Schema**:
   - Never assume fields, taxonomies, or ACF properties exist without verifying against current code or verified API responses.
   - All expected WordPress custom post types, fields, and taxonomies are documented in [docs/INTEGRATION.md](file:///home/sabir/projects/mu/docs/INTEGRATION.md) and [docs/API_INTEGRATION.md](file:///home/sabir/projects/mu/docs/API_INTEGRATION.md).

4. **Do Not Modify Unrelated Functionality**:
   - Keep pull requests and edits strictly targeted to the user's specific request.
   - Avoid opportunistic refactoring or reformatting of large files like [`src/styles/index.css`](file:///home/sabir/projects/mu/src/styles/index.css) or [`src/pages/DepartmentSingle.jsx`](file:///home/sabir/projects/mu/src/pages/DepartmentSingle.jsx).

---

## 2. Routing & Multilingual Conventions

1. **Maintain Dual Language Routing**:
   - Every route must support both Malayalam (`/ml/`) and English (`/en/`) routes.
   - Default language is Malayalam (`ml`).
   - Root `/` and `/landing` render the interactive Landing Page [`src/pages/landing.jsx`](file:///home/sabir/projects/mu/src/pages/landing.jsx).
   - Any modifications to routing in [`src/App.jsx`](file:///home/sabir/projects/mu/src/App.jsx) must preserve the fallback routes:
     ```jsx
     <Route path="/:slug/*" element={<WordPressPage />} />
     <Route path="/:lang/:slug/*" element={<WordPressPage />} />
     ```
   - See [docs/ROUTING.md](file:///home/sabir/projects/mu/docs/ROUTING.md) and [docs/MULTILINGUAL.md](file:///home/sabir/projects/mu/docs/MULTILINGUAL.md).

2. **Page Metadata & Polylang Synchronization**:
   - When introducing or altering page components, always update the shared context via [`usePageInfo`](file:///home/sabir/projects/mu/src/services/PageInfoContext.jsx):
     ```jsx
     const { setPageInfo } = usePageInfo()
     setPageInfo({
       id: post.id,
       postType: 'department',
       translationSlugs: await extractTranslationSlugs(post, 'department')
     })
     ```
   - This ensures the language toggle in [`src/components/Header.jsx`](file:///home/sabir/projects/mu/src/components/Header.jsx) accurately switches between corresponding Malayalam and English post slugs.

3. **Internal Navigation Interception**:
   - Never use raw `<a href="...">` for internal React routes. Use `<Link to="...">` from `react-router-dom`.
   - Any raw HTML injected from WordPress (e.g. Gutenberg blocks or API menus) relies on [`LinkInterceptor`](file:///home/sabir/projects/mu/src/App.jsx#L86-L128) and `cleanWordPressUrl` in [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L1161-L1193) to strip CMS base URLs and navigate client-side.

---

## 3. API Integration & Network Rules

1. **Use `fetchWithCache` for Deduplication and Caching**:
   - Use `fetchWithCache(url, options, ttlMs)` for all GET requests that can be shared or cached (e.g., menus, pages, static lists).
   - Never use `_t: Date.now()` on requests unless live freshness is explicitly required (e.g., preview mode). Cache-busting queries defeat client-side caching and degrade server performance.

2. **URL Cleanup and Asset Path Resolution**:
   - Always sanitize API content and URLs using:
     - `stripHtml(html)`: Strip HTML tags for document titles, cards, and excerpts.
     - `cleanWordPressUrl(url)`: Strip WordPress host/base paths while preserving media asset URLs (`/wp-content/`).
     - `fixWordPressUrls(content)`: Normalize embedded links and images in rendered Gutenberg HTML.

3. **Graceful Error & Loading States**:
   - Every data-fetching component must handle 3 states:
     - **Loading**: Use `<div className="page-loading"><div className="loading-spinner"></div>...</div>` or skeleton cards.
     - **Error / Empty**: Show a user-friendly bilingual error card with a link back to Home or the section dashboard.
     - **Success**: Render the content smoothly with `.page-reveal` animations where appropriate.

---

## 4. Styling & Design System Rules

1. **Follow Existing CSS Design Tokens**:
   - The design system is defined in [`src/styles/index.css`](file:///home/sabir/projects/mu/src/styles/index.css) using CSS variables:
     - Primary Navy: `var(--primary: #1a3a6e)`
     - Primary Light: `var(--primary-light: #2a5298)`
     - Primary Dark: `var(--primary-dark: #0f2347)`
     - Secondary Blue: `var(--secondary: #1e88e5)`
     - Warm Gold Accent: `var(--accent: #f0b429)`
     - Card Backgrounds: `var(--card: rgba(255, 255, 255, .96))`
     - Borders: `var(--stroke: rgba(26, 58, 110, .14))`
   - Never introduce ad-hoc HEX colors when an existing token exists.

2. **Scoped & Component-Level CSS**:
   - Avoid adding global classes without prefixing or nesting under component wrappers (e.g., `.department-hero-modern`, `.faculty-card`, `.naac-section`).
   - Maintain typography switching rules: Malayalam uses `Inter` & `Noto Sans Malayalam`; English uses `Montserrat` via `body.lang-en`.

3. **Responsive Breakpoints**:
   - Always respect the established responsive breakpoints:
     - **1200px**: Desktop container max-width (`1300px`).
     - **980px**: Mega-menu collapses to mobile burger navigation; quick-action dropdowns switch to touch-friendly mode.
     - **768px**: Multi-column grids (courses, cards, department sidebars) stack to single column.
     - **576px / 480px**: Small smartphone layout adjustments.

---

## 5. Verification & Testing

Before completing any task:
1. Run `npm run build` or `npm run lint` if verifying code modifications to verify there are no compilation or syntax errors.
2. Verify responsive layout down to mobile viewports (`375px`, `768px`, `1024px`, `1440px`).
3. Verify both language prefixes (`/ml/...` and `/en/...`).
4. Update corresponding documentation in [`docs/`](file:///home/sabir/projects/mu/docs/) if architecture, components, or API usage change.

---

## 6. Documentation Map

- Architecture & Structure: [docs/REACT_ARCHITECTURE.md](file:///home/sabir/projects/mu/docs/REACT_ARCHITECTURE.md)
- Complete Route Map: [docs/ROUTING.md](file:///home/sabir/projects/mu/docs/ROUTING.md)
- Component Catalog & Department Architecture: [docs/COMPONENTS.md](file:///home/sabir/projects/mu/docs/COMPONENTS.md)
- API Services & Endpoints: [docs/API_INTEGRATION.md](file:///home/sabir/projects/mu/docs/API_INTEGRATION.md)
- Multilingual System: [docs/MULTILINGUAL.md](file:///home/sabir/projects/mu/docs/MULTILINGUAL.md)
- Design System & Tokens: [docs/DESIGN_SYSTEM.md](file:///home/sabir/projects/mu/docs/DESIGN_SYSTEM.md)
- Performance & Optimization: [docs/PERFORMANCE.md](file:///home/sabir/projects/mu/docs/PERFORMANCE.md)
- WordPress Integration Contract: [docs/INTEGRATION.md](file:///home/sabir/projects/mu/docs/INTEGRATION.md)
