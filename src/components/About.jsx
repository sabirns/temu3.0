import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchNotifications, fetchNotificationCategories, getLanguageContext } from '../services/wordpressApi'

const malayalamLetters = [
  'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ',
  'ഒ', 'ഓ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ',
  'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ',
  'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ',
  'ശ', 'ഷ', 'സ', 'ഹ', 'ള', 'ഴ', 'റ'
]



function ParallaxLetters() {
  const [letters, setLetters] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const generatedLetters = malayalamLetters.map((letter, index) => ({
      id: index,
      letter,
      size: 40 + (index % 5) * 20,
      opacity: 0.03 + (index % 3) * 0.02,
      top: (index * 7) % 100,
      left: (index * 13) % 100,
      zIndex: index % 3
    }))
    setLetters(generatedLetters)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="parallax-letters-container">
      {letters.map((item) => (
        <span
          key={item.id}
          className="parallax-letter"
          style={{
            fontSize: `${item.size}px`,
            color: `rgba(172, 38, 41, ${item.opacity})`,
            top: `${item.top}%`,
            left: `${item.left}%`,
            zIndex: item.zIndex,
            transform: `translate(${mousePos.x * (item.zIndex + 1) * 0.3}px, ${mousePos.y * (item.zIndex + 1) * 0.3}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {item.letter}
        </span>
      ))}
    </div>
  )
}

function About() {
  const [isPaused, setIsPaused] = useState(false)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)
  const [notifications, setNotifications] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [notifsData, catsData] = await Promise.all([
          fetchNotifications({ lang, _t: Date.now() }),
          fetchNotificationCategories({ lang, _t: Date.now() })
        ])

        // Create a map of category ID to category data
        const catsMap = {}
        catsData.forEach(cat => {
          catsMap[cat.id] = {
            name: cat.name,
            slug: cat.slug
          }
        })

        setCategories(catsMap)
        // Limit to 10 notifications for the home page ticker
        setNotifications(notifsData.slice(0, 10))
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [lang])

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const getNotificationType = (item) => {
    if (!item.categorySlug) return 'info'
    const slug = item.categorySlug.toLowerCase()

    // Map slugs to CSS types
    const typeMap = {
      'urgent': 'urgent',
      'warning': 'warning',
      'important': 'warning',
      'info': 'info',
      'academic': 'academic',
      'admission': 'admission',
      'event': 'event',
      'news': 'event',
      'exam': 'exam',
      'examination': 'exam',
      'result': 'exam',
      'tender': 'tender',
      'career': 'tender',
      'job': 'tender',
      'student': 'scholarship',
      'scholarship': 'scholarship',
      'seminar': 'admission',
      'workshop': 'event'
    }
    return typeMap[slug] || 'info'
  }

  const getCategoryName = (item) => {
    return item.categoryName || (lang === 'ml' ? 'അറിയിപ്പ്' : 'Notice')
  }

  return (
    <section className="about hero">
      <ParallaxLetters />

      <div className="container">
        <div className="hero-wrap">
          <div className="hero-card">
            <div className="hero-content">
              <h2 className="hero-title">
                {lang === 'ml' 
                  ? 'തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാളസര്‍വകലാശാലയുടെ ഔദ്യോഗിക വെബ്സൈറ്റിലേക്ക് സ്വാഗതം' 
                  : 'Welcome to the Official Website of Thunchath Ezhuthachan Malayalam University'}
              </h2>
              <p className="hero-sub">
                {lang === 'ml' 
                  ? <>കേരളസര്‍ക്കാറിന്‍റെ 2012 ലെ ഉത്തരവിലൂടെയാണ് തുഞ്ചത്തെഴുത്തച്ഛന്‍ മലയാളസര്‍വകലാശാല സ്ഥാപിതമായത്. <b>2012 നവംബര്‍ ഒന്നിനാണ് സര്‍വകലാശാല സാക്ഷാല്‍ക്കരിക്കപ്പെട്ടത്.</b></>
                  : <>Thunchath Ezhuthachan Malayalam University was established by the Government of Kerala in 2012. <b>The university was realized on November 1, 2012.</b></>}
              </p>

              <div className="hero-cta">
                <button className="btn primary" onClick={() => scrollToId('initiatives')}>
                  {lang === 'ml' ? 'കൂടുതല്‍ വായിക്കുക' : 'Read More'}
                </button>
                <button className="btn" onClick={() => scrollToId('updates')}>
                  {lang === 'ml' ? 'പദ്ധതികളും സംരംഭങ്ങളും' : 'Projects & Initiatives'}
                </button>
              </div>

              <div className="hero-stats" aria-label="Highlights">
                <div className="stat">
                  <a href="#">
                    <strong>{lang === 'ml' ? 'വിദ്യാർത്ഥികൾക്കുള്ള സേവനങ്ങൾ' : 'Student Services'}</strong>
                    <span>Scholarships/NSS/Insurance etc. </span>
                  </a>
                </div>
                <div className="stat">
                  <a href="#">
                    <strong>{lang === 'ml' ? 'ഭരണം' : 'Administration'}</strong>
                    <span>{lang === 'ml' ? 'ചാൻസലർ/പ്രോ-ചാൻസലർ/വൈസ് ചാന്‍സലര്‍' : 'Chancellor/Pro-Chancellor/VC'}</span>
                  </a>
                </div>
                <div className="stat">
                  <a href="http://malayalamuniversity.edu.in/360-virtual-tour/" target="_blank">
                    <strong>{lang === 'ml' ? 'വിർച്വൽ ടൂർ' : 'Virtual Tour'}</strong>
                    <span>Explore the university</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3>📢 {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}</h3>
              <span className="live-badge">LIVE</span>
            </div>

            <div className="notifications-container" id="notificationsContainer">
              <div
                className="notifications-track"
                id="notificationsTrack"
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {loading ? (
                  <div className="notification-loading">
                    {lang === 'ml' ? 'അറിയിപ്പുകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading notifications...'}
                  </div>
                ) : notifications.length > 0 ? (
                  // Double the notifications for a seamless marquee loop
                  [...notifications, ...notifications].map((item, index) => {
                    const type = getNotificationType(item)
                    const catName = getCategoryName(item)

                    return (
                      <div key={`${item.id}-${index}`} className={`notification-item ${type}`}>
                        <span className={`notification-badge ${type}`}>
                          {catName}
                        </span>
                        <h4 className="notification-title">{item.title}</h4>
                        <div className="notification-meta">
                          <span className="notification-date">
                            📅 {new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
                          </span>
                          <a href={item.link} className="notification-link">
                            {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക →' : 'Read More →'}
                          </a>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="notification-empty">
                    {lang === 'ml' ? 'പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.' : 'No new notifications.'}
                  </div>
                )}
              </div>
            </div>

            <div className="notifications-controls">
              <button
                className={`notification-btn ${isPaused ? 'play' : 'pause'}`}
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? "Resume notifications" : "Pause notifications"}
              >
                {isPaused ? (lang === 'ml' ? 'തുടങ്ങുക' : 'Play') : (lang === 'ml' ? 'നിർത്തുക' : 'Pause')}
              </button>
              <Link 
                to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`} 
                className="notification-btn" 
                aria-label="View all notifications"
              >
                {lang === 'ml' ? 'എല്ലാം കാണുക' : 'View All'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
