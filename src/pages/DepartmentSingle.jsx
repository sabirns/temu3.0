import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import { fetchDepartment, fetchFaculties, fetchActivities, fetchCourses, fetchFacultyDepartment, fetchGallery, stripHtml, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import '../styles/pages.css'

function DepartmentSingle() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const { setPageInfo } = usePageInfo()

  const [wpDept, setWpDept] = useState(null)
  const [faculties, setFaculties] = useState([])
  const [activities, setActivities] = useState([])
  const [courses, setCourses] = useState([])
  const [deptTermSlug, setDeptTermSlug] = useState('')
  const [showFullContent, setShowFullContent] = useState(false)
  const [contentOverflows, setContentOverflows] = useState(false)
  const contentRef = useRef(null)
  const [galleryItems, setGalleryItems] = useState([])
  const overviewRef = useRef(null)

  const title = wpDept?.title?.rendered || wpDept?.title || ''
  const content = wpDept?.content?.rendered || wpDept?.content || ''

  useEffect(() => {
    let cancelled = false

    fetchDepartment(id, { lang }).then(deptData => {
      if (cancelled || !deptData) return
      setWpDept(deptData)

      const deptTermIds = deptData.faculty_department || []
      const rawGallery = deptData.acf?.gallery
      const galleryIds = rawGallery && rawGallery.length > 0
        ? rawGallery.map(g => (typeof g === 'object' ? g.ID || g.id : g)).filter(Boolean)
        : []

      Promise.all([
        fetchFaculties({ lang }),
        deptTermIds.length > 0 ? fetchActivities({ faculty_department: deptTermIds[0], lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchCourses({ faculty_department: deptTermIds[0], lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchFacultyDepartment(deptTermIds[0]) : Promise.resolve(null),
        galleryIds.length > 0 ? fetchGallery({ include: galleryIds.join(','), per_page: 50, lang }) : Promise.resolve([]),
        extractTranslationSlugs(deptData, 'department')
      ]).then(([facData, actData, courseData, termData, galleryData, slugs]) => {
        if (cancelled) return

        const filtered = deptTermIds.length > 0
          ? facData.filter(f => {
              const fTerms = (f._embedded?.['wp:term'] || []).flat().filter(t => t.taxonomy === 'faculty_department')
              if (fTerms.length > 0) return fTerms.some(t => deptTermIds.includes(t.id))
              if (f.faculty_department && Array.isArray(f.faculty_department)) {
                return f.faculty_department.some(fid => deptTermIds.includes(Number(fid)))
              }
              return false
            })
          : []

        setFaculties(filtered)
        setActivities(actData)
        setCourses(courseData)
        if (termData?.slug) setDeptTermSlug(termData.slug)
        if (galleryData.length > 0) setGalleryItems(galleryData)
        setPageInfo({ id: deptData.id, postType: 'department', translationSlugs: slugs })
      })
    })

    return () => { cancelled = true }
  }, [id, lang])

  useEffect(() => {
    if (contentRef.current) {
      setContentOverflows(contentRef.current.scrollHeight > 500)
    }
  }, [content])

  useEffect(() => {
    if (!showFullContent && contentOverflows) {
      overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showFullContent])

  const imageGalleries = galleryItems.filter(g => !g.galleryCategory || g.galleryCategory.length === 0 || g.galleryCategory.some(c => c === 43 || c === 160))
  const videoGalleries = galleryItems.filter(g => g.galleryCategory && g.galleryCategory.length > 0 && g.galleryCategory.some(c => c === 44 || c === 162))

  return (
    <>
      <div className="dept-hero">
        <div className="dept-hero-bg" />
        <div className="container dept-hero-content">
          <span className="dept-breadcrumb">
            Academics / Schools
          </span>
          <h1 className="dept-title">{stripHtml(title)}</h1>
          <p className="dept-excerpt">
            {(() => {
              const text = stripHtml(wpDept?.excerpt?.rendered || '')
              return text.length > 200 ? text.slice(0, 200) + '...' : text
            })()}
          </p>
        </div>
      </div>

      <main className="page-content dept-page">
        <div className="container">
          <div className="dept-layout">
            <div>
              <section id="overview" ref={overviewRef} className="dept-section">
                <div ref={contentRef} className="dept-content-body" style={{ maxHeight: showFullContent ? 'none' : '500px', overflow: 'hidden', position: 'relative' }}>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                  {!showFullContent && contentOverflows && (
                    <div className="dept-content-fade" />
                  )}
                </div>
                {contentOverflows && (
                  <button onClick={() => setShowFullContent(p => !p)} className="dept-readmore-btn">
                    {showFullContent ? (lang === 'ml' ? 'കുറവ് കാണുക' : 'Show less') : (lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read more')}
                  </button>
                )}
              </section>

              {imageGalleries.length > 0 && (
                <section className="dept-gallery-section">
                  <div className="dept-gallery-header">
                    <h2>{lang === 'ml' ? 'ഫോട്ടോ ഗാലറി' : 'Photo Gallery'}</h2>
                    <Link to={lang === 'ml' ? '/gallery' : `/${lang}/gallery`}>View All →</Link>
                  </div>
                  <GalleryCarousel items={imageGalleries} lang={lang} />
                </section>
              )}
              {videoGalleries.length > 0 && (
                <section className="dept-gallery-section">
                  <div className="dept-gallery-header">
                    <h2>{lang === 'ml' ? 'വീഡിയോ ഗാലറി' : 'Video Gallery'}</h2>
                    <Link to={lang === 'ml' ? '/gallery' : `/${lang}/gallery`}>View All →</Link>
                  </div>
                  <GalleryCarousel items={videoGalleries} lang={lang} isVideo />
                </section>
              )}

            </div>

            <aside className="dept-sidebar">
              <div className="side-card" style={{ padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow2)', border: '1px solid var(--stroke)', background: 'var(--card)', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--secondary)', fontSize: '20px', borderBottom: '1px solid var(--stroke)', paddingBottom: '12px', marginBottom: '20px' }}>
                  {stripHtml(title)} {lang === 'ml' ? 'ഫാക്കൽറ്റി അംഗങ്ങൾ' : 'Faculty Members'}
                </h3>
                {faculties.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{lang === 'ml' ? 'ഫാക്കൽറ്റി വിവരങ്ങൾ ലഭ്യമല്ല.' : 'No faculty information available.'}</p>
                )}
                {faculties.map(f => {
                  const name = stripHtml(f.title?.rendered || f.title || '')
                  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  const role = f.meta?.designation || f.acf?.designation || (f.excerpt?.rendered ? stripHtml(f.excerpt.rendered).slice(0, 50) : 'Faculty Member')
                  const img = f._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                    <div key={f.id} className="faculty-item" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                      {img ? (
                        <div className="faculty-avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="faculty-avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>{initials}</div>
                      )}
                      <div className="faculty-info">
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{name}</h5>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>{role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="side-card" style={{ padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow2)', border: '1px solid var(--stroke)', background: 'var(--card)', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--secondary)', fontSize: '20px', borderBottom: '1px solid var(--stroke)', paddingBottom: '12px', marginBottom: '20px' }}>
                  {lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Activities'}
                </h3>
                {activities.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ ലഭ്യമല്ല.' : 'No activities available.'}</p>
                )}
                {activities.slice(0, 4).map(act => {
                  const actImg = act._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                  <Link key={act.id} to={`/${lang}/activity/${act.slug}`} className="activity-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' }}>
                    {actImg ? (
                      <div className="activity-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={actImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className="activity-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--stroke)', flexShrink: 0 }} />
                    )}
                    <div className="activity-content">
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{stripHtml(act.title?.rendered || act.title || '')}</h5>
                      {act.excerpt?.rendered && (
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>{stripHtml(act.excerpt.rendered).slice(0, 80)}</p>
                      )}
                    </div>
                  </Link>
                  )
                })}
                <Link to={`/${lang}/activities/department/${deptTermSlug}`} className="btn btn-small" style={{ width: '100%', justifyContent: 'center', marginTop: '15px' }}>{lang === 'ml' ? 'എല്ലാ പ്രവർത്തനങ്ങളും കാണുക' : 'View All Activities'}</Link>
              </div>

              <div className="side-card" style={{ padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow2)', border: '1px solid var(--stroke)', background: 'var(--card)', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: 'var(--secondary)', fontSize: '20px', borderBottom: '1px solid var(--stroke)', paddingBottom: '12px', marginBottom: '20px' }}>
                  {lang === 'ml' ? 'കോഴ്സുകൾ' : 'Courses'}
                </h3>
                {courses.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{lang === 'ml' ? 'കോഴ്സുകൾ ലഭ്യമല്ല.' : 'No courses available.'}</p>
                )}
                {courses.slice(0, 4).map(course => {
                  const courseImg = course._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                  <Link key={course.id} to={`/${lang}/courses/${course.slug}`} className="activity-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px', textDecoration: 'none', color: 'inherit' }}>
                    {courseImg ? (
                      <div className="activity-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={courseImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className="activity-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--stroke)', flexShrink: 0 }} />
                    )}
                    <div className="activity-content">
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{stripHtml(course.title?.rendered || course.title || '')}</h5>
                      {course.excerpt?.rendered && (
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--muted)' }}>{stripHtml(course.excerpt.rendered).slice(0, 80)}</p>
                      )}
                    </div>
                  </Link>
                  )
                })}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function GalleryCarousel({ items, lang, isVideo }) {
  const [pos, setPos] = useState(0)
  const [activeVideo, setActiveVideo] = useState(null)
  const step = 270

  return (
    <div>
      <div className="dept-gallery-carousel-wrap">
        <div className="dept-gallery-track" style={{ transform: `translateX(-${pos}px)` }}>
          {items.map(item => {
            const embedUrl = getYoutubeEmbedUrl(item.video)
            const linkTo = lang === 'ml' ? `/gallery/${item.slug}` : `/${lang}/gallery/${item.slug}`
            return (
              <div key={item.id} className="dept-gallery-card" style={{ cursor: embedUrl ? 'pointer' : undefined }}>
                {embedUrl ? (
                  <div style={{ width: '100%', height: '100%' }} onClick={() => setActiveVideo(embedUrl)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setActiveVideo(embedUrl)}>
                    <img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="dept-gallery-play">
                      <div className="dept-gallery-play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
                      </div>
                    </div>
                    <div className="dept-gallery-card-overlay">
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                ) : (
                  <Link to={linkTo} style={{ width: '100%', height: '100%', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isVideo && (
                      <div className="dept-gallery-play">
                        <div className="dept-gallery-play-btn">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
                        </div>
                      </div>
                    )}
                    <div className="dept-gallery-card-overlay">
                      <h3>{item.title}</h3>
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {items.length > 0 && (
        <div className="dept-gallery-controls">
          <button className="dept-gallery-arrow" onClick={() => setPos(p => Math.max(0, p - step))}>&#8249;</button>
          <button className="dept-gallery-arrow" onClick={() => setPos(p => Math.min(Math.max(0, items.length - 2) * step, p + step))}>&#8250;</button>
        </div>
      )}
      {activeVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setActiveVideo(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', aspectRatio: '16/9' }}>
            <iframe src={activeVideo} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }} allow="autoplay; encrypted-media" allowFullScreen />
            <button onClick={() => setActiveVideo(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentSingle
