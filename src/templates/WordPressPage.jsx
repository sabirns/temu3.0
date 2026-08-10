import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchPage, fetchPageBySlug, getPageContent, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'


function WordPressPage() {
  const { pageId, slug, '*': splat } = useParams()
  // React Router v6 treats :slug* as :slug/* — slug captures only first segment,
  // remaining segments go into the "*" param. Recombine them.
  const fullSlug = splat ? `${slug}/${splat}` : slug
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  // Detect language from path or query
  const lang = getLanguageContext(location.pathname, searchParams)
  const isCourseSubPage = (slug === 'our-courses-ml' || slug === 'courses-offered') && splat;
  
  const { setPageInfo } = usePageInfo()

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [subLinks, setSubLinks] = useState([])

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

          // Fetch courses if select_course term ID is set
          const courseTermId = pageData.acf?.select_course
          if (courseTermId != null && (typeof courseTermId === 'number' || /^\d+$/.test(courseTermId))) {
            setCoursesLoading(true)
            try {
              const courseParams = new URLSearchParams({
                course_category: courseTermId,
                _embed: true,
                per_page: 100,
                lang
              })
              const courseRes = await fetch(`${WP_CONFIG.API_URL}/courses?${courseParams}`)
              if (courseRes.ok) {
                const courseData = await courseRes.json()
                setCourses(courseData)
              }
            } catch (e) {
              console.warn('Failed to fetch courses:', e)
            } finally {
              setCoursesLoading(false)
            }
          }
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
    if (!page || loading) return
    const tmp = document.createElement('div')
    tmp.innerHTML = page.content || ''
    const textContent = (tmp.textContent || tmp.innerText || '').trim()
    
    // Check if content is effectively empty
    if (textContent === '') {
      let attempts = 0
      const currentPath = decodeURIComponent(window.location.pathname).replace(/\/$/, '') || '/'
      
      const checkMenu = () => {
        const links = Array.from(document.querySelectorAll('#mega-menu-custom a'))
        if (links.length === 0) {
          if (attempts < 20) {
            attempts++
            setTimeout(checkMenu, 100)
          }
          return
        }
        
        const currentLink = links.find(a => {
          const href = a.getAttribute('href')
          if (!href || href === '#') return false
          try {
            const url = new URL(href, window.location.origin)
            return (decodeURIComponent(url.pathname).replace(/\/$/, '') || '/') === currentPath
          } catch { return false }
        })
        
        if (currentLink) {
          const parentLi = currentLink.closest('li')
          if (parentLi) {
            const subMenu = parentLi.querySelector('ul.sub-menu, ul.mega-sub-menu')
            if (subMenu) {
              const extractedLinks = Array.from(subMenu.querySelectorAll(':scope > li > a')).map(a => ({
                title: a.textContent.trim(),
                url: a.getAttribute('href')
              }))
              setSubLinks(extractedLinks)
            }
          }
        }
      }
      
      checkMenu()
    } else {
      setSubLinks([])
    }
  }, [page, loading, location.pathname])

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
        if (panel) panel.toggleAttribute('inert')
        const icon = btn.querySelector('.wp-block-accordion-heading__toggle-icon')
        if (icon) icon.textContent = isOpen ? '+' : '−'
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

  return (
    <article className="wordpress-page">
      {!isCourseSubPage && (
        <section className="inner-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
              <span>/</span>
              <span dangerouslySetInnerHTML={{ __html: page.title }} />
            </nav>
            <h1 
              className="inner-hero-title" 
              dangerouslySetInnerHTML={{ __html: page.title }} 
            />
          </div>
        </section>
      )}

      {/* Page Content */}
      <div className="page-content-wrapper" style={{ paddingTop: isCourseSubPage ? '40px' : '0', paddingBottom: '80px' }}>
        <div className="container">
          <div className="page-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="main-content page-reveal reveal-up">
              {isCourseSubPage && (
                <>
                  <nav className="breadcrumb" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <Link to={`/${lang}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
                    <span style={{ margin: '0 12px', color: 'var(--muted2)' }}>/</span>
                    <Link to={`/${lang}/${slug}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{lang === 'ml' ? 'കോഴ്സുകൾ' : 'Courses'}</Link>
                    <span style={{ margin: '0 12px', color: 'var(--muted2)' }}>/</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }} dangerouslySetInnerHTML={{ __html: page.title }} />
                  </nav>
                  <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px', fontSize: '2.5rem', fontWeight: '800' }} dangerouslySetInnerHTML={{ __html: page.title }} />
                </>
              )}
              {page.featuredImage && (
                <div className="page-featured-image" style={{ marginBottom: '40px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <img src={page.featuredImage} alt={page.title} style={{ width: '100%', display: 'block' }} />
                </div>
              )}
              
              <GutenbergContent 
                html={page.content}
                className="page-content wordpress-content"
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

              {/* Sub-menu Cards for empty pages */}
              {subLinks.length > 0 && (
                <div className="submenu-cards-section" style={{ marginTop: '40px' }}>
                  <div className="portals-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {subLinks.map((link, idx) => {
                      const isInternal = link.url.startsWith('/') || link.url.startsWith(window.location.origin)
                      const path = isInternal && link.url.startsWith('http') ? new URL(link.url).pathname : link.url
                      
                      return (
                        <div key={idx} className="portal-card" style={{ padding: '24px', textAlign: 'center' }}>
                          <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '16px' }}>{link.title}</h3>
                          {isInternal ? (
                            <Link to={path} className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                              {lang === 'ml' ? 'കൂടുതൽ അറിയുക' : 'Explore'}
                            </Link>
                          ) : (
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                              {lang === 'ml' ? 'കൂടുതൽ അറിയുക' : 'Explore'}
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Courses section */}
              {courses.length > 0 && (
                <div className="courses-section" style={{ marginTop: '50px' }}>
                  <h2 className="courses-section-title">
                    {lang === 'ml' ? 'കോഴ്സുകൾ' : 'Courses'}
                  </h2>
                  <div className="courses-list">
                    {courses.map(course => {
                      const embed = course._embedded || {}
                      const media = embed['wp:featuredmedia'] || []
                      const imgUrl = media.length > 0 ? media[0].source_url : null
                      return (
                        <Link key={course.id} to={`/${lang}/courses/${course.slug}`} className="course-card-link">
                          <article className="course-card">
                            {imgUrl && (
                              <div className="course-card-img">
                                <img src={imgUrl} alt={course.title?.rendered || ''} loading="lazy" />
                              </div>
                            )}
                            <div className="course-card-body">
                              <h3 className="course-card-title" dangerouslySetInnerHTML={{ __html: course.title?.rendered || '' }} />
                              {course.excerpt?.rendered && (
                                <p className="course-card-excerpt" dangerouslySetInnerHTML={{ __html: course.excerpt.rendered }} />
                              )}
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
              {coursesLoading && (
                <div className="courses-loading" style={{ marginTop: '50px', textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--muted)' }}>
                    {lang === 'ml' ? 'കോഴ്സുകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading courses...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default WordPressPage
