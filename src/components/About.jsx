import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { fetchNotifications, getLanguageContext } from '../services/wordpressApi'

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

function About({ homePageData }) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const lang = getLanguageContext(location.pathname, searchParams)

  const acf = homePageData?.acf || {}

  const boldFirstParagraph = (html) => {
    if (!html) return ''
    const idx = html.indexOf('</p>')
    if (idx !== -1) {
      return html.slice(0, idx + 4).replace('<p>', '<p><b>').replace('</p>', '</b></p>') + html.slice(idx + 4)
    }
    const dotIdx = html.indexOf('. ')
    if (dotIdx !== -1) {
      return '<b>' + html.slice(0, dotIdx + 1) + '</b>' + html.slice(dotIdx + 1)
    }
    return '<b>' + html + '</b>'
  }
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('announcements')

  const tabTermIds = {
    announcements: lang === 'en' ? '6' : '222',
    orders: lang === 'en' ? '602' : '606',
    tenders: lang === 'en' ? '40' : '224'
  }

  const tabLabels = {
    announcements: lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Announcements',
    orders: lang === 'ml' ? 'ഉത്തരവുകൾ' : 'Orders',
    tenders: lang === 'ml' ? 'ടെൻഡറുകൾ' : 'Tenders'
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchNotifications({ lang, per_page: 20, _t: Date.now() })
        setNotifications(data)
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [lang])

  const filteredNotifications = notifications.filter(item =>
    item.categories && item.categories.includes(Number(tabTermIds[activeTab]))
  )

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="about hero">
      <ParallaxLetters />

      <div className="container">
        <div className="hero-wrap">
          <div className="hero-card">
            <div className="hero-content">
              {acf.welcome_title && <h2 className="hero-title" dangerouslySetInnerHTML={{ __html: acf.welcome_title }} />}
              {acf.welcome_description && <p className="hero-sub" dangerouslySetInnerHTML={{ __html: boldFirstParagraph(acf.welcome_description) }} />}

              {acf.welcome_buttons && acf.welcome_buttons.length > 0 && (
              <div className="hero-cta">
                {acf.welcome_buttons.map((btn, i) => (
                  <a key={i} href={btn.welcome_button_link?.url || '#'} className={`btn ${i === 0 ? 'primary' : ''}`} target={btn.welcome_button_link?.target || '_self'} rel={btn.welcome_button_link?.target === '_blank' ? 'noopener' : ''}>
                    {btn.welcome_button_text}
                  </a>
                ))}
              </div>
              )}

              <div className="hero-stats" aria-label="Highlights">
                <div className="stat">
                    <a href="#">
                        <strong>വിദ്യാർത്ഥികൾക്കുള്ള സേവനങ്ങൾ</strong>
                    <span>Scholarships/NSS/Insurance etc. </span>
                    </a>
                </div>
                <div className="stat">
                    <a href="#">
                        <strong>ഭരണം</strong>
                    <span>ചാൻസലർ/പ്രോ-ചാൻസലർ/വൈസ് ചാന്‍സലര്‍</span>
                    </a>
                </div>
                <div className="stat">
                    <a href="http://malayalamuniversity.edu.in/360-virtual-tour/" target="_blank"><strong>വിർച്വൽ ടൂർ </strong>
                    <span>Explore the university</span></a>
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

            <div className="notifications-tabs">
              {Object.keys(tabLabels).map(key => (
                <button
                  key={key}
                  className={`notifications-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {tabLabels[key]}
                </button>
              ))}
            </div>

            <div className="notifications-container">
              {loading ? (
                <div className="notification-loading">
                  {lang === 'ml' ? 'അറിയിപ്പുകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading notifications...'}
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.slice(0, 5).map((item) => (
                  <a key={item.id} href={item.link} className="notification-card">
                    <span className="notification-card-badge">{tabLabels[activeTab]}</span>
                    <h4 className="notification-title">{item.title}</h4>
                    <span className="notification-date">
                      {new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
                    </span>
                  </a>
                ))
              ) : (
                <div className="notification-empty">
                  {lang === 'ml' ? 'ഈ വിഭാഗത്തിൽ അറിയിപ്പുകളൊന്നുമില്ല.' : 'No notifications in this category.'}
                </div>
              )}
            </div>
            <div className="notifications-controls">
              <Link 
                to={lang === 'ml' ? '/notifications' : `/${lang}/notifications`} 
                className="notification-btn"
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
