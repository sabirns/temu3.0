import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPublications, fetchPublicationCategories, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function Publications() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [publications, setPublications] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [cats, items] = await Promise.all([
        fetchPublicationCategories({ lang, per_page: 50 }),
        fetchPublications({ lang, per_page: 50, _t: Date.now() }),
      ])
      if (cancelled) return
      setCategories(cats)
      setPublications(items)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [lang])

  return (
    <main className="publications-archive-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications'}</span>
          </nav>
          <h1 className="inner-hero-title">
            {lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications'}
          </h1>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {categories.length > 0 && (
          <div className="publications-category-tabs">
            <span className="publications-cat-label">
              {lang === 'ml' ? 'വിഭാഗങ്ങൾ' : 'Categories'}:
            </span>
            {categories.map(cat => (
              <Link
                key={cat.slug || cat.id}
                to={lang === 'ml' ? `/publication-category/${cat.slug}` : `/${lang}/publication-category/${cat.slug}`}
                className="publications-cat-btn"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading publications...'}</p>
          </div>
        ) : publications.length > 0 ? (
          <div className="publications-grid">
            {publications.map(pub => (
              <Link
                key={pub.id}
                to={lang === 'ml' ? `/publications/${pub.slug}` : `/${lang}/publications/${pub.slug}`}
                className="publications-card"
              >
                {pub.featuredImage && (
                  <div className="publications-card-img">
                    <img src={pub.featuredImage} alt={pub.title} loading="lazy" />
                  </div>
                )}
                <div className="publications-card-body">
                  <h3 className="publications-card-title">{pub.title}</h3>
                  {pub.editor && (
                    <p className="publications-card-editor">{pub.editor}</p>
                  )}
                  {pub.price && (
                    <p className="publications-card-price">{pub.price}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {lang === 'ml'
                ? 'പ്രസിദ്ധീകരണങ്ങളൊന്നും ലഭ്യമല്ല.'
                : 'No publications available.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Publications
