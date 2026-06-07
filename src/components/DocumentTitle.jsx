import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = {
  ml: 'തുഞ്ചത്തെഴുത്തച്ഛൻ മലയാളസർവകലാശാല',
  en: 'Thunchath Ezhuthachan Malayalam University',
}

function DocumentTitle() {
  const location = useLocation()

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    const lang = parts[0] === 'ml' || parts[0] === 'en' ? parts[0] : 'ml'
    const h1 = document.querySelector('main h1')
    const pageTitle = h1 ? h1.textContent.trim() : ''
    document.title = pageTitle ? `${pageTitle} - ${SITE_NAME[lang]}` : SITE_NAME[lang]
  }, [location.pathname])

  return null
}

export default DocumentTitle
