import { useState, useEffect } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { fetchNotificationCategories, fetchPosts, getLanguageContext, stripHtml, fixWordPressUrls, cleanWordPressUrl } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'

function Notifications() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  // Detect language from path or query
  const lang = getLanguageContext(location.pathname, searchParams)
  
  const [notifications, setNotifications] = useState([])
  const [rawCategories, setRawCategories] = useState([])
  const [latestNews, setLatestNews] = useState([])
  const [filterId, setFilterId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const formatNotifications = (data) =>
    (data || []).map(n => {
      const embeddedTerms = n._embedded?.['wp:term'] || []
      const categories = embeddedTerms.flat().filter(t => t.taxonomy === 'notification_category')
      let primary = categories[0] || null
      if (categories.length > 1) {
        const specific = categories.find(c =>
          c.slug !== 'announcements' && c.name !== 'Announcements' && c.name !== 'അറിയിപ്പുകൾ'
        )
        if (specific) primary = specific
      }
      return {
        id: n.id,
        title: stripHtml(n.title?.rendered || ''),
        content: fixWordPressUrls(n.content?.rendered || ''),
        excerpt: fixWordPressUrls(n.excerpt?.rendered || ''),
        link: cleanWordPressUrl(n.link || '#'),
        date: n.date,
        slug: n.slug || '',
        categories: n.notification_category || [],
        categoryName: primary?.name || null,
        categorySlug: primary?.slug || null
      }
    })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [catsData, newsData] = await Promise.all([
          fetchNotificationCategories({ lang }),
          fetchPosts({ lang, per_page: 5 })
        ])
        setRawCategories(catsData)
        setLatestNews(newsData)

        const notifResponse = await fetch(`${WP_CONFIG.API_URL}/notifications?per_page=10&page=1&lang=${lang}&_embed`)
        const totalPagesFromHeaders = notifResponse.headers.get('X-WP-TotalPages')
        setTotalPages(totalPagesFromHeaders ? Number(totalPagesFromHeaders) : 1)
        setPage(1)

        const notifData = notifResponse.ok ? await notifResponse.json() : []
        setNotifications(formatNotifications(notifData))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [lang])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`${WP_CONFIG.API_URL}/notifications?per_page=10&page=${nextPage}&lang=${lang}&_embed`)
      const data = res.ok ? await res.json() : []
      setNotifications(prev => [...prev, ...formatNotifications(data)])
      setPage(nextPage)
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const revealElements = document.querySelectorAll('.inner-reveal')
    const revealOnScroll = () => {
      revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top
        if (elementTop < window.innerHeight - 100) {
          el.classList.add('active')
        }
      })
    }
    window.addEventListener('scroll', revealOnScroll)
    // Small delay to ensure content is rendered
    setTimeout(revealOnScroll, 100)
    return () => window.removeEventListener('scroll', revealOnScroll)
  }, [loading, notifications])

  const getNotificationType = (item) => {
    if (!item.categorySlug) return 'info'
    const slug = item.categorySlug.toLowerCase()

    const typeMap = {
      'urgent': 'urgent',
      'warning': 'warning',
      'important': 'warning',
      'info': 'info',
      'academic': 'academic',
      'admission': 'admission',
      'event': 'event',
      'news': 'event',
      'exam': 'exam',
      'examination': 'exam',
      'result': 'exam',
      'tender': 'tender',
      'career': 'tender',
      'job': 'tender',
      'student': 'scholarship',
      'scholarship': 'scholarship',
      'seminar': 'admission',
      'workshop': 'event'
    }
    return typeMap[slug] || 'info'
  }

  const getCategoryName = (item) => {
    return item.categoryName || (lang === 'ml' ? 'അറിയിപ്പ്' : 'Notice')
  }

  const filteredNotifications = filterId
    ? notifications.filter(n => n.categories.includes(filterId))
    : notifications

  return (
    <main className="notifications-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}</span>
          </nav>
          <h1 className="inner-hero-title">
            {lang === 'ml' ? 'അറിയിപ്പുകളും വാർത്തകളും' : 'Notifications & Announcements'}
          </h1>
        </div>
      </section>

      <div className="container">
        <div className="page-grid">
          {/* Main Content Column */}
          <div className="main-content">
            {/* Category Filter Bar */}
            {!loading && rawCategories.length > 0 && (
              <div className="filter-bar inner-reveal reveal-up">
                <button
                  onClick={() => setFilterId(null)}
                  className={`filter-pill ${filterId === null ? 'active' : ''}`}
                >
                  {lang === 'ml' ? 'എല്ലാം' : 'All'}
                </button>
                {rawCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterId(cat.id)}
                    className={`filter-pill ${filterId === cat.id ? 'active' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="notifications-list">
              {loading ? (
                <div className="notification-loading">
                  {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading notifications...'}
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((item, index) => {
                  const type = getNotificationType(item)
                  const catName = getCategoryName(item)

                  return (
                    <article
                      key={item.id}
                      className={`notification-archive-item ${type} inner-reveal reveal-up`}
                      style={{ transitionDelay: `${index * 0.05}s` }}
                    >
                      <div className="archive-item-header">
                        <span className={`notification-badge ${type}`}>
                          {catName}
                        </span>
                        <span className="notification-date">
                          📅 {new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
                        </span>
                      </div>

                      <h2 className="archive-item-title">{item.title}</h2>

                      <div
                        className="archive-item-desc"
                      // dangerouslySetInnerHTML={{ __html: item.excerpt || item.content }}
                      />

                      <div className="archive-item-footer">
                        <Link
                          to={lang === 'ml' ? `/notifications/${item.slug}` : `/${lang}/notifications/${item.slug}`}
                          className="btn primary btn-small"
                        >
                          {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക →' : 'Read More →'}
                        </Link>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="empty-state">
                  {lang === 'ml' ? 'ഈ വിഭാഗത്തിൽ അറിയിപ്പുകളൊന്നുമില്ല.' : 'No notifications found in this category.'}
                </div>
              )}
            </div>

            {page < totalPages && (
            <div className="load-more-wrap">
              <button onClick={loadMore} disabled={loadingMore} className="btn load-more-btn">
                {loadingMore
                  ? (lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...')
                  : (lang === 'ml' ? 'കൂടുതൽ ലോഡ് ചെയ്യുക' : 'Load More')
                }
              </button>
            </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="sidebar">
            <div className="widget inner-reveal reveal-right">
              <h3 className="widget-title">
                {lang === 'ml' ? 'പുതിയ വാർത്തകൾ' : 'Latest News'}
              </h3>
              <div className="sidebar-news-list">
                {loading ? (
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading...</p>
                ) : latestNews.length > 0 ? (
                  latestNews.map(news => (
                    <Link key={news.id} to={lang === 'ml' ? `/news/${news.slug}` : `/${lang}/news/${news.slug}`} className="news-item-compact">
                      <div className="news-thumb-wrapper">
                        {news.featuredImage ? (
                          <img src={news.featuredImage} alt={news.title} className="news-thumb" />
                        ) : (
                          <div className="news-thumb" style={{ background: 'var(--primary)', opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>MU</div>
                        )}
                      </div>
                      <div className="news-info">
                        <span className="news-item-date">{new Date(news.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}</span>
                        <h4 className="news-item-title">{news.title}</h4>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>No news found.</p>
                )}
              </div>
            </div>


          </aside>
        </div>
      </div>
    </main>
  )
}

export default Notifications
