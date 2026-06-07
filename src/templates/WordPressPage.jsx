import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchPage, fetchPageBySlug, getPageContent, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import { usePageInfo } from '../services/PageInfoContext'

function WordPressPage() {
  const { pageId, slug, '*': splat } = useParams()
  // React Router v6 treats :slug* as :slug/* — slug captures only first segment,
  // remaining segments go into the "*" param. Recombine them.
  const fullSlug = splat ? `${slug}/${splat}` : slug
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  // Detect language from path or query
  const lang = getLanguageContext(location.pathname, searchParams)
  
  const { setPageInfo } = usePageInfo()

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPage() {
      setLoading(true)
      setError(null)

      try {
        let data = null

        if (fullSlug) {
          // 1. Decode the URL path — React Router may leave * splat partially encoded
          const fullPath = decodeURIComponent(fullSlug)
          // 2. Split into segments, remove empties
          const segments = fullPath.split('/').filter(Boolean)

          // 3. Extract only the last slug segment (the actual page slug)
          //    The parent path is only used for validation after fetch.
          const pageSlug = segments[segments.length - 1] || fullPath

          // Build the full path prefix we expect the page's link to contain.
          // Include the lang prefix because the API's `link` field starts with /ml/ or /en/
          const requestedPath = `/${lang}/${segments.join('/')}/`.replace(/\/+/g, '/')

          console.debug('WordPressPage [slug]:', slug, '[splat]:', splat, '[fullSlug]:', fullSlug)
          console.debug('WordPressPage [location.pathname]:', window.location.pathname)
          console.debug('WordPressPage [decoded fullPath]:', fullPath)
          console.debug('WordPressPage [segments]:', segments)
          console.debug('WordPressPage [pageSlug (last segment)]:', pageSlug)
          console.debug('WordPressPage [requestedPath for validation]:', requestedPath)

          // 4. Encode slug only while sending the API request.
          //    URLSearchParams handles percent-encoding of Malayalam characters.
          const params = new URLSearchParams({ slug: pageSlug, _embed: true, acf_format: 'standard', lang })
          console.debug('WordPressPage [API query string]:', params.toString())

          const res = await fetch(`${WP_CONFIG.API_URL}/pages?${params}`)
          if (res.ok) {
            const pages = await res.json()
            console.debug('WordPressPage [API returned pages]:', pages.length)

            // 5. Validate the full parent/child path after fetching.
            //    Use the WordPress link (canonical URL) from the API response.
            const matchedPage = pages.find(p => {
              let linkPath
              try {
                linkPath = new URL(p.link, WP_CONFIG.SITE_URL).pathname
              } catch {
                linkPath = p.link || ''
              }
              // 6. Remove leading/trailing slashes, decode for comparison
              const normalizedLink = decodeURIComponent(linkPath).replace(/^\/+|\/+$/g, '')
              // The requested path: e.g. "ml/സർവകലാശാല/ആക്റ്റും-സ്റ്റാറ്റ്യുട്"
              const normalizedRequested = requestedPath.replace(/^\/+|\/+$/g, '')
              console.debug('WordPressPage [comparing link vs path]:', normalizedLink, 'vs', normalizedRequested)
              return normalizedLink === normalizedRequested ||
                     normalizedLink.endsWith(`/${normalizedRequested}`)
            })

            if (matchedPage) {
              console.debug('WordPressPage [matched by link validation]:', matchedPage.id, matchedPage.slug)
              data = matchedPage
            } else if (pages.length === 1) {
              console.debug('WordPressPage [single result, using directly]:', pages[0].id, pages[0].slug)
              data = pages[0]
            } else {
              console.debug('WordPressPage [no link match, ', pages.length, ' candidates, trying parent-chain validation...')
              // 7. Handle duplicate child slugs by checking parent chain
              if (segments.length > 1) {
                const parentSlugs = segments.slice(0, -1) // parent segments
                for (const candidate of pages) {
                  let match = true
                  let currentId = candidate.parent
                  for (let i = parentSlugs.length - 1; i >= 0; i--) {
                    if (!currentId) { match = false; break }
                    try {
                      const pRes = await fetch(`${WP_CONFIG.API_URL}/pages/${currentId}?_fields=id,slug,parent`)
                      if (pRes.ok) {
                        const pData = await pRes.json()
                        const expectedSlug = parentSlugs[i]
                        const actualSlug   = decodeURIComponent(pData.slug || '')
                        console.debug('WordPressPage [parent chain check]: level', i, 'expected', expectedSlug, 'got', actualSlug)
                        if (actualSlug !== expectedSlug) { match = false; break }
                        currentId = pData.parent
                      } else { match = false; break }
                    } catch { match = false; break }
                  }
                  if (match) { data = candidate; console.debug('WordPressPage [parent chain match]:', candidate.id); break }
                }
              }
            }
          }

          if (!data) {
            console.debug('WordPressPage [fallback: fetching with lang param]')
            data = await fetchPageBySlug(pageSlug, { lang })
          }
        } else if (pageId) {
          data = await fetchPage(pageId, { lang })
        }

        if (data) {
          setPageInfo({ id: data.id, postType: 'page', translationSlugs: await extractTranslationSlugs(data, 'page') })
          const pageData = getPageContent(data)
          const fileField = pageData.acf?.file
          if (fileField && typeof fileField === 'number') {
            try {
              const res = await fetch(`${WP_CONFIG.API_URL}/media/${fileField}`)
              if (res.ok) {
                const media = await res.json()
                pageData.acf.file = { url: media.source_url, mime_type: media.mime_type }
              }
            } catch (e) {
              console.warn('Failed to resolve ACF file media:', e)
            }
          }
          setPage(pageData)
        } else {
          setError('Page not found')
        }
      } catch (err) {
        console.error('WordPressPage [error]:', err)
        setError('Failed to load page content')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pageId, slug, splat, lang])

  useEffect(() => {
    const revealElements = document.querySelectorAll('.page-reveal')
    const revealOnScroll = () => {
      revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top
        if (elementTop < window.innerHeight - 100) {
          el.classList.add('active')
        }
      })
    }
    window.addEventListener('scroll', revealOnScroll)
    setTimeout(revealOnScroll, 100)
    return () => window.removeEventListener('scroll', revealOnScroll)
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

  return (
    <article className="wordpress-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: page.title }} />
          </nav>
          <h1 
            className="inner-hero-title" 
            dangerouslySetInnerHTML={{ __html: page.title }} 
          />
        </div>
      </section>

      {/* Page Content */}
      <div className="page-content-wrapper" style={{ paddingBottom: '80px' }}>
        <div className="container">
          <div className="page-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="main-content page-reveal reveal-up">
              {page.featuredImage && (
                <div className="page-featured-image" style={{ marginBottom: '40px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <img src={page.featuredImage} alt={page.title} style={{ width: '100%', display: 'block' }} />
                </div>
              )}
              
              <div 
                className="page-content wordpress-content"
                dangerouslySetInnerHTML={{ __html: page.content }} 
                style={{ 
                  fontSize: '18px', 
                  lineHeight: '1.8', 
                  color: 'var(--text)',
                }}
              />

              {(() => {
                const f = page.acf?.file
                if (!f) return null
                const url = typeof f === 'string' ? f : f.url
                const mime = typeof f === 'object' ? f.mime_type : (url?.match(/\.pdf$/i) ? 'application/pdf' : '')
                if (!url || mime !== 'application/pdf') return null
                return (
                  <div className="page-pdf-viewer" style={{ marginTop: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(51,51,51,.1)' }}>
                    <embed src={url} type="application/pdf" width="100%" height="800px" style={{ display: 'block' }} />
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default WordPressPage
