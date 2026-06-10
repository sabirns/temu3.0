import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { getLanguageContext } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import '../styles/pages.css'

function ChildPagesGrid() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  // Derive the page slug from the URL path (last non-empty segment)
  const pageSlug = location.pathname.split('/').filter(Boolean).pop()

  const [page, setPage] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        if (!pageSlug) throw new Error('No slug')
        const params = new URLSearchParams({ slug: pageSlug, _embed: true, acf_format: 'standard', lang })
        const res = await fetch(`${WP_CONFIG.API_URL}/pages?${params}`)
        if (!res.ok) throw new Error('Page not found')
        const pages = await res.json()
        if (!pages.length) throw new Error('Page not found')
        if (cancelled) return
        const pageData = pages[0]
        setPage(pageData)

        const childRes = await fetch(`${WP_CONFIG.API_URL}/pages?parent=${pageData.id}&_embed=true&per_page=50&lang=${lang}`)
        if (childRes.ok) {
          const childData = await childRes.json()
          if (!cancelled) setChildren(childData)
        }
      } catch (err) {
        console.error('ChildPagesGrid error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pageSlug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}</p>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{lang === 'ml' ? 'പേജ് കണ്ടെത്തിയില്ല.' : 'Page not found.'}</p>
        <Link to={`/${lang}`} className="btn primary">{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
      </div>
    )
  }

  return (
    <article className="child-pages-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: page.title?.rendered || page.title }} />
          </nav>
          <h1 className="inner-hero-title" dangerouslySetInnerHTML={{ __html: page.title?.rendered || page.title }} />
          {page.content?.rendered && (
            <div className="page-subtitle" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
          )}
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {children.length > 0 ? (
          <div className="child-pages-grid">
            {children.map(child => {
              const embed = child._embedded || {}
              const media = embed['wp:featuredmedia'] || []
              const imgUrl = media.length > 0 ? media[0].source_url : null
              const childSlug = child.slug
              return (
                <Link
                  key={child.id}
                  to={`/${lang}/${page.slug}/${childSlug}`}
                  className="child-page-card"
                >
                  {imgUrl ? (
                    <div className="child-page-img">
                      <img src={imgUrl} alt={child.title?.rendered || ''} loading="lazy" />
                    </div>
                  ) : (
                    <div className="child-page-img child-page-img-placeholder">
                      <span>📄</span>
                    </div>
                  )}
                  <div className="child-page-body">
                    <h3 className="child-page-title" dangerouslySetInnerHTML={{ __html: child.title?.rendered || '' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>{lang === 'ml' ? 'ഉപ പേജുകളൊന്നുമില്ല.' : 'No child pages found.'}</p>
          </div>
        )}
      </div>
    </article>
  )
}

export default ChildPagesGrid
