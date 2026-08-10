import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import { fetchDepartment, fetchDepartments, fetchFaculties, fetchActivities, fetchCourses, fetchStudents, fetchFacultyDepartment, fetchFacultyDepartments, fetchGallery, stripHtml, getLanguageContext, extractTranslationSlugs, getFacultyProfileUrl } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import GutenbergContent from '../components/GutenbergContent'
import '../styles/pages.css'
import '../styles/department-modern.css'

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
  const [students, setStudents] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [openGroups, setOpenGroups] = useState({ about: true })
  const [openActivityId, setOpenActivityId] = useState(null)
  const [expandedContentId, setExpandedContentId] = useState(null)
  const overviewRef = useRef(null)
  const [termDepartments, setTermDepartments] = useState(null)
  const [currentTerm, setCurrentTerm] = useState(null)
  const [termNotFound, setTermNotFound] = useState(false)
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0)

  const title = wpDept?.title?.rendered || wpDept?.title || ''
  const content = wpDept?.acf?.overview || wpDept?.content?.rendered || wpDept?.content || ''

  const isTermRoute = id.startsWith('term-')

  useEffect(() => {
    let cancelled = false

    // Reset state when id or lang changes
    setWpDept(null)
    setTermDepartments(null)
    setCurrentTerm(null)
    setTermNotFound(false)
    setFaculties([])
    setActivities([])
    setCourses([])
    setStudents([])
    setGalleryItems([])

    async function load() {
      if (isTermRoute) {
        const termId = id.replace('term-', '')
        const term = await fetchFacultyDepartment(termId)
        if (cancelled) return
        if (!term) { setTermNotFound(true); return }
        setCurrentTerm(term)
        
        const allTerms = await fetchFacultyDepartments({ lang, per_page: 100 })
        if (cancelled) return
        const childTermIds = allTerms.filter(t => t.parent === Number(termId)).map(t => t.id)
        const allRelevantTermIds = [Number(termId), ...childTermIds].join(',')

        const depts = await fetchDepartments({ faculty_department: allRelevantTermIds, lang, per_page: 50 })
        if (cancelled) return
        setTermDepartments(depts)
        return
      }

      const deptData = await fetchDepartment(id, { lang })
      if (cancelled || !deptData) return
      setWpDept(deptData)

      const deptTermIds = deptData.faculty_department || []
      const rawGallery = deptData.acf?.gallery
      const galleryIds = rawGallery && rawGallery.length > 0
        ? rawGallery.map(g => (typeof g === 'object' ? g.ID || g.id : g)).filter(Boolean)
        : []

      const [facData, actData, courseData, termData, galleryData, termGalleryData, studentData, slugs] = await Promise.all([
        fetchFaculties({ lang }),
        deptTermIds.length > 0 ? fetchActivities({ faculty_department: deptTermIds[0], lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchCourses({ faculty_department: deptTermIds[0], lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchFacultyDepartment(deptTermIds[0]) : Promise.resolve(null),
        galleryIds.length > 0 ? fetchGallery({ include: galleryIds.join(','), per_page: 50, lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchGallery({ faculty_department: deptTermIds[0], per_page: 50, lang }) : Promise.resolve([]),
        deptTermIds.length > 0 ? fetchStudents({ faculty_department: deptTermIds[0], lang }) : Promise.resolve([]),
        extractTranslationSlugs(deptData, 'department')
      ])
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
      setStudents(studentData)
      if (termData?.slug) setDeptTermSlug(termData.slug)
      
      const mergedGallery = [...galleryData, ...termGalleryData]
      const uniqueGallery = Array.from(new Map(mergedGallery.map(item => [item.id, item])).values())
      if (uniqueGallery.length > 0) setGalleryItems(uniqueGallery)
      setPageInfo({ id: deptData.id, postType: 'department', translationSlugs: slugs })
    }

    load()
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

  let imageGallerySlides = imageGalleries.map(g => g.image).filter(Boolean).slice(0, 5);

  useEffect(() => {
    if (activeTab !== 'overview' || imageGallerySlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentGallerySlide(prev => (prev + 1) % imageGallerySlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [activeTab, imageGallerySlides.length])

  if (isTermRoute && termNotFound) {
    return (
      <main className="page-content departments-page">
        <div className="container">
          <p style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            {lang === 'ml' ? 'ഫാക്കൽറ്റി കണ്ടെത്തിയില്ല' : 'Faculty department not found'}
          </p>
        </div>
      </main>
    )
  }

  if (isTermRoute && !termDepartments) {
    return (
      <main className="page-content departments-page">
        <div className="container">
          <div className="departments-header">
            <div className="department-skeleton" style={{ height: '32px', width: '60%', marginBottom: '12px' }} />
            <div className="department-skeleton" style={{ height: '18px', width: '40%' }} />
          </div>
          <div className="departments-grid">
            {[1, 2, 3].map(i => <div key={i} className="department-skeleton" />)}
          </div>
        </div>
      </main>
    )
  }

  if (termDepartments && currentTerm) {
    const termCta = lang === 'en' ? 'View Details →' : 'വിശദാംഗങ്ങൾ കാണുക →'
    const backText = lang === 'en' ? '← Back to Schools & Departments' : '← സ്കൂളുകളിലേക്കും വിഭാഗങ്ങളിലേക്കും'
    return (
      <main className="page-content departments-page">
        <div className="container">
          <Link to={`/${lang}/departments`} className="back-link" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{backText}</Link>
          <div className="departments-header">
            <h1 className="departments-title">{stripHtml(currentTerm.name)}</h1>
            {currentTerm.description && (
              <p className="departments-subtitle">{stripHtml(currentTerm.description)}</p>
            )}
          </div>
          <div className="departments-grid">
            {termDepartments.map(dept => (
              <div key={dept.id} className="department-card-wrapper">
                <Link className="department-card" to={`/${lang}/department/${dept.slug}`}>
                  <h3 className="department-card-title">
                    {stripHtml(dept.title?.rendered || dept.title || '')}
                  </h3>
                  {dept.excerpt?.rendered && (
                    <p className="department-card-excerpt">{stripHtml(dept.excerpt.rendered).slice(0, 120)}</p>
                  )}
                  <span className="department-card-link">{termCta}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="page-shell-modern">
      <aside className="department-hero-modern">
        <div className="hero-inner-modern">
          <div className="hero-content-modern">
            <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '16px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', flexWrap: 'wrap' }}>
              <Link to={`/${lang}`} style={{ color: 'inherit', textDecoration: 'none' }}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
              <span>/</span>
              <Link to={`/${lang}/departments`} style={{ color: 'inherit', textDecoration: 'none' }}>{lang === 'ml' ? 'പഠനസ്കൂളുകൾ' : 'Departments'}</Link>
              <span>/</span>
              <span style={{ color: '#ffd700', fontWeight: '600' }}>{stripHtml(title)}</span>
            </nav>
            <h1>{stripHtml(title)}</h1>
            <figure className="department-visual">
              <img
                src={wpDept?._embedded?.['wp:featuredmedia']?.[0]?.source_url || "/images/department-banner.webp"}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <figcaption className="department-banner-desc">
                {(() => {
                  const text = stripHtml(wpDept?.excerpt?.rendered || '')
                  return text.length > 200 ? text.slice(0, 200) + '...' : text
                })()}
              </figcaption>
            </figure>
          </div>

          <div className="hero-footer-modern">
            <nav className="hero-nav-modern-accordion">
              {[
                {
                  id: 'about',
                  title: lang === 'ml' ? 'സ്കൂളിനെക്കുറിച്ച്' : 'About the School',
                  items: [
                    { id: 'overview', title: lang === 'ml' ? 'അവലോകനം' : 'Overview' },
                    { id: 'highlights', title: lang === 'ml' ? 'സ്കൂൾ സവിശേഷതകൾ' : 'School Highlights' },
                    { id: 'programs', title: lang === 'ml' ? 'പ്രോഗ്രാമുകൾ' : 'Programmes' },
                    { id: 'faculty', title: lang === 'ml' ? 'ഫാക്കൽറ്റി പ്രൊഫൈൽ' : 'Faculty Profile' },
                    { id: 'facilities', title: lang === 'ml' ? 'അടിസ്ഥാനസൗകര്യങ്ങളും സംവിധാനങ്ങളും' : 'Infrastructure & Facilities' },
                  ]
                },
                {
                  id: 'curriculum',
                  title: lang === 'ml' ? 'പാഠ്യപദ്ധതി' : 'Curriculum',
                  items: [
                    { id: 'curriculum_ba_bsc', title: lang === 'ml' ? 'ബി.എ / ബി.എസ്.സി' : 'BA / BSc' },
                    { id: 'curriculum_ma_msc', title: lang === 'ml' ? 'എം.എ / എം.എസ്.സി' : 'MA / MSc' },
                    { id: 'curriculum_phd', title: lang === 'ml' ? 'പിഎച്ച്.ഡി' : 'PhD' },
                    { id: 'curriculum_po_pso', title: lang === 'ml' ? 'പി.ഒ & പി.എസ്.ഒ' : 'PO & PSO' },
                  ]
                },
                {
                  id: 'research',
                  title: lang === 'ml' ? 'ഗവേഷണം' : 'Research',
                  items: [
                    { id: 'research_thrust', title: lang === 'ml' ? 'പ്രധാന ഗവേഷണ മേഖലകൾ' : 'Thrust Areas' },
                    { id: 'research_publications', title: lang === 'ml' ? 'വിദ്യാർത്ഥി പ്രസിദ്ധീകരണങ്ങൾ' : 'Student Publications' },
                    { id: 'projects', title: lang === 'ml' ? 'ഗവേഷണ പ്രോജക്റ്റുകൾ' : 'Research Projects' },
                  ]
                },
                {
                  id: 'activities',
                  title: lang === 'ml' ? 'വിഭാഗത്തിലെ പ്രവർത്തനങ്ങൾ' : 'Department Activities',
                  items: [
                    { id: 'activities_seminars', title: lang === 'ml' ? 'സെമിനാറുകൾ / പ്രഭാഷണങ്ങൾ / പരിശീലനങ്ങൾ' : 'Seminars / Talks / Training Programs' },
                    { id: 'activities_awards', title: lang === 'ml' ? 'അവാർഡുകളും അംഗീകാരങ്ങളും' : 'Awards & Recognition' },
                    { id: 'activities_workshops', title: lang === 'ml' ? 'വർക്ക്‌ഷോപ്പുകൾ / സ്‌കിൽ പ്രോഗ്രാമുകൾ' : 'Workshops / Student Development Programs' },
                    { id: 'activities_best_practices', title: lang === 'ml' ? 'മികച്ച മാതൃകകൾ' : 'Best Practices' },
                    { id: 'activities_extension', title: lang === 'ml' ? 'സാമൂഹിക വിപുലീകരണ പ്രവർത്തനങ്ങൾ' : 'Social Extension Activities' },
                    { id: 'activities_field_visits', title: lang === 'ml' ? 'ഫീൽഡ് സന്ദർശനങ്ങൾ' : 'Field Visits' },
                    { id: 'activities_events', title: lang === 'ml' ? 'വിഭാഗത്തിലെ പ്രധാന പരിപാടികൾ' : 'Department Events' },
                    { id: 'activities_mous', title: lang === 'ml' ? 'ധാരണാപത്രങ്ങൾ (MoUs)' : 'MoUs' },
                    { id: 'activities_addon_courses', title: lang === 'ml' ? 'ആഡ്-ഓൺ കോഴ്‌സുകൾ / ഓൺലൈൻ കോഴ്‌സുകൾ' : 'Add-on Courses / Online Courses' },
                  ]
                },
                {
                  id: 'student_projects',
                  title: lang === 'ml' ? 'വിദ്യാർത്ഥി പ്രോജക്റ്റുകൾ' : 'Student Projects',
                  isSingle: true,
                  tabId: 'student_projects'
                },
                {
                  id: 'achievements',
                  title: lang === 'ml' ? 'നേട്ടങ്ങൾ' : 'Achievements',
                  items: [
                    { id: 'student_achievements', title: lang === 'ml' ? 'വിദ്യാർത്ഥികളുടെ നേട്ടങ്ങൾ' : 'Student Achievements' },
                    { id: 'faculty_achievements', title: lang === 'ml' ? 'ഫാക്കൽറ്റിയുടെ നേട്ടങ്ങൾ' : 'Faculty Achievements' },
                    { id: 'awards_grants', title: lang === 'ml' ? 'അവാർഡുകൾ / ഗ്രാന്റുകൾ' : 'Awards / Recognitions / Grants' },
                    { id: 'scholarships', title: lang === 'ml' ? 'സ്‌കോളർഷിപ്പുകൾ' : 'Scholarships' },
                  ]
                },
                {
                  id: 'resources_contact',
                  title: lang === 'ml' ? 'വിഭവങ്ങളും ബന്ധപ്പെടലും' : 'Resources & Contact',
                  items: [
                    { id: 'placement_career', title: lang === 'ml' ? 'പ്ലേസ്‌മെന്റ് & കരിയർ സപ്പോർട്ട്' : 'Placement & Career Support' },
                  ]
                }
              ].map((group) => {
                if (group.isSingle) {
                  const isActive = activeTab === group.tabId
                  return (
                    <div key={group.id} className={`hero-nav-group ${isActive ? 'open' : ''}`}>
                      <button
                        className={`hero-nav-group-header ${isActive ? 'single-active' : ''}`}
                        onClick={() => setActiveTab(group.tabId)}
                      >
                        <span>{group.title}</span>
                      </button>
                    </div>
                  )
                }

                const isOpen = !!openGroups[group.id]
                const hasActiveChild = group.items?.some(it => it.id === activeTab)

                return (
                  <div key={group.id} className={`hero-nav-group ${isOpen ? 'open' : ''}`}>
                    <button
                      className={`hero-nav-group-header ${hasActiveChild && !isOpen ? 'single-active' : ''}`}
                      onClick={() => setOpenGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                    >
                      <span>{group.title}</span>
                      <span className="group-arrow" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {isOpen ? (
                            <path d="M2.25 6H9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          ) : (
                            <path d="M6 2.25V9.75M2.25 6H9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          )}
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="hero-nav-group-items">
                        {group.items.map((item, idx) => {
                          const isLast = idx === group.items.length - 1
                          const isItemActive = activeTab === item.id
                          return (
                            <button
                              key={item.id}
                              className={`hero-nav-item-btn ${isItemActive ? 'active' : ''}`}
                              onClick={() => setActiveTab(item.id)}
                            >
                              <span className="tree-prefix">{isLast ? '└──' : '├──'}</span>
                              <span>{item.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>

      <section className="content-panel-modern">
        <div className="content-wrap-modern">
          {activeTab === 'overview' && (
            <div className="content-section-modern">
              {imageGallerySlides.length > 0 && (
                <div className="dept-overview-slider-container">
                  <div className="dept-overview-slider-track" style={{ transform: `translateX(-${currentGallerySlide * 100}%)` }}>
                    {imageGallerySlides.map((src, index) => (
                      <div key={index} className="dept-overview-slider-slide">
                        <img src={src} alt={`Gallery slide ${index + 1}`} className="dept-overview-slider-image" />
                      </div>
                    ))}
                  </div>
                  {imageGallerySlides.length > 1 && (
                    <div className="dept-overview-slider-dots">
                      {imageGallerySlides.map((_, index) => (
                        <button 
                          key={index} 
                          onClick={() => setCurrentGallerySlide(index)}
                          className={`dept-overview-slider-dot ${index === currentGallerySlide ? 'active' : ''}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <h2 style={{ fontSize: '28px', color: 'var(--navy-900)', marginBottom: '24px' }}>
                {lang === 'ml' ? 'അവലോകനം' : 'Overview'}
              </h2>

              <div ref={contentRef} style={{ maxHeight: showFullContent ? 'none' : '500px', overflow: 'hidden', position: 'relative' }}>
                <GutenbergContent html={content} />
                {!showFullContent && contentOverflows && (
                  <div className="dept-content-fade" />
                )}
              </div>
              {contentOverflows && (
                <button onClick={() => setShowFullContent(p => !p)} className="btn btn-small" style={{ marginTop: '20px' }}>
                  {showFullContent ? (lang === 'ml' ? 'കുറവ് കാണുക' : 'Show less') : (lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read more')}
                </button>
              )}
            </div>
          )}

          {activeTab === 'highlights' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'സ്കൂൾ സവിശേഷതകൾ' : 'School Highlights'}
              </h2>
              <div className="dept-info-card">
                <h3>{stripHtml(title)}</h3>
                <p>{stripHtml(wpDept?.excerpt?.rendered || content || '')}</p>
                <div className="dept-info-badge-grid">
                  <div className="dept-info-badge">
                    <span>📚</span>
                    <div>
                      <div>{courses.length}</div>
                      <small style={{ color: 'var(--muted-mod)', fontWeight: 400 }}>{lang === 'ml' ? 'പ്രോഗ്രാമുകൾ' : 'Programmes'}</small>
                    </div>
                  </div>
                  <div className="dept-info-badge">
                    <span>👨‍🏫</span>
                    <div>
                      <div>{faculties.length}</div>
                      <small style={{ color: 'var(--muted-mod)', fontWeight: 400 }}>{lang === 'ml' ? 'ഫാക്കൽറ്റി അംഗങ്ങൾ' : 'Faculty Members'}</small>
                    </div>
                  </div>
                  <div className="dept-info-badge">
                    <span>🎯</span>
                    <div>
                      <div>{activities.length}</div>
                      <small style={{ color: 'var(--muted-mod)', fontWeight: 400 }}>{lang === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Activities'}</small>
                    </div>
                  </div>
                  <div className="dept-info-badge">
                    <span>🔬</span>
                    <div>
                      <div>{wpDept?.acf?.projects?.length || 0}</div>
                      <small style={{ color: 'var(--muted-mod)', fontWeight: 400 }}>{lang === 'ml' ? 'പ്രോജക്ടുകൾ' : 'Research Projects'}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facilities' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'അടിസ്ഥാനസൗകര്യങ്ങളും സംവിധാനങ്ങളും' : 'Infrastructure & Facilities'}
              </h2>
              {wpDept?.acf?.facilities?.length > 0 ? (
                <FacilitiesAccordion items={wpDept.acf.facilities} lang={lang} />
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'വിഭാഗത്തിലെ പ്രധാന ലാബുകൾ, ലൈബ്രറികൾ, ഗവേഷണ സൗകര്യങ്ങൾ എന്നിവ ഇവിടെ കാണാം.' : 'Details on department laboratories, library resources, smart classrooms, and research equipment.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (imageGalleries.length > 0 || videoGalleries.length > 0) && (
            <div className="content-section-modern">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--navy-900)' }}>{lang === 'ml' ? 'ഫോട്ടോ ഗാലറി' : 'Photo Gallery'}</h2>
                <Link to={lang === 'ml' ? '/gallery' : `/${lang}/gallery`} className="btn btn-small">View All →</Link>
              </div>
              
              {imageGalleries.length > 0 && (
                <div style={{ marginBottom: videoGalleries.length > 0 ? '40px' : '0' }}>
                  <GalleryCarousel items={imageGalleries} lang={lang} />
                </div>
              )}

              {videoGalleries.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'വീഡിയോ ഗാലറി' : 'Video Gallery'}</h3>
                  <GalleryCarousel items={videoGalleries} lang={lang} isVideo />
                </div>
              )}
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'പ്രോഗ്രാമുകൾ' : 'Programmes'}</h2>
              {courses.length === 0 && (
                <p style={{ color: 'var(--muted-mod)', fontSize: '14px' }}>{lang === 'ml' ? 'പ്രോഗ്രാമുകൾ ലഭ്യമല്ല.' : 'No programs available.'}</p>
              )}
              <div className="modern-program-grid" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                {courses.map(course => {
                  const courseImg = course._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                    <div key={course.id} className="modern-program-card">
                      <Link to={`/${lang}/courses/${course.slug}`} className="modern-program-link">
                        {courseImg ? (
                          <img src={courseImg} alt="" className="modern-program-image" />
                        ) : (
                          <div className="modern-program-image-fallback"></div>
                        )}
                        <div className="modern-program-content">
                          <h5>{stripHtml(course.title?.rendered || course.title || '')}</h5>
                          {course.excerpt?.rendered && (
                            <p>{stripHtml(course.excerpt.rendered).slice(0, 100)}...</p>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(activeTab === 'curriculum_ba_bsc' || activeTab === 'curriculum_ma_msc' || activeTab === 'curriculum_phd') && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {activeTab === 'curriculum_ba_bsc' ? (lang === 'ml' ? 'ബി.എ / ബി.എസ്.സി പാഠ്യപദ്ധതി' : 'BA / BSc Programmes') :
                 activeTab === 'curriculum_ma_msc' ? (lang === 'ml' ? 'എം.എ / എം.എസ്.സി പാഠ്യപദ്ധതി' : 'MA / MSc Programmes') :
                 (lang === 'ml' ? 'പിഎച്ച്.ഡി ഗവേഷണ പ്രോഗ്രാമുകൾ' : 'PhD Research Programmes')}
              </h2>
              {courses.length > 0 ? (
                <div className="modern-program-grid" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                  {courses.map(course => {
                    const courseImg = course._embedded?.['wp:featuredmedia']?.[0]?.source_url
                    return (
                      <div key={course.id} className="modern-program-card">
                        <Link to={`/${lang}/courses/${course.slug}`} className="modern-program-link">
                          {courseImg ? <img src={courseImg} alt="" className="modern-program-image" /> : <div className="modern-program-image-fallback"></div>}
                          <div className="modern-program-content">
                            <h5>{stripHtml(course.title?.rendered || course.title || '')}</h5>
                            {course.excerpt?.rendered && <p>{stripHtml(course.excerpt.rendered).slice(0, 100)}...</p>}
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'ഈ വിഭാഗത്തിലെ പഠന കോഴ്‌സുകളുടെയും ക്രെഡിറ്റ് ഘടനകളുടെയും വിവരങ്ങൾ ലഭ്യമാണ്.' : 'Curriculum structure, semester-wise credit layout, and syllabus specifications for this programme.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'curriculum_po_pso' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'പി.ഒ & പി.എസ്.ഒ (കോഴ്സ് ലക്ഷ്യങ്ങൾ) & സിലബസ്' : 'PO & PSO (Program Outcomes) & Syllabus'}
              </h2>
              {wpDept?.acf?.syllabus?.length > 0 ? (
                <div className="modern-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{lang === 'ml' ? 'ക്ര.നം.' : 'Sl. No'}</th>
                        <th>{lang === 'ml' ? 'ശീർഷകം' : 'Title'}</th>
                        <th>{lang === 'ml' ? 'ഫയൽ' : 'File'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wpDept.acf.syllabus.map((item, idx) => {
                        const fileUrl = typeof item.file === 'object' ? item.file?.url : item.file;
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.title}</td>
                            <td>
                              {fileUrl && (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-small" style={{ display: 'inline-block' }}>
                                  {lang === 'ml' ? 'ഡൗൺലോഡ് ചെയ്യുക' : 'Download'}
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'പ്രോഗ്രാം ലക്‌ഷ്യങ്ങളും (PO) കോഴ്‌സ് ഔട്ട്‌കം വിവരങ്ങളും സിലബസ് കോപ്പികളും ഇവിടെ ലഭ്യമാണ്.' : 'Detailed documentation of Program Outcomes (PO), Program Specific Outcomes (PSO), and course syllabus documents.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'research_thrust' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'പ്രധാന ഗവേഷണ മേഖലകൾ' : 'Thrust Areas of Research'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'സ്കൂളിൽ നടക്കുന്ന പ്രധാന അന്തർവൈജ്ഞാനിക ഗവേഷണ മേഖലകളും പദ്ധതികളും.' : 'Primary interdisciplinary research domains, key focus areas, and institutional research priorities.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'research_publications' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'വിദ്യാർത്ഥി പ്രസിദ്ധീകരണങ്ങൾ' : 'Student & Scholar Publications'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'വിദ്യാർത്ഥികളും ഗവേഷകരും പ്രസിദ്ധീകരിച്ച റിസർച്ച് പേപ്പറുകളും ബുക്കുകളും.' : 'Peer-reviewed research articles, books, conference proceedings, and publications authored by department scholars.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'ഗവേഷണ പ്രോജക്റ്റുകൾ' : 'Research Projects'}</h2>
              {wpDept?.acf?.projects?.length > 0 ? (
                <div className="modern-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{lang === 'ml' ? 'ക്ര.നം.' : 'Sl. No'}</th>
                        <th>{lang === 'ml' ? 'PI/ Co-PI/ പേര്' : 'Name of the PI/ Co-PI/Name of the person holding the Chair'}</th>
                        <th>{lang === 'ml' ? 'ഗവേഷണ പ്രോജക്ടിന്റെ ശീർഷകം' : 'Title of the research project, endowments, Research Chairs'}</th>
                        <th>{lang === 'ml' ? 'ഫണ്ടിംഗ് ഏജൻസി' : 'Name of the funding agency'}</th>
                        <th>{lang === 'ml' ? 'കാലാവധി' : 'Duration'}</th>
                        <th>{lang === 'ml' ? 'അനുവദിച്ച വർഷം' : 'Year of award or sanction'}</th>
                        <th>{lang === 'ml' ? 'തുക (₹)' : 'Amount (Rs.)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wpDept.acf.projects.map((proj, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{proj.name}</td>
                          <td>{proj.project_title}</td>
                          <td>{proj.name_of_the_funding_agency}</td>
                          <td>{proj.duration}</td>
                          <td>{proj.year_of_award_or_sanction}</td>
                          <td>{proj.amount_rs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'ദേശീയ-അന്തർദേശീയ ഫണ്ടിംഗ് ഏജൻസികളുടെ സാമ്പത്തിക സഹായത്തോടെ നടക്കുന്ന പ്രോജക്റ്റുകൾ.' : 'Major and minor research projects funded by state, national, and international funding agencies.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities_events' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'വിഭാഗത്തിലെ പ്രധാന പരിപാടികൾ' : 'Department Events & Activities'}
              </h2>
              {activities.length > 0 ? (
                <div>
                  {activities.map(activity => {
                    const actImg = activity._embedded?.['wp:featuredmedia']?.[0]?.source_url
                    const isOpen = openActivityId === activity.id
                    const isExpanded = expandedContentId === activity.id
                    
                    const strippedContent = activity.content?.rendered ? stripHtml(activity.content.rendered).replace(/\[&hellip;\]|\.\.\./g, '').trim() : '';
                    const strippedExcerpt = activity.excerpt?.rendered ? stripHtml(activity.excerpt.rendered).replace(/\[&hellip;\]|\.\.\./g, '').trim() : '';
                    const hasMoreContent = strippedContent.length > strippedExcerpt.length;

                    return (
                      <div key={activity.id} className="modern-accordion-item">
                        <button 
                          className="modern-accordion-header" 
                          onClick={() => {
                            setOpenActivityId(isOpen ? null : activity.id)
                            if (isOpen) setExpandedContentId(null)
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {actImg && <img src={actImg} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />}
                            {stripHtml(activity.title?.rendered || activity.title || '')}
                          </span>
                          <span style={{ fontSize: '20px', color: 'var(--navy-900)' }}>{isOpen ? '−' : '+'}</span>
                        </button>
                        {isOpen && (
                          <div className="modern-accordion-body">
                            {isExpanded && activity.content?.rendered ? (
                              <div style={{ marginBottom: '12px' }} className="gutenberg-content" dangerouslySetInnerHTML={{ __html: activity.content.rendered }} />
                            ) : activity.excerpt?.rendered ? (
                              <div style={{ marginBottom: '12px' }} dangerouslySetInnerHTML={{ __html: activity.excerpt.rendered }} />
                            ) : (
                              <p style={{ marginBottom: '12px' }}>{lang === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ ലഭ്യമല്ല.' : 'No more details available.'}</p>
                            )}
                            
                            {hasMoreContent && (
                              <button 
                                onClick={() => setExpandedContentId(isExpanded ? null : activity.id)}
                                style={{ color: 'var(--blue-500)', fontWeight: '600', textDecoration: 'none', fontSize: '13px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              >
                                {isExpanded 
                                  ? (lang === 'ml' ? 'ചുരുക്കുക' : 'Read less') 
                                  : (lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read more')} &rarr;
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'വിഭാഗത്തിലെ പ്രധാന പരിപാടികളുടെ വിവരങ്ങൾ ഇവിടെ ലഭിക്കും.' : 'Major department events and activities organized throughout the academic year.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities_seminars' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'സെമിനാറുകൾ / പ്രഭാഷണങ്ങൾ / പരിശീലനങ്ങൾ' : 'Seminars / Talks / Training Programs'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'വിഭാഗം സംഘടിപ്പിക്കുന്ന ദേശീയ-അന്തർദേശീയ സെമിനാറുകൾ, വിസിറ്റിംഗ് പ്രൊഫസർമാരുടെ പ്രഭാഷണങ്ങൾ, അധ്യാപക-വിദ്യാർത്ഥി പരിശീലന പരിപാടികൾ.' : 'National and international seminars, endowment lectures, invited talks, and faculty development training programs.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_awards' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'അവാർഡുകളും അംഗീകാരങ്ങളും' : 'Awards & Recognition'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'വിഭാഗത്തിനും ഗവേഷകർക്കും ലഭിച്ച പ്രധാന പുരസ്കാരങ്ങളും ബഹുമതികളും.' : 'Academic awards, honors, and recognitions bestowed upon the department and its members.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_workshops' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'വർക്ക്‌ഷോപ്പുകൾ / സ്‌കിൽ പ്രോഗ്രാമുകൾ' : 'Workshops / Student Development Programs'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'പ്രാക്ടിക്കൽ പരിശീലന വർക്ക്‌ഷോപ്പുകൾ, കപ്പാസിറ്റി ബിൽഡിംഗ് പ്രോഗ്രാമുകൾ, കരിയർ സ്‌കിൽ സെഷനുകൾ.' : 'Hands-on workshops, methodology training sessions, and student capacity development programs.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_best_practices' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'മികച്ച മാതൃകകൾ' : 'Best Practices'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'പഠന-ഗവേഷണ രംഗത്ത് വിഭാഗം നടപ്പിലാക്കുന്ന മാതൃകാപരമായ പ്രവർത്തനങ്ങളും നവീന രീതികളും.' : 'Distinctive academic, environmental, and cultural best practices implemented by the department.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_extension' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'സാമൂഹിക വിപുലീകരണ പ്രവർത്തനങ്ങൾ' : 'Social Extension Activities'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'സമൂഹവുമായുള്ള പങ്കാളിത്ത പ്രവർത്തനങ്ങൾ, ബോധവൽക്കരണ കാമ്പെയ്‌നുകൾ, എക്സ്റ്റൻഷൻ പ്രോജക്റ്റുകൾ.' : 'Community engagement initiatives, outreach programs, and social extension projects.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_field_visits' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'ഫീൽഡ് സന്ദർശനങ്ങൾ' : 'Field Visits & Study Tours'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'പഠനത്തിന്റെ ഭാഗമായുള്ള ഫീൽഡ് സ്റ്റഡികൾ, പ്രായോഗിക സന്ദർശനങ്ങൾ, റിസർച്ച് സർവേകൾ.' : 'Field surveys, educational study tours, ecological and cultural field visits.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_mous' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'ധാരണാപത്രങ്ങൾ (MoUs)' : 'Memorandums of Understanding (MoUs)'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'മറ്റ് സർവകലാശാലകളുമായും സ്ഥാപനങ്ങളുമായുമുള്ള അക്കാദമിക സഹകരണ കരാറുകൾ.' : 'Academic collaborations, research partnerships, and MoUs signed with partner institutions.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'activities_addon_courses' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>
                {lang === 'ml' ? 'ആഡ്-ഓൺ കോഴ്‌സുകൾ / ഓൺലൈൻ കോഴ്‌സുകൾ' : 'Add-on Courses / Online Courses'}
              </h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'വിദ്യാർത്ഥികളുടെ തൊഴിൽ നൈപുണ്യം വർദ്ധിപ്പിക്കുന്ന ആഡ്-ഓൺ, സർട്ടിഫിക്കറ്റ്, ഓൺലൈൻ കോഴ്‌സുകൾ.' : 'Certificate courses, value-added skill modules, and online learning courses.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'student_projects' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'വിദ്യാർത്ഥി പ്രോജക്റ്റുകൾ' : 'Student Projects'}</h2>
              {students.length > 0 ? (
                <StudentAccordion items={students} lang={lang} />
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'വിദ്യാർത്ഥികളുടെ ഗവേഷണ പ്രോജക്റ്റുകളും ഫീൽഡ് പ്രോജക്റ്റ് റിപ്പോർട്ടുകളും.' : 'Student dissertations, field study projects, research monographs, and practical work.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'student_achievements' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'വിദ്യാർത്ഥികളുടെ നേട്ടങ്ങൾ' : 'Student Achievements'}</h2>
              {wpDept?.acf?.student_achievement ? (
                <GutenbergContent html={wpDept.acf.student_achievement} />
              ) : (
                <div className="dept-info-card">
                  <p>{lang === 'ml' ? 'ദേശീയ പരീക്ഷാ റാങ്കുകൾ (NET/JRF), മത്സരങ്ങൾ, സ്പോർട്സ്/കലാ മേഖലയിലെ മികച്ച നേട്ടങ്ങൾ.' : 'National eligibility tests (NET/JRF), academic distinctions, competitive exam ranks, and sports/cultural awards achieved by students.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faculty_achievements' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'ഫാക്കൽറ്റിയുടെ നേട്ടങ്ങൾ' : 'Faculty Achievements'}</h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'ഫാക്കൽറ്റി അംഗങ്ങൾക്ക് ലഭിച്ച ദേശീയ-അന്തർദേശീയ അംഗീകാരങ്ങളും അവാർഡുകളും.' : 'National and international honors, editorial board appointments, and prestigious fellowships awarded to faculty members.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'awards_grants' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'അവാർഡുകൾ / ഗ്രാന്റുകൾ' : 'Awards / Recognitions / Grants'}</h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'സ്കൂളിനും വകുപ്പിനും ലഭിച്ച വിശിഷ്ട സാമ്പത്തിക സാങ്കേതിക അവാർഡുകളും ഗ്രാൻറുകളും.' : 'Institutional recognitions, infrastructure grants, and academic awards received by the school.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'scholarships' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'സ്‌കോളർഷിപ്പുകൾ' : 'Scholarships & Financial Aid'}</h2>
              <div className="dept-info-card">
                <p>{lang === 'ml' ? 'വിദ്യാർത്ഥികൾക്കായി സർവകലാശാലയും സർക്കാരും നൽകുന്ന സാമ്പത്തിക ആനുകൂല്യങ്ങളും സ്‌കോളർഷിപ്പുകളും.' : 'State, central, and university merit/means scholarships, stipends, and research fellowships available to department students.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'placement_career' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'പ്ലേസ്‌മെന്റ് & കരിയർ സപ്പോർട്ട്' : 'Placement & Career Support'}</h2>
              <div className="dept-info-card">
                <h3>{lang === 'ml' ? 'കരിയർ മാർഗ്ഗനിർദ്ദേശവും പ്ലേസ്‌മെന്റും' : 'Career Guidance & Placement Cell'}</h3>
                <p>{lang === 'ml' ? 'വിദ്യാർത്ഥികളുടെ ഉന്നതപഠനം, തൊഴിലവസരങ്ങൾ, ഇന്റേൺഷിപ്പ് എന്നിവയ്ക്കായുള്ള വിവരങ്ങളും കൗൺസിലിംഗും.' : 'Career placement services, internship assistance, higher studies guidance, and industry recruitment tie-ups.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="content-section-modern">
              <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--navy-900)' }}>{lang === 'ml' ? 'ഫാക്കൽറ്റി പ്രൊഫൈൽ' : 'Faculty Profile'}</h2>
              {faculties.length === 0 && (
                <p style={{ color: 'var(--muted-mod)', fontSize: '14px' }}>{lang === 'ml' ? 'ഫാക്കൽറ്റി വിവരങ്ങൾ ലഭ്യമല്ല.' : 'No faculty information available.'}</p>
              )}
              <div className="modern-faculty-grid">
                {faculties.map(f => {
                  const name = stripHtml(f.title?.rendered || f.title || '')
                  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  const role = f.acf?.designation || ''
                  const img = f._embedded?.['wp:featuredmedia']?.[0]?.source_url
                  return (
                    <div key={f.id} className="modern-faculty-card">
                      <div className="modern-faculty-card-top">
                        <div className="modern-faculty-card-img">
                          {img ? <img src={img} alt={name} /> : initials}
                        </div>

                        <div>
                          <h4 className="modern-faculty-card-name">{name}</h4>
                          {role && <div className="modern-faculty-card-role-wrapper"><span className="modern-faculty-card-role">{role}</span></div>}
                          
                          <div className="modern-faculty-card-contact">
                            {f.acf?.phone_number && (
                              <div className="modern-faculty-card-contact-item">
                                <img src="/images/phone.png" alt="Phone" /> 
                                <span>{f.acf.phone_number}</span>
                              </div>
                            )}
                            {f.acf?.email_address && (
                              <div className="modern-faculty-card-contact-item">
                                <img src="/images/mail.png" alt="Email" /> 
                                <a href={`mailto:${f.acf.email_address}`}>{f.acf.email_address}</a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="modern-faculty-card-bottom">
                        <div className="modern-faculty-card-bottom-inner">
                          {f.acf?.description && (
                            <div className="modern-faculty-card-desc-wrapper">
                              <strong className="modern-faculty-card-desc-title">
                                {lang === 'ml' ? 'വൈദഗ്ധ്യ മേഖലഃ' : 'Area of Expertise:'}
                              </strong>
                              <p className="modern-faculty-card-desc-text">
                                {stripHtml(f.acf.description)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="modern-faculty-card-actions">
                          {getFacultyProfileUrl(f) && (
                            <a 
                              href={getFacultyProfileUrl(f)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn primary modern-faculty-card-btn-primary" 
                            >
                              {lang === 'ml' ? 'വിശദമായ പ്രൊഫൈൽ' : 'Profile PDF'}
                            </a>
                          )}
                          <Link to={`/${lang}/faculty/${f.slug}`} className="modern-faculty-card-btn-link">
                            {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read More'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StudentAccordion({ items, lang }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = idx => setOpenIndex(openIndex === idx ? null : idx)

  return (
    <div>
      {items.map((s, idx) => (
        <div key={s.id} className="modern-accordion-item">
          <button
            onClick={() => toggle(idx)}
            className="modern-accordion-header"
          >
            <span>{stripHtml(s.title?.rendered || s.title || '')}</span>
            <span>{openIndex === idx ? '▲' : '▼'}</span>
          </button>
          <div className="modern-accordion-body" style={{ display: openIndex === idx ? 'block' : 'none' }}>
            <div style={{ paddingTop: '10px' }}>
              <GutenbergContent html={s.content?.rendered || ''} className="page-content-body" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FacilitiesAccordion({ items, lang }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = idx => setOpenIndex(openIndex === idx ? null : idx)

  return (
    <div>
      {items.map((fac, idx) => (
        <div key={idx} className="modern-accordion-item">
          <button
            onClick={() => toggle(idx)}
            className="modern-accordion-header"
          >
            <span>{fac.facilities_title || 'Facility'}</span>
            <span>{openIndex === idx ? '▲' : '▼'}</span>
          </button>
          <div className="modern-accordion-body" style={{ display: openIndex === idx ? 'block' : 'none' }}>
            <div style={{ paddingTop: '10px' }}>
              <GutenbergContent html={fac.facilities_description || ''} className="page-content-body" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function getFullImageUrl(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (img.full_image_url && typeof img.full_image_url === 'string') return img.full_image_url;
  if (img.source_url) return img.source_url;
  const s = img.sizes || {};
  const bigSizes = ['2048x2048', '1920x1920', 'full', 'large', 'medium_large'];
  for (const k of bigSizes) {
    if (s[k]) return s[k];
  }
  if (img.url) return img.url;
  if (img.thumbnail_image_url) return img.thumbnail_image_url.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
  return null;
}

function GalleryCarousel({ items, lang, isVideo }) {
  const [activeVideo, setActiveVideo] = useState(null)
  const [activeGalleryImages, setActiveGalleryImages] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openGallery = (item, e) => {
    e.preventDefault();
    let images = []
    if (item.acf?.photo_gallery?.gallery_images && Array.isArray(item.acf.photo_gallery.gallery_images)) {
      const raw = item.acf.photo_gallery.gallery_images
      images = Array.isArray(raw[0]) ? raw[0] : raw
    } else if (item.acf?.gallery && Array.isArray(item.acf.gallery)) {
      images = item.acf.gallery
    }
    if (images.length > 0) {
      setActiveGalleryImages(images)
      setCurrentIndex(0)
    } else {
      setActiveGalleryImages([item.image])
      setCurrentIndex(0)
    }
  }

  const closeLightbox = () => setActiveGalleryImages(null)
  const nextImage = (e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % activeGalleryImages.length) }
  const prevImage = (e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length) }

  useEffect(() => {
    if (!activeGalleryImages) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage(e)
      if (e.key === 'ArrowLeft') prevImage(e)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeGalleryImages, currentIndex])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {items.map(item => {
          const embedUrl = getYoutubeEmbedUrl(item.video)
          const linkTo = lang === 'ml' ? `/gallery/${item.slug}` : `/${lang}/gallery/${item.slug}`
          
          const overlayStyle = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' };
          const playBtnStyle = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' };
          const playIconStyle = { width: '48px', height: '48px', background: 'var(--blue-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
          
          return (
            <div key={item.id} className="dept-grid-card" style={{ cursor: embedUrl ? 'pointer' : undefined, margin: 0, width: '100%', height: '130px', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
              {embedUrl ? (
                <div style={{ width: '100%', height: '100%' }} onClick={() => setActiveVideo(embedUrl)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setActiveVideo(embedUrl)}>
                  <img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={playBtnStyle}>
                    <div style={playIconStyle}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
                    </div>
                  </div>
                  <div className="dept-grid-overlay">
                    <h3>{item.title}</h3>
                  </div>
                </div>
              ) : (
                <a href={linkTo} onClick={(e) => openGallery(item, e)} style={{ width: '100%', height: '100%', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isVideo && (
                    <div style={playBtnStyle}>
                      <div style={playIconStyle}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19" /></svg>
                      </div>
                    </div>
                  )}
                  <div className="dept-grid-overlay">
                    <h3>{item.title}</h3>
                  </div>
                </a>
              )}
            </div>
          )
        })}
      </div>
      {activeVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setActiveVideo(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', aspectRatio: '16/9' }}>
            <iframe src={activeVideo} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }} allow="autoplay; encrypted-media" allowFullScreen />
            <button onClick={() => setActiveVideo(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
          </div>
        </div>
      )}
      {activeGalleryImages && (
        <div className="lightbox-overlay" onClick={closeLightbox} style={{ zIndex: 10000 }}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {activeGalleryImages.length > 1 && (
            <button className="lightbox-nav prev" onClick={prevImage} aria-label="Previous">‹</button>
          )}

          <div className="lightbox-content">
            <img 
              src={getFullImageUrl(activeGalleryImages[currentIndex])} 
              alt="Gallery Preview" 
              onClick={(e) => e.stopPropagation()}
            />
            <div className="lightbox-info">
              {currentIndex + 1} / {activeGalleryImages.length}
            </div>
          </div>

          {activeGalleryImages.length > 1 && (
            <button className="lightbox-nav next" onClick={nextImage} aria-label="Next">›</button>
          )}
        </div>
      )}
    </div>
  )
}

export default DepartmentSingle
