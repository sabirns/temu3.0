function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-bg"></div>
      <div className="footer-gradient-bar"></div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-links">
            <h4 className="footer-heading">പ്രധാന ലിങ്കുകൾ</h4>
            <ul className="footer-list">
              {[
                { label: 'വിദ്യാർത്ഥിക്ഷേമം', href: '#' },
                { label: 'വിദ്യാർത്ഥി യൂണിയൻ', href: '#' },
                { label: 'വീഡിയോ ഗാലറി', href: '#' },
                { label: 'ക്യാമ്പസ്', href: '#campus' },
                { label: 'ഫീസ് പേയ്‌മെന്റ്', href: '#' },
                { label: 'ഒഴിവുകൾ', href: '#' },
                { label: 'RTI', href: '#' },
                { label: 'സംശയങ്ങൾ', href: '#' }
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section footer-useful">
            <h4 className="footer-heading">ഉപയോഗപ്രദമായ ലിങ്കുകൾ</h4>
            <ul className="footer-list">
              {[
                { label: 'കേരള സർക്കാർ', href: 'https://kerala.gov.in/' },
                { label: 'ഉന്നത വിദ്യാഭ്യാസം', href: 'http://www.highereducation.kerala.gov.in/' },
                { label: 'ഇ-ഗ്രാന്റ്സ്', href: 'http://www.e-grantz.kerala.gov.in/' },
                { label: 'എൽ.എം.എസ്', href: 'https://lms.temu.ac.in/' },
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
            <h4 className="footer-heading">ബന്ധപ്പെടുക</h4>
            <div className="footer-contact-list">
              {[
                { icon: '📍', label: 'വിലാസം', value: 'തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാള സർവകലാശാല, തിരൂർ,  വാക്കാട്, തിരൂര്‍, മലപ്പുറം, കേരളം, പിന്‍:676 502' },
                { icon: '📞', label: 'ഫോൺ', value: '+91 494 2740000' },
                { icon: '✉️', label: 'ഇമെയിൽ', value: 'info@malayalamuniversity.edu.in' },
                { icon: '🌐', label: 'വെബ്സൈറ്റ്', value: 'www.malayalamuniversity.edu.in' }
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
          </div>
        </div>

        <div className="footer-map-section">
          <div className="map-info">
            <h5>📍 കാമ്പസ് ലൊക്കേഷൻ</h5>
            <p> തുഞ്ചത്തെഴുത്തച്ഛന്‍ മലയാളസര്‍വകലാശാല, <br />  വാക്കാട്, തിരൂര്‍, മലപ്പുറം, പിന്‍:676 502</p>
          </div>
          <a href="https://maps.app.goo.gl/mR1hviU5Whku6FrA9" target="_blank" rel="noopener" className="map-link">
            മാപ്പിൽ കാണുക →
          </a>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>© {year} തുഞ്ചത്ത് എഴുത്തച്ഛൻ മലയാള സർവകലാശാല. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.</p>
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
