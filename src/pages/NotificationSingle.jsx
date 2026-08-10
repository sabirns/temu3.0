import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchNotification, fetchNotifications, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function NotificationSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const { setPageInfo } = usePageInfo()

  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarNotifications, setSidebarNotifications] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug);
        const [data, recent] = await Promise.all([
          fetchNotification(decodedSlug, { lang, _t: Date.now() }),
          fetchNotifications({ lang, per_page: 10, _t: Date.now() })
        ])
        if (data) {
          setPageInfo({ id: data.id, postType: 'notification', translationSlugs: await extractTranslationSlugs(data, 'notification') })
          setNotification(data)
        } else {
          setError(lang === 'ml' ? 'അറിയിപ്പ് കണ്ടെത്തിയില്ല.' : 'Notification not found.')
        }
        setSidebarNotifications(recent || [])
      } catch (err) {
        setError(lang === 'ml' ? 'അറിയിപ്പ് ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load notification.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      load()
    }
  }, [slug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'അറിയിപ്പ് ലോഡ് ചെയ്യുന്നു...' : 'Loading notification...'}</p>
      </div>
    )
  }

  if (error || !notification) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`} className="btn primary">
          {lang === 'ml' ? 'എല്ലാ അറിയിപ്പുകളും കാണുക' : 'View All Notifications'}
        </Link>
      </div>
    )
  }

  return (
    <article className="notification-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`}>
              {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}
            </Link>
            <span>/</span>
            <span>{notification.title}</span>
          </nav>
          <div className="notification-single-header">
            {notification.categoryName && (
              <span className={`notification-badge ${notification.categorySlug || 'info'}`}>
                {notification.categoryName}
              </span>
            )}
            <h1 className="inner-hero-title">{notification.title}</h1>
            <div className="notification-single-meta">
              <span>
                {new Date(notification.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="notification-single-layout">
          <div className="notification-single-main">
            {notification.featuredImage && (
              <div className="notification-single-featured">
                <img src={notification.featuredImage} alt={notification.title} />
              </div>
            )}
            <GutenbergContent
              html={notification.content}
              className="notification-content wordpress-content"
            />
          </div>

          <aside className="notification-single-sidebar">
            <div className="sidebar-widget">
              <h3>{lang === 'ml' ? 'ഏറ്റവും പുതിയ അറിയിപ്പുകൾ' : 'Latest Notifications'}</h3>
              {sidebarNotifications.length > 0 ? (
                <ul className="sidebar-notification-list">
                  {sidebarNotifications.map(item => (
                    <li key={item.id}>
                      <Link to={lang === 'ml' ? `/notifications/${item.slug}` : `/${lang}/notifications/${item.slug}`} className="sidebar-notification-link">
                        <span className="sidebar-notification-title">{item.title}</span>
                        <span className="sidebar-notification-date">{new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>{lang === 'ml' ? 'അറിയിപ്പുകളൊന്നുമില്ല.' : 'No notifications.'}</p>
              )}
              <Link to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`} className="btn outline full" style={{ marginTop: '12px' }}>
                {lang === 'ml' ? 'എല്ലാം കാണുക' : 'View All'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export default NotificationSingle
