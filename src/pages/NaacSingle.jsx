import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams, Navigate } from 'react-router-dom'
import { fetchNaacPosts, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function NaacSingle() {
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
        const data = await fetchNaacPosts({ lang, _t: Date.now() })
        if (cancelled) return
        if (data.length === 0) {
          setError(lang === 'ml' ? 'NAAC വിവരങ്ങളൊന്നും കണ്ടെത്തിയില്ല.' : 'No NAAC posts found.')
        } else {
          const currentPost = data.find(p => p.slug === slug)
          if (currentPost) setPageInfo({ id: currentPost.id, postType: 'naac', translationSlugs: await extractTranslationSlugs(currentPost, 'naac') })
          setPosts(data)
        }
      } catch {
        if (!cancelled) setError(lang === 'ml' ? 'NAAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load NAAC posts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug, lang])

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'NAAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading NAAC posts...'}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="naac-single-page">
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
              <span>/</span>
              <span>NAAC</span>
            </nav>
            <h1 className="inner-hero-title">NAAC</h1>
          </div>
        </section>
        <div className="naac-error-section">
          <h2 className="naac-error-title">Oops!</h2>
          <p className="naac-error-text">{error}</p>
          <Link to={lang === 'ml' ? '/' : `/${lang}`} className="btn primary">
            {lang === 'ml' ? 'ഹോം പേജിലേക്ക്' : 'Go Home'}
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
function romanToNumber(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]]
    const next = map[s[i + 1]]
    total += next && cur < next ? -cur : cur
  }
  return total
}

function sortByRomanName(a, b) {
  const aNum = romanToNumber(a.name.replace(/^Attribute\s*/i, ''))
  const bNum = romanToNumber(b.name.replace(/^Attribute\s*/i, ''))
  return aNum - bNum
}

  const categories = Object.values(categoryMap).sort(sortByRomanName)

  const currentPost = posts.find(p => p.slug === slug)
  const currentCategory = currentPost?.primaryCategory

  if (!currentPost) {
    return (
      <main className="naac-single-page">
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
              <span>/</span>
              <span>NAAC</span>
            </nav>
            <h1 className="inner-hero-title">NAAC</h1>
          </div>
        </section>
        <div className="naac-error-section">
          <h2 className="naac-error-title">Oops!</h2>
          <p className="naac-error-text">
            {lang === 'ml' ? 'NAAC പോസ്റ്റ് കണ്ടെത്തിയില്ല.' : 'NAAC post not found.'}
          </p>
          <Link to={lang === 'ml' ? '/naac' : `/${lang}/naac`} className="btn primary">
            {lang === 'ml' ? 'NAAC ഹോമിലേക്ക്' : 'NAAC Home'}
          </Link>
        </div>
      </main>
    )
  }

  if (currentCategory && categorySlug !== currentCategory.slug) {
    const base = `/naac/${currentCategory.slug}/${slug}`
    return <Navigate to={lang === 'ml' ? base : `/${lang}${base}`} replace />
  }

  const sidebarPosts = (categorySlug
    ? posts.filter(p => p.primaryCategory?.slug === categorySlug)
    : currentCategory
      ? posts.filter(p => p.primaryCategory?.slug === currentCategory.slug)
      : []
  ).sort((a, b) => a.title.localeCompare(b.title))

  const makePostUrl = (catSlug, postSlug) => {
    const base = `/naac/${catSlug}/${postSlug}`
    return lang === 'ml' ? base : `/${lang}${base}`
  }

  const makeCategoryUrl = (cat) => `/naac/${cat.slug}/${cat.firstPostSlug}`

  return (
    <main className="naac-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/naac' : `/${lang}/naac`}>NAAC</Link>
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
          <div className="naac-single-meta">
            <span>{new Date(currentPost.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}</span>
          </div>
        </div>
      </section>

      <div className="container naac-section-top">
        {categories.length > 0 && (
          <nav className="naac-category-nav">
            {categories.map(cat => {
              const isActive = currentCategory && cat.slug === currentCategory.slug
              return (
                <Link
                  key={cat.slug}
                  to={makeCategoryUrl(cat)}
                  className={`naac-category-link ${isActive ? 'active' : ''}`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>
        )}

        <div className="naac-single-layout">
          {sidebarPosts.length > 0 && (
            <aside className="naac-sidebar">
              <div className="naac-sidebar-widget">
                <h3 className="naac-sidebar-title">
                  {currentCategory?.name || (lang === 'ml' ? 'എല്ലാ പോസ്റ്റുകളും' : 'All Posts')}
                </h3>
                <ul className="naac-sidebar-list">
                  {sidebarPosts.map(p => (
                    <li key={p.id}>
                      <Link
                        to={makePostUrl(currentCategory?.slug || categorySlug || '', p.slug)}
                        className={`naac-sidebar-link ${p.slug === slug ? 'active' : ''}`}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          <div className="naac-single-main">
            {currentPost.featuredImage && (
              <div className="naac-single-featured">
                <img src={currentPost.featuredImage} alt={currentPost.title} />
              </div>
            )}
            <GutenbergContent
              html={currentPost.content}
              className="naac-content wordpress-content"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default NaacSingle
