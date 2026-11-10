# Multilingual Architecture & Polylang System

The Malayalam University website is a dual-language application supporting **Malayalam (`ml`)** as the primary native language and **English (`en`)** as the secondary language.

---

## 1. Language Detection & Context Resolution

Language state is resolved via `getLanguageContext` in [`src/services/wordpressApi.js`](file:///home/sabir/projects/mu/src/services/wordpressApi.js#L1144-L1159):

```javascript
export function getLanguageContext(pathname, searchParams) {
  // 1. Check path prefix (e.g., /en/notifications)
  const pathParts = pathname.split('/').filter(Boolean)
  if (pathParts[0] === 'ml' || pathParts[0] === 'en') {
    return pathParts[0]
  }

  // 2. Check search params (fallback)
  const langParam = searchParams.get('lang')
  if (langParam === 'ml' || langParam === 'en') {
    return langParam
  }

  // 3. Default
  return 'ml'
}
```

### Typography Switching ([`LangFont`](file:///home/sabir/projects/mu/src/App.jsx#L77-L84))
When switching languages, `LangFont` watches `location.pathname` and toggles a global CSS class on `document.body`:
- **Malayalam (`ml`)**: `document.body.className = ''`
  Uses `Inter` and `Noto Sans Malayalam` for script rendering.
- **English (`en`)**: `document.body.className = 'lang-en'`
  Applies `Montserrat` across headings and UI text for English typography.

---

## 2. Dynamic Language Switching Engine

The language toggle button in [`src/components/Header.jsx`](file:///home/sabir/projects/mu/src/components/Header.jsx#L506-L551) runs a 3-tier translation resolution algorithm when clicked:

```
                            User clicks Language Switcher
                                         │
                                         ▼
            Target language determined (newLang = siteLang === 'ml' ? 'en' : 'ml')
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ Priority 1: Check PageInfoContext Slugs      │
                  │ (pageInfo.translationSlugs?.[newLang])       │
                  └──────────────────────┬───────────────────────┘
                                         │
                         Found? ─────────┴──────── No
                           │                        │
                           ▼                        ▼
                  Navigate to target      ┌──────────────────────────────────────────────┐
                  translated slug         │ Priority 2: Query Polylang REST Endpoint     │
                                          │ fetchPolylangTranslation(id, type, newLang) │
                                          └──────────────────────┬───────────────────────┘
                                                                 │
                                                 Found? ─────────┴──────── No
                                                   │                        │
                                                   ▼                        ▼
                                          Navigate to resolved    ┌──────────────────────────────────────────────┐
                                          translated slug         │ Priority 3: Path Prefix Swap (Fallback)      │
                                                                  │ Replace /ml/ with /en/ (or vice-versa).      │
                                                                  │ For section hubs (nss/naac/iqac), navigate   │
                                                                  │ to section root if post doesn't exist.       │
                                                                  └──────────────────────────────────────────────┘
```

### Pre-computed Translation Paths
To avoid visual latency on hover or tap, `Header.jsx` uses `useMemo` to pre-compute the target translated URL paths (`translationPaths.en` and `translationPaths.ml`) whenever `pageInfo` changes:

```javascript
const translationPaths = useMemo(() => {
  const currentPath = location.pathname
  const swapPrefix = (targetLang) => {
    const parts = currentPath.split('/').filter(Boolean)
    if (parts[0] === 'ml' || parts[0] === 'en') parts[0] = targetLang
    else parts.unshift(targetLang)
    const sectionRoutes = ['nss', 'naac', 'iqac']
    if (sectionRoutes.includes(parts[1])) {
      return '/' + [targetLang, parts[1]].join('/')
    }
    return '/' + parts.join('/')
  }
  // If translationSlugs exist, replace the final slug segment with the translated slug
  ...
}, [pageInfo.translationSlugs, location.pathname])
```

---

## 3. Translation Orchestration ([`PageInfoContext`](file:///home/sabir/projects/mu/src/services/PageInfoContext.jsx))

Because single-page components know their current WordPress post ID and translation links, they publish their metadata to `PageInfoContext` upon loading:

```javascript
// Example in DepartmentSingle.jsx, NewsSingle.jsx, WordPressPage.jsx
const { setPageInfo } = usePageInfo()

useEffect(() => {
  if (post) {
    setPageInfo({
      id: post.id,
      postType: 'department',
      translationSlugs: await extractTranslationSlugs(post, 'department')
    })
  }
}, [post])
```

When navigating away, `resetPageInfo()` clears the active post context.

---

## 4. Language-Specific Content & Configuration

Several features require language-specific identifiers or queries:

### 1. Navigation Menus
- **Malayalam MegaMenu**: Fetches `/wp-json/mu/v2/mega-menu/primary_ml`.
- **English MegaMenu**: Fetches `/wp-json/mu/v2/mega-menu/primary_en`.
- **Top Bar Menu**: Fetches location `top_menu_1` with `lang=ml` or `lang=en`.

### 2. Homepage Content
In [`src/pages/Home.jsx`](file:///home/sabir/projects/mu/src/pages/Home.jsx#L54):
- **Malayalam**: Fetches page by slug `home-page-ml`.
- **English**: Fetches page by numeric ID `465`.
- **Slider**: Filtered by slide language property:
  ```javascript
  s.lang === slideLang || s.translations?.[slideLang === 'ml' ? 'ml_IN' : 'en_US']
  ```

### 3. Notification Categories
In [`src/components/Header.jsx`](file:///home/sabir/projects/mu/src/components/Header.jsx#L18):
- **Malayalam**: Notification term ID `1888`
- **English**: Notification term ID `1890`

### 4. Contact Pages
- **Malayalam**: Slug `contact-us-ml`
- **English**: Slug `contact-us`

### 5. Fallback Behavior
- If an English translation does not exist for a specific page, the URL router will fallback to the dashboard or section index (e.g. `/:lang/naac`, `/:lang/iqac`, `/:lang/nss`).
- In `WordPressPage.jsx`, if a page does not exist under the requested language, it gracefully attempts fallback resolution with the current slug before showing the 404 Oops view.
