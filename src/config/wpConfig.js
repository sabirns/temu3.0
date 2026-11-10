const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

// Use local WordPress when explicitly enabled via VITE_USE_LOCAL_WP=true
const isBrowser = typeof window !== 'undefined'
const isLocalhostHost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
)

const isDevMode = Boolean(env.DEV)
const shouldUseLocalhost = isLocalhostHost && isDevMode && env.VITE_USE_LOCAL_WP === 'true'

export const WP_CONFIG = {
  API_URL: env.VITE_WP_API_URL || (shouldUseLocalhost ? 'http://localhost/sabir/mu/wp-json/wp/v2' : 'https://cms.malayalamuniversity.edu.in/wp-json/wp/v2'),
  SITE_URL: env.VITE_WP_SITE_URL || (shouldUseLocalhost ? 'http://localhost/sabir/mu' : 'https://cms.malayalamuniversity.edu.in'),
  SITE_NAME: 'Thunchath Ezhuthachan Malayalam University',
  // Default WordPress notifications category to filter by
  NOTIFICATIONS_CATEGORY_ID: 208,
}
