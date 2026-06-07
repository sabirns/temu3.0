import { useState, useEffect } from 'react'
import { Navigate, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchNaacPosts, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function Naac() {
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
        const data = await fetchNaacPosts({ per_page: 1, lang, _t: Date.now() })
        if (cancelled) return
        if (data && data.length > 0) {
          const firstPost = data[0]
          const catSlug = firstPost.primaryCategory?.slug || 'uncategorized'
          const base = `/naac/${catSlug}/${firstPost.slug}`
          setTarget(lang === 'ml' ? base : `/${lang}${base}`)
        }
      } catch {
        /* empty state handled below */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [lang])

  if (target) return <Navigate to={target} replace />

  return (
    <main className="naac-single-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span>NAAC</span>
          </nav>
          <h1 className="inner-hero-title">NAAC</h1>
          <p className="page-subtitle naac-hero-subtitle">
            {lang === 'ml' ? 'ദേശീയ അക്രഡിറ്റേഷൻ കൗൺസിൽ' : 'National Assessment and Accreditation Council'}
          </p>
        </div>
      </section>

      <div className="container naac-section">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{lang === 'ml' ? 'NAAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading NAAC...'}</p>
          </div>
        ) : (
          <div className="empty-state">
            <h2 className="naac-error-title">NAAC</h2>
            <p className="naac-empty-text">
              {lang === 'ml'
                ? 'നിലവിൽ NAAC വിവരങ്ങളൊന്നും ലഭ്യമല്ല.'
                : 'No NAAC posts found.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Naac
