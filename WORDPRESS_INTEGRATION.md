# WordPress Integration Guide

## Setup

The WordPress API URL is configured in `src/config/wpConfig.js`. Update it to match your WordPress installation:

```js
export const WP_CONFIG = {
  API_URL: 'http://localhost/sabir/mu/wp-json/wp/v2',
  SITE_URL: 'http://localhost/sabir/mu',
  SITE_NAME: 'Thunchath Ezhuthachan Malayalam University',
}
```

## Adding WordPress Page Links

### 1. Configure Page IDs

Add your WordPress page IDs in `src/config/wordpressPages.js`:

```js
export const WORDPRESS_PAGES = {
  ABOUT: 23,
  VISION_MISSION: 24,
  CHANCELLOR: 25,
  // Add more page IDs here
}
```

### 2. Update Menu Links

Edit `src/config/wordpressPages.js` to add menu items with page IDs:

```js
{
  label: 'സർവകലാശാല',
  megaMenu: true,
  children: [
    {
      title: 'സർവകലാശാല',
      links: [
        { label: 'സർവകലാശാലയെക്കുറിച്ച്', pageId: WORDPRESS_PAGES.ABOUT },
        // For React routes:
        { label: 'Departments', pageId: 27, isRoute: true, route: '/departments' },
      ]
    }
  ]
}
```

### 3. Using Components

Import and use the WordPress menu components:

```jsx
import { WordPressMenuItem, WordPressMenuLink } from './components/WordPressMenu'

// Simple link to a WordPress page
<WordPressMenuItem pageId={23} label="About Us" />

// In dropdown menu
<WordPressMenuLink pageId={23} label="About" />
```

## Routes

WordPress pages are loaded at `/page/:pageId`:

- `/page/23` - Fetches and displays WordPress page with ID 23

## API Service

The `wordpressApi.js` service provides:

- `fetchPage(pageId)` - Fetch single page by ID
- `fetchPages(params)` - Fetch multiple pages
- `getPageContent(page)` - Parse page data
- `getFeaturedImage(page)` - Get featured image URL

## Hooks

Use the custom hooks for fetching data:

```jsx
import { useWordPressPage } from './hooks/useWordPress'

function MyComponent() {
  const { page, loading, error } = useWordPressPage(23)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  
  return <div dangerouslySetInnerHTML={{ __html: page.content }} />
}
```

## WordPress REST API

Your WordPress site needs the REST API enabled (default in modern WordPress). Test your API:

```
http://localhost/sabir/mu/wp-json/wp/v2/pages
```
