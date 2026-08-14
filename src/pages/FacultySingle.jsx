import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchFacultyBySlug, getLanguageContext, getFacultyProfileUrl } from '../services/wordpressApi'
import GutenbergContent from '../components/GutenbergContent'

function FacultySingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)

  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSectionId, setActiveSectionId] = useState('profile')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const decodedSlug = decodeURIComponent(slug)
        const data = await fetchFacultyBySlug(decodedSlug, { lang })
        if (data) {
          setFaculty(data)
        } else {
          setError('Faculty not found')
        }
      } catch (err) {
        setError('Failed to load faculty')
      }
      setLoading(false)
    }
    load()
  }, [slug, lang])

  // Scroll spy to update active side menu item as user scrolls
  useEffect(() => {
    if (!faculty) return

    const handleScroll = () => {
      const sectionElements = document.querySelectorAll('.faculty-section-card[id]')
      let currentId = 'profile'
      sectionElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 180 && rect.bottom >= 180) {
          currentId = el.id
        }
      })
      if (currentId) setActiveSectionId(currentId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [faculty])

  if (loading) {
    return (
      <main className="page-content">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>
          {lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
        </div>
      </main>
    )
  }

  if (error || !faculty) {
    return (
      <main className="page-content">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>{lang === 'ml' ? 'ഫാക്കൽറ്റി കണ്ടെത്തിയില്ല' : 'Faculty Not Found'}</h2>
          <Link to={`/${lang}/departments`} className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            {lang === 'ml' ? 'വകുപ്പുകളിലേക്ക് തിരികെ' : 'Back to Departments'}
          </Link>
        </div>
      </main>
    )
  }

  const profileUrl = getFacultyProfileUrl(faculty) || faculty.profilePdf

  // 9 requested side menu items mapped to faculty content & ACF fields
  const baseMenuItems = [
    {
      id: 'profile',
      label: lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      content: faculty.content || (faculty.acf?.description ? `<p>${faculty.acf.description}</p>` : null)
    },
    {
      id: 'articles_in_journals',
      label: lang === 'ml' ? 'ജേണൽ ലേഖനങ്ങൾ' : 'Articles in Journals',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      content: faculty.acf?.articles_in_journals
    },
    {
      id: 'books',
      label: lang === 'ml' ? 'പ്രസിദ്ധീകരിച്ച പുസ്തകങ്ങൾ' : 'Books',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      content: faculty.acf?.books || faculty.acf?.books_authored
    },
    {
      id: 'book_chapters',
      label: lang === 'ml' ? 'പുസ്തക അധ്യായങ്ങൾ' : 'Book Chapters',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
      content: faculty.acf?.book_chapters
    },
    {
      id: 'articles_in_periodicals',
      label: lang === 'ml' ? 'ആനുകാലിക ലേഖനങ്ങൾ' : 'Articles in Periodicals',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M9 12h6m-6 4h6"/></svg>,
      content: faculty.acf?.articles_in_periodicals
    },
    {
      id: 'mphil__phd_guided__adjudicated',
      label: lang === 'ml' ? 'എം.ഫിൽ / പിഎച്ച്.ഡി' : 'MPhil / PhD Guided / Adjudicated',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      content: faculty.acf?.mphil__phd_guided__adjudicated
    },
    {
      id: 'research_projects',
      label: lang === 'ml' ? 'ഗവേഷണ പദ്ധതികൾ' : 'Research Projects',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>,
      content: faculty.acf?.research_projects
    },
    {
      id: 'workshops__fdp__training_programs',
      label: lang === 'ml' ? 'വർക്ക്ഷോപ്പുകൾ & പരിശീലനം' : 'Workshops / FDP / Training Programs',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      content: faculty.acf?.workshops__fdp__training_programs
    },
    {
      id: 'awards__achievements__others',
      label: lang === 'ml' ? 'അവാർഡുകളും നേട്ടങ്ങളും' : 'Awards / Achievements / Others',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
      content: faculty.acf?.awards__achievements__others
    }
  ]

  // Items with content placed first; zero content items moved to bottom
  const activeItems = baseMenuItems.filter(item => Boolean(item.content))
  const emptyItems = baseMenuItems.filter(item => !item.content)

  const sideMenuItems = [...activeItems, ...emptyItems].map((item, index, arr) => ({
    ...item,
    treePrefix: index === arr.length - 1 ? '└──' : '├──'
  }))

  // Filter sections that actually have content to render on the main body
  const availableSections = sideMenuItems.filter(item => Boolean(item.content))

  const handleMenuClick = (item) => {
    setActiveSectionId(item.id)
    const element = document.getElementById(item.id)
    if (element) {
      const yOffset = -120
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const hasContactInfo = faculty.acf?.phone_number || faculty.acf?.email_address || profileUrl

  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
        <nav className="breadcrumb" style={{ marginBottom: '24px' }}>
          <Link to={`/${lang}`}>{lang === 'ml' ? 'പൂമുഖം' : 'Home'}</Link>
          <span>/</span>
          <Link to={`/${lang}/departments`}>{lang === 'ml' ? 'വകുപ്പുകൾ' : 'Departments'}</Link>
          <span>/</span>
          <span>{faculty.title}</span>
        </nav>

        <div className="faculty-profile-layout">
          <aside className="faculty-profile-sidebar">
            {faculty.featuredImage && (
              <div className="faculty-profile-card">
                <img src={faculty.featuredImage} alt={faculty.title} />
              </div>
            )}

            {/* Side Sticky Navigation Menu */}
            <div className="faculty-side-menu-card">
              <div className="faculty-side-menu-header">
                <span className="faculty-side-menu-header-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </span>
                <span>{lang === 'ml' ? 'ഫാക്കൽറ്റി പ്രൊഫൈൽ' : 'Faculty Profile'}</span>
              </div>
              <ul className="faculty-side-menu-list">
                {sideMenuItems.map((item) => {
                  const hasData = Boolean(item.content)
                  const isActive = activeSectionId === item.id

                  return (
                    <li key={item.id} className="faculty-side-menu-item">
                      <button
                        type="button"
                        className={`faculty-side-menu-link ${isActive ? 'active' : ''} ${!hasData ? 'empty' : ''}`}
                        onClick={() => hasData && handleMenuClick(item)}
                        disabled={!hasData}
                        title={!hasData ? (lang === 'ml' ? 'വിവരങ്ങൾ ലഭ്യമായിട്ടില്ല' : 'No entries available') : ''}
                      >
                        <span className="faculty-side-menu-tree-prefix">{item.treePrefix}</span>
                        <span className="faculty-side-menu-icon">{item.icon}</span>
                        <span className="faculty-side-menu-label">{item.label}</span>
                        {!hasData && (
                          <span className="faculty-side-menu-badge">N/A</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          <div className="faculty-profile-content">
            {availableSections.map((section) => {
              if (section.id === 'profile') {
                return (
                  <div key={section.id} id={section.id} className="faculty-section-card">
                    {/* Main Profile Header with Name, Designation, Department & Download Button */}
                    <div className="faculty-profile-header">
                      <div className="faculty-profile-header-main">
                        <h1 className="faculty-header-title">{faculty.title}</h1>
                        
                        <div className="faculty-header-badges">
                          {(faculty.acf?.designation || faculty.acf?.other_designation) && (
                            <span className="faculty-badge designation-badge">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                              <span>{[faculty.acf?.designation, faculty.acf?.other_designation].filter(Boolean).join(' • ')}</span>
                            </span>
                          )}
                          {faculty.department && (
                            <span className="faculty-badge department-badge">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/></svg>
                              <span>{faculty.department}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {profileUrl && (
                        <div className="faculty-header-action">
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn primary modern-faculty-card-btn-primary"
                            style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
                            <span>{lang === 'ml' ? 'വിശദമായ പ്രൊഫൈൽ' : 'Profile PDF'}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Contact Details Box near Expertise */}
                    {(faculty.acf?.phone_number || faculty.acf?.email_address) && (
                      <div className="faculty-contact-inline-box">
                        <h3 className="faculty-contact-inline-title">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{lang === 'ml' ? 'ബന്ധപ്പെടേണ്ട വിവരങ്ങൾ' : 'Contact Details'}</span>
                        </h3>
                        <div className="faculty-contact-inline-grid">
                          {faculty.acf?.phone_number && (
                            <div className="faculty-contact-inline-item">
                              <span className="faculty-contact-inline-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              </span>
                              <div>
                                <div style={{ fontSize: '11.5px', opacity: 0.7, fontWeight: 500 }}>{lang === 'ml' ? 'ഫോൺ' : 'Phone'}</div>
                                <a href={`tel:${faculty.acf.phone_number}`} className="faculty-contact-inline-link">
                                  {faculty.acf.phone_number}
                                </a>
                              </div>
                            </div>
                          )}
                          {faculty.acf?.email_address && (
                            <div className="faculty-contact-inline-item">
                              <span className="faculty-contact-inline-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              </span>
                              <div>
                                <div style={{ fontSize: '11.5px', opacity: 0.7, fontWeight: 500 }}>{lang === 'ml' ? 'ഇമെയിൽ' : 'Email'}</div>
                                <a href={`mailto:${faculty.acf.email_address}`} className="faculty-contact-inline-link">
                                  {faculty.acf.email_address}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Area of Expertise Box */}
                    {faculty.acf?.description && (
                      <div className="faculty-expertise-box">
                        <h3 className="faculty-expertise-title">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                          <span>
                            {faculty.acf?.description_title
                              ? faculty.acf.description_title
                              : (lang === 'ml' ? 'വൈദഗ്ധ്യ മേഖല' : 'Area of Expertise')}
                          </span>
                        </h3>
                        <p className="faculty-expertise-text">
                          {faculty.acf.description}
                        </p>
                      </div>
                    )}

                    {/* Biography / Content */}
                    {faculty.content && (
                      <div className="faculty-overview-content">
                        <GutenbergContent html={faculty.content} className="gutenberg-content page-content-body" />
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div key={section.id} id={section.id} className="faculty-section-card">
                  <h2>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{section.icon}</span>
                    <span>{section.label}</span>
                  </h2>
                  <GutenbergContent html={section.content} className="gutenberg-content page-content-body" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

export default FacultySingle
