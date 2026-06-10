import { useState, useEffect } from 'react'
import { Navigate, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchIqacPosts, getLanguageContext } from '../services/wordpressApi'
import '../styles/pages.css'

function IqacDashboard() {
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
        const data = await fetchIqacPosts({ per_page: 1, lang, _t: Date.now() })
        if (cancelled) return
        if (data && data.length > 0) {
          const firstPost = data[0]
          const catSlug = firstPost.primaryCategory?.slug || 'uncategorized'
          const base = `/iqac/${catSlug}/${firstPost.slug}`
          setTarget(lang === 'ml' ? base : `/${lang}${base}`)
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
    <main className="iqac-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={lang === 'ml' ? '/' : `/${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span>IQAC</span>
          </nav>
          <h1 className="inner-hero-title">IQAC</h1>
          <p className="page-subtitle iqac-hero-subtitle">
            {lang === 'ml' ? 'ആഭ്യന്തര ഗുണനിലവാര ഉറപ്പ് കേന്ദ്രം' : 'Internal Quality Assurance Cell'}
          </p>
        </div>
      </section>

      <div className="container iqac-section">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>{lang === 'ml' ? 'IQAC വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading IQAC...'}</p>
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {lang === 'ml'
                ? 'നിലവിൽ IQAC വിവരങ്ങളൊന്നും ലഭ്യമല്ല.'
                : 'No IQAC posts found.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default IqacDashboard