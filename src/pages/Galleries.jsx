import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchGallery, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function Galleries() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const ITEMS_PER_PAGE = 20

  const loadGalleries = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const items = await fetchGallery({ per_page: ITEMS_PER_PAGE, page: pageNum, lang })
    
    if (items.length < ITEMS_PER_PAGE) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }

    if (pageNum === 1) {
      setGalleries(items)
    } else {
      setGalleries(prev => [...prev, ...items])
    }

    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    loadGalleries(1)
  }, [lang])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadGalleries(nextPage)
  }

  if (loading && page === 1) {
    return (
      <main className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'ചിത്രങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading galleries...'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="galleries-archive-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'ചിത്രശാല' : 'Gallery'}</span>
          </nav>
          <h1 className="inner-hero-title">
            {lang === 'ml' ? 'വിസ്മയ കാഴ്ചകൾ' : 'University Gallery'}
          </h1>
          <p className="page-subtitle" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '10px' }}>
            {lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ പരിപാടികളുടെ ചിത്രങ്ങൾ.' : 'Photos of various events at Thunchath Ezhuthachan Malayalam University.'}
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {galleries.length > 0 ? (
          <>
            <div className="gallery-archive-grid">
              {galleries.map(item => (
                <Link 
                  key={item.id} 
                  to={lang === 'ml' ? `/gallery/${item.slug}` : `/${lang}/gallery/${item.slug}`} 
                  className="gallery-archive-card reveal-up active"
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="gallery-archive-overlay">
                    <h3>{item.title}</h3>
                    {item.desc && <p>{item.desc}</p>}
                    <span className="view-btn">
                      {lang === 'ml' ? 'കാണുക' : 'View Gallery'} →
                    </span>
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
                  style={{ minWidth: '200px' }}
                >
                  {loadingMore ? (
                    lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'
                  ) : (
                    lang === 'ml' ? 'കൂടുതൽ കാണുക' : 'Load More Galleries'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>{lang === 'ml' ? 'ഗാലറികൾ ഒന്നും കണ്ടെത്തിയില്ല.' : 'No galleries found.'}</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Galleries
