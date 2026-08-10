import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchCourseBySlug, getLanguageContext } from '../services/wordpressApi'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'


function CourseSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchCourseBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) {
          setCourse(data)
        } else {
          setError(lang === 'ml' ? 'കോഴ്സ് കണ്ടെത്തിയില്ല.' : 'Course not found.')
        }
      } catch (err) {
        setError(lang === 'ml' ? 'കോഴ്സ് ലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.' : 'Failed to load course.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadCourse()
    }
  }, [slug, lang])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'കോഴ്സ് ലോഡ് ചെയ്യുന്നു...' : 'Loading course...'}</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={`/${lang}`} className="btn primary">{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
      </div>
    )
  }

  return (
    <article className="course-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: course.title }} />
          </nav>
          <h1 className="inner-hero-title" dangerouslySetInnerHTML={{ __html: course.title }} />
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        <div className="page-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="main-content page-reveal reveal-up">
            {course.featuredImage && (
              <div className="page-featured-image" style={{ marginBottom: '40px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <img src={course.featuredImage} alt={course.title} style={{ width: '100%', display: 'block' }} />
              </div>
            )}
            <GutenbergContent
              html={course.content}
              className="page-content wordpress-content"
              style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text)' }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export default CourseSingle
