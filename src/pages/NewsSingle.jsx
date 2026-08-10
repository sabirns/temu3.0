import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPageBySlug, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

// We'll reuse fetchPageBySlug since it works for posts too by changing the endpoint, 
// but it's better to add a dedicated fetchPostBySlug in wordpressApi.js.
// For now, I'll update wordpressApi.js first.

import { fetchPostBySlug, fetchPosts, fetchNotifications, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'


function NewsSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  
  const { setPageInfo } = usePageInfo()

  const [post, setPost] = useState(null)
  const [recentNews, setRecentNews] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPostAndData = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug);
        const data = await fetchPostBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setPageInfo({ id: data.id, postType: 'post', translationSlugs: await extractTranslationSlugs(data, 'post') })
          setPost(data)

          // Fetch other news (excluding current post)
          const newsData = await fetchPosts({ per_page: 5, lang, exclude: [data.id] })
          setRecentNews(newsData || [])

          // Fetch notifications for marquee
          const notifData = await fetchNotifications({ per_page: 5, lang })
          setNotifications(notifData || [])
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
      loadPostAndData()
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
      <div className="container" style={{ padding: '40px 0 60px' }}>
        <div className="news-single-layout">
          <div className="news-single-main">
            {/* Clean Header Area */}
            <div className="news-single-header-clean">
              <nav className="breadcrumb">
                <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
                <span>/</span>
                <Link to={lang === 'ml' ? '/news' : `/${lang}/news`}>{lang === 'ml' ? 'വാർത്തകൾ' : 'News'}</Link>
                <span>/</span>
                <span dangerouslySetInnerHTML={{ __html: post.title }} />
              </nav>
              
              <h1 className="news-clean-title" dangerouslySetInnerHTML={{ __html: post.title }} style={{ marginBottom: '25px' }} />
            </div>

            {/* Full size featured image above content */}
            {post.featuredImage && (
              <div className="news-single-featured-full">
                <img src={post.featuredImage} alt={post.title} />
              </div>
            )}
            
            <div className="news-single-meta-clean" style={{ marginBottom: '30px' }}>
              {post.category && (
                <span className={`news-badge ${post.categorySlug || 'default'}`} style={{ position: 'relative', top: '0', right: '0' }}>
                  {post.category}
                </span>
              )}
              <span className="news-date">📅 {new Date(post.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <GutenbergContent 
              html={post.content} 
              className="news-content wordpress-content" 
            />
          </div>

          <aside className="news-single-sidebar">
            <div className="sidebar-widget">
              <h3>{lang === 'ml' ? 'മറ്റു വാർത്തകൾ' : 'Other News'}</h3>
              <div className="sidebar-news-list">
                {recentNews.length > 0 ? (
                  recentNews.map(item => (
                    <Link to={lang === 'ml' ? `/news/${item.slug}` : `/${lang}/news/${item.slug}`} className="sidebar-news-item" key={item.id}>
                      {item.featured_media_url && (
                        <div className="sidebar-news-thumb">
                          <img src={item.featured_media_url} alt={item.title} />
                        </div>
                      )}
                      <div className="sidebar-news-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className={`news-badge-mini ${item.categorySlug || 'default'}`}>
                            {item.category || 'News'}
                          </span>
                          <span>{new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <h4 dangerouslySetInnerHTML={{ __html: item.title }} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="sidebar-empty">{lang === 'ml' ? 'മറ്റു വാർത്തകൾ ലഭ്യമല്ല.' : 'No other news available.'}</p>
                )}
              </div>
              <Link to={lang === 'ml' ? '/news' : `/${lang}/news`} className="btn outline full" style={{ marginTop: '20px' }}>
                {lang === 'ml' ? 'എല്ലാ വാർത്തകളും കാണുക' : 'View All News'}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Notifications Carousel Section */}
      {notifications.length > 0 && (
        <section className="notifications-carousel-section">
          <div className="container">
            <h3 className="section-title-small" style={{ marginBottom: '15px', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '800' }}>
              {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}
            </h3>
            <div className="marquee-container" style={{ overflow: 'hidden', padding: '10px 0' }}>
              <div className="marquee-track" style={{ display: 'flex', gap: '20px', animation: 'scrollMarquee 35s linear infinite', width: 'max-content' }}
                   onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                   onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}>
                {[...notifications, ...notifications].map((notif, index) => {
                  const badgeText = notif.categoryName?.toLowerCase() === 'highlights' ? 'NEW' : (notif.categoryName || 'NEW');
                  return (
                    <Link to={lang === 'ml' ? `/notifications/${notif.slug}` : `/${lang}/notifications/${notif.slug}`} className="notification-card-tile" key={`${notif.id}-${index}`} style={{ scrollSnapAlign: 'none' }}>
                      <div className="notification-card-header">
                        <span className={`news-badge-mini ${notif.categorySlug || 'default'}`}>
                          {badgeText}
                        </span>
                        <span className="news-date" style={{ fontSize: '13px' }}>{new Date(notif.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <h4 className="notification-card-title" dangerouslySetInnerHTML={{ __html: notif.title }} />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

export default NewsSingle
