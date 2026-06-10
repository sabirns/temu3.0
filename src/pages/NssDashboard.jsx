import { useState, useEffect } from 'react'
import { Navigate, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchNssPosts, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function NssDashboard() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchNssPosts({ include: 17028, _t: Date.now() })
        if (cancelled) return
        if (data && data.length > 0) {
          const post = data[0]
          setTarget(`/${lang}/nss/${post.slug}`)
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [lang])

  if (target) return <Navigate to={target} replace />

  return (
    <main className="nss-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span>NSS</span>
          </nav>
          <h1 className="inner-hero-title">NSS</h1>
          <p className="page-subtitle nss-hero-subtitle">
            {lang === 'ml' ? 'ദേശീയ സേവന പദ്ധതി' : 'National Service Scheme'}
          </p>
        </div>
      </section>

      <div className="container nss-section">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{lang === 'ml' ? 'NSS വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading NSS...'}</p>
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {lang === 'ml'
                ? 'നിലവിൽ NSS വിവരങ്ങളൊന്നും ലഭ്യമല്ല.'
                : 'No NSS posts found.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default NssDashboard