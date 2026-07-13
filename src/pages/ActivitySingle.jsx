import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchActivityBySlug, getLanguageContext } from '../services/wordpressApi'
import GutenbergContent from '../components/GutenbergContent'


function ActivitySingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchActivityBySlug(decodedSlug, { lang })
        if (data) {
          setActivity(data)
        } else {
          setError('Activity not found')
        }
      } catch (err) {
        setError('Failed to load activity')
      }
      setLoading(false)
    }
    load()
  }, [slug, lang])

  if (loading) {
    return (
      <main className="page-content">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>
          {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
        </div>
      </main>
    )
  }

  if (error || !activity) {
    return (
      <main className="page-content">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>{lang === 'ml' ? 'പ്രവർത്തനം കണ്ടെത്തിയില്ല' : 'Activity Not Found'}</h2>
          <Link to={`/${lang}/activities`} className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            {lang === 'ml' ? 'പ്രവർത്തനങ്ങളിലേക്ക് തിരികെ' : 'Back to Activities'}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <Link to={`/${lang}/activities`}>{lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Activities'}</Link>
            <span>/</span>
            <span>{activity.title}</span>
          </nav>
          <h1 className="inner-hero-title">{activity.title}</h1>
          {activity.date && (
            <p className="inner-hero-desc" style={{ fontSize: '14px', opacity: 0.7 }}>
              {new Date(activity.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        {activity.featuredImage && (
          <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: 'var(--radius)', marginBottom: '30px' }}>
            <img src={activity.featuredImage} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <GutenbergContent html={activity.content} className="page-content-body" />
      </div>
    </main>
  )
}

export default ActivitySingle
