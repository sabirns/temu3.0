import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchFacultyDepartments, fetchDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'
import '../styles/faculties.css'

function FacultyDepartmentSingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [faculty, setFaculty] = useState(null)
  const [facultyDepts, setFacultyDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function loadData() {
      try {
        const decodedSlug = decodeURIComponent(slug)
        // Fetch the specific faculty term by slug
        const terms = await fetchFacultyDepartments({ slug: decodedSlug, lang })
        if (cancelled) return
        
        if (!terms || terms.length === 0) {
          setError('Faculty not found')
          setLoading(false)
          return
        }
        
        const currentFaculty = terms[0]
        setFaculty(currentFaculty)

        // Fetch all faculties to get children IDs, or just fetch departments
        const allTerms = await fetchFacultyDepartments({ lang, per_page: 100 })
        const childTermIds = allTerms.filter(t => t.parent === currentFaculty.id).map(t => t.id)
        const allRelevantTermIds = [currentFaculty.id, ...childTermIds]

        // Fetch departments and filter
        const depts = await fetchDepartments({ lang, per_page: 100 })
        if (cancelled) return
        
        const matchedDepts = depts.filter(dept => {
          const deptTermIds = dept.faculty_department || []
          return deptTermIds.some(id => allRelevantTermIds.includes(id))
        })
        
        setFacultyDepts(matchedDepts)

      } catch (err) {
        if (!cancelled) setError('Failed to load faculty details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [slug, lang])

  if (loading) {
    return (
      <main className="faculties-page">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>
          {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
        </div>
      </main>
    )
  }

  if (error || !faculty) {
    return (
      <main className="faculties-page">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>{lang === 'ml' ? 'ഫാക്കൽറ്റി കണ്ടെത്തിയില്ല' : 'Faculty Not Found'}</h2>
          <Link to={`/${lang}/faculties`} className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            {lang === 'ml' ? 'ഫാക്കൽറ്റികളിലേക്ക് തിരികെ' : 'Back to Faculties'}
          </Link>
        </div>
      </main>
    )
  }

  const heading = stripHtml(faculty.name || '')
  const subtext = stripHtml(faculty.description || '')

  return (
    <main className="faculties-page">
      <section className="department-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <Link to={`/${lang}/faculties`}>{lang === 'ml' ? 'ഫാക്കൽറ്റികൾ' : 'Faculties'}</Link>
            <span>/</span>
            <span>{heading}</span>
          </nav>
          <h1 className="faculties-hero-title reveal-up active" style={{ marginTop: '15px' }}>{heading}</h1>
          {subtext && (
            <p className="faculties-hero-subtitle reveal-up active" style={{ transitionDelay: '0.1s' }}>
              {subtext}
            </p>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {facultyDepts.length > 0 ? (
          <div className="faculties-departments-grid reveal-up active" style={{ transitionDelay: '0.2s' }}>
            {facultyDepts.map(dept => (
              <Link
                key={dept.id}
                className="department-card"
                to={`/${lang}/department/${dept.slug}`}
              >
                <h3 className="department-card-title">
                  {stripHtml(dept.title?.rendered || dept.title || '')}
                </h3>
                {dept.excerpt?.rendered && (
                  <p className="department-card-desc">
                    {stripHtml(dept.excerpt.rendered).substring(0, 80)}...
                  </p>
                )}
                <span className="department-card-link">
                  {lang === 'en' ? 'Explore Department →' : 'വിഭാഗം കാണുക →'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="notification-empty" style={{ margin: '40px 0', border: '1px dashed var(--stroke)' }}>
            {lang === 'ml' ? 'ഈ ഫാക്കൽറ്റിക്ക് കീഴിൽ വിഭാഗങ്ങളൊന്നുമില്ല.' : 'No departments found under this faculty.'}
          </div>
        )}
      </div>
    </main>
  )
}

export default FacultyDepartmentSingle
