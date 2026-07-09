import { useLocation, useSearchParams } from 'react-router-dom'
import { getLanguageContext } from '../services/wordpressApi'

function Footer() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-bg"></div>
      <div className="footer-gradient-bar"></div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-links">
            <h4 className="footer-heading">{lang === 'ml' ? 'പ്രധാന ലിങ്കുകൾ' : 'Quick Links'}</h4>
            <ul className="footer-list">
              {[
                { label: lang === 'ml' ? 'വിദ്യാർത്ഥിക്ഷേമം' : 'Student Welfare', href: '#' },
                { label: lang === 'ml' ? 'വിദ്യാർത്ഥി യൂണിയൻ' : 'Student Union', href: '#' },
                { label: lang === 'ml' ? 'വീഡിയോ ഗാലറി' : 'Video Gallery', href: '#' },
                { label: lang === 'ml' ? 'ക്യാമ്പസ്' : 'Campus', href: '#campus' },
                { label: lang === 'ml' ? 'ഫീസ് പേയ്‌മെന്റ്' : 'Fee Payment', href: '#' },
                { label: lang === 'ml' ? 'ഒഴിവുകൾ' : 'Vacancies', href: '#' },
                { label: 'RTI', href: '#' },
                { label: lang === 'ml' ? 'സംശയങ്ങൾ' : 'Queries', href: '#' }
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section footer-useful">
            <h4 className="footer-heading">{lang === 'ml' ? 'ഉപയോഗപ്രദമായ ലിങ്കുകൾ' : 'Useful Links'}</h4>
            <ul className="footer-list">
              {[
                { label: lang === 'ml' ? 'കേരള സർക്കാർ' : 'Govt of Kerala', href: 'https://kerala.gov.in/' },
                { label: lang === 'ml' ? 'ഉന്നത വിദ്യാഭ്യാസം' : 'Higher Education', href: 'http://www.highereducation.kerala.gov.in/' },
                { label: lang === 'ml' ? 'ഇ-ഗ്രാന്റ്സ്' : 'E-Grantz', href: 'http://www.e-grantz.kerala.gov.in/' },
                { label: lang === 'ml' ? 'എൽ.എം.എസ്' : 'LMS', href: 'https://lms.temu.ac.in/' },
                { label: 'NAAC', href: '#' },
                { label: 'IQAC', href: '#' }
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4 className="footer-heading">{lang === 'ml' ? 'ബന്ധപ്പെടുക' : 'Contact Us'}</h4>
            <div className="footer-contact-list">
              {[
                { icon: '📍', label: lang === 'ml' ? 'വിലാസം' : 'Address', value: lang === 'ml' ? 'തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാള സർവകലാശാല, തിരൂർ, വാക്കാട്, തിരൂര്‍, മലപ്പുറം, കേരളം, പിന്‍:676 502' : 'Thunchath Ezhuthachan Malayalam University, Vakkad, Tirur, Malappuram, Kerala, PIN: 676 502' },
                { icon: '📞', label: lang === 'ml' ? 'ഫോൺ' : 'Phone', value: '+91 494 2740000' },
                { icon: '✉️', label: lang === 'ml' ? 'ഇമെയിൽ' : 'Email', value: 'info@malayalamuniversity.edu.in' },
                { icon: '🌐', label: lang === 'ml' ? 'വെബ്സൈറ്റ്' : 'Website', value: 'www.malayalamuniversity.edu.in' }
              ].map((item, i) => (
                <div key={i} className="contact-item">
                  <span className="contact-icon">{item.icon}</span>
                  <div>
                    <span className="contact-label">{item.label}</span>
                    <span className="contact-value">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="footer-social">
              <h4 className="footer-heading social-heading">{lang === 'ml' ? 'സോഷ്യൽ മീഡിയ' : 'Social Media'}</h4>
              <div className="footer-social-icons">
                <a href="https://www.facebook.com/malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon facebook" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.threads.net/@malayalamuniversity" target="_blank" rel="noopener noreferrer" className="social-icon threads" aria-label="Threads">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.242 11.498c.087-.38.162-.742.162-1.244 0-2.039-1.444-3.29-3.451-3.29-1.898 0-3.37 1.261-3.37 3.287 0 1.983 1.215 3.168 3.191 3.168 1.55 0 2.573-.497 3.128-1.176-.034-.02-.068-.043-.102-.065-.33-.212-.816-.585-.816-1.303 0-.797.615-1.237 1.258-1.377zm3.496 7.439c-1.49 1.343-3.636 1.948-6.126 1.948-3.409 0-6.17-1.142-8.03-3.468C1.759 15.14.93 12.473.93 9.97c0-2.505.83-5.171 2.652-7.447C5.442.197 8.202-.945 11.612-.945c3.452 0 6.245 1.135 8.141 3.447 1.854 2.266 2.705 4.941 2.705 7.444 0 2.518-.847 5.233-2.717 7.5 0 0-1.8 2.221-5.152 2.221-2.98 0-4.637-1.582-4.637-1.582l.726-1.244s1.482 1.297 3.911 1.297c2.318 0 3.838-1.55 4.573-2.503 0 0 .674 1.052 2.164 1.052.743 0 1.297-.183 1.297-.183s-.168.443-.569.828z"/></svg>
                </a>
                <a href="https://x.com/malayalamuni" target="_blank" rel="noopener noreferrer" className="social-icon x" aria-label="X (Twitter)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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
