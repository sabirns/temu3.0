import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams, Navigate } from 'react-router-dom'
import { fetchIqacPosts, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function IqacSingle() {
  const { categorySlug, slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  const { setPageInfo } = usePageInfo()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchIqacPosts({ lang, _t: Date.now() })
        if (cancelled) return
        if (data.length === 0) {
          setError(lang === 'ml' ? 'IQAC വിവരങ്ങളൊന്നും കണ്ടെത്തിയില്ല.' : 'No IQAC posts found.')
        } else {
          const currentPost = data.find(p => p.slug === slug)
          if (currentPost) {
            setPageInfo({
              id: currentPost.id,
              postType: 'iqac',
              translationSlugs: await extractTranslationSlugs(currentPost, 'iqac')
            })
          }
          setPosts(data)
        }
      } catch {
        if (!cancelled) setError(lang === 'ml' ? 'IQAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load IQAC posts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug, lang, setPageInfo])

  if (loading) {
    return (
      <main className="iqac-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'IQAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading IQAC posts...'}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="iqac-page">
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
              <span>/</span>
              <span>IQAC</span>
            </nav>
            <h1 className="inner-hero-title">IQAC</h1>
          </div>
        </section>
        <div className="iqac-error-section">
          <h2 className="iqac-error-title">Oops!</h2>
          <p className="iqac-error-text">{error}</p>
          <Link to={lang === 'ml' ? '/iqac' : `/${lang}/iqac`} className="btn primary">
            {lang === 'ml' ? 'IQAC ഹോമിലേക്ക്' : 'IQAC Home'}
          </Link>
        </div>
      </main>
    )
  }

  const sortedByTitle = [...posts].sort((a, b) => a.title.localeCompare(b.title))
  const categoryMap = {}
  sortedByTitle.forEach(post => {
    const cat = post.primaryCategory
    if (!cat) return
    if (!categoryMap[cat.slug]) {
      categoryMap[cat.slug] = { ...cat, firstPostSlug: post.slug }
    }
  })
  const categories = Object.values(categoryMap)

  const currentPost = posts.find(p => p.slug === slug)
  const currentCategory = currentPost?.primaryCategory

  if (!currentPost) {
    return (
      <main className="iqac-page">
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
              <span>/</span>
              <span>IQAC</span>
            </nav>
            <h1 className="inner-hero-title">IQAC</h1>
          </div>
        </section>
        <div className="iqac-error-section">
          <h2 className="iqac-error-title">Oops!</h2>
          <p className="iqac-error-text">
            {lang === 'ml' ? 'IQAC പോസ്റ്റ് കണ്ടെത്തിയില്ല.' : 'IQAC post not found.'}
          </p>
          <Link to={lang === 'ml' ? '/iqac' : `/${lang}/iqac`} className="btn primary">
            {lang === 'ml' ? 'IQAC ഹോമിലേക്ക്' : 'IQAC Home'}
          </Link>
        </div>
      </main>
    )
  }

  if (currentCategory && categorySlug !== currentCategory.slug) {
    const base = `/iqac/${currentCategory.slug}/${slug}`
    return <Navigate to={lang === 'ml' ? base : `/${lang}${base}`} replace />
  }

  const sidebarPosts = (categorySlug
    ? posts.filter(p => p.primaryCategory?.slug === categorySlug)
    : currentCategory
      ? posts.filter(p => p.primaryCategory?.slug === currentCategory.slug)
      : []
  ).sort((a, b) => a.title.localeCompare(b.title))

  const makePostUrl = (catSlug, postSlug) => {
    const base = `/iqac/${catSlug}/${postSlug}`
    return lang === 'ml' ? base : `/${lang}${base}`
  }

  const makeCategoryUrl = (cat) => `/iqac/${cat.slug}/${cat.firstPostSlug}`

  return (
    <main className="iqac-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/iqac' : `/${lang}/iqac`}>IQAC</Link>
            {currentCategory && (
              <>
                <span>/</span>
                <span>{currentCategory.name}</span>
              </>
            )}
            <span>/</span>
            <span>{currentPost.title}</span>
          </nav>
          <h1 className="inner-hero-title">{currentPost.title}</h1>
          <div className="iqac-single-meta">
            <span>{new Date(currentPost.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}</span>
          </div>
        </div>
      </section>

      <div className="container iqac-section-top">
        {categories.length > 0 && (
          <nav className="iqac-category-nav" aria-label={lang === 'ml' ? 'IQAC വിഭാഗങ്ങൾ' : 'IQAC Categories'}>
            {categories.map(cat => {
              const isActive = currentCategory && cat.slug === currentCategory.slug
              return (
                <Link
                  key={cat.slug}
                  to={lang === 'ml' ? makeCategoryUrl(cat) : `/${lang}${makeCategoryUrl(cat)}`}
                  className={`iqac-category-link ${isActive ? 'active' : ''}`}
                >
                  {cat.name}
                </Link>
              )
            })}
            <Link to={`/${lang}/naac`} className="iqac-category-link">
              {lang === 'ml' ? 'എൻ.എ.എ.സി' : 'NAAC'}
            </Link>
          </nav>
        )}

        <div className="iqac-single-layout">
          {sidebarPosts.length > 0 && (
            <aside className="iqac-sidebar">
              <div className="iqac-sidebar-widget">
                <h3 className="iqac-sidebar-title">
                  {currentCategory?.name || (lang === 'ml' ? 'എല്ലാ പോസ്റ്റുകളും' : 'All Posts')}
                </h3>
                <ul className="iqac-sidebar-list">
                  {sidebarPosts.map(p => (
                    <li key={p.id}>
                      <Link
                        to={makePostUrl(currentCategory?.slug || categorySlug || '', p.slug)}
                        className={`iqac-sidebar-link ${p.slug === slug ? 'active' : ''}`}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          <div className="iqac-single-main">
            {currentPost.featuredImage && (
              <div className="iqac-single-featured">
                <img src={currentPost.featuredImage} alt={currentPost.title} />
              </div>
            )}
            {currentPost.acf?.gallery && currentPost.acf.gallery.length > 0 && (
              <div className="iqac-gallery">
                <h3 className="iqac-gallery-title">{lang === 'ml' ? 'ഗാലറി' : 'Gallery'}</h3>
                <div className="iqac-gallery-grid">
                  {currentPost.acf.gallery.map((img, i) => {
                    const src = typeof img === 'object' ? (img.url || img.sizes?.large || img.full_image_url) : img
                    const alt = typeof img === 'object' ? (img.alt || img.title || '') : ''
                    return (
                      <div key={i} className="iqac-gallery-item">
                        <img src={src} alt={alt} loading="lazy" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <GutenbergContent
              html={currentPost.content}
              className="iqac-content wordpress-content"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default IqacSingle