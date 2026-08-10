import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'


function ContactUs() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)
  const { setPageInfo } = usePageInfo()

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const pageSlug = location.pathname.split('/').filter(Boolean).pop()

  useEffect(() => {
    async function loadPage() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ slug: pageSlug, _embed: true, acf_format: 'standard', lang })
        const res = await fetch(`${WP_CONFIG.API_URL}/pages?${params}`)
        if (res.ok) {
          const pages = await res.json()
          const data = pages[0]
          if (data) {
            setPageInfo({ id: data.id, postType: 'page', translationSlugs: await extractTranslationSlugs(data, 'page') })
            const title = data.title?.rendered || ''
            const content = data.content?.rendered || ''
            const featuredImage = data._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
            const acf = data.acf || {}
            setPage({ title, content, featuredImage, acf })
          } else {
            setError('Page not found')
          }
        } else {
          setError('Failed to load page')
        }
      } catch (err) {
        setError('Failed to load page content')
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [pageSlug, lang])

  useEffect(() => {
    if (loading) return
    const toggles = document.querySelectorAll('.wp-block-accordion-heading__toggle')
    toggles.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault()
        const item = btn.closest('.wp-block-accordion-item')
        if (!item) return
        const panel = item.querySelector('.wp-block-accordion-panel')
        const isOpen = item.classList.contains('is-open')
        item.classList.toggle('is-open')
        btn.setAttribute('aria-expanded', !isOpen)
        if (panel) {
          panel.toggleAttribute('inert')
        }
        const icon = btn.querySelector('.wp-block-accordion-heading__toggle-icon')
        if (icon) {
          icon.textContent = isOpen ? '+' : '−'
        }
      }
    })
    return () => { toggles.forEach(btn => { btn.onclick = null }) }
  }, [loading])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{lang === 'ml' ? 'ഉള്ളടക്കം ലോഡ് ചെയ്യുന്നു...' : 'Loading page content...'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-error" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{error}</p>
        <Link to={`/?lang=${lang}`} className="btn primary">Go Home</Link>
      </div>
    )
  }

  const acf = page.acf || {}
  const acfEntries = Object.entries(acf).filter(([key]) => !['file', 'select_course', 'title'].includes(key))

  const mapEmbed = (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.05838613526!2d75.89502089999999!3d10.883163899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ae295c2d3cd1%3A0x988847bbe464021a!2sThunchath%20Ezhuthachan%20Malayalam%20University!5e0!3m2!1sen!2sin!4v1781165016946!5m2!1sen!2sin"
      className="contact-map-iframe"
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Campus Location"
    />
  )

  return (
    <article className="contact-page">
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: page.title }} />
          </nav>
          <h1 className="inner-hero-title" dangerouslySetInnerHTML={{ __html: page.title }} />
        </div>
      </section>

      <div className="page-content-wrapper">
        <div className="container">
          {page.content && (
            <div className="contact-wysiwyg">
              <GutenbergContent html={page.content} className="wordpress-content" />
            </div>
          )}

          {acfEntries.length > 0 && (
            <div className="contact-acf-grid">
              {acfEntries.map(([key, value]) => {
                if (!value) return null
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                let displayVal = value
                let isImage = false
                if (typeof value === 'object' && value !== null) {
                  if (value.url) {
                    if (value.mime_type?.startsWith('image/')) {
                      isImage = true
                      displayVal = value.url
                    } else {
                      displayVal = value.url
                    }
                  } else {
                    displayVal = JSON.stringify(value)
                  }
                }
                if (typeof displayVal === 'string' && displayVal.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
                  isImage = true
                }
                const isMulti = typeof displayVal === 'string' && displayVal.includes(',') && displayVal.split(',').every(s => {
                  const t = s.trim()
                  return t.includes('@') || /[\d\+\-\(\)\s]{6,}/.test(t)
                })
                const items = isMulti ? displayVal.split(',').map(s => s.trim()).filter(Boolean) : [displayVal]
                const icon = (() => {
                  const k = key.toLowerCase()
                  if (k.includes('phone') || k.includes('mobile') || k.includes('tel')) return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  )
                  if (k.includes('email') || k.includes('mail')) return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  )
                  if (k.includes('address') || k.includes('location') || k.includes('map')) return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  )
                  if (k.includes('website') || k.includes('web') || k.includes('site') || k.includes('url')) return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  )
                  if (k.includes('time') || k.includes('hour') || k.includes('working')) return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  )
                  return null
                })()
                return (
                  <div key={key} className="contact-acf-item">
                    <div className="contact-acf-header">
                      {icon && <span className="contact-acf-icon">{icon}</span>}
                      <span className="contact-acf-label">{label}</span>
                    </div>
                    {isImage ? (
                      <div className="contact-acf-image-wrap">
                        <img src={displayVal} alt={label} className="contact-acf-image" loading="lazy" />
                      </div>
                    ) : (
                      <div className="contact-acf-list">
                        {items.map((item, i) => (
                          <span key={i} className="contact-acf-value" dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <section className="contact-map-section">
            <h3 className="contact-map-title">
              {lang === 'ml' ? 'ക്യാമ്പസ് ലൊക്കേഷൻ' : 'Campus Location'}
            </h3>
            {mapEmbed}
          </section>
        </div>
      </div>
    </article>
  )
}

export default ContactUs
