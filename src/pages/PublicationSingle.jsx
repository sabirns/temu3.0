import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPublicationBySlug, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function PublicationSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  const { setPageInfo } = usePageInfo()

  const [pub, setPub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchPublicationBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setPageInfo({ id: data.id, postType: 'publication', translationSlugs: await extractTranslationSlugs(data, 'publication') })
          setPub(data)
        } else {
          setError(lang === 'ml' ? 'പ്രസിദ്ധീകരണം കണ്ടെത്തിയില്ല.' : 'Publication not found.')
        }
      } catch (err) {
        setError(lang === 'ml' ? 'പ്രസിദ്ധീകരണം ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load publication.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'പ്രസിദ്ധീകരണം ലോഡ് ചെയ്യുന്നു...' : 'Loading publication...'}</p>
      </div>
    )
  }

  if (error || !pub) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={lang === 'ml' ? '/publications' : `/${lang}/publications`} className="btn primary">
          {lang === 'ml' ? 'എല്ലാ പ്രസിദ്ധീകരണങ്ങളും കാണുക' : 'View All Publications'}
        </Link>
      </div>
    )
  }

  const hasMeta = pub.editor || pub.price

  return (
    <article className="publication-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/publications' : `/${lang}/publications`}>
              {lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications'}
            </Link>
            {pub.primaryCategory && (
              <>
                <span>/</span>
                <Link to={lang === 'ml' ? `/publication-category/${pub.primaryCategory.slug}` : `/${lang}/publication-category/${pub.primaryCategory.slug}`}>
                  {pub.primaryCategory.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span>{pub.title}</span>
          </nav>
          <h1 className="inner-hero-title">{pub.title}</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            {pub.primaryCategory && (
              <span className="publication-badge">{pub.primaryCategory.name}</span>
            )}
            {pub.pdf && (
              <span className="publication-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                📄 PDF
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        <div className="publication-single-layout">
          <div className="publication-single-main">
            {pub.featuredImage && (
              <div className="publication-single-img">
                <img src={pub.featuredImage} alt={pub.title} />
              </div>
            )}

            {hasMeta && (
              <div className="publication-meta-grid">
                {pub.editor && (
                  <div className="publication-meta-item">
                    <span className="publication-meta-label">
                      {lang === 'ml' ? 'എഡിറ്റർ' : 'Editor'}
                    </span>
                    <span className="publication-meta-value">{pub.editor}</span>
                  </div>
                )}
                {pub.price && (
                  <div className="publication-meta-item">
                    <span className="publication-meta-label">
                      {lang === 'ml' ? 'വില' : 'Price'}
                    </span>
                    <span className="publication-meta-value">{pub.price}</span>
                  </div>
                )}
              </div>
            )}

            {pub.content && (
              <GutenbergContent
                html={pub.content}
                className="publication-content wordpress-content"
              />
            )}

            {/* Embedded PDF Viewer Section */}
            {pub.pdf && (
              <div className="publication-pdf-container">
                <div className="publication-pdf-toolbar">
                  <div className="publication-pdf-info">
                    <svg className="pdf-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <span className="pdf-title">{pub.title}</span>
                  </div>
                  <div className="publication-pdf-actions">
                    <a
                      href={pub.pdf}
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
                      href={pub.pdf}
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
                    src={`${pub.pdf}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={pub.title}
                    className="publication-pdf-frame"
                  />
                </div>

                <div className="publication-pdf-footer-note">
                  <p>
                    {lang === 'ml'
                      ? 'പി.ഡി.എഫ് തുറക്കുന്നതിൽ തടസ്സം നേരിടുന്നുണ്ടോ? '
                      : 'Having trouble viewing the PDF document? '}
                    <a href={pub.pdf} target="_blank" rel="noopener noreferrer">
                      {lang === 'ml' ? 'നേരിട്ട് കാണാനോ ഡൗൺലോഡ് ചെയ്യാനോ ഇവിടെ ക്ലിക്ക് ചെയ്യുക →' : 'Click here to view or download directly →'}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="publication-single-sidebar">
            {pub.pdf && (
              <div className="sidebar-pdf-card">
                <div className="sidebar-pdf-card-header">
                  <span className="sidebar-pdf-badge">PDF</span>
                  <h3>{lang === 'ml' ? 'പ്രസിദ്ധീകരണ രേഖ' : 'Publication File'}</h3>
                </div>
                <p>
                  {lang === 'ml'
                    ? 'ഈ പ്രസിദ്ധീകരണത്തിന്റെ ഡിജിറ്റൽ പതിപ്പ് പി.ഡി.എഫ് ആയി വായിക്കാനും ഡൗൺലോഡ് ചെയ്യാനും ലഭ്യമാണ്.'
                    : 'The full digital edition of this publication is available to view and download.'}
                </p>
                <div className="sidebar-pdf-buttons">
                  <a
                    href={pub.pdf}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn primary full"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {lang === 'ml' ? 'ഡൗൺലോഡ് PDF' : 'Download PDF'}
                  </a>
                  <a
                    href={pub.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn outline full"
                  >
                    {lang === 'ml' ? 'പുതിയ ടാബിൽ തുറക്കുക' : 'Open in New Tab'}
                  </a>
                </div>
              </div>
            )}

            {pub.primaryCategory && (
              <div className="sidebar-widget" style={{ marginBottom: '20px' }}>
                <h3>{lang === 'ml' ? 'വിഭാഗം' : 'Category'}</h3>
                <Link
                  to={lang === 'ml' ? `/publication-category/${pub.primaryCategory.slug}` : `/${lang}/publication-category/${pub.primaryCategory.slug}`}
                  className="btn outline full"
                >
                  {pub.primaryCategory.name} →
                </Link>
              </div>
            )}

            <div className="sidebar-widget">
              <h3>{lang === 'ml' ? 'എല്ലാ പ്രസിദ്ധീകരണങ്ങളും' : 'All Publications'}</h3>
              <Link to={lang === 'ml' ? '/publications' : `/${lang}/publications`} className="btn outline full">
                {lang === 'ml' ? 'എല്ലാം കാണുക' : 'View All'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export default PublicationSingle
