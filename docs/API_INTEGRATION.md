# API Integration & WordPress REST Endpoints

This document details all WordPress REST API integrations, endpoints, request parameters, data transformations, and caching strategies implemented in [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js).

---

## 1. API Configuration & Base URLs

Configured in [`src/config/wpConfig.js`](file:///home/sabir/projects/mu/src/config/wpConfig.js):

```javascript
export const WP_CONFIG = {
  API_URL: import.meta.env.VITE_WP_API_URL || (shouldUseLocalhost ? 'http://localhost/sabir/mu/wp-json/wp/v2' : 'https://cms.malayalamuniversity.edu.in/wp-json/wp/v2'),
  SITE_URL: import.meta.env.VITE_WP_SITE_URL || (shouldUseLocalhost ? 'http://localhost/sabir/mu' : 'https://cms.malayalamuniversity.edu.in'),
  SITE_NAME: 'Thunchath Ezhuthachan Malayalam University',
  NOTIFICATIONS_CATEGORY_ID: 208,
}
```

- **Environment Override**:
  Components can override the base endpoint via `import.meta.env.VITE_WP_API_URL`.
- **Custom Endpoints**:
  The MegaMenu uses a custom WordPress REST endpoint: `${WP_CONFIG.SITE_URL}/wp-json/mu/v2/mega-menu/:slug`.

---

## 2. In-Memory Caching & Request Deduplication

To prevent duplicate requests and API waterfalls, `wordpressApi.js` provides an in-memory caching and deduplication utility:

```javascript
const apiCache = new Map()
const pendingRequests = new Map()
const DEFAULT_TTL_MS = 3 * 60 * 1000 // 3 minutes TTL

export async function fetchWithCache(url, options = {}, ttlMs = DEFAULT_TTL_MS)
```

### Mechanisms
1. **TTL Caching (`apiCache`)**:
   - Stores `{ data, timestamp }` keyed by the full request URL.
   - Cache hits return instantly if `Date.now() - timestamp < ttlMs`.
2. **In-Flight Request Deduplication (`pendingRequests`)**:
   - If a request for the exact same URL is already in progress, subsequent calls attach to the existing Promise rather than dispatching a duplicate network request.
3. **Cache Invalidation**:
   - Can be purged programmatically via `clearApiCache()`.

---

## 3. Complete Endpoints Catalog

### 1. Pages & Posts
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchPage(id, params)` | `/pages/:id` | `_embed`, `acf_format=standard`, `lang` | Cached with `fetchWithCache`. |
| `fetchPageBySlug(slug, params)` | `/pages?slug=:slug` | `slug`, `_embed`, `acf_format=standard`, `lang` | Returns first matching page object. |
| `fetchPages(params)` | `/pages` | `per_page`, `parent`, `lang`, `_embed` | Fetches multiple pages (e.g. child pages). |
| `fetchPosts(params)` | `/posts` | `per_page`, `status=publish`, `_embed`, `lang` | Fetches university news items. |
| `fetchPostBySlug(slug, params)` | `/posts?slug=:slug` | `slug`, `_embed`, `lang` | Fetches single news story. |

### 2. Departments & Faculties
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchDepartments(params)` | `/departments` | `per_page=100`, `status=publish`, `_embed`, `lang`, `faculty_department` | Returns list of academic departments. |
| `fetchDepartment(id, params)` | `/departments/:id` or `/departments?slug=:id` | `_embed`, `acf_format=standard`, `lang` | Numeric ID tried first; falls back to slug search. |
| `fetchFaculties(params)` | `/faculties` | `per_page=100`, `_embed`, `acf_format=standard`, `lang` | Returns faculty member profiles. |
| `fetchFacultyBySlug(slug, params)` | `/faculties?slug=:slug` | `slug`, `_embed`, `acf_format=standard`, `lang` | Attempts decoded slug; falls back to raw slug. |
| `fetchFacultyDepartments(params)` | `/faculty_department` | `per_page=100`, `lang` | Taxonomy terms for schools & faculties. |
| `fetchFacultyDepartment(id)` | `/faculty_department/:id` | `lang` | Single faculty department term. |

### 3. Academics, Activities & Students
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchCourses(params)` | `/courses` | `per_page=20`, `status=publish`, `_embed`, `lang`, `faculty_department`, `course_category` | Academic degree programmes. |
| `fetchCourseBySlug(slug, params)` | `/courses?slug=:slug` | `slug`, `_embed`, `lang` | Single course syllabus view. |
| `fetchActivities(params)` | `/activity` | `per_page=20`, `status=publish`, `_embed`, `lang`, `activity_type`, `faculty_department` | Department & campus activities. |
| `fetchActivityBySlug(slug, params)` | `/activity?slug=:slug` | `slug`, `_embed`, `lang` | Single activity detail. Extracts `activity_type`. |
| `fetchStudents(params)` | `/student` | `per_page=20`, `status=publish`, `_embed`, `lang`, `faculty_department` | Department student list. |

### 4. Announcements & Media
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchNotifications(params)` | `/notifications` | `per_page=10`, `status=publish`, `_embed`, `notification_category` | Announcements and circulars. Filters specific categories over generic ones. |
| `fetchNotification(id, params)` | `/notifications/:id` or `?slug=:id` | `_embed`, `lang` | Single notification view. |
| `fetchNotificationCategories(params)`| `/notification_category` | `lang` | Notification taxonomy terms. |
| `fetchGallery(params)` | `/galleries` | `per_page=8`, `status=publish`, `_embed`, `lang`, `include`, `faculty_department` | Photo & video galleries. |
| `fetchGalleryBySlug(slug, params)` | `/galleries?slug=:slug` | `slug`, `_embed`, `lang` | Single gallery album. |
| `fetchMedia(id)` | `/media/:id` | None | Direct attachment resolution for PDFs and ACF image IDs. |

### 5. Accreditations, Quality & Extension
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchNaacPosts(params)` | `/naac` | `per_page=100`, `status=publish`, `_embed` | NAAC criteria documents. Parses `naac_category`. |
| `fetchIqacPosts(params)` | `/iqac` | `per_page=100`, `status=publish`, `_embed` | IQAC records. Parses `iqac_category`. Cached. |
| `fetchIqacPostBySlug(slug, params)` | `/iqac?slug=:slug` | `slug`, `_embed` | Single IQAC post. Cached. |
| `fetchIqacCategories(params)` | `/iqac_category` | `lang` | IQAC taxonomy terms. |
| `fetchNssPosts(params)` | `/nss` | `per_page=100`, `status=publish`, `_embed`, `acf_format=standard` | NSS posts. Parses `nss_category`. Cached. |
| `fetchNssPostBySlug(slug, params)` | `/nss?slug=:slug` | `slug`, `_embed`, `acf_format=standard` | Single NSS activity. Cached. |
| `fetchNssCategories(params)` | `/nss_category` | `lang` | NSS taxonomy terms. |
| `fetchPublications(params)` | `/publications` | `per_page=50`, `status=publish`, `_embed`, `acf_format=standard` | University books & publications. Extracts `pdf` from ACF `file`. |
| `fetchPublicationBySlug(slug, params)`| `/publications?slug=:slug`| `slug`, `_embed`, `acf_format=standard` | Single publication with `pdf` document resolver. |
| `fetchPublicationCategories(params)` | `/publication_category` | `lang` | Publication categories. |

### 6. Menus & Homepage
| Function | Endpoint | Params | Notes |
| :--- | :--- | :--- | :--- |
| `fetchMenus()` | `/menus` | None | Cached (10-minute TTL). |
| `fetchMenuByLocation(loc, lang)` | `/menu-locations/:loc` -> `/menu-items?menus=:id` | `lang` | Resolves menu location items. Cached (10 min). |
| Dynamic MegaMenu | `/wp-json/mu/v2/mega-menu/:slug` | `primary_ml` / `primary_en` | Returns server-rendered HTML for the mega menu. |
| `fetchSliders(params)` | `/slider` & `/slider_location` | `location`, `lang`, `per_page`, `_embed`, `acf_format=standard` | Fetches sliders filtered by `slider_location` taxonomy (`home-page` for Home banner or `landing-page` for Landing slideshow). Parses ACF `content` and `slider_buttons`. |

---

## 4. Data Transformation Helpers

1. **`getPageContent(page)`**:
   Transforms raw WordPress page payload into a clean, normalized structure:
   ```javascript
   {
     id: page.id,
     title: fixWordPressUrls(stripHtml(page.title?.rendered || '')),
     content: fixWordPressUrls(page.content?.rendered || ''),
     excerpt: fixWordPressUrls(page.excerpt?.rendered || ''),
     date: page.date,
     modified: page.modified,
     slug: page.slug,
     featuredImage: getFeaturedImage(page),
     meta: page.meta || {},
     acf: page.acf || {}
   }
   ```
2. **`stripHtml(html)`**:
   Uses `DOMParser` (in browser) or regex fallback to strip all HTML tags, yielding plain text for card headers and excerpts.
3. **`cleanWordPressUrl(url)`**:
   - Preserves external protocols (`mailto:`, `tel:`, `#`).
   - Identifies static media assets (`.pdf`, `.jpg`, `.png`, `/wp-content/`) and preserves absolute URL pointing to the CMS host.
   - Slices out local WordPress prefixes (`http://localhost/sabir/mu`) from navigational links so they become relative paths for React Router.
4. **`fixWordPressUrls(content)`**:
   Regex parser that rewrites `href`, `src`, and `action` attributes inside raw HTML to ensure media points to WordPress while internal links are transformed for SPA navigation.
5. **`getFacultyProfileUrl(f)`**:
   Multi-stage fallback extractor for faculty CV / profile URLs:
   - Checks `f.acf?.profile` (string or object URL).
   - Checks `f.profilePdf`.
   - Inspects `f._embedded['wp:attachment']` for attached PDF files.

---

## 5. Polylang Multilingual API Integration

To support synchronized language toggling, two methods extract translation slugs:

1. **`extractTranslationSlugs(post, postType)`**:
   - **Method A**: Inspects `post._links.translations` (Polylang link relation containing full URLs) and extracts the slug for each locale (`en_US` -> `en`, `ml_IN` -> `ml`).
   - **Method B**: Inspects `post.translations` (map of language codes to translated post IDs: `{ en: 123, ml: 456 }`). Fetches the corresponding post's slug via `${WP_CONFIG.API_URL}/${endpoint}/${translatedId}?_fields=slug`.
2. **`fetchPolylangTranslation(postId, postType, targetLang)`**:
   - Queries the post by ID and returns the exact slug in the target language.

---

## 6. Error Handling & Loading Conventions

- **Network Failures**: All API methods are wrapped in `try ... catch` blocks and return safe defaults (`null` or `[]`) rather than throwing unhandled exceptions.
- **Empty States**: Pages check for null/empty returns and display contextual alerts without crashing the application.
- **HTTP Status Codes**:
  - `404 Not Found`: Logged as warning (`console.warn`); components show fallback 404 screens.
  - `500 Server Error`: Caught and reported to UI via `setError(...)`.
