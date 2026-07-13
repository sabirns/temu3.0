import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { fetchNssPosts, fetchNssPostBySlug, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function NssSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const lang = getLanguageContext(location.pathname, searchParams)
  const { setPageInfo } = usePageInfo()

  const [posts, setPosts] = useState([])
  const [currentPost, setCurrentPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let post = await fetchNssPostBySlug(slug, { lang, _t: Date.now() })

        if (!post) {
          const fallbackLang = lang === 'ml' ? 'en' : 'ml'
          post = await fetchNssPostBySlug(slug, { lang: fallbackLang, _t: Date.now() })
          if (cancelled) return
          if (post) {
            navigate(`/${fallbackLang}/nss/${slug}`, { replace: true })
            return
          }
        }

        if (cancelled) return
        if (post) {
          const allPosts = await fetchNssPosts({ lang, _t: Date.now() })
          if (cancelled) return
          setCurrentPost(post)
          setPosts(allPosts)
          setPageInfo({
            id: post.id,
            postType: 'nss',
            translationSlugs: await extractTranslationSlugs(post, 'nss')
          })
        } else {
          setError(lang === 'ml' ? 'NSS പോസ്റ്റ് കണ്ടെത്തിയില്ല.' : 'NSS post not found.')
        }
      } catch {
        if (!cancelled) setError(lang === 'ml' ? 'NSS വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load NSS posts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug, lang, setPageInfo, navigate])

  if (loading) {
    return (
      <main className="nss-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'NSS വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading NSS...'}</p>
        </div>
      </main>
    )
  }

  if (error || !currentPost) {
    return (
      <main className="nss-page">
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
              <span>/</span>
              <span>NSS</span>
            </nav>
            <h1 className="inner-hero-title">NSS</h1>
          </div>
        </section>
        <div className="nss-error-section">
          <h2 className="nss-error-title">Oops!</h2>
          <p className="nss-error-text">{error || (lang === 'ml' ? 'NSS പോസ്റ്റ് കണ്ടെത്തിയില്ല.' : 'NSS post not found.')}</p>
          <Link to={`/${lang}/nss`} className="btn primary">
            {lang === 'ml' ? 'NSS ഹോമിലേക്ക്' : 'NSS Home'}
          </Link>
        </div>
      </main>
    )
  }

  const currentCategory = currentPost.primaryCategory

  const sortedByTitle = [...posts].sort((a, b) => a.title.localeCompare(b.title))
  const categoryMap = {}
  sortedByTitle.forEach(post => {
    const cat = post.primaryCategory
    if (!cat) return
    if (!categoryMap[cat.slug]) {
      categoryMap[cat.slug] = { ...cat, firstPostSlug: post.slug }
    }
  })
  const categories = Object.values(categoryMap).sort((a, b) => {
    const priorityId = lang === 'ml' ? 1918 : 1949
    if (a.id === priorityId) return -1
    if (b.id === priorityId) return 1
    return a.id - b.id
  })

  const sidebarPosts = currentCategory
    ? posts.filter(p => p.primaryCategory?.slug === currentCategory.slug).sort((a, b) => a.title.localeCompare(b.title))
    : []

  const makePostUrl = (postSlug) => {
    return `/${lang}/nss/${postSlug}`
  }

  return (
    <>
    <main className="nss-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <Link to={`/${lang}/nss`}>NSS</Link>
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
        </div>
      </section>

      <div className="container nss-section-top">
        {categories.length > 0 && (
          <nav className="nss-category-nav" aria-label={lang === 'ml' ? 'NSS വിഭാഗങ്ങൾ' : 'NSS Categories'}>
            {categories.map(cat => {
              const isActive = currentCategory && cat.slug === currentCategory.slug
              return (
                <Link
                  key={cat.slug}
                  to={makePostUrl(cat.firstPostSlug)}
                  className={`nss-category-link ${isActive ? 'active' : ''}`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>
        )}

        <div className="nss-single-layout">
          {sidebarPosts.length > 0 && (
            <aside className="nss-sidebar">
              <div className="nss-sidebar-widget">
                <h3 className="nss-sidebar-title">
                  {currentCategory?.name || (lang === 'ml' ? 'എല്ലാ പോസ്റ്റുകളും' : 'All Posts')}
                </h3>
                <ul className="nss-sidebar-list">
                  {sidebarPosts.map(p => (
                    <li key={p.id}>
                      <Link
                        to={makePostUrl(p.slug)}
                        className={`nss-sidebar-link ${p.slug === slug ? 'active' : ''}`}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          <div className="nss-single-main">
            {currentPost.featuredImage && (
              <div className="nss-single-featured">
                <img src={currentPost.featuredImage} alt={currentPost.title} />
              </div>
            )}
            {currentPost.acf?.photo_gallery?.gallery_images?.[0]?.length > 0 && (
              <div className="nss-gallery">
                <h3 className="nss-gallery-title">{lang === 'ml' ? 'ഗാലറി' : 'Gallery'}</h3>
                <div className="nss-gallery-grid">
                  {currentPost.acf.photo_gallery.gallery_images[0].map((img, i) => {
                    const src = img.full_image_url || img.url
                    const alt = img.alt_text || img.title || ''
                    return (
                      <div key={i} className="nss-gallery-item" onClick={() => setZoomedImage(src)}>
                        <img src={src} alt={alt} loading="lazy" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <GutenbergContent
              html={currentPost.content}
              className="nss-content wordpress-content"
            />
          </div>
        </div>
      </div>
    </main>

      {zoomedImage && (
        <div className="nss-zoom-overlay" onClick={() => setZoomedImage(null)}>
          <button className="nss-zoom-close" onClick={() => setZoomedImage(null)}>&times;</button>
          <img className="nss-zoom-image" src={zoomedImage} alt="" />
        </div>
      )}
    </>
  )
}

export default NssSingle