import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, lazy, Suspense, Component } from 'react'
import { WP_CONFIG } from './config/wpConfig'
import { fixAssetUrl } from './services/wordpressApi'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingSocial from './components/FloatingSocial'
import ScrollToTop from './components/ScrollToTop'
import DocumentTitle from './components/DocumentTitle'
import { PageInfoProvider } from './services/PageInfoContext'
import Landing from './pages/landing'

// Lazy-loaded page components for route code-splitting
const Home = lazy(() => import('./pages/Home'))
const Departments = lazy(() => import('./pages/Departments'))
const Faculties = lazy(() => import('./pages/Faculties'))
const DepartmentSingle = lazy(() => import('./pages/DepartmentSingle'))
const Notifications = lazy(() => import('./pages/Notifications'))
const NotificationSingle = lazy(() => import('./pages/NotificationSingle'))
const WordPressPage = lazy(() => import('./templates/WordPressPage'))
const ContactUs = lazy(() => import('./templates/ContactUs'))
const ChildPagesGrid = lazy(() => import('./templates/ChildPagesGrid'))
const Search = lazy(() => import('./pages/Search'))
const GallerySingle = lazy(() => import('./pages/GallerySingle'))
const Galleries = lazy(() => import('./pages/Galleries'))
const News = lazy(() => import('./pages/News'))
const NewsSingle = lazy(() => import('./pages/NewsSingle'))
const Naac = lazy(() => import('./pages/Naac'))
const NaacSingle = lazy(() => import('./pages/NaacSingle'))
const IqacDashboard = lazy(() => import('./pages/IqacDashboard'))
const IqacSingle = lazy(() => import('./pages/IqacSingle'))
const NssDashboard = lazy(() => import('./pages/NssDashboard'))
const NssSingle = lazy(() => import('./pages/NssSingle'))
const Publications = lazy(() => import('./pages/Publications'))
const PublicationSingle = lazy(() => import('./pages/PublicationSingle'))
const PublicationCategory = lazy(() => import('./pages/PublicationCategory'))
const CourseSingle = lazy(() => import('./pages/CourseSingle'))
const Activities = lazy(() => import('./pages/Activities'))
const ActivitySingle = lazy(() => import('./pages/ActivitySingle'))
const FacultySingle = lazy(() => import('./pages/FacultySingle'))
const FacultyDepartmentSingle = lazy(() => import('./pages/FacultyDepartmentSingle'))
const InitiativesPage = lazy(() => import('./pages/InitiativesPage'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <h2 style={{ color: '#1a3a6e', marginBottom: '12px' }}>എന്തോ തകരാർ സംഭവിച്ചു (Something went wrong)</h2>
          <p style={{ color: '#555', maxWidth: '500px', marginBottom: '24px', lineHeight: 1.6 }}>
            പേജ് ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു. ദയവായി പേജ് വീണ്ടും റീലോഡ് ചെയ്യുക.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1a3a6e',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              റീലോഡ് ചെയ്യുക (Reload)
            </button>
            <a
              href="/ml/home"
              style={{
                background: '#f0b429',
                color: '#0f2347',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '25px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              ഹോം പേജിലേക്ക് (Go Home)
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(178, 34, 34, 0.15)',
        borderTopColor: '#B22222',
        borderRadius: '50%',
        animation: 'appSpin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes appSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function TaxonomyRedirect({ base }) {
  const params = useParams()
  const lang = params.lang || ''
  const to = lang ? `/${lang}/${base}` : `/${base}`
  return <Navigate to={to} replace />
}

function LangFont() {
  const location = useLocation()
  useEffect(() => {
    const lang = location.pathname.split('/').filter(Boolean)[0]
    document.body.className = lang === 'en' ? 'lang-en' : ''
  }, [location])
  return null
}

function LinkInterceptor() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return
      
      const href = anchor.getAttribute('href')
      if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return

      // Check if this is a file asset or media link
      const isFileAsset = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz|7z|mp4|mp3|avi|mov|webp|svg|avif)(?:[?#].*)?$/i.test(href) ||
                          href.includes('/wp-content/') ||
                          href.includes('/wp-includes/') ||
                          href.includes('/uploads/')

      if (isFileAsset) {
        // Ensure href points directly to CMS backend and opens cleanly
        const fixed = fixAssetUrl(href)
        if (fixed && fixed !== href) {
          anchor.setAttribute('href', fixed)
        }
        if (!anchor.target) {
          anchor.setAttribute('target', '_blank')
          anchor.setAttribute('rel', 'noopener noreferrer')
        }
        // Do NOT intercept file attachments with React Router; let the browser open/download them directly
        return
      }

      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

      try {
        const url = new URL(href, window.location.origin)
        const wpHost = new URL(WP_CONFIG.SITE_URL).host

        // Strictly exclude archive subdomain
        if (url.host === 'archive.malayalamuniversity.edu.in') {
          return
        }

        const isInternal = url.host === window.location.host ||
                           url.host === wpHost ||
                           url.host === 'malayalamuniversity.edu.in' ||
                           url.host === 'www.malayalamuniversity.edu.in' ||
                           url.host === 'localhost' ||
                           url.host === '127.0.0.1'
        
        if (isInternal) {
          e.preventDefault()
          let path = url.pathname
          const wpBasePath = new URL(WP_CONFIG.SITE_URL).pathname.replace(/\/$/, '')
          const knownBasePaths = ['/sabir/mu', wpBasePath].filter(Boolean)
          for (const bp of knownBasePaths) {
            if (bp !== '/' && path.startsWith(bp)) {
              path = path.slice(bp.length)
              break
            }
          }
          const destination = (path || '/') + url.search + url.hash
          navigate(destination)
        }
      } catch {}
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [navigate])

  return null
}

function AppContent() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/landing/'

  return (
    <PageInfoProvider>
      {!isLandingPage && <div className="grid-bg" aria-hidden="true"></div>}
      {!isLandingPage && <Header />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<Navigate to="/ml/home" replace />} />
        <Route path="/home-page" element={<Navigate to="/ml/home" replace />} />
        <Route path="/home-page-ml" element={<Navigate to="/ml/home" replace />} />
        <Route path="/home-page-en" element={<Navigate to="/en/home" replace />} />
        <Route path="/:lang/home" element={<Home />} />
        <Route path="/:lang/home/*" element={<Home />} />
        <Route path="/:lang/home-page" element={<Navigate to="/:lang/home" replace />} />
        <Route path="/:lang/home-page-ml" element={<Navigate to="/ml/home" replace />} />
        <Route path="/:lang/home-page-en" element={<Navigate to="/en/home" replace />} />
        <Route path="/:lang" element={<Home />} />

        <Route path="/search" element={<Search />} />
        <Route path="/:lang/search" element={<Search />} />
        
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/:lang/notifications" element={<Notifications />} />
        <Route path="/notifications/:slug" element={<NotificationSingle />} />
        <Route path="/:lang/notifications/:slug" element={<NotificationSingle />} />
        
        <Route path="/departments" element={<Departments />} />
        <Route path="/:lang/departments" element={<Departments />} />

        <Route path="/faculties" element={<Faculties />} />
        <Route path="/:lang/faculties" element={<Faculties />} />
        <Route path="/:lang/ഫാക്കൽറ്റികൾ" element={<Faculties />} />
        
        <Route path="/faculty-department/:slug" element={<FacultyDepartmentSingle />} />
        <Route path="/:lang/faculty-department/:slug" element={<FacultyDepartmentSingle />} />
        
        <Route path="/department/:id" element={<DepartmentSingle />} />
        <Route path="/:lang/department/:id" element={<DepartmentSingle />} />
        
        <Route path="/gallery" element={<Galleries />} />
        <Route path="/:lang/gallery" element={<Galleries />} />
        
        <Route path="/gallery/:slug" element={<GallerySingle />} />
        <Route path="/:lang/gallery/:slug" element={<GallerySingle />} />
        
        <Route path="/news" element={<News />} />
        <Route path="/:lang/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsSingle />} />
        <Route path="/:lang/news/:slug" element={<NewsSingle />} />
        
        <Route path="/naac" element={<Naac />} />
        <Route path="/naac/" element={<Naac />} />
        <Route path="/:lang/naac" element={<Naac />} />
        <Route path="/:lang/naac/" element={<Naac />} />
        <Route path="/naac/:categorySlug/:slug" element={<NaacSingle />} />
        <Route path="/:lang/naac/:categorySlug/:slug" element={<NaacSingle />} />

        <Route path="/iqac" element={<IqacDashboard />} />
        <Route path="/iqac/" element={<IqacDashboard />} />
        <Route path="/:lang/iqac" element={<IqacDashboard />} />
        <Route path="/:lang/iqac/" element={<IqacDashboard />} />
        <Route path="/iqac/:categorySlug/:slug" element={<IqacSingle />} />
        <Route path="/:lang/iqac/:categorySlug/:slug" element={<IqacSingle />} />
        <Route path="/iqac-category/:slug" element={<IqacSingle />} />
        <Route path="/:lang/iqac-category/:slug" element={<IqacSingle />} />

        <Route path="/nss" element={<NssDashboard />} />
        <Route path="/nss/" element={<NssDashboard />} />
        <Route path="/:lang/nss" element={<NssDashboard />} />
        <Route path="/:lang/nss/" element={<NssDashboard />} />
        <Route path="/nss-en" element={<NssDashboard />} />
        <Route path="/:lang/nss-en" element={<NssDashboard />} />
        <Route path="/nss/:slug" element={<NssSingle />} />
        <Route path="/:lang/nss/:slug" element={<NssSingle />} />
        
        <Route path="/publications" element={<Publications />} />
        <Route path="/:lang/publications" element={<Publications />} />
        <Route path="/publications/:slug" element={<PublicationSingle />} />
        <Route path="/:lang/publications/:slug" element={<PublicationSingle />} />
        <Route path="/publication-category/:categorySlug" element={<PublicationCategory />} />
        <Route path="/:lang/publication-category/:categorySlug" element={<PublicationCategory />} />
        
        <Route path="/page/:pageId" element={<WordPressPage />} />
        <Route path="/:lang/page/:pageId" element={<WordPressPage />} />
        
        <Route path="/:lang/our-courses-ml" element={<ChildPagesGrid />} />
        <Route path="/:lang/courses-offered" element={<ChildPagesGrid />} />
        <Route path="/courses/:slug" element={<CourseSingle />} />
        <Route path="/:lang/courses/:slug" element={<CourseSingle />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/:lang/activities" element={<Activities />} />
        <Route path="/activities/department/:termSlug" element={<Activities />} />
        <Route path="/:lang/activities/department/:termSlug" element={<Activities />} />
        <Route path="/activity/:slug" element={<ActivitySingle />} />
        <Route path="/:lang/activity/:slug" element={<ActivitySingle />} />
        <Route path="/faculty/:slug" element={<FacultySingle />} />
        <Route path="/:lang/faculty/:slug" element={<FacultySingle />} />
        <Route path="/initiatives" element={<InitiativesPage />} />
        <Route path="/:lang/initiatives" element={<InitiativesPage />} />
        <Route path="/പദ്ധതികളും-സംരംഭങ്ങളും" element={<InitiativesPage />} />
        <Route path="/:lang/പദ്ധതികളും-സംരംഭങ്ങളും" element={<InitiativesPage />} />

        <Route path="/എൻ-എസ്-എസ്" element={<Navigate to="/nss" replace />} />
        <Route path="/ml/എൻ-എസ്-എസ്" element={<Navigate to="/ml/nss" replace />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/contact-us-ml" element={<ContactUs />} />
        <Route path="/:lang/contact-us" element={<ContactUs />} />
        <Route path="/:lang/contact-us-ml" element={<ContactUs />} />
        <Route path="/:slug/*" element={<WordPressPage />} />
        <Route path="/:lang/:slug/*" element={<WordPressPage />} />
      </Routes>
      </Suspense>
      {!isLandingPage && <Footer />}
      {!isLandingPage && <FloatingSocial />}
    </PageInfoProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LinkInterceptor />
        <ScrollToTop />
        <LangFont />
        <DocumentTitle />
        <AppContent />
      </Router>
    </ErrorBoundary>
  )
}

export default App
