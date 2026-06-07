import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPublicationBySlug, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
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

  return (
    <article className="publication-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/publications' : `/${lang}/publications`}>
              {lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications'}
            </Link>
            <span>/</span>
            <span>{pub.title}</span>
          </nav>
          <h1 className="inner-hero-title">{pub.title}</h1>
          {pub.primaryCategory && (
            <span className="publication-badge">{pub.primaryCategory.name}</span>
          )}
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

            {pub.content && (
              <div
                className="publication-content wordpress-content"
                dangerouslySetInnerHTML={{ __html: pub.content }}
              />
            )}
          </div>

          <aside className="publication-single-sidebar">
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
