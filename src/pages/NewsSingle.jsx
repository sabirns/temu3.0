import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPageBySlug, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

// We'll reuse fetchPageBySlug since it works for posts too by changing the endpoint, 
// but it's better to add a dedicated fetchPostBySlug in wordpressApi.js.
// For now, I'll update wordpressApi.js first.

import { fetchPostBySlug, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'


function NewsSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  
  const { setPageInfo } = usePageInfo()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug);
        const data = await fetchPostBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setPageInfo({ id: data.id, postType: 'post', translationSlugs: await extractTranslationSlugs(data, 'post') })
          setPost(data)
        } else {
          setError(lang === 'ml' ? 'വാർത്ത കണ്ടെത്തിയില്ല.' : 'News post not found.')
        }
      } catch (err) {
        setError(lang === 'ml' ? 'വാർത്ത ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load news post.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadPost()
    }
  }, [slug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'വാർത്ത ലോഡ് ചെയ്യുന്നു...' : 'Loading news...'}</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={lang === 'ml' ? '/news' : `/${lang}/news`} className="btn primary">
          {lang === 'ml' ? 'എല്ലാ വാർത്തകളും കാണുക' : 'View All News'}
        </Link>
      </div>
    )
  }

  return (
    <article className="news-single-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <Link to={lang === 'ml' ? '/news' : `/${lang}/news`}>{lang === 'ml' ? 'വാർത്തകൾ' : 'News'}</Link>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: post.title }} />
          </nav>
          <div className="news-single-header">
            {post.category && (
              <span className={`news-badge ${post.categorySlug || 'default'}`}>
                {post.category}
              </span>
            )}
            <h1 className="inner-hero-title" dangerouslySetInnerHTML={{ __html: post.title }} />
            <div className="news-single-meta">
              <span>📅 {new Date(post.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        <div className="news-single-layout no-image">
          <div className="news-single-main-full">
            <GutenbergContent 
              html={post.content} 
              className="news-content wordpress-content" 
            />
          </div>

          <aside className="news-single-sidebar">
            <div className="sidebar-widget">
              <h3>{lang === 'ml' ? 'മറ്റു വാർത്തകൾ' : 'Other News'}</h3>
              <Link to={lang === 'ml' ? '/news' : `/${lang}/news`} className="btn outline full">
                {lang === 'ml' ? 'എല്ലാ വാർത്തകളും കാണുക' : 'View All News'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export default NewsSingle
