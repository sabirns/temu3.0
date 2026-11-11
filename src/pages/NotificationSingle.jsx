import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchNotification, fetchNotifications, getLanguageContext, extractTranslationSlugs, getNotificationPdf, fixAssetUrl, fetchMedia } from '../services/wordpressApi'
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
          fetchNotification(decodedSlug, { _t: Date.now() }),
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

  // Resolve PDF from any possible location: notification.pdf, acf.file, acf.pdf, or embedded content
  const rawAcfFile = notification?.acf?.file || notification?.acf?.pdf || notification?.acf?.document
  const resolvedFromAcf = typeof rawAcfFile === 'string' && !/^\d+$/.test(rawAcfFile.trim())
    ? fixAssetUrl(rawAcfFile.trim())
    : (rawAcfFile?.url ? fixAssetUrl(rawAcfFile.url) : null)

  const pdfUrl = notification?.pdf || resolvedFromAcf || getNotificationPdf(notification) || null

  // If acf.file is a numeric ID that hasn't been resolved yet, resolve it dynamically
  useEffect(() => {
    if (notification && !pdfUrl) {
      const fileId = notification.acf?.file || notification.acf?.pdf
      if (fileId && /^\d+$/.test(String(fileId).trim())) {
        fetchMedia(Number(fileId)).then(url => {
          if (url) {
            setNotification(prev => ({ ...prev, pdf: fixAssetUrl(url) }))
          }
        })
      }
    }
  }, [notification, pdfUrl])

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

            {pdfUrl && (
              <div className="notification-pdf-quick-bar" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, rgba(26, 58, 110, 0.08) 0%, rgba(30, 136, 229, 0.12) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(26, 58, 110, 0.15)',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="#ef4444">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                  <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '15px' }}>
                    {lang === 'ml' ? 'അനുബന്ധ ഫയൽ (PDF)' : 'Attached Document (PDF)'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn outline small"
                    style={{ textDecoration: 'none' }}
                  >
                    {lang === 'ml' ? 'പുതിയ ടാബിൽ കാണുക ↗' : 'Open in New Tab ↗'}
                  </a>
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn primary small"
                    style={{ textDecoration: 'none' }}
                  >
                    {lang === 'ml' ? 'ഡൗൺലോഡ് ചെയ്യുക ⬇' : 'Download PDF ⬇'}
                  </a>
                </div>
              </div>
            )}

            <GutenbergContent
              html={notification.content}
              className="notification-content wordpress-content"
            />

            {pdfUrl && (
              <div className="publication-pdf-container" style={{ marginTop: '32px' }}>
                <div className="publication-pdf-toolbar">
                  <div className="publication-pdf-info">
                    <svg className="pdf-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <span className="pdf-title">{notification.title}</span>
                  </div>
                  <div className="publication-pdf-actions">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn outline small"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {lang === 'ml' ? 'പുതിയ ടാബിൽ കാണുക' : 'Open in New Tab'}
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn primary small"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {lang === 'ml' ? 'ഡൗൺലോഡ് ചെയ്യുക' : 'Download PDF'}
                    </a>
                  </div>
                </div>

                <div className="publication-pdf-frame-wrapper">
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={notification.title}
                    className="publication-pdf-frame"
                  />
                </div>

                <div className="publication-pdf-footer-note">
                  <p>
                    {lang === 'ml'
                      ? 'പി.ഡി.എഫ് തുറക്കുന്നതിൽ തടസ്സം നേരിടുന്നുണ്ടോ? '
                      : 'Having trouble viewing the PDF document? '}
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      {lang === 'ml' ? 'നേരിട്ട് കാണാനോ ഡൗൺലോഡ് ചെയ്യാനോ ഇവിടെ ക്ലിക്ക് ചെയ്യുക →' : 'Click here to view or download directly →'}
                    </a>
                  </p>
                </div>
              </div>
            )}
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
