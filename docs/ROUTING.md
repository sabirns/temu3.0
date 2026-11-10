# Routing Architecture & Route Catalog

The routing in the Malayalam University frontend is powered by `react-router-dom` v6 (`^6.28.0`) in [`src/App.jsx`](file:///home/sabir/projects/mu/src/App.jsx). It features bilingual routing (`/ml/` and `/en/`), code-split lazy routes, dynamic hierarchical fallback routes for WordPress pages, and client-side link interception.

---

## 1. Routing Principles

1. **Language Prefix as Canonical Routing Standard**:
   - The primary language is Malayalam (`/ml/`), and the secondary language is English (`/en/`).
   - Root URL `/` and `/landing` render the intro screen.
   - Core routes are mapped twice: with and without `:lang` prefix (e.g. `/departments` and `/:lang/departments`), allowing graceful redirection or implicit Malayalam default.
2. **Route-Level Code Splitting**:
   - Every single view component is loaded lazily with `React.lazy()` wrapped in a top-level `<Suspense fallback={<PageLoader />}>`.
3. **Catch-All WordPress Fallback**:
   - Any URL path that does not match an explicit React route is captured by `/:slug/*` or `/:lang/:slug/*`, invoking [`src/templates/WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx).

---

## 2. Complete Route Catalog

| Path Pattern | Component | Purpose & Description |
| :--- | :--- | :--- |
| `/` | `Landing` | Intro countdown landing page (30s redirect to `/ml/home`). Hides Header, Footer, and FloatingSocial. |
| `/landing` | `Landing` | Direct URL for the intro landing page. |
| `/home` | `Navigate` | Redirects to `/ml/home` |
| `/home-page` | `Navigate` | Redirects to `/ml/home` |
| `/home-page-ml` | `Navigate` | Redirects to `/ml/home` |
| `/home-page-en` | `Navigate` | Redirects to `/en/home` |
| `/:lang/home` | `Home` | Main bilingual university home page (slider, news, notifications, portals, about) |
| `/:lang/home/*` | `Home` | Sub-splat fallback for home |
| `/:lang/home-page` | `Navigate` | Redirects to `/:lang/home` |
| `/:lang/home-page-ml` | `Navigate` | Redirects to `/ml/home` |
| `/:lang/home-page-en` | `Navigate` | Redirects to `/en/home` |
| `/:lang` | `Home` | Base language root (e.g. `/ml` or `/en`) renders `Home` |
| `/search`, `/:lang/search` | `Search` | Global search across WordPress posts and pages (`searchContent`) |
| `/notifications`, `/:lang/notifications` | `Notifications` | Paginated announcements and university circulars |
| `/notifications/:slug`, `/:lang/notifications/:slug` | `NotificationSingle` | Single announcement view with sidebar of recent circulars |
| `/departments`, `/:lang/departments` | `Departments` | Catalog of university schools and departments |
| `/department/:id`, `/:lang/department/:id` | `DepartmentSingle` | Single department portal with tabbed layout or faculty term route (`term-:id`) |
| `/faculties`, `/:lang/faculties`, `/:lang/ഫാക്കൽറ്റികൾ` | `Faculties` | Catalog of top-level academic faculties |
| `/faculty-department/:slug`, `/:lang/faculty-department/:slug` | `FacultyDepartmentSingle` | Department view filtered by taxonomy term slug |
| `/faculty/:slug`, `/:lang/faculty/:slug` | `FacultySingle` | Individual faculty member profile with publications and CV |
| `/gallery`, `/:lang/gallery` | `Galleries` | Video & photo gallery archive |
| `/gallery/:slug`, `/:lang/gallery/:slug` | `GallerySingle` | Single gallery album with responsive modal lightbox |
| `/news`, `/:lang/news` | `News` | University news archive |
| `/news/:slug`, `/:lang/news/:slug` | `NewsSingle` | Single news story detail with recent news sidebar |
| `/naac`, `/naac/`, `/:lang/naac`, `/:lang/naac/` | `Naac` | NAAC portal redirector (redirects to first criterion post) |
| `/naac/:categorySlug/:slug`, `/:lang/naac/:categorySlug/:slug` | `NaacSingle` | NAAC single criterion document explorer |
| `/iqac`, `/iqac/`, `/:lang/iqac`, `/:lang/iqac/` | `IqacDashboard` | IQAC dashboard redirector (redirects to first IQAC post) |
| `/iqac/:categorySlug/:slug`, `/:lang/iqac/:categorySlug/:slug` | `IqacSingle` | IQAC criteria view and documents |
| `/iqac-category/:slug`, `/:lang/iqac-category/:slug` | `IqacSingle` | Direct link to IQAC category |
| `/nss`, `/nss/`, `/:lang/nss`, `/:lang/nss/`, `/nss-en`, `/:lang/nss-en` | `NssDashboard` | NSS portal overview (redirects to first NSS article) |
| `/nss/:slug`, `/:lang/nss/:slug` | `NssSingle` | National Service Scheme activity single post |
| `/എൻ-എസ്-എസ്`, `/ml/എൻ-എസ്-എസ്` | `Navigate` | Malayalam Unicode redirect to `/nss` or `/ml/nss` |
| `/publications`, `/:lang/publications` | `Publications` | University publication catalog (books, price, editor) |
| `/publications/:slug`, `/:lang/publications/:slug` | `PublicationSingle` | Single publication detail view |
| `/publication-category/:categorySlug`, `/:lang/publication-category/:categorySlug` | `PublicationCategory` | Publications filtered by taxonomy term |
| `/our-courses-ml`, `/courses-offered`, `/:lang/our-courses-ml`, `/:lang/courses-offered` | `ChildPagesGrid` | Grid of child course pages |
| `/courses/:slug`, `/:lang/courses/:slug` | `CourseSingle` | Single course / academic syllabus detail view |
| `/activities`, `/:lang/activities` | `Activities` | University activities overview |
| `/activities/department/:termSlug`, `/:lang/activities/department/:termSlug` | `Activities` | Activities filtered by department term slug |
| `/activity/:slug`, `/:lang/activity/:slug` | `ActivitySingle` | Single activity detail with same-category recommendations |
| `/initiatives`, `/:lang/initiatives`, `/പദ്ധതികളും-സംരംഭങ്ങളും`, `/:lang/പദ്ധതികളും-സംരംഭങ്ങളും` | `InitiativesPage` | Special initiatives with social activities grid |
| `/contact-us`, `/contact-us-ml`, `/:lang/contact-us`, `/:lang/contact-us-ml` | `ContactUs` | Dynamic contact template with ACF details and Google Maps |
| `/page/:pageId`, `/:lang/page/:pageId` | `WordPressPage` | Direct page load by numeric WordPress ID |
| `/:slug/*` | `WordPressPage` | Fallback catch-all for root hierarchical WordPress pages |
| `/:lang/:slug/*` | `WordPressPage` | Fallback catch-all for bilingual hierarchical WordPress pages |

---

## 3. Dynamic Department Routes & Term Routing

Department routes support three different URL schemes in [`src/pages/DepartmentSingle.jsx`](file:///home/sabir/projects/mu/src/pages/DepartmentSingle.jsx):

1. **Numeric ID**: `/department/27` or `/:lang/department/27`
   - Fetches directly via `${WORDPRESS_API_URL}/departments/${id}`.
2. **Slug**: `/department/malayalam-kavitha` or `/:lang/department/malayalam-kavitha`
   - Fetches via `${WORDPRESS_API_URL}/departments?slug=${id}`.
3. **Term Routes (`term-:id`)**: `/department/term-42` or `/:lang/department/term-42`
   - Detected by `id.startsWith('term-')`.
   - Used when navigating from faculty department taxonomy terms.
   - Fetches the term details via `fetchFacultyDepartment(termId)` and all child departments assigned to that term or its descendants via `fetchDepartments({ faculty_department: allRelevantTermIds })`.
   - Renders a multi-card grid of all departments under that school/faculty.

---

## 4. Fallback Routing & 404 Resolution Architecture

When an unregistered route is requested, it matches `/:lang/:slug/*` and renders [`src/templates/WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx). The resolution follows a strict multi-tier fallback pipeline:

```
User visits /ml/about/vision-mission/
          │
          ▼
1. Recombine segments: slug = "about", splat = "vision-mission" -> fullSlug = "about/vision-mission"
          │
          ▼
2. Extract page slug: last segment = "vision-mission"
          │
          ▼
3. Query API: /pages?slug=vision-mission&_embed=true&acf_format=standard&lang=ml
          │
          ├──> [Matches found]
          │         │
          │         ▼
          │    4. Canonical link validation:
          │       Does page.link match "/ml/about/vision-mission/"?
          │         ├── Yes -> Render matched page
          │         └── No (duplicate slugs) ->
          │                 5. Parent-Chain verification:
          │                    Walk candidate.parent hierarchy to match parent slugs
          │
          └──> [No match]
                    │
                    ▼
               6. Fallback fetch: fetchPageBySlug(pageSlug, { lang })
                    │
                    ├── Found -> Render page
                    └── Not Found -> Display 404 Oops state with "Go Home" button
```

### Empty Content Fallback: Sub-menu Portals
If a WordPress page exists in the CMS but its `content` is effectively empty (e.g. placeholder container pages in a hierarchy), [`WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx#L212-L260) dynamically queries the rendered DOM menu (`#mega-menu-custom a`), finds the parent item matching the current URL, extracts its child submenu links, and displays an auto-generated portal card grid (`submenu-cards-section`) so the user never sees a dead blank page.

---

## 5. Client-Side Link Interception ([`LinkInterceptor`](file:///home/sabir/projects/mu/src/App.jsx#L86-L128))

Because WordPress content, Gutenberg blocks, and dynamic mega-menus output standard `<a href="...">` anchor tags, standard clicks would cause unwanted full-browser reloads to WordPress backend URLs.

`LinkInterceptor` registers a capturing click listener on `document`:
1. Identifies if the clicked target is an anchor `<a>`.
2. Bypasses non-navigational links (`#`, `javascript:`, `mailto:`, `tel:`, `download`, `target="_blank"`, or modifier keys like Ctrl/Cmd).
3. Compares host against internal hosts: `window.location.host`, `WP_CONFIG.SITE_URL` host, `localhost`, or `127.0.0.1`.
4. If internal, calls `e.preventDefault()`.
5. Slices out WordPress base paths (e.g. `/sabir/mu`).
6. Dispatches `navigate(destination)` via React Router for seamless SPA transitions.

---

## 6. Document Title Management ([`DocumentTitle`](file:///home/sabir/projects/mu/src/components/DocumentTitle.jsx))

```javascript
const SITE_NAME = {
  ml: 'തുഞ്ചത്തെഴുത്തച്ഛൻ മലയാളസർവകലാശാല',
  en: 'Thunchath Ezhuthachan Malayalam University',
}
```

On every route change (`location.pathname`), `DocumentTitle`:
1. Identifies current language from the URL prefix (`ml` vs `en`).
2. Queries the DOM for `document.querySelector('main h1')`.
3. Formats document title as:
   `[Page Title] - [Site Name]` or defaults to `[Site Name]`.
