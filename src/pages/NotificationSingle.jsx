import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchNotification, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'


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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug);
        const data = await fetchNotification(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setPageInfo({ id: data.id, postType: 'notification', translationSlugs: await extractTranslationSlugs(data, 'notification') })
          setNotification(data)
        } else {
          setError(lang === 'ml' ? 'അറിയിപ്പ് കണ്ടെത്തിയില്ല.' : 'Notification not found.')
        }
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
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
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

      <div className="container" style={{ padding: '60px 0 100px' }}>
        <div className="notification-single-layout">
          <div className="notification-single-main">
            {notification.featuredImage && (
              <div className="notification-single-featured">
                <img src={notification.featuredImage} alt={notification.title} />
              </div>
            )}
            <div
              className="notification-content wordpress-content"
              dangerouslySetInnerHTML={{ __html: notification.content }}
            />
          </div>

          <aside className="notification-single-sidebar">
            <div className="sidebar-widget">
              <h3>{lang === 'ml' ? 'എല്ലാ അറിയിപ്പുകളും' : 'All Notifications'}</h3>
              <Link to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`} className="btn outline full">
                {lang === 'ml' ? 'എല്ലാ അറിയിപ്പുകളും കാണുക' : 'View All Notifications'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export default NotificationSingle
