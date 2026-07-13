import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { WP_CONFIG } from '../config/wpConfig'
import { fixWordPressUrls, getLanguageContext, stripHtml, fetchMenuByLocation, fetchPolylangTranslation } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import '../styles/megaMenu.css'
import '../styles/megaCenter.css'
import '../styles/normalMenu.css'


async function fetchNotificationsFromAPI(lang = 'ml') {
    try {
        const params = new URLSearchParams({
            per_page: '10',
            status: 'publish',
            lang,
            _t: Date.now()
        })
        const termId = lang === 'en' ? '1890' : '1888'
        params.set('notification_category', termId)
        const response = await fetch(`${WP_CONFIG.API_URL}/notifications?${params}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        return data.map(item => ({
            id: item.id,
            title: stripHtml(item.title?.rendered || item.title || ''),
            link: item.link || '#',
            slug: item.slug || (item.link ? item.link.split('/').filter(Boolean).pop() : '')
        }))
    } catch (error) {
        console.warn('Failed to fetch notifications:', error)
        return null
    }
}

function Header() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { pageInfo } = usePageInfo()

    // Detect language from path or query
    const siteLang = getLanguageContext(location.pathname, searchParams)

    const [siteLanguage, setSiteLanguage] = useState(siteLang)

    useEffect(() => {
        setSiteLanguage(siteLang)
    }, [siteLang])

    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [megaMenuHtml, setMegaMenuHtml] = useState('')
    const [topMenuItems, setTopMenuItems] = useState([])
    const [mobileOpen, setMobileOpen] = useState(false)
    
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const tickerRef = useRef(null)
    const tickerAnimRef = useRef(null)
    const [menuKey, setMenuKey] = useState(0)
    const megaMenuContainerRef = useRef(null)
    const mobilePanelRef = useRef(null)

    const [contactInfo, setContactInfo] = useState({ phone: '+91 494 2740000', email: 'info@malayalamuniversity.edu.in' })

    useEffect(() => {
        async function fetchContactInfo() {
            try {
                const slug = siteLanguage === 'ml' ? 'contact-us-ml' : 'contact-us'
                const { fetchPageBySlug } = await import('../services/wordpressApi')
                const page = await fetchPageBySlug(slug, { lang: siteLanguage })
                if (page && page.acf) {
                    let phone = '+91 494 2740000'
                    let email = 'info@malayalamuniversity.edu.in'
                    for (const [key, value] of Object.entries(page.acf)) {
                        if (!value) continue;
                        const k = key.toLowerCase()
                        if (typeof value === 'string') {
                            if (k.includes('phone') || k.includes('mobile') || k.includes('tel')) {
                                phone = value.split(',')[0].trim()
                            }
                            if (k.includes('email') || k.includes('mail')) {
                                email = value.split(',')[0].trim()
                            }
                        }
                    }
                    setContactInfo({ phone, email })
                }
            } catch (e) {
                console.error("Failed to fetch contact info:", e)
            }
        }
        fetchContactInfo()
    }, [siteLanguage])

    const loadNotifications = useCallback(async (lang) => {
        setIsLoading(true)
        const data = await fetchNotificationsFromAPI(lang)
        setNotifications(data || [])
        setIsLoading(false)
    }, [])

    const fetchMegaMenu = useCallback(async (lang) => {
        try {
            const menuSlug = lang === 'en' ? 'primary_en' : 'primary_ml'
            const response = await fetch(`${WP_CONFIG.SITE_URL}/wp-json/mu/v2/mega-menu/${menuSlug}?_t=${Date.now()}`)
            if (!response.ok) throw new Error('Failed to fetch mega menu')
            const data = await response.json()
            if (data.html) {
                // Normalize the dynamic ID to a stable custom ID so CSS always works
                const fixedHtml = data.html.replace(/\sid=(['"])mega-menu-[^'"]*\1/, ' id="mega-menu-custom"')
                setMegaMenuHtml(fixWordPressUrls(fixedHtml))
            }
        } catch (error) {
            console.warn('Failed to fetch mega menu:', error)
        }
    }, [])

    useEffect(() => {
        loadNotifications(siteLanguage)
        fetchMegaMenu(siteLanguage)
        fetchMenuByLocation('top_menu_1', siteLanguage).then(setTopMenuItems)
    }, [siteLanguage, loadNotifications, fetchMegaMenu])

    // Initialize API mega menu and handle internal navigation
    useEffect(() => {
        if (!megaMenuHtml) return
        const el = megaMenuContainerRef.current
        if (!el) return

        // Ensure the menu has the stable CSS ID regardless of what WordPress returned
        const menuUl = el.querySelector('ul[id^="mega-menu-"]')
        if (menuUl) {
            menuUl.id = 'mega-menu-custom'
        }

        const wpBaseUrl = WP_CONFIG.SITE_URL

        // Build the base pathname for removal (e.g., /sabir/mu)
        let wpBasePath = '/'
        try {
            wpBasePath = new URL(wpBaseUrl).pathname.replace(/\/$/, '')
        } catch { /* fallback to '/' */ }

        // Combine navigation + mobile children toggle in one handler
        const handleMenuClick = (e) => {
            const link = e.target.closest('a')
            if (!link) return

            const href = link.getAttribute('href')
            if (!href || href === '#' || href.startsWith('javascript:')) return

            // On mobile, tapping a parent item toggles its submenu without navigating
            if (window.innerWidth <= 768) {
                const parentItem = link.closest('li.mega-menu-item-has-children')
                if (parentItem) {
                    const isParentAnchor = (parentItem.querySelector(':scope > a.mega-menu-link') === link) ||
                        (parentItem.querySelector(':scope > a') === link)
                    if (isParentAnchor) {
                        e.preventDefault()
                        parentItem.classList.toggle('open')
                        link.setAttribute('aria-expanded', String(parentItem.classList.contains('open')))
                        return
                    }
                }
            }

            // Parse the URL to determine if it's internal
            let url
            try {
                url = new URL(href, window.location.origin)
            } catch {
                return // invalid URL, let browser handle
            }

            // Skip external links
            const wpHost = new URL(wpBaseUrl).host
            if (url.host !== window.location.host && url.host !== wpHost) return

            e.preventDefault()

            // Extract and clean the pathname
            let path = url.pathname

            // Remove the WP base path prefix (e.g., /sabir/mu/about → /about)
            if (wpBasePath !== '/' && path.startsWith(wpBasePath)) {
                path = path.slice(wpBasePath.length)
            }

            // Remove language prefix if present (e.g., /ml/about → /about)
            const segments = path.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s) } catch { return s } })
            if (segments[0] === 'ml' || segments[0] === 'en') {
                segments.shift()
            }

            // Map known WordPress post type query params to React routes
            const postType = url.searchParams.get('post_type')
            const postId = url.searchParams.get('p')
            if (postType === 'department' || postType === 'departments') {
                if (postId) {
                    setMenuKey(k => k + 1)
                    navigate(`/${siteLang}/department/${postId}${url.hash}`)
                    return
                }
            }

            // Map WordPress clean URLs (plural) to React routes (singular)
            if (segments[0] === 'departments' && segments[1]) {
                setMenuKey(k => k + 1)
                navigate(`/${siteLang}/department/${segments.slice(1).join('/')}${url.search}${url.hash}`)
                return
            }

            // Build the new path with current language and preserve query/hash
            setMenuKey(k => k + 1)
            const suffix = url.search + url.hash
            if (segments.length > 0) {
                navigate(`/${siteLang}/${segments.join('/')}${suffix}`)
            } else {
                navigate(`/${siteLang}/${suffix}`)
            }
        }

        el.addEventListener('click', handleMenuClick)

        // Ensure all parent items have aria-expanded
        el.querySelectorAll('li.mega-menu-item-has-children').forEach(li => {
            const anchor = li.querySelector(':scope > a.mega-menu-link') || li.querySelector('a')
            if (anchor && !anchor.hasAttribute('aria-expanded')) {
                anchor.setAttribute('aria-expanded', 'false')
            }
        })

        return () => {
            el.removeEventListener('click', handleMenuClick)
        }
    }, [megaMenuHtml, navigate, siteLang])

    // Highlight active menu item based on current route
    useEffect(() => {
        const el = megaMenuContainerRef.current
        if (!el || !megaMenuHtml) return

        // Remove existing active classes
        el.querySelectorAll('.mega-current-menu-item, .mega-current-menu-ancestor, .current-menu-item, .current-page-ancestor').forEach(li => {
            li.classList.remove('mega-current-menu-item', 'mega-current-menu-ancestor', 'current-menu-item', 'current-page-ancestor')
        })

        // Find the matching anchor
        const links = Array.from(el.querySelectorAll('a'))
        // Normalize location pathname
        const currentPath = decodeURIComponent(window.location.pathname).replace(/\/$/, '') || '/'

        const activeLink = links.find(a => {
            const href = a.getAttribute('href')
            if (!href || href === '#') return false
            try {
                const url = new URL(href, window.location.origin)
                // Normalize href path
                let path = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/'
                return path === currentPath
            } catch (e) {
                return false
            }
        })

        if (activeLink) {
            const parentLi = activeLink.closest('li')
            if (parentLi) {
                parentLi.classList.add('mega-current-menu-item', 'current-menu-item')
                
                // Add ancestor classes to all parent dropdowns
                let current = parentLi.parentElement
                while (current && current !== el) {
                    if (current.tagName === 'LI') {
                        current.classList.add('mega-current-menu-ancestor', 'current-page-ancestor')
                    }
                    current = current.parentElement
                }
            }
        }
    }, [location.pathname, megaMenuHtml])

    // Dropdown viewport boundary adjustment
    useEffect(() => {
        const el = megaMenuContainerRef.current
        if (!el) return

        const handleMouseEnter = (e) => {
            const li = e.currentTarget
            const subMenu = li.querySelector(':scope > ul.sub-menu')
            if (!subMenu) return

            // Reset position before measuring
            subMenu.classList.remove('open-upwards')

            const rect = subMenu.getBoundingClientRect()
            if (rect.bottom > window.innerHeight) {
                subMenu.classList.add('open-upwards')
            }
        }

        const items = el.querySelectorAll('li.menu-item-has-children')
        items.forEach(li => {
            li.addEventListener('mouseenter', handleMouseEnter)
        })

        return () => {
            items.forEach(li => {
                li.removeEventListener('mouseenter', handleMouseEnter)
            })
        }
    }, [megaMenuHtml])

    useEffect(() => {
        if (!tickerRef.current) return
        const container = tickerRef.current.querySelector('.ticker-scroll')
        if (!container) return
        const handler = (e) => {
            const link = e.target.closest('a')
            if (!link) return
            const href = link.getAttribute('href')
            if (!href || href === '#') return
            e.preventDefault()
            const slug = href.split('/').filter(Boolean).pop()
            if (slug) {
                navigate(siteLanguage === 'ml' ? `/notifications/${slug}` : `/${siteLanguage}/notifications/${slug}`)
            }
        }
        container.addEventListener('click', handler)
        return () => container.removeEventListener('click', handler)
    }, [notifications, navigate, siteLanguage])

    // Touch toggle for dropdown menus on mobile
    useEffect(() => {
        const el = document.querySelector('.quick-actions')
        if (!el) return
        const handler = (e) => {
            const dd = e.target.closest('[data-dd]')
            if (dd && window.innerWidth <= 980) {
                const btn = dd.querySelector('button')
                const isBtnTrigger = btn && (btn === e.target || btn.contains(e.target))
                if (isBtnTrigger) {
                    e.preventDefault()
                    dd.classList.toggle('open')
                    btn.setAttribute('aria-expanded', String(dd.classList.contains('open')))
                    return
                }
                if (!e.target.closest('.dropdown-menu')) {
                    dd.classList.remove('open')
                }
            }
            const link = e.target.closest('a')
            if (!link) return
            const href = link.getAttribute('href')
            if (!href || href === '#') return
            const wpHost = new URL(WP_CONFIG.SITE_URL).host
            try {
                const url = new URL(href)
                if (url.host === window.location.host || url.host === wpHost) {
                    e.preventDefault()
                    const path = url.pathname
                    const wpBasePath = new URL(WP_CONFIG.SITE_URL).pathname.replace(/\/$/, '')
                    const relativePath = wpBasePath !== '/' && path.startsWith(wpBasePath) ? path.slice(wpBasePath.length) : path
                    navigate(relativePath || '/')
                }
            } catch { }
        }
        el.addEventListener('click', handler)
        return () => el.removeEventListener('click', handler)
    }, [navigate])

    const toggleMobile = () => {
        setMobileOpen(prev => !prev)
    }

    const closeMobile = () => {
        setMobileOpen(false)
    }

    useEffect(() => {
        if (!mobileOpen) return
        const handleClickOutside = (e) => {
            if (mobilePanelRef.current && !mobilePanelRef.current.contains(e.target) && !e.target.closest('#burger')) {
                closeMobile()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [mobileOpen])

    useEffect(() => {
        const megaEl = megaMenuContainerRef.current
        if (!megaEl || !mobileOpen) return
        const menuUl = megaEl.querySelector('#mega-menu-custom')
        if (menuUl) {
            menuUl.classList.add('mega-mobile-open')
        }
        return () => {
            if (menuUl) menuUl.classList.remove('mega-mobile-open')
        }
    }, [mobileOpen, megaMenuHtml])

    useEffect(() => {
        const el = document.querySelector('.mobile-panel')
        if (!el) return
        const handler = (e) => {
            const link = e.target.closest('a')
            if (!link) return
            
            // Handle submenu toggling for mega menu in mobile panel
            const parentItem = link.closest('li.mega-menu-item-has-children')
            if (parentItem) {
                const isParentAnchor = (parentItem.querySelector(':scope > a.mega-menu-link') === link) ||
                    (parentItem.querySelector(':scope > a') === link)
                if (isParentAnchor) {
                    e.preventDefault()
                    parentItem.classList.toggle('open')
                    link.setAttribute('aria-expanded', String(parentItem.classList.contains('open')))
                    return
                }
            }

            const href = link.getAttribute('href')
            if (!href || href === '#') return
            const wpHost = new URL(WP_CONFIG.SITE_URL).host
            try {
                const url = new URL(href)
                if (url.host === window.location.host || url.host === wpHost) {
                    e.preventDefault()
                    const path = url.pathname
                    const wpBasePath = new URL(WP_CONFIG.SITE_URL).pathname.replace(/\/$/, '')
                    const relativePath = wpBasePath !== '/' && path.startsWith(wpBasePath) ? path.slice(wpBasePath.length) : path
                    closeMobile()
                    navigate(relativePath || '/')
                }
            } catch { }
        }
        el.addEventListener('click', handler)
        return () => el.removeEventListener('click', handler)
    }, [navigate])

    // Pre-compute translated paths at page load time
    const translationPaths = useMemo(() => {
        const currentPath = location.pathname
        const swapPrefix = (targetLang) => {
            const parts = currentPath.split('/').filter(Boolean)
            if (parts[0] === 'ml' || parts[0] === 'en') parts[0] = targetLang
            else parts.unshift(targetLang)
            const sectionRoutes = ['nss', 'naac', 'iqac']
            if (sectionRoutes.includes(parts[1])) {
                return '/' + [targetLang, parts[1]].join('/')
            }
            return '/' + parts.join('/')
        }
        if (pageInfo.translationSlugs) {
            const buildPath = (targetLang) => {
                const slug = pageInfo.translationSlugs[targetLang]
                if (!slug) return swapPrefix(targetLang)
                const parts = currentPath.split('/').filter(Boolean)
                if (parts[0] === 'ml' || parts[0] === 'en') parts.shift()
                if (parts.length > 0 && !/^\d+$/.test(parts[parts.length - 1])) {
                    parts[parts.length - 1] = slug
                }
                return '/' + [targetLang, ...parts].join('/')
            }
            return { en: buildPath('en'), ml: buildPath('ml') }
        }
        return { en: swapPrefix('en'), ml: swapPrefix('ml') }
    }, [pageInfo.translationSlugs, location.pathname])

    const toggleLang = async () => {
        const newLang = siteLanguage === 'ml' ? 'en' : 'ml'
        setSiteLanguage(newLang)

        const currentPath = location.pathname
        const pathParts = currentPath.split('/').filter(Boolean)

        // Priority 1: translationSlugs already extracted from page data
        if (pageInfo.translationSlugs?.[newLang]) {
            const translatedSlug = pageInfo.translationSlugs[newLang]
            const parts = [...pathParts]
            if (parts[0] === 'ml' || parts[0] === 'en') parts.shift()
            if (parts.length > 0 && !/^\d+$/.test(parts[parts.length - 1])) {
                parts[parts.length - 1] = translatedSlug
            }
            navigate('/' + [newLang, ...parts].join('/'))
            return
        }

        // Priority 2: fetch translation via Polylang API
        if (pageInfo.id && pageInfo.postType) {
            const translatedSlug = await fetchPolylangTranslation(pageInfo.id, pageInfo.postType, newLang)
            if (translatedSlug) {
                const parts = [...pathParts]
                if (parts[0] === 'ml' || parts[0] === 'en') parts.shift()
                if (parts.length > 0 && !/^\d+$/.test(parts[parts.length - 1])) {
                    parts[parts.length - 1] = translatedSlug
                }
                navigate('/' + [newLang, ...parts].join('/'))
                return
            }
        }

        // Fallback: just swap the language prefix
        if (pathParts[0] === 'ml' || pathParts[0] === 'en') {
            pathParts[0] = newLang
            // For custom post type pages (nss, naac, iqac), navigate to dashboard if translation isn't available
            const sectionRoutes = ['nss', 'naac', 'iqac']
            if (sectionRoutes.includes(pathParts[1])) {
                navigate('/' + [newLang, pathParts[1]].join('/'))
            } else {
                navigate('/' + pathParts.join('/'))
            }
        } else {
            navigate(`/${newLang}${currentPath === '/' ? '' : currentPath}`)
        }
    }

    const targetLang = siteLanguage === 'ml' ? 'en' : 'ml'
    const translationPath = translationPaths?.[targetLang]

    return (
        <header className="header">

            <div className="header-top">
                <div className="container">
                    <div className="header-top-inner">
                        <Link className="logo-link" to="/" aria-label="Home">
                            <img src={siteLanguage === 'en' ? '/images/malayalam-university-logo-en.png' : '/images/malayalam-university-logo.png'} alt="Malayalam University Logo" />
                        </Link>

                        <div className="mobile-top-actions">
                            <div className="action-buttons">
                                {translationPath ? (
                                    <Link to={translationPath} className="toggle" title="Language toggle">
                                        <span className="dot" aria-hidden="true"></span>
                                        <span>{siteLanguage === 'ml' ? 'EN' : 'മലയാളം'}</span>
                                    </Link>
                                ) : (
                                    <div className="toggle" onClick={toggleLang} title="Language toggle">
                                        <span className="dot" aria-hidden="true"></span>
                                        <span>{siteLanguage === 'ml' ? 'EN' : 'മലയാളം'}</span>
                                    </div>
                                )}
                            </div>
                            <button className={`mobile-toggle ${mobileOpen ? 'active' : ''}`} id="burger" onClick={toggleMobile} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
                                <span className="bar"></span>
                                <span className="bar"></span>
                                <span className="bar"></span>
                            </button>
                        </div>

                        <div className="quick-actions">
                            <div className="nav-item has-dropdown" data-dd>
                                <button className="btn btn-small" aria-haspopup="true" aria-expanded="false">
                                    {siteLanguage === 'ml' ? 'സൗകര്യങ്ങൾ' : 'Facilities'}<span className="dropdown-arrow"></span>
                                </button>
                                <div className="dropdown-menu">
                                    <div className="dropdown-grid">
                                        {topMenuItems.length > 0 ? topMenuItems.map(item => (
                                            <a
                                                key={item.id}
                                                href={item.url || '#'}
                                                className="dropdown-item"
                                                target={item.target || '_self'}
                                                rel={item.target === '_blank' ? 'noopener noreferrer' : ''}
                                            >
                                                <div><strong>{item.title?.rendered || item.title}</strong></div>
                                            </a>
                                        )) : (
                                            <Link to="#" className="dropdown-item"><div><strong>Loading...</strong></div></Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="nav-item has-dropdown" data-dd>
                                <button className="btn btn-small" aria-haspopup="true" aria-expanded="false">
                                    {siteLanguage === 'ml' ? 'വിദ്യാർത്ഥി പിന്തുണ' : 'Student Support'} <span className="dropdown-arrow">▼</span>
                                </button>
                                <div className="dropdown-menu">
                                    <div className="dropdown-grid">
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'സ്കോളർഷിപ്പ്' : 'Scholarship'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'എൻഎസ്എസ്' : 'NSS'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'പിടിഎ' : 'PTA'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'വിദ്യാർത്ഥി യൂണിയൻ' : 'Student Union'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'സ്റ്റുഡന്റ് സോൺ' : 'Student Zone'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'ഇന്റേൺഷിപ്പ്' : 'Internship'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'ഫീൽഡ് ട്രിപ്പുകൾ' : 'Field Trips'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'പ്ലേസ്മെന്റ്' : 'Placement'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'കരിയർ ഗൈഡൻസ്' : 'Career Guidance'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'സിവിൽ സർവീസസ് അക്കാദമി' : 'Civil Services Academy'}</strong></div></Link>
                                        <Link to="#" className="dropdown-item"><div><strong>{siteLanguage === 'ml' ? 'പരാതി പരിഹാര സെൽ' : 'Grievance & Redressal'}</strong></div></Link>
                                    </div>
                                </div>
                            </div>

                            <div className="header-contact-inline">
                                <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="contact-link-inline">
                                    <img src="/images/phone.png" alt="Phone" className="icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> {contactInfo.phone}
                                </a>
                                <a href={`mailto:${contactInfo.email}`} className="contact-link-inline">
                                    <img src="/images/mail.png" alt="Email" className="icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> {contactInfo.email}
                                </a>
                            </div>
                            <div className="action-buttons">
                                {translationPath ? (
                                    <Link to={translationPath} className="toggle" title="Language toggle">
                                        <span className="dot" aria-hidden="true"></span>
                                        <span>{siteLanguage === 'ml' ? 'English' : 'മലയാളം'}</span>
                                    </Link>
                                ) : (
                                    <div className="toggle" onClick={toggleLang} title="Language toggle">
                                        <span className="dot" aria-hidden="true"></span>
                                        <span>{siteLanguage === 'ml' ? 'English' : 'മലയാളം'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-bottom">
                <div id="header_menu">
                    <div className="container">
                        <nav className="main-nav" aria-label="Primary Navigation">
                            {megaMenuHtml ? (
                                <div
                                    key={menuKey}
                                    className={`mega-menu-container lang-${siteLanguage}`}
                                    ref={megaMenuContainerRef}
                                    dangerouslySetInnerHTML={{ __html: megaMenuHtml }}
                                />
                            ) : (
                                <ul className="nav-menu justify-content-center">
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/">ഹോം</Link>
                                    </li>
                                </ul>
                            )}

                        </nav>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="mobile-sheet open" onClick={closeMobile}>
                        <div className="mobile-panel" ref={mobilePanelRef} onClick={e => e.stopPropagation()}>
                            <div className="mobile-head">
                                <button className="mobile-toggle active" onClick={closeMobile} aria-label="Close menu" style={{ marginLeft: 0 }}>
                                    <span className="bar"></span>
                                    <span className="bar"></span>
                                    <span className="bar"></span>
                                </button>
                            </div>

                            <div className="mobile-menu-wrapper">
                                {megaMenuHtml && (
                                    <div
                                        key={`mobile-${menuKey}`}
                                        className={`mega-menu-container-mobile lang-${siteLanguage}`}
                                        dangerouslySetInnerHTML={{ __html: megaMenuHtml.replace(/id="mega-menu-[^"]+"/g, 'id="mega-menu-mobile"') }}
                                    />
                                )}
                                
                                <ul className="mobile-nav-list" id="mobile-custom-menus">
                                    <li className="mega-menu-item mega-menu-item-has-children">
                                        <a href="#" className="mega-menu-link">
                                            {siteLanguage === 'ml' ? 'സൗകര്യങ്ങൾ' : 'Facilities'}
                                            <span className="mega-indicator"></span>
                                        </a>
                                        <ul className="mega-sub-menu">
                                            {topMenuItems.length > 0 ? topMenuItems.map(item => (
                                                <li key={item.id} className="mega-menu-item">
                                                    <a href={item.url || '#'} className="mega-menu-link">{item.title?.rendered || item.title}</a>
                                                </li>
                                            )) : (
                                                <li className="mega-menu-item"><span className="mega-menu-link">{siteLanguage === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}</span></li>
                                            )}
                                        </ul>
                                    </li>

                                    <li className="mega-menu-item mega-menu-item-has-children">
                                        <a href="#" className="mega-menu-link">
                                            {siteLanguage === 'ml' ? 'വിദ്യാർത്ഥി പിന്തുണ' : 'Student Support'}
                                            <span className="mega-indicator"></span>
                                        </a>
                                        <ul className="mega-sub-menu">
                                            {[
                                                { en: 'Scholarship', ml: 'സ്കോളർഷിപ്പ്' },
                                                { en: 'NSS', ml: 'എൻഎസ്എസ്' },
                                                { en: 'PTA', ml: 'പിടിഎ' },
                                                { en: 'Student Union', ml: 'വിദ്യാർത്ഥി യൂണിയൻ' },
                                                { en: 'Student Zone', ml: 'സ്റ്റുഡന്റ് സോൺ' },
                                                { en: 'Internship', ml: 'ഇന്റേൺഷിപ്പ്' },
                                                { en: 'Field Trips', ml: 'ഫീൽഡ് ട്രിപ്പുകൾ' },
                                                { en: 'Placement', ml: 'പ്ലേസ്മെന്റ്' },
                                                { en: 'Career Guidance', ml: 'കരിയർ ഗൈഡൻസ്' },
                                                { en: 'Civil Services Academy', ml: 'സിവിൽ സർവീസസ് അക്കാദമി' },
                                                { en: 'Grievance & Redressal', ml: 'പരാതി പരിഹാര സെൽ' }
                                            ].map((item, i) => (
                                                <li key={i} className="mega-menu-item">
                                                    <a href="#" className="mega-menu-link">
                                                        {siteLanguage === 'ml' ? item.ml : item.en}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}


                <div className="news-ticker-area" ref={tickerRef}>
                    <div className="container">
                        <div className="ticker-wrapper">
                            <div className="ticker-label">
                                <span>{siteLang === 'ml' ? 'അറിയിപ്പുകൾ' : 'Announcements'}</span>
                            </div>
                            <div className="ticker-content">
                                <div className="ticker-scroll" id="notificationsTrack">
                                    {notifications.map((item, index) => (
                                        <a
                                            key={`notif1-${index}`}
                                            href={item.link || '#'}
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                    {/* Duplicated for seamless loop */}
                                    {notifications.map((item, index) => (
                                        <a
                                            key={`notif2-${index}`}
                                            href={item.link || '#'}
                                            aria-hidden="true"
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
