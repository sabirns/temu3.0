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



export function ParallaxLetters() {
  const [letters, setLetters] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const generatedLetters = malayalamLetters.map((letter, index) => {
      const isLeft = index % 2 === 0
      const sideIndex = Math.floor(index / 2) // 0 to 23
      const col = sideIndex % 4 // 0 to 3
      const row = Math.floor(sideIndex / 4) // 0 to 5

      // Base left is 0-24% for left, 75-99% for right
      const baseLeft = isLeft ? 0 : 75
      const leftOffset = (col * 6) + (row % 2 === 0 ? 0 : 3)
      
      const topOffset = (row * 16) + (col % 2 === 0 ? 2 : 8)

      return {
        id: index,
        letter,
        size: 30 + (index % 3) * 15,
        opacity: 0.08 + (index % 3) * 0.04,
        top: topOffset,
        left: baseLeft + leftOffset,
        zIndex: index % 3
      }
    })
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
      <div className="container">
        <div className="hero-wrap">
          <div className="hero-card">
            <div className="hero-content">
              {acf.welcome_title && <h2 className="hero-title" dangerouslySetInnerHTML={{ __html: acf.welcome_title }} />}
              {acf.welcome_description && <p className="hero-sub" dangerouslySetInnerHTML={{ __html: boldFirstParagraph(acf.welcome_description) }} />}

              {acf.welcome_buttons && acf.welcome_buttons.length > 0 && (
              <div className="hero-cta">
                {acf.welcome_buttons.map((btn, i) => {
                  const originalText = btn.welcome_button_text || ''
                  let text = originalText
                  let url = btn.welcome_button_link?.url || '#'
                  let isExternal = true

                  // Override for Faculties
                  if (originalText.includes('പദ്ധതികളും സംരംഭങ്ങളും') || originalText.includes('Projects & Initiatives') || originalText.includes('Initiatives')) {
                    text = lang === 'ml' ? 'ഫാക്കൽറ്റികൾ' : 'Faculties'
                    url = lang === 'ml' ? '/faculties' : `/${lang}/faculties`
                    isExternal = false
                  } else if (originalText.toLowerCase().includes('read more') || originalText.includes('കൂടുതൽ വായിക്കുക') || originalText.includes('readmore')) {
                    url = 'https://tessst.com/temu_cms/ml/%e0%b4%b8%e0%b5%bc%e0%b4%b5%e0%b4%95%e0%b4%b2%e0%b4%be%e0%b4%b6%e0%b4%be%e0%b4%b2/'
                    isExternal = true
                  } else if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
                     // Keep external
                  } else {
                     // Check if it's internal WP link (if WP_CONFIG was imported, but let's just make it relative if possible)
                     try {
                        if (url.startsWith('http')) {
                            const u = new URL(url)
                            url = u.pathname
                            isExternal = false
                        }
                     } catch(e) {}
                  }

                  if (!isExternal || url.startsWith('/')) {
                    return (
                      <Link key={i} to={url} className={`btn ${i === 0 ? 'primary' : ''}`}>
                        {text}
                      </Link>
                    )
                  }
                  return (
                    <a key={i} href={url} className={`btn ${i === 0 ? 'primary' : ''}`} target={btn.welcome_button_link?.target || '_self'} rel={btn.welcome_button_link?.target === '_blank' ? 'noopener' : ''}>
                      {text}
                    </a>
                  )
                })}
              </div>
              )}

              <div className="hero-stats" aria-label="Highlights">
                <div className="stat">
                    <Link to={lang === 'ml' ? '/ml/പ്രവേശനം' : '/en/admission'}>
                        <strong>{lang === 'ml' ? 'പ്രവേശനം' : 'Admission'}</strong>
                    <span>{lang === 'ml' ? 'സർവകലാശാലയിൽ ചേരുക' : 'Join our university'}</span>
                    </Link>
                </div>
                <div className="stat">
                    <Link to={lang === 'ml' ? '/ml/പരീക്ഷ' : '/en/exam'}>
                        <strong>{lang === 'ml' ? 'പരീക്ഷ' : 'Exam'}</strong>
                    <span>{lang === 'ml' ? 'പരീക്ഷാ വിവരങ്ങൾ' : 'Examination details'}</span>
                    </Link>
                </div>
                <div className="stat">
                    <Link to={lang === 'ml' ? '/ml/പരീക്ഷാഫലം' : '/en/exam-result'}><strong>{lang === 'ml' ? 'പരീക്ഷാ ഫലം' : 'Exam Result'}</strong>
                    <span>{lang === 'ml' ? 'നിങ്ങളുടെ ഫലങ്ങൾ പരിശോധിക്കുക' : 'Check your results'}</span></Link>
                </div>
            </div>


            </div>
          </div>

          {/* Notifications Panel */}
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3> {lang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Notifications'}</h3>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="notification-card-badge" style={{ marginBottom: 0 }}>{tabLabels[activeTab]}</span>
                      <span className="notification-date" style={{ marginTop: 0 }}>
                        {new Date(item.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="notification-title" style={{ marginBottom: 0 }}>{item.title}</h4>
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
