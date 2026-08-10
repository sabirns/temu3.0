import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { getLanguageContext } from '../services/wordpressApi'

function Footer() {
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const lang = getLanguageContext(location.pathname, searchParams)

    const [contactInfo, setContactInfo] = useState({
        address: lang === 'ml' ? 'തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാള സർവകലാശാല, തിരൂർ, വാക്കാട്, തിരൂര്‍, മലപ്പുറം, കേരളം, പിന്‍:676 502' : 'Thunchath Ezhuthachan Malayalam University, Vakkad, Tirur, Malappuram, Kerala, PIN: 676 502',
        phone: '+91 494 2740000',
        email: 'info@malayalamuniversity.edu.in'
    })

    useEffect(() => {
        async function fetchContactInfo() {
            try {
                const slug = lang === 'ml' ? 'contact-us-ml' : 'contact-us'
                const { fetchPageBySlug } = await import('../services/wordpressApi')
                const page = await fetchPageBySlug(slug, { lang })
                if (page && page.acf) {
                    let phone = contactInfo.phone
                    let email = contactInfo.email
                    let address = contactInfo.address
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
                            if (k.includes('address') || k.includes('location')) {
                                address = value
                            }
                        }
                    }
                    setContactInfo({ phone, email, address })
                }
            } catch (e) {
                console.error("Failed to fetch contact info:", e)
            }
        }
        fetchContactInfo()
    }, [lang])

    const year = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-bg"></div>
            <div className="footer-gradient-bar"></div>

            <div className="container">
                <div className="footer-content">

                    <div className="footer-section footer-useful">
                        <h4 className="footer-heading">{lang === 'ml' ? 'ഉപയോഗപ്രദമായ ലിങ്കുകൾ' : 'Useful Links'}</h4>

                        <p className="footer-group-heading">{lang === 'ml' ? 'കേന്ദ്ര / സംസ്ഥാന സർക്കാർ വെബ്സൈറ്റുകൾ' : 'Central / State Govt Websites'}</p>
                        <ul className="footer-list">
                            {[
                                { label: lang === 'ml' ? 'കേരള സർക്കാർ ഔദ്യോഗിക വെബ് പോർട്ടൽ' : 'Kerala Govt Official Web Portal', href: 'https://kerala.gov.in/' },
                                { label: lang === 'ml' ? 'ഐടി മിഷൻ, കേരള' : 'IT Mission, Kerala', href: 'http://www.itmission.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'ഉന്നത വിദ്യാഭ്യാസ വകുപ്പ്, കേരള' : 'Dept. of Higher Education, Kerala', href: 'http://www.highereducation.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'ഇ-ഗ്രാന്റ്സ്' : 'E-Grantz', href: 'http://www.e-grantz.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'ഫിഷറീസ് ഇ-ഗ്രാന്റ്സ്' : 'Fisheries E-Grantz', href: 'http://www.egrantzfisheries.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'ഡിസിഇ സ്കോളർഷിപ്പ്' : 'DCE Scholarship', href: 'http://www.dcescholarship.kerala.gov.in' },
                                { label: lang === 'ml' ? 'കേരള ന്യൂനപക്ഷ ക്ഷേമ സ്കോളർഷിപ്പ്' : 'Kerala Minority Welfare Scholarship', href: 'http://www.minoritywelfare.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'മുഖ്യമന്ത്രിയുടെ പൊതുജന പരാതി പരിഹാര സംവിധാനം' : "Chief Minister's Public Grievance Redressal System", href: 'http://www.cmo.kerala.gov.in/' },
                                { label: lang === 'ml' ? 'നാഷണൽ കരിയർ സർവീസ്' : 'National Career Service', href: 'https://www.ncs.gov.in/' },
                            ].map((item, i) => (
                                <li key={i}>
                                    <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                                </li>
                            ))}
                        </ul>

                        <div className="footer-useful-row">
                            <div>
                                <p className="footer-group-heading">{lang === 'ml' ? 'യുജിസി ഫെലോഷിപ്പ്' : 'UGC Fellowship'}</p>
                                <ul className="footer-list">
                                    <li>
                                        <a href="https://ugc.ac.in/" target="_blank" rel="noopener noreferrer">
                                            {lang === 'ml' ? 'യുജിസി ഫെലോഷിപ്പ്' : 'UGC Fellowship'}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="footer-group-heading">{lang === 'ml' ? 'നാഷണൽ സ്കോളർഷിപ്പ് പോർട്ടൽ' : 'National Scholarship Portal'}</p>
                                <ul className="footer-list">
                                    <li>
                                        <a href="https://scholarships.gov.in/" target="_blank" rel="noopener noreferrer">
                                            {lang === 'ml' ? 'നാഷണൽ സ്കോളർഷിപ്പ് പോർട്ടൽ' : 'National Scholarship Portal'}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section footer-contact">
                        <h4 className="footer-heading">{lang === 'ml' ? 'ബന്ധപ്പെടുക' : 'Contact Us'}</h4>
                        <div className="footer-contact-list">
                            {[
                                { icon: '📍', label: lang === 'ml' ? 'വിലാസം' : 'Address', value: contactInfo.address },
                                { icon: '📞', label: lang === 'ml' ? 'ഫോൺ' : 'Phone', value: contactInfo.phone },
                                { icon: '✉️', label: lang === 'ml' ? 'ഇമെയിൽ' : 'Email', value: contactInfo.email },
                                { icon: '🌐', label: lang === 'ml' ? 'വെബ്സൈറ്റ്' : 'Website', value: 'www.malayalamuniversity.edu.in' }
                            ].map((item, i) => (
                                <div key={i} className="contact-item">
                                    <span className="contact-icon">{item.icon}</span>
                                    <div>
                                        <span className="contact-label">{item.label}</span>
                                        <span
                                            className="contact-value"
                                            dangerouslySetInnerHTML={{ __html: item.value || '' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="footer-social">
                            <h4 className="footer-heading social-heading">{lang === 'ml' ? 'സോഷ്യൽ മീഡിയ' : 'Social Media'}</h4>
                            <div className="footer-social-icons">
                                <a href="https://www.facebook.com/malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon facebook" aria-label="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.125 0-1.71.379-1.71 1.758v1.92h3.3l-.402 3.667h-2.898v7.98H9.101z" /></svg>
                                </a>
                                <a href="https://www.instagram.com/malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.848 5.848 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.757 6.162 6.162 6.162 3.405 0 6.162-2.757 6.162-6.162 0-3.402-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                                </a>
                                <a href="https://www.threads.net/@malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon threads" aria-label="Threads">
                                    <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor"><path d="M259.965 512h-.147c-76.391-.518-135.117-25.703-174.575-74.879-35.125-43.755-53.232-104.638-53.84-180.936v-.37c.609-76.316 18.715-137.182 53.84-180.936C124.682 25.703 183.427.516 259.799 0h.295c58.56.387 107.551 15.451 145.626 44.732 35.789 27.529 60.977 66.766 74.879 116.642l-43.514 12.133C413.54 89.04 353.947 45.857 259.947 45.175c-62.064.442-108.99 19.95-139.505 57.971-28.58 35.605-43.349 87.03-43.884 152.836.553 65.825 15.322 117.25 43.884 152.837 30.516 38.019 77.441 57.526 139.505 57.969 55.941-.405 92.967-13.44 123.76-43.606 35.143-34.426 34.498-76.649 23.25-102.333-6.619-15.139-18.643-27.75-34.85-37.302-4.073 28.802-13.239 52.181-27.399 69.791-18.882 23.508-45.653 36.361-79.544 38.185-25.648 1.382-50.355-4.682-69.531-17.092-22.68-14.677-35.955-37.136-37.375-63.244-1.383-25.389 8.685-48.733 28.34-65.734 18.789-16.244 45.211-25.776 76.427-27.528 23.011-1.291 44.528-.276 64.424 3.042-2.637-15.839-7.983-28.395-15.949-37.467-10.953-12.483-27.898-18.862-50.337-19.01h-.627c-18.014 0-42.482 4.941-58.081 28.137l-37.485-25.205c20.872-31.032 54.781-48.106 95.548-48.106h.922c68.167.424 108.751 42.113 112.789 114.926 2.321.979 4.591 1.991 6.84 3.043 31.807 14.954 55.057 37.597 67.263 65.476 17.001 38.867 18.568 102.205-33.041 152.725-39.422 38.609-87.289 56.034-155.197 56.496h-.147l.018.019zm21.389-249.418c-5.163 0-10.4.147-15.748.461-39.181 2.213-63.594 20.154-62.211 45.709 1.457 26.773 30.995 39.218 59.372 37.689 26.127-1.403 60.129-11.562 65.825-79.158-14.42-3.078-30.275-4.701-47.239-4.701z"></path></svg>
                                </a>
                                <a href="https://x.com/malayalamuni" target="_blank" rel="noopener noreferrer" className="social-icon x" aria-label="X (Twitter)">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="footer-map-section">
                    <div className="map-info">
                        <h5>📍 {lang === 'ml' ? 'കാമ്പസ് ലൊക്കേഷൻ' : 'Campus Location'}</h5>
                        <p> {lang === 'ml' ? 'തുഞ്ചത്തെഴുത്തച്ഛന്‍ മലയാളസര്‍വകലാശാല, വാക്കാട്, തിരൂര്‍, മലപ്പുറം, പിന്‍:676 502' : 'Thunchath Ezhuthachan Malayalam University, Vakkad, Tirur, Malappuram, PIN: 676 502'}</p>
                    </div>
                    <a href="https://maps.app.goo.gl/mR1hviU5Whku6FrA9" target="_blank" rel="noopener" className="map-link">
                        {lang === 'ml' ? 'മാപ്പിൽ കാണുക →' : 'View on Map →'}
                    </a>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p>© {year} {lang === 'ml' ? 'തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാള സർവകലാശാല. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.' : 'Thunchath Ezhuthachan Malayalam University. All rights reserved.'}</p>
                        <p className="footer-credit">
                            Developed by <a href="https://sprdh.com" target="_blank" rel="noopener">SPRDH SOLUTIONS PVT LTD.</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
