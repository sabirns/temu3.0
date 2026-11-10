import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/social-activities.css'

function getLimitedExcerpt(activity, maxChars = 140) {
  const rawHtml = activity.excerpt?.rendered || activity.content?.rendered || ''
  if (!rawHtml) return ''
  let text = ''
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(rawHtml, 'text/html')
      text = (doc.body.textContent || '').trim()
    } catch {
      text = rawHtml.replace(/<[^>]*>?/gm, '').trim()
    }
  } else {
    text = rawHtml.replace(/<[^>]*>?/gm, '').trim()
  }
  text = text.replace(/\s+/g, ' ')
  if (text.length > maxChars) {
    return text.slice(0, maxChars).trim() + '...'
  }
  return text
}

function getGraphicTheme(activity) {
  const id = activity.id
  const title = activity.title?.rendered || activity.title || ''

  if (id === 17625 || title.includes('കാറ്റാടി') || title.includes('പാലിയേറ്റീവ്')) {
    return {
      categoryKey: 'palliative',
      tag: 'പാലിയേറ്റീവ് കെയർ',
      tagEn: 'Palliative Care',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
      accentColor: '#e11d48',
      bgGlow: 'rgba(225, 29, 72, 0.08)'
    }
  }
  
  if (id === 17626 || title.includes('യോഗ') || title.includes('Yoga')) {
    return {
      categoryKey: 'yoga',
      tag: 'ആരോഗ്യവും യോഗയും',
      tagEn: 'Yoga & Wellness',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      accentColor: '#7c3aed',
      bgGlow: 'rgba(124, 58, 237, 0.08)'
    }
  }

  if (id === 17622 || title.includes('ഗ്രാമീണ ലൈബ്രറി') || title.includes('Rural Library')) {
    return {
      categoryKey: 'library',
      tag: 'ഗ്രന്ഥാലയ വികസനം',
      tagEn: 'Library Development',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      accentColor: '#0284c7',
      bgGlow: 'rgba(2, 132, 199, 0.08)'
    }
  }

  if (id === 17623 || title.includes('സ്‌കൂൾ') || title.includes('School')) {
    return {
      categoryKey: 'school',
      tag: 'വിദ്യാഭ്യാസ പിന്തുണ',
      tagEn: 'Educational Support',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      accentColor: '#059669',
      bgGlow: 'rgba(5, 150, 105, 0.08)'
    }
  }

  if (id === 17624 || title.includes('അംഗനവാടി') || title.includes('Anganwadi')) {
    return {
      categoryKey: 'anganwadi',
      tag: 'ശിശുക്ഷേമം',
      tagEn: 'Child Welfare',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      accentColor: '#ea580c',
      bgGlow: 'rgba(234, 88, 12, 0.08)'
    }
  }

  if (id === 17620 || title.includes('സര്‍വ്വേ') || title.includes('Survey')) {
    return {
      categoryKey: 'survey',
      tag: 'സാമൂഹിക പഠനങ്ങൾ',
      tagEn: 'Social Research & Surveys',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
      accentColor: '#4f46e5',
      bgGlow: 'rgba(79, 70, 229, 0.08)'
    }
  }

  if (id === 17621 || title.includes('ആരോഗ്യ') || title.includes('Health')) {
    return {
      categoryKey: 'health',
      tag: 'ആരോഗ്യ സേവനങ്ങൾ',
      tagEn: 'Healthcare & Camps',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      accentColor: '#d97706',
      bgGlow: 'rgba(217, 119, 6, 0.08)'
    }
  }

  return {
    categoryKey: 'general',
    tag: 'സാമൂഹിക പ്രവർത്തനം',
    tagEn: 'Social Activity',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    accentColor: '#0d9488',
    bgGlow: 'rgba(13, 148, 136, 0.08)'
  }
}

