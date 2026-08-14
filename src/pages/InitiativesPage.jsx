import { useState, useEffect } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { getLanguageContext, fetchPageBySlug, fetchActivities } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import SocialActivitiesGrid from '../components/SocialActivitiesGrid'

function InitiativesPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [data, setData] = useState(null)
  const [socialActivities, setSocialActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [page, activitiesData] = await Promise.all([
          fetchPageBySlug('home-page-ml'),
          fetchActivities({ activity_type: 1991, lang, per_page: 50 })
        ])
        setData(page)
        setSocialActivities(activitiesData || [])
      } catch (e) {
        console.warn('Failed to load initiatives page data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lang])

  const buttons = data?.acf?.buttons || []

  return (
    <main className="page-content">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'പദ്ധതികളും സംരംഭങ്ങളും' : 'Initiatives & Projects'}</span>
          </nav>
          <h1 className="inner-hero-title">{lang === 'ml' ? 'പദ്ധതികളും സംരംഭങ്ങളും' : 'Initiatives & Projects'}</h1>
          <p className="inner-hero-desc">{lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ പദ്ധതികളും സംരംഭങ്ങളും.' : 'Various projects and initiatives of Malayalam University.'}</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '50px', paddingBottom: '60px' }}>
        {loading ? (
          <div className="loading-state" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
            {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
          </div>
        ) : (
          <>
            {buttons.length > 0 && (
              <div className="initiatives-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {buttons.map((btn, index) => {
                  const btnLinkField = btn.external_link || btn.link || '#'
                  const linkUrl = typeof btnLinkField === 'object' && btnLinkField?.url ? btnLinkField.url : btnLinkField
                  
                  const isExternal = linkUrl.startsWith('http') && !linkUrl.startsWith(WP_CONFIG.SITE_URL)
                  const internalPath = !isExternal && linkUrl.startsWith(WP_CONFIG.SITE_URL)
                    ? linkUrl.replace(WP_CONFIG.SITE_URL, '') || '/'
                    : linkUrl

                  const linkText = typeof btnLinkField === 'object' && btnLinkField?.title ? btnLinkField.title : (lang === 'ml' ? 'കൂടുതൽ അറിയുക →' : 'Explore →')
                  const iconUrl = typeof btn.icon === 'object' && btn.icon?.url ? btn.icon.url : btn.icon
                  return (
                    <article key={index} className="initiative-card">
                      {iconUrl ? (
                        <img className="icon" src={iconUrl} alt={btn.title || ''} style={{ width: '48px', height: '48px', marginBottom: '16px', objectFit: 'contain' }} />
                      ) : (
                        <div className="icon" style={{ fontSize: '32px', marginBottom: '16px' }}>⟡</div>
                      )}
                      <h3 style={{ margin: '0 0 10px', fontSize: '18px' }}>{btn.title}</h3>
                      <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: btn.description }} />
                      <div className="meta">
                        {isExternal ? (
                          <a className="link" href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>{linkText}</a>
                        ) : (
                          <Link className="link" to={internalPath} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>{linkText}</Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Socially Committed Activities Section */}
            {socialActivities.length > 0 && (
              <section className="social-activities-page-section" style={{ marginTop: '30px', paddingTop: '30px !important', paddingBottom: '30px !important', borderTop: '1px solid var(--stroke, rgba(0,0,0,0.08))' }}>
                <div className="section-head" style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '28px', color: 'var(--primary-dark, #1e293b)', fontWeight: '800', margin: '0 0 8px' }}>
                    {lang === 'ml' ? 'സാമൂഹികപ്രതിബദ്ധതാ പ്രവർത്തനങ്ങൾ' : 'Socially Committed Activities'}
                  </h2>
                  <p style={{ color: 'var(--muted, #64748b)', fontSize: '15px', margin: 0 }}>
                    {lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ സാമൂഹിക പ്രതിബദ്ധതയുള്ള സേവന പ്രവർത്തനങ്ങൾ.' : 'Socially committed activities and community initiatives of Malayalam University.'}
                  </p>
                </div>

                <SocialActivitiesGrid activities={socialActivities} lang={lang} />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default InitiativesPage
