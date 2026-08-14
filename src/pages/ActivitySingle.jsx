import React, { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { 
  fetchActivityBySlug, 
  fetchActivities, 
  fetchNotifications, 
  getLanguageContext, 
  extractTranslationSlugs 
} from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'

function ActivitySingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  const { setPageInfo } = usePageInfo()

  const [activity, setActivity] = useState(null)
  const [sameCategoryActivities, setSameCategoryActivities] = useState([])
  const [otherActivities, setOtherActivities] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchActivityBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setPageInfo({ id: data.id, postType: 'activity', translationSlugs: await extractTranslationSlugs(data, 'activity') })
          setActivity(data)

          // Fetch same category activities if activityTypeId exists
          let sameCatData = []
          if (data.activityTypeId) {
            sameCatData = await fetchActivities({ 
              activity_type: data.activityTypeId, 
              per_page: 5, 
              lang 
            }) || []
            sameCatData = sameCatData.filter(item => item.id !== data.id)
          }
          setSameCategoryActivities(sameCatData)

          // Fetch other activities (excluding current activity & same category activities)
          const excludeIds = [data.id, ...sameCatData.map(i => i.id)]
          let otherData = await fetchActivities({ per_page: 8, lang }) || []
          otherData = otherData.filter(item => !excludeIds.includes(item.id)).slice(0, 5)
          setOtherActivities(otherData)

          // Fetch notifications for bottom marquee
          const notifData = await fetchNotifications({ per_page: 5, lang }) || []
          setNotifications(notifData)
        } else {
          setError(lang === 'ml' ? 'പ്രവർത്തനം കണ്ടെത്തിയില്ല.' : 'Activity not found.')
        }
      } catch (err) {
        console.error(err)
        setError(lang === 'ml' ? 'പ്രവർത്തനം ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load activity.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      load()
    }
  }, [slug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'പ്രവർത്തനം ലോഡ് ചെയ്യുന്നു...' : 'Loading activity...'}</p>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={`/${lang}/activities`} className="btn primary">
          {lang === 'ml' ? 'എല്ലാ പ്രവർത്തനങ്ങളും കാണുക' : 'View All Activities'}
        </Link>
      </div>
    )
  }

  return (
    <article className="news-single-page activity-single-page">
      <div className="container" style={{ padding: '40px 0 60px' }}>
        <div className="news-single-layout">
          {/* Main Content Area */}
          <div className="news-single-main">
            {/* Breadcrumb & Clean Header */}
            <div className="news-single-header-clean">
              <nav className="breadcrumb">
                <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
                <span>/</span>
                <Link to={`/${lang}/activities`}>{lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Activities'}</Link>
                <span>/</span>
                <span dangerouslySetInnerHTML={{ __html: activity.title }} />
              </nav>
              
              <h1 className="news-clean-title" dangerouslySetInnerHTML={{ __html: activity.title }} style={{ marginBottom: '25px' }} />
            </div>

            {/* Featured Image */}
            {activity.featuredImage && (
              <div className="news-single-featured-full">
                <img src={activity.featuredImage} alt={activity.title} />
              </div>
            )}
            
            {/* Content Body */}
            <GutenbergContent 
              html={activity.content} 
              className="news-content wordpress-content" 
              style={{ marginTop: '20px' }}
            />
          </div>

          {/* Sidebar */}
          <aside className="news-single-sidebar">
            {/* Top Section: Same Category Activities */}
            <div className="sidebar-widget">
              <h3>
                {lang === 'ml' 
                  ? (activity.activityTypeName || 'സാമൂഹികപ്രതിബദ്ധതാ പ്രവർത്തനങ്ങൾ')
                  : (activity.activityTypeName || 'Socially Committed Activities')
                }
              </h3>
              <div className="sidebar-news-list">
                {sameCategoryActivities.length > 0 ? (
                  sameCategoryActivities.map(item => {
                    const thumb = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || item.featured_media_url
                    const itemTitle = item.title?.rendered || item.title || ''
                    return (
                      <Link to={`/${lang}/activity/${item.slug}`} className="sidebar-news-item" key={item.id}>
                        {thumb && (
                          <div className="sidebar-news-thumb">
                            <img src={thumb} alt={itemTitle} />
                          </div>
                        )}
                        <div className="sidebar-news-info">
                          <h4 dangerouslySetInnerHTML={{ __html: itemTitle }} />
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="sidebar-empty">
                    {lang === 'ml' ? 'ഈ വിഭാഗത്തിൽ മറ്റു പ്രവർത്തനങ്ങൾ ലഭ്യമല്ല.' : 'No other activities in this category.'}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Section: Other Activities */}
            <div className="sidebar-widget" style={{ marginTop: '30px' }}>
              <h3>
                {lang === 'ml' ? 'മറ്റു പ്രവർത്തനങ്ങൾ' : 'Other Activities'}
              </h3>
              <div className="sidebar-news-list">
                {otherActivities.length > 0 ? (
                  otherActivities.map(item => {
                    const thumb = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || item.featured_media_url
                    const itemTitle = item.title?.rendered || item.title || ''
                    return (
                      <Link to={`/${lang}/activity/${item.slug}`} className="sidebar-news-item" key={item.id}>
                        {thumb && (
                          <div className="sidebar-news-thumb">
                            <img src={thumb} alt={itemTitle} />
                          </div>
                        )}
                        <div className="sidebar-news-info">
                          <h4 dangerouslySetInnerHTML={{ __html: itemTitle }} />
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="sidebar-empty">
                    {lang === 'ml' ? 'മറ്റു പ്രവർത്തനങ്ങൾ ലഭ്യമല്ല.' : 'No other activities available.'}
                  </p>
                )}
              </div>
              <Link to={`/${lang}/activities`} className="btn outline full" style={{ marginTop: '20px' }}>
                {lang === 'ml' ? 'എല്ലാ പ്രവർത്തനങ്ങളും കാണുക' : 'View All Activities'}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Notifications Marquee Section */}
      {notifications.length > 0 && (
        <section className="notifications-carousel-section">
          <div className="container">
            <h3 className="section-title-small" style={{ marginBottom: '15px', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '800' }}>
              {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}
            </h3>
            <div className="marquee-container" style={{ overflow: 'hidden', padding: '10px 0' }}>
              <div 
                className="marquee-track" 
                style={{ display: 'flex', gap: '20px', animation: 'scrollMarquee 35s linear infinite', width: 'max-content' }}
                onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
              >
                {[...notifications, ...notifications].map((notif, index) => {
                  const badgeText = notif.categoryName?.toLowerCase() === 'highlights' ? 'NEW' : (notif.categoryName || 'NEW');
                  return (
                    <Link to={lang === 'ml' ? `/notifications/${notif.slug}` : `/${lang}/notifications/${notif.slug}`} className="notification-card-tile" key={`${notif.id}-${index}`} style={{ scrollSnapAlign: 'none' }}>
                      <div className="notification-card-header">
                        <span className={`news-badge-mini ${notif.categorySlug || 'default'}`}>
                          {badgeText}
                        </span>
                        <span className="news-date" style={{ fontSize: '13px' }}>
                          {new Date(notif.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
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

export default ActivitySingle
