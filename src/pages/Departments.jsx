import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'
import '../styles/faculties.css'

function Departments() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function loadData() {
      try {
        const depts = await fetchDepartments({ lang, per_page: 100 })
        if (cancelled) return
        setDepartments(depts)
      } catch (error) {
        console.error("Error loading departments", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [lang])

  const heading = lang === 'en' ? 'Schools & Departments' : 'സ്കൂളുകളും വിഭാഗങ്ങളും'
  const subtext = lang === 'en'
    ? 'Explore our diverse schools offering comprehensive academic programs and research opportunities.'
    : 'സമഗ്രമായ അക്കാദമിക് പ്രോഗ്രാമുകളും ഗവേഷണ അവസരങ്ങളും വാഗ്ദാനം ചെയ്യുന്ന വിവിധ സ്കൂളുകൾ പര്യവേക്ഷണം ചെയ്യുക.'

  const cta = lang === 'en' ? 'Explore Department →' : 'വിഭാഗം കാണുക →'

  return (
    <main className="page-content departments-page">
      <section className="faculties-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{heading}</span>
          </nav>
          <h1 className="faculties-hero-title reveal-up active">{heading}</h1>
          <p className="faculties-hero-subtitle reveal-up active" style={{ transitionDelay: '0.1s' }}>{subtext}</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="faculties-layout">
          <div className="faculties-departments-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="department-skeleton" style={{ height: '180px' }} />
            ))
          ) : departments.length > 0 ? (
            departments.map(dept => (
              <Link
                key={dept.id}
                className="department-card reveal-up active"
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
                  {cta}
                </span>
              </Link>
            ))
          ) : (
            <div className="faculty-empty-state" style={{ gridColumn: '1 / -1' }}>
              {lang === 'ml' ? 'വിഭാഗങ്ങളൊന്നുമില്ല.' : 'No departments found.'}
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Departments
