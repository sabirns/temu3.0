import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchFacultyDepartments, fetchDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'
import '../styles/faculties.css'

// Fallback high quality imagery tailored for each academic faculty domain
const FACULTY_FALLBACK_IMAGES = {
  'linguistics-ml': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'malayalam-language-studies': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'literature-ml': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  'literature': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  'cultural-heritage-history-ml': 'https://images.unsplash.com/photo-1599557999956-65481711202e?auto=format&fit=crop&w=800&q=80',
  'heritage-studies-2': 'https://images.unsplash.com/photo-1599557999956-65481711202e?auto=format&fit=crop&w=800&q=80',
  'media-studies-ml': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
  'media-studies': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
  'social-sciences-ml': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'social-sciences': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'environmental-studies-ml': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'environmental-studies': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'

function getFacultyImage(faculty, facultyDepts) {
  if (faculty._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return faculty._embedded['wp:featuredmedia'][0].source_url
  }
  if (typeof faculty.acf?.file === 'string' && faculty.acf.file.startsWith('http')) {
    return faculty.acf.file
  }
  const deptWithImage = facultyDepts?.find(d => d._embedded?.['wp:featuredmedia']?.[0]?.source_url)
  if (deptWithImage) {
    return deptWithImage._embedded['wp:featuredmedia'][0].source_url
  }
  if (faculty.slug && FACULTY_FALLBACK_IMAGES[faculty.slug]) {
    return FACULTY_FALLBACK_IMAGES[faculty.slug]
  }
  return DEFAULT_IMAGE
}

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
        const terms = await fetchFacultyDepartments({ lang, per_page: 100, _embed: true })
        if (cancelled) return
        
        setAllTerms(terms)
        const topLevelFaculties = terms.filter(t => t.parent === 0)
        setFaculties(topLevelFaculties)

        const depts = await fetchDepartments({ lang, per_page: 100, _embed: true })
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
    ? 'Explore our academic faculties and their specialized departments offering comprehensive programs and research opportunities.'
    : 'വിവിധ ഫാക്കൽറ്റികളും അവയുടെ കീഴിലുള്ള പഠനസ്‌കൂളുകളും പര്യവേക്ഷണം ചെയ്യുക.'

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

      <div className="container" style={{ paddingBottom: '80px', paddingTop: '60px' }}>
        <div className="faculties-layout">
          {loading ? (
            <div className="faculties-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="faculty-grid-card skeleton-card" style={{ height: '380px' }} />
              ))}
            </div>
          ) : (
            <div className="faculties-grid">
              {faculties.map((faculty, idx) => {
                const facultyDepts = getDepartmentsForFaculty(faculty.id)
                const facultyImg = getFacultyImage(faculty, facultyDepts)
                const facultyTitle = stripHtml(faculty.name || '')

                return (
                  <div 
                    key={faculty.id} 
                    className="faculty-grid-card reveal-up active" 
                    style={{ transitionDelay: `${0.08 * (idx + 1)}s` }}
                  >
                    <Link to={`/${lang}/faculty-department/${faculty.slug}`} className="faculty-card-image-wrap">
                      <img 
                        src={facultyImg} 
                        alt={facultyTitle} 
                        className="faculty-card-img"
                        loading="lazy" 
                      />
                      <div className="faculty-card-overlay" />
                      <h2 className="faculty-card-title-overlay">
                        {facultyTitle}
                      </h2>
                    </Link>

                    <div className="faculty-card-content">
                      <h4 className="faculty-dept-section-title">
                        {lang === 'en' ? 'Departments' : 'പഠനസ്‌കൂളുകൾ'}
                      </h4>

                      {facultyDepts.length > 0 ? (
                        <div className="faculty-dept-inline-list">
                          {facultyDepts.map(dept => {
                            const deptTitle = stripHtml(dept.title?.rendered || dept.title || '')
                            return (
                              <Link 
                                key={dept.id} 
                                to={`/${lang}/department/${dept.slug}`} 
                                className="faculty-dept-chip"
                              >
                                {deptTitle}
                              </Link>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="faculty-dept-empty">
                          {lang === 'en' ? 'No departments listed' : 'പഠനസ്‌കൂളുകൾ ചേർത്തിട്ടില്ല'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Faculties

