import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { fetchActivities, fetchFacultyDepartments, stripHtml, getLanguageContext } from '../services/wordpressApi'

function Activities() {
  const { termSlug } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [activities, setActivities] = useState([])
  const [deptName, setDeptName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      const params = { lang, per_page: 50 }
      if (termSlug) {
        const terms = await fetchFacultyDepartments({ slug: termSlug })
        if (terms.length > 0 && !cancelled) {
          setDeptName(terms[0].name)
          params.faculty_department = terms[0].id
        }
      }
      const data = await fetchActivities(params)
      if (!cancelled) {
        setActivities(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [lang, termSlug])

  const heading = termSlug && deptName
    ? `${deptName} - ${lang === 'en' ? 'Activities' : 'പ്രവർത്തനങ്ങൾ'}`
    : lang === 'en' ? 'Activities' : 'പ്രവർത്തനങ്ങൾ'

  const subtext = lang === 'en'
    ? 'Explore the various activities organized by our departments.'
    : 'ഞങ്ങളുടെ വകുപ്പുകൾ സംഘടിപ്പിക്കുന്ന വിവിധ പ്രവർത്തനങ്ങൾ പര്യവേക്ഷണം ചെയ്യുക.'

  return (
    <main className="page-content activities-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            {termSlug && <><Link to={`/${lang}/activities`}>{lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Activities'}</Link><span>/</span></>}
            <span>{deptName || heading}</span>
          </nav>
          <h1 className="inner-hero-title">{heading}</h1>
          {!termSlug && <p className="inner-hero-desc">{subtext}</p>}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '16px' }}>
            {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading activities...'}
          </div>
        ) : activities.length > 0 ? (
          <div className="activities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {activities.map(act => {
              const actImg = act._embedded?.['wp:featuredmedia']?.[0]?.source_url
              return (
                <Link key={act.id} to={`/${lang}/activity/${act.slug}`} className="activity-card" style={{ display: 'block', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--stroke)', overflow: 'hidden', boxShadow: 'var(--shadow2)', transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none', color: 'inherit' }}>
                  {actImg ? (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                      <img src={actImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg0)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--stroke)' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', lineHeight: 1.3 }}>
                      {stripHtml(act.title?.rendered || act.title || '')}
                    </h3>
                    {act.excerpt?.rendered && (
                      <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
                        {stripHtml(act.excerpt.rendered).slice(0, 200)}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '18px', color: 'var(--muted)' }}>
              {lang === 'ml' ? 'ഒരു പ്രവർത്തനവും കണ്ടെത്തിയില്ല.' : 'No activities found.'}
            </p>
            {termSlug && (
              <Link to={`/${lang}/activities`} className="btn primary" style={{ marginTop: '16px' }}>
                {lang === 'ml' ? 'എല്ലാ പ്രവർത്തനങ്ങളും കാണുക' : 'View All Activities'}
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Activities
