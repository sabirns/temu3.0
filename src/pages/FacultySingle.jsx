import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchFacultyBySlug, getLanguageContext } from '../services/wordpressApi'
import GutenbergContent from '../components/GutenbergContent'


function FacultySingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchFacultyBySlug(decodedSlug, { lang })
        if (data) {
          setFaculty(data)
        } else {
          setError('Faculty not found')
        }
      } catch (err) {
        setError('Failed to load faculty')
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

  if (error || !faculty) {
    return (
      <main className="page-content">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>{lang === 'ml' ? 'ഫാക്കൽറ്റി കണ്ടെത്തിയില്ല' : 'Faculty Not Found'}</h2>
          <Link to={`/${lang}/departments`} className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            {lang === 'ml' ? 'വകുപ്പുകളിലേക്ക് തിരികെ' : 'Back to Departments'}
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
            <Link to={`/${lang}/departments`}>{lang === 'ml' ? 'വകുപ്പുകൾ' : 'Departments'}</Link>
            <span>/</span>
            <span>{faculty.title}</span>
          </nav>
          <h1 className="inner-hero-title">{faculty.title}</h1>
          {faculty.acf?.designation && (
            <p className="inner-hero-desc" style={{ fontSize: '18px', opacity: 0.8, marginTop: '10px', marginBottom: '5px' }}>
              {faculty.acf.designation}
            </p>
          )}
          {faculty.department && (
            <p className="inner-hero-desc" style={{ fontSize: '15px', opacity: 0.6, marginTop: 0 }}>
              {faculty.department}
            </p>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="faculty-profile-layout">
          <aside className="faculty-profile-sidebar">
            {faculty.featuredImage && (
              <div className="faculty-profile-card">
                <img src={faculty.featuredImage} alt={faculty.title} />
              </div>
            )}
          </aside>
          <div className="faculty-profile-content">
            <GutenbergContent html={faculty.content} className="page-content-body" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default FacultySingle
