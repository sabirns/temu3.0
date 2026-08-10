import React, { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { getLanguageContext } from '../services/wordpressApi'
import '../styles/floatingSocial.css'

function FloatingSocial() {
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const lang = getLanguageContext(location.pathname, searchParams)
    const [isOpen, setIsOpen] = useState(false)
    const closeTimeoutRef = React.useRef(null)

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 350)
    }

    const handleToggleClick = (e) => {
        e.stopPropagation()
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setIsOpen(prev => !prev)
    }

    const socialLinks = [
        {
            id: 'facebook',
            name: 'Facebook',
            labelMl: 'ഫെയ്‌സ്ബുക്ക്',
            url: 'https://www.facebook.com/malayalamuniversity',
            bg: '#1877f2',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.125 0-1.71.379-1.71 1.758v1.92h3.3l-.402 3.667h-2.898v7.98H9.101z" />
                </svg>
            )
        },
        {
            id: 'instagram',
            name: 'Instagram',
            labelMl: 'ഇൻസ്റ്റാഗ്രാം',
            url: 'https://www.instagram.com/malayalamuniversity',
            bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.848 5.848 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.757 6.162 6.162 6.162 3.405 0 6.162-2.757 6.162-6.162 0-3.402-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
            )
        },
        {
            id: 'threads',
            name: 'Threads',
            labelMl: 'ത്രെഡ്സ്',
            url: 'https://www.threads.net/@malayalamuniversity',
            bg: '#101010',
            icon: (
                <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M259.965 512h-.147c-76.391-.518-135.117-25.703-174.575-74.879-35.125-43.755-53.232-104.638-53.84-180.936v-.37c.609-76.316 18.715-137.182 53.84-180.936C124.682 25.703 183.427.516 259.799 0h.295c58.56.387 107.551 15.451 145.626 44.732 35.789 27.529 60.977 66.766 74.879 116.642l-43.514 12.133C413.54 89.04 353.947 45.857 259.947 45.175c-62.064.442-108.99 19.95-139.505 57.971-28.58 35.605-43.349 87.03-43.884 152.836.553 65.825 15.322 117.25 43.884 152.837 30.516 38.019 77.441 57.526 139.505 57.969 55.941-.405 92.967-13.44 123.76-43.606 35.143-34.426 34.498-76.649 23.25-102.333-6.619-15.139-18.643-27.75-34.85-37.302-4.073 28.802-13.239 52.181-27.399 69.791-18.882 23.508-45.653 36.361-79.544 38.185-25.648 1.382-50.355-4.682-69.531-17.092-22.68-14.677-35.955-37.136-37.375-63.244-1.383-25.389 8.685-48.733 28.34-65.734 18.789-16.244 45.211-25.776 76.427-27.528 23.011-1.291 44.528-.276 64.424 3.042-2.637-15.839-7.983-28.395-15.949-37.467-10.953-12.483-27.898-18.862-50.337-19.01h-.627c-18.014 0-42.482 4.941-58.081 28.137l-37.485-25.205c20.872-31.032 54.781-48.106 95.548-48.106h.922c68.167.424 108.751 42.113 112.789 114.926 2.321.979 4.591 1.991 6.84 3.043 31.807 14.954 55.057 37.597 67.263 65.476 17.001 38.867 18.568 102.205-33.041 152.725-39.422 38.609-87.289 56.034-155.197 56.496h-.147l.018.019zm21.389-249.418c-5.163 0-10.4.147-15.748.461-39.181 2.213-63.594 20.154-62.211 45.709 1.457 26.773 30.995 39.218 59.372 37.689 26.127-1.403 60.129-11.562 65.825-79.158-14.42-3.078-30.275-4.701-47.239-4.701z" />
                </svg>
            )
        },
        {
            id: 'x',
            name: 'X (Twitter)',
            labelMl: 'എക്സ് (ട്വിറ്റർ)',
            url: 'https://x.com/malayalamuni',
            bg: '#0f1419',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            )
        },
        {
            id: 'youtube',
            name: 'YouTube',
            labelMl: 'യൂട്യൂബ്',
            url: 'https://www.youtube.com/@malayalamuniversity',
            bg: '#ff0000',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            )
        }
    ]

    return (
        <div 
            className={`floating-social-wrapper ${isOpen ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="floating-social-menu">
                {socialLinks.map((item, index) => (
                    <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`floating-social-item ${item.id}`}
                        style={{
                            '--bg-color': item.bg,
                            '--item-index': socialLinks.length - index
                        }}
                        aria-label={item.name}
                    >
                        <span className="floating-social-label">
                            {lang === 'ml' ? item.labelMl : item.name}
                        </span>
                        <div className="floating-social-icon-box">
                            {item.icon}
                        </div>
                    </a>
                ))}
            </div>

            <button
                type="button"
                className="floating-social-toggle"
                onClick={handleToggleClick}
                aria-label={lang === 'ml' ? 'സോഷ്യൽ മീഡിയ ലിങ്കുകൾ' : 'Social Media Links'}
                aria-expanded={isOpen}
            >
                <div className="toggle-icon-container">
                    <span className="share-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </span>
                    <span className="close-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </span>
                </div>
                <span className="main-toggle-tooltip">
                    {lang === 'ml' ? 'സോഷ്യൽ മീഡിയ' : 'Connect With Us'}
                </span>
            </button>
        </div>
    )
}

export default FloatingSocial