export default function SocialActivitiesGrid({ activities = [], lang = 'ml', isGrid = false }) {
  const [viewMode, setViewMode] = useState(isGrid ? 'grid' : 'carousel')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setViewMode(isGrid ? 'grid' : 'carousel')
  }, [isGrid])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, activities.length - itemsPerPage)

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
  }

  // Autoplay interval for carousel mode
  useEffect(() => {
    if (viewMode !== 'carousel' || isPaused || activities.length <= itemsPerPage) return
    const timer = setInterval(() => {
      handleNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [currentIndex, isPaused, activities.length, itemsPerPage, maxIndex, viewMode])

  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities-found">
        <p>{lang === 'ml' ? 'പ്രവർത്തനങ്ങളൊന്നും കണ്ടെത്തിയില്ല.' : 'No activities found.'}</p>
      </div>
    )
  }

  return (
    <section className={`social-activities-section ${viewMode}-mode`}>
      {/* View Toggle Bar (if on view all page or manually toggling) */}
      {isGrid && (
        <div className="view-mode-toggle-bar">
          <span className="view-mode-label">
            {lang === 'ml' ? `ആകെ ${activities.length} പ്രവർത്തനങ്ങൾ` : `Total ${activities.length} Activities`}
          </span>
          <div className="view-toggle-btns">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={lang === 'ml' ? 'ഗ്രിഡ് കാഴ്ച' : 'Grid View'}
              aria-label="Grid View"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'carousel' ? 'active' : ''}`}
              onClick={() => setViewMode('carousel')}
              title={lang === 'ml' ? 'സ്ലൈഡർ കാഴ്ച' : 'Carousel View'}
              aria-label="Carousel View"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M8 5v14M16 5v14"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Grid List View Mode */}
      {viewMode === 'grid' ? (
        <div className="activities-grid-container">
          {activities.map((act, index) => {
            const theme = getGraphicTheme(act)
            const titleHtml = act.title?.rendered || act.title || ''
            const limitedExcerpt = getLimitedExcerpt(act, 140)
            
            return (
              <article 
                key={act.id || index}
                className="activity-graphic-card"
                style={{ '--card-glow': theme.bgGlow, '--card-accent': theme.accentColor }}
              >
                {/* Header Graphic Bar */}
                <div className="card-graphic-header" style={{ background: theme.gradient }}>
                  <div className="header-top-row">
                    <span className="category-tag">
                      {lang === 'ml' ? theme.tag : theme.tagEn}
                    </span>
                  </div>
                  <h3 
                    className="activity-title-header"
                    dangerouslySetInnerHTML={{ __html: titleHtml }}
                  />
                  <div className="graphic-decoration-shape" />
                </div>

                {/* Body Content - Limited excerpt */}
                <div className="card-body-content">
                  <div className="activity-content-box">
                    <p className="activity-limited-text">
                      {limitedExcerpt}
                    </p>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="card-footer-bar">
                  {act.slug && (
                    <Link to={`/${lang}/activity/${act.slug}`} className="details-link">
                      {lang === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ' : 'View Details'}
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* Carousel Slider View Mode */
        <div 
          className="activities-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          {activities.length > itemsPerPage && (
            <>
              <button 
                className="carousel-nav-btn prev-btn" 
                onClick={handlePrev}
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button 
                className="carousel-nav-btn next-btn" 
                onClick={handleNext}
                aria-label="Next slide"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Slide Track Container */}
          <div className="carousel-track-container">
            <div 
              className="carousel-track" 
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
              }}
            >
              {activities.map((act, index) => {
                const theme = getGraphicTheme(act)
                const titleHtml = act.title?.rendered || act.title || ''
                const limitedExcerpt = getLimitedExcerpt(act, 140)
                
                return (
                  <div 
                    key={act.id || index} 
                    className="carousel-slide-item"
                    style={{ flex: `0 0 ${100 / itemsPerPage}%`, maxWidth: `${100 / itemsPerPage}%` }}
                  >
                    <article 
                      className="activity-graphic-card"
                      style={{ '--card-glow': theme.bgGlow, '--card-accent': theme.accentColor }}
                    >
                      {/* Header Graphic Bar */}
                      <div className="card-graphic-header" style={{ background: theme.gradient }}>
                        <div className="header-top-row">
                          <span className="category-tag">
                            {lang === 'ml' ? theme.tag : theme.tagEn}
                          </span>
                        </div>
                        <h3 
                          className="activity-title-header"
                          dangerouslySetInnerHTML={{ __html: titleHtml }}
                        />
                        <div className="graphic-decoration-shape" />
                      </div>

                      {/* Body Content - Limited excerpt */}
                      <div className="card-body-content">
                        <div className="activity-content-box">
                          <p className="activity-limited-text">
                            {limitedExcerpt}
                          </p>
                        </div>
                      </div>

                      {/* Footer bar */}
                      <div className="card-footer-bar">
                        {act.slug && (
                          <Link to={`/${lang}/activity/${act.slug}`} className="details-link">
                            {lang === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ' : 'View Details'}
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12"/>
                              <polyline points="12 5 19 12 12 19"/>
                            </svg>
                          </Link>
                        )}
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          {activities.length > itemsPerPage && (
            <div className="carousel-dots-bar">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
