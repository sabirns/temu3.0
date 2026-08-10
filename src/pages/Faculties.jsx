import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchFacultyDepartments, fetchDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'
import '../styles/faculties.css'

function Faculties() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [allTerms, setAllTerms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function loadData() {
      try {
        const terms = await fetchFacultyDepartments({ lang, per_page: 100 })
        if (cancelled) return
        
        setAllTerms(terms)
        const topLevelFaculties = terms.filter(t => t.parent === 0)
        setFaculties(topLevelFaculties)

        const depts = await fetchDepartments({ lang, per_page: 100 })
        if (cancelled) return
        setDepartments(depts)

      } catch (error) {
        console.error("Error loading faculties and departments", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [lang])

  const heading = lang === 'en' ? 'Faculties' : 'ഫാക്കൽറ്റികൾ'
  const subtext = lang === 'en'
    ? 'Explore our diverse faculties and their respective departments offering comprehensive academic programs and research opportunities.'
    : 'വിവിധ ഫാക്കൽറ്റികളും അവയുടെ കീഴിലുള്ള വിഭാഗങ്ങളും പര്യവേക്ഷണം ചെയ്യുക.'

  const cta = lang === 'en' ? 'Explore Department →' : 'വിഭാഗം കാണുക →'

  const getDepartmentsForFaculty = (facultyId) => {
    const childTermIds = allTerms.filter(t => t.parent === facultyId).map(t => t.id)
    const allRelevantTermIds = [facultyId, ...childTermIds]

    return departments.filter(dept => {
      const deptTermIds = dept.faculty_department || []
      return deptTermIds.some(id => allRelevantTermIds.includes(id))
    })
  }

  return (
    <main className="faculties-page">
      <section className="faculties-hero">
        <div className="container">
          <h1 className="faculties-hero-title reveal-up active">{heading}</h1>
          <p className="faculties-hero-subtitle reveal-up active" style={{ transitionDelay: '0.1s' }}>{subtext}</p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: '80px' }}>
        <div className="faculties-layout">
          {loading ? (
            <div className="faculties-departments-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="department-skeleton" style={{ height: '180px' }} />
              ))}
            </div>
          ) : (
            faculties.map((faculty, idx) => {
              const facultyDepts = getDepartmentsForFaculty(faculty.id)
              
              return (
                <div key={faculty.id} className="faculty-section reveal-up active" style={{ transitionDelay: `${0.1 * (idx + 1)}s` }}>
                  <h2 className="faculty-section-title">
                    <Link to={`/${lang}/faculty-department/${faculty.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {stripHtml(faculty.name || '')}
                      <span style={{ fontSize: '0.6em', marginLeft: '10px', color: 'var(--primary)', opacity: 0.8 }}>🔗</span>
                    </Link>
                  </h2>
                  
                  {facultyDepts.length > 0 ? (
                    <div className="faculties-departments-grid">
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
                            <p className="department-card-excerpt">
                              {stripHtml(dept.excerpt.rendered).slice(0, 100)}...
                            </p>
                          )}
                          <span className="department-card-link">
                            {cta}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="faculty-empty-state">
                      {lang === 'en' ? 'No departments found under this faculty.' : 'ഈ ഫാക്കൽറ്റിക്ക് കീഴിൽ വിഭാഗങ്ങൾ ലഭ്യമല്ല.'}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}

export default Faculties
