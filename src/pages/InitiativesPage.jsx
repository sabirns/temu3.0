import { useState, useEffect } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { getLanguageContext, fetchPageBySlug } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'

function InitiativesPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const page = await fetchPageBySlug('home-page-ml')
      setData(page)
      setLoading(false)
    }
    load()
  }, [])

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
        ) : buttons.length > 0 ? (
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
                <article key={index} className="initiative-card" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--stroke)', padding: '28px', boxShadow: 'var(--shadow2)' }}>
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
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <p>{lang === 'ml' ? 'ഉള്ളടക്കം ലഭ്യമല്ല.' : 'No content available.'}</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default InitiativesPage
