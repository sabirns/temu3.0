import { useState, useEffect } from 'react'
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPublications, fetchPublicationCategoryBySlug, getLanguageContext } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import { usePageInfo } from '../services/PageInfoContext'
import '../styles/pages.css'

function PublicationCategory() {
  const { categorySlug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const { setPageInfo } = usePageInfo()

  const [category, setCategory] = useState(null)
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(categorySlug)
        const cat = await fetchPublicationCategoryBySlug(decodedSlug, { lang })
        if (cancelled) return
        if (!cat) {
          setError(lang === 'ml' ? 'ഈ വിഭാഗം കണ്ടെത്തിയില്ല.' : 'Category not found.')
          setLoading(false)
          return
        }
        setCategory(cat)

        const items = await fetchPublications({
          lang,
          per_page: 50,
          publication_category: cat.id,
          _t: Date.now(),
        })
        if (cancelled) return
        setPublications(items)

        // Extract term translation slugs for language switcher
        if (cat.translations) {
          const slugs = { [cat.lang || lang]: cat.slug }
          for (const [tlang, tid] of Object.entries(cat.translations)) {
            if ((tlang === 'ml' || tlang === 'en') && tid !== cat.id) {
              try {
                  const tRes = await fetch(`${WP_CONFIG.API_URL}/publication_category/${tid}?_fields=slug`)
                if (tRes.ok) {
                  const tData = await tRes.json()
                  if (tData.slug) slugs[tlang] = tData.slug
                }
              } catch {}
            }
          }
          if (Object.keys(slugs).length > 0) {
            setPageInfo({ id: cat.id, postType: 'publication_category', translationSlugs: slugs })
          }
        }
      } catch {
        setError(lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load publications.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [categorySlug, lang])

  return (
    <main className="publications-archive-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/publications' : `/${lang}/publications`}>
              {lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications'}
            </Link>
            {category && (
              <>
                <span>/</span>
                <span>{category.name}</span>
              </>
            )}
          </nav>
          <h1 className="inner-hero-title">
            {category?.name || (lang === 'ml' ? 'പ്രസിദ്ധീകരണങ്ങൾ' : 'Publications')}
          </h1>
          {category?.description && (
            <p className="page-subtitle">{category.description}</p>
          )}
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
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
                ? 'ഈ വിഭാഗത്തിൽ പ്രസിദ്ധീകരണങ്ങളൊന്നും ലഭ്യമല്ല.'
                : 'No publications in this category.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default PublicationCategory
