import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchFacultyDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'

const fallbackTerms = {
  ml: [
    { id: 1, name: 'എഴുത്തച്ഛൻ പഠന സ്കൂൾ', slug: 'ezhuthachan-school-of-studies', count: 1, description: 'ഭാഷാശാസ്ത്രം, സാഹിത്യം, സൃഷ്ടിപരമായ എഴുത്ത്', parent: 0 },
    { id: 2, name: 'സാംസ്കാരിക പഠന വിഭാഗം', slug: 'department-of-cultural-studies', count: 1, description: 'നാടോടി വിദ്യ, മാനവശാസ്ത്രം', parent: 0 },
    { id: 3, name: 'പത്രപ്രവർത്തന വിഭാഗം', slug: 'department-of-journalism', count: 1, description: 'പ്രിന്റ്, ഡിജിറ്റൽ, ബ്രോഡ്കാസ്റ്റ്', parent: 0 }
  ],
  en: [
    { id: 1, name: 'Thunchath Ezhuthachan School of Studies', slug: 'ezhuthachan-school-of-studies', count: 1, description: 'Linguistics, Literature, Creative Writing', parent: 0 },
    { id: 2, name: 'Department of Cultural Studies', slug: 'department-of-cultural-studies', count: 1, description: 'Folklore, Anthropology', parent: 0 },
    { id: 3, name: 'Department of Journalism', slug: 'department-of-journalism', count: 1, description: 'Print, Digital, Broadcast', parent: 0 }
  ]
}

function Departments() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchFacultyDepartments({ lang, per_page: 100 })
      .then(data => {
        if (cancelled) return
        if (data.length > 0) {
          setTerms(data.filter(t => t.parent === 0))
        } else {
          setTerms(fallbackTerms[lang] || fallbackTerms.ml)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setTerms(fallbackTerms[lang] || fallbackTerms.ml)
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
            terms.map(term => (
              <div key={term.id} className="department-card-wrapper">
                  <Link
                    className="department-card"
                    to={`/${lang}/department/term-${term.id}`}
                  >
                  <div className="department-card-accent" />
                  <h3 className="department-card-title">
                    {stripHtml(term.name || '')}
                  </h3>
                  {term.description && (
                    <p className="department-card-excerpt">
                      {stripHtml(term.description)}
                    </p>
                  )}
                  <span className="department-card-link">
                    {term.count > 0
                      ? cta
                      : (lang === 'en' ? 'Coming Soon' : 'ഉടൻ ലഭ്യമാകും')}
                  </span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default Departments
