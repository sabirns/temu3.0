import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchDepartments, fetchFaculties, stripHtml, getLanguageContext } from '../services/wordpressApi'

function truncate(str, max = 80) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max).trim() + '…' : str
}

function getFacultyDeptSlugs(faculty) {
  const embedded = faculty._embedded?.['wp:term'] || []
  const terms = embedded.flat().filter(t => t.taxonomy === 'faculty_department')
  if (terms.length > 0) return terms.map(t => t.slug)
  if (faculty.faculty_department && Array.isArray(faculty.faculty_department)) {
    return faculty.faculty_department.map(String)
  }
  return []
}

function getFacultyInfo(f) {
  const name = stripHtml(f.title?.rendered || f.title || '')
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const role = f.meta?.designation || f.acf?.designation || (f.excerpt?.rendered ? stripHtml(f.excerpt.rendered).slice(0, 50) : '')
  const img = f._embedded?.['wp:featuredmedia']?.[0]?.source_url
  return { name, initials, role, img }
}

const fallbackDepts = {
  ml: [
    { id: 1, title: { rendered: 'എഴുത്തച്ഛൻ പഠന സ്കൂൾ' }, slug: 'എഴുത്തച്ഛൻ-പഠന-സ്കൂൾ', excerpt: { rendered: 'ഭാഷാശാസ്ത്രം, സാഹിത്യം, സൃഷ്ടിപരമായ എഴുത്ത്' } },
    { id: 2, title: { rendered: 'സാംസ്കാരിക പഠന വിഭാഗം' }, slug: 'സാംസ്കാരിക-പഠന-വിഭാഗം', excerpt: { rendered: 'നാടോടി വിദ്യ, മാനവശാസ്ത്രം' } },
    { id: 3, title: { rendered: 'പത്രപ്രവർത്തന വിഭാഗം' }, slug: 'പത്രപ്രവർത്തന-വിഭാഗം', excerpt: { rendered: 'പ്രിന്റ്, ഡിജിറ്റൽ, ബ്രോഡ്കാസ്റ്റ്' } }
  ],
  en: [
    { id: 1, title: { rendered: 'Thunchath Ezhuthachan School of Studies' }, slug: 'ezhuthachan-school-of-studies', excerpt: { rendered: 'Linguistics, Literature, Creative Writing' } },
    { id: 2, title: { rendered: 'Department of Cultural Studies' }, slug: 'department-of-cultural-studies', excerpt: { rendered: 'Folklore, Anthropology' } },
    { id: 3, title: { rendered: 'Department of Journalism' }, slug: 'department-of-journalism', excerpt: { rendered: 'Print, Digital, Broadcast' } }
  ]
}

function Departments() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [depts, setDepts] = useState([])
  const [facultiesByDept, setFacultiesByDept] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchDepartments({ lang }),
      fetchFaculties({ lang })
    ]).then(([deptData, facData]) => {
      if (cancelled) return
      const depts = deptData.length > 0 ? deptData : fallbackDepts[lang] || fallbackDepts.ml

      const grouped = {}
      facData.forEach(f => {
        const slugs = getFacultyDeptSlugs(f)
        slugs.forEach(slug => {
          if (!grouped[slug]) grouped[slug] = []
          grouped[slug].push(getFacultyInfo(f))
        })
      })

      setDepts(depts)
      setFacultiesByDept(grouped)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) {
        setDepts(fallbackDepts[lang] || fallbackDepts.ml)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [lang])

  const heading = lang === 'en' ? 'Schools & Departments' : 'സ്കൂളുകളും വിഭാഗങ്ങളും'
  const subtext = lang === 'en'
    ? 'Explore our diverse schools offering comprehensive academic programs and research opportunities.'
    : 'സമഗ്രമായ അക്കാദമിക് പ്രോഗ്രാമുകളും ഗവേഷണ അവസരങ്ങളും വാഗ്ദാനം ചെയ്യുന്ന വിവിധ സ്കൂളുകൾ പര്യവേക്ഷണം ചെയ്യുക.'

  const cta = lang === 'en' ? 'View Details →' : 'വിശദാംഗങ്ങൾ കാണുക →'

  return (
    <main className="page-content departments-page">
      <div className="container">
        <div className="departments-header">
          <h1 className="departments-title">{heading}</h1>
          <p className="departments-subtitle">{subtext}</p>
        </div>

        <div className="departments-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="department-skeleton" />
            ))
          ) : (
            depts.map(dept => {
              const deptFaculties = facultiesByDept[dept.slug] || []
              return (
                <div key={dept.id} className="department-card-wrapper">
                  <Link
                    className="department-card"
                    to={`/${lang}/department/${dept.slug}`}
                  >
                    <div className="department-card-accent" />
                    <h3 className="department-card-title">
                      {stripHtml(dept.title?.rendered || dept.title || '')}
                    </h3>
                    {dept.excerpt?.rendered && (
                      <p className="department-card-excerpt">
                        {truncate(stripHtml(dept.excerpt.rendered))}
                      </p>
                    )}
                    <span className="department-card-link">{cta}</span>
                  </Link>
                  {deptFaculties.length > 0 && (
                    <div className="department-faculties">
                      {deptFaculties.map((fac, i) => (
                        <div key={i} className="dept-faculty-mini">
                          {fac.img ? (
                            <img src={fac.img} alt={fac.name} className="dept-faculty-mini-avatar" />
                          ) : (
                            <span className="dept-faculty-mini-avatar dept-faculty-mini-initials">{fac.initials}</span>
                          )}
                          <div>
                            <span className="dept-faculty-mini-name">{fac.name}</span>
                            {fac.role && <span className="dept-faculty-mini-role">{fac.role}</span>}
                          </div>
                        </div>
                      ))}
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

export default Departments
