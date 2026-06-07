import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import { fetchDepartment, fetchFaculties, fetchGallery, stripHtml, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'

function DepartmentSingle() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const { setPageInfo } = usePageInfo()

  const [wpDept, setWpDept] = useState(null)
  const [faculties, setFaculties] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  const [galleryIdx, setGalleryIdx] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchDepartment(id, { lang }),
      fetchFaculties({ lang })
    ]).then(async ([deptData, facData]) => {
      if (cancelled) return
      if (deptData) setPageInfo({ id: deptData.id, postType: 'department', translationSlugs: await extractTranslationSlugs(deptData, 'department') })
      setWpDept(deptData)

      const rawGallery = deptData?.acf?.gallery
      let galleryIds = []
      if (rawGallery && rawGallery.length > 0) {
        galleryIds = rawGallery.map(g => (typeof g === 'object' ? g.ID || g.id : g)).filter(Boolean)
      }
      if (galleryIds.length > 0) {
        const items = await fetchGallery({ include: galleryIds.join(','), per_page: 50, lang })
        if (!cancelled) setGalleryItems(items)
      }

      const deptTermIds = deptData?.faculty_department || []
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
    })
    return () => { cancelled = true }
  }, [id, lang])

  const title = wpDept?.title?.rendered || wpDept?.title || ''
  const content = wpDept?.content?.rendered || wpDept?.content || ''

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
            {stripHtml(wpDept?.excerpt?.rendered || '')}
          </p>
        </div>
      </div>

      <main className="page-content dept-page">
        <div className="container">
          <div className="dept-layout">
            <div>
              <section id="overview" className="dept-section">
                <div className="section-head">
                  <h2>Overview</h2>
                </div>
                <div className="dept-content-body"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </section>

              {galleryItems.length > 0 && (
                <section className="dept-section">
                  <div className="section-head">
                    <h2>{lang === 'ml' ? 'ഗാലറി' : 'Gallery'}</h2>
                  </div>
                  <div className="dept-gallery-carousel">
                    <div className="dept-gallery-track" style={{ transform: `translateX(-${galleryIdx * 100}%)` }}>
                      {galleryItems.map(item => (
                        <Link
                          key={item.id}
                          to={lang === 'ml' ? `/gallery/${item.slug}` : `/${lang}/gallery/${item.slug}`}
                          className="dept-gallery-slide"
                        >
                          <div className="dept-gallery-img">
                            <img src={item.image} alt={item.title} loading="lazy" />
                          </div>
                          <div className="dept-gallery-overlay">
                            <h4>{item.title}</h4>
                            {item.desc && <p>{item.desc}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                    {galleryItems.length > 1 && (
                      <>
                        <button
                          className="dept-gallery-arrow dept-gallery-prev"
                          onClick={() => setGalleryIdx(i => (i === 0 ? galleryItems.length - 1 : i - 1))}
                        >
                          &#8249;
                        </button>
                        <button
                          className="dept-gallery-arrow dept-gallery-next"
                          onClick={() => setGalleryIdx(i => (i === galleryItems.length - 1 ? 0 : i + 1))}
                        >
                          &#8250;
                        </button>
                        <div className="dept-gallery-dots">
                          {galleryItems.map((_, i) => (
                            <button
                              key={i}
                              className={`dept-gallery-dot${i === galleryIdx ? ' active' : ''}`}
                              onClick={() => setGalleryIdx(i)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

            </div>

            <aside className="dept-sidebar">
              <div className="dept-sidebar-widget">
                <h3 className="dept-sidebar-title">
                  {stripHtml(title)} Faculties
                </h3>
                {faculties.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No faculty information available.</p>
                )}
                {faculties.map(f => {
                  const name = stripHtml(f.title?.rendered || f.title || '')
                  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  const role = f.meta?.designation || f.acf?.designation || (f.excerpt?.rendered ? stripHtml(f.excerpt.rendered).slice(0, 50) : 'Faculty Member')
                  const img = f._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                    <div key={f.id} className="dept-faculty-item">
                      {img ? (
                        <div className="dept-faculty-avatar">
                          <img src={img} alt={name} />
                        </div>
                      ) : (
                        <div className="dept-faculty-avatar">{initials}</div>
                      )}
                      <div>
                        <h5 className="dept-faculty-name">{name}</h5>
                        <p className="dept-faculty-role">{role}</p>
                      </div>
                    </div>
                  )
                })}
                <a href="#" className="btn btn-small dept-sidebar-widget-btn">View All Faculty</a>
              </div>


            </aside>
          </div>
        </div>
      </main>
    </>
  )
}

export default DepartmentSingle
