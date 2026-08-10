import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchPosts, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const ITEMS_PER_PAGE = 12

  const loadNews = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const items = await fetchPosts({ per_page: ITEMS_PER_PAGE, page: pageNum, lang, _t: Date.now() })
    
    if (items.length < ITEMS_PER_PAGE) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }

    if (pageNum === 1) {
      setNews(items)
    } else {
      setNews(prev => [...prev, ...items])
    }

    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    loadNews(1)
    setPage(1)
  }, [lang])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadNews(nextPage)
  }

  if (loading && page === 1) {
    return (
      <main className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'വാർത്തകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading news...'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="news-archive-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'വാർത്തകൾ' : 'News'}</span>
          </nav>
          <h1 className="inner-hero-title">
            {lang === 'ml' ? 'വാർത്തകളും അറിയിപ്പുകളും' : 'News & Announcements'}
          </h1>
          <p className="page-subtitle" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '10px' }}>
            {lang === 'ml' ? 'മലയാളസർവകലാശാലയിലെ പുതിയ സംഭവവികാസങ്ങളും പരിഷ്‌കാരങ്ങളും.' : 'The latest developments and updates from the university.'}
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {news.length > 0 ? (
          <>
            {/* News Grid - Text Only Redesign */}
            <div className="news-text-grid">
              {news.map(item => (
                <Link 
                  key={item.id} 
                  to={lang === 'ml' ? `/news/${item.slug}` : `/${lang}/news/${item.slug}`} 
                  className="news-text-card reveal-up active"
                >
                  <div className="news-text-card-content">
                    <div className="news-card-header">
                      {item.category && (
                        <span className={`news-category-tag ${item.categorySlug || 'default'}`}>
                          {item.category}
                        </span>
                      )}
                      <span className="news-card-date">
                        {new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="news-card-title-bold">{item.title}</h3>
                    <div className="news-card-excerpt-muted" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                    <div className="news-card-footer">
                      <span className="read-more-link">
                        {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read More'} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container" style={{ marginTop: '60px', textAlign: 'center' }}>
                <button 
                  className={`btn primary ${loadingMore ? 'loading' : ''}`} 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ minWidth: '220px' }}
                >
                  {loadingMore ? (
                    lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'
                  ) : (
                    lang === 'ml' ? 'കൂടുതൽ വാർത്തകൾ' : 'Load More News'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>{lang === 'ml' ? 'വാർത്തകളൊന്നും കണ്ടെത്തിയില്ല.' : 'No news found.'}</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default News
