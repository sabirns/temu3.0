import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Departments from './pages/Departments'
import Faculties from './pages/Faculties'
import DepartmentSingle from './pages/DepartmentSingle'
import Notifications from './pages/Notifications'
import NotificationSingle from './pages/NotificationSingle'
import WordPressPage from './templates/WordPressPage'
import ContactUs from './templates/ContactUs'
import ChildPagesGrid from './templates/ChildPagesGrid'

import GallerySingle from './pages/GallerySingle'
import Galleries from './pages/Galleries'
import News from './pages/News'
import NewsSingle from './pages/NewsSingle'
import Naac from './pages/Naac'
import NaacSingle from './pages/NaacSingle'
import IqacDashboard from './pages/IqacDashboard'
import IqacSingle from './pages/IqacSingle'
import NssDashboard from './pages/NssDashboard'
import NssSingle from './pages/NssSingle'
import Publications from './pages/Publications'
import PublicationSingle from './pages/PublicationSingle'
import PublicationCategory from './pages/PublicationCategory'
import CourseSingle from './pages/CourseSingle'
import Activities from './pages/Activities'
import ActivitySingle from './pages/ActivitySingle'
import FacultySingle from './pages/FacultySingle'
import InitiativesPage from './pages/InitiativesPage'
import ScrollToTop from './components/ScrollToTop'
import DocumentTitle from './components/DocumentTitle'
import { PageInfoProvider } from './services/PageInfoContext'

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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LangFont />
      <DocumentTitle />
      <PageInfoProvider>
      <div className="grid-bg" aria-hidden="true"></div>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/ml" replace />} />
        <Route path="/:lang" element={<Home />} />
        
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/:lang/notifications" element={<Notifications />} />
        <Route path="/notifications/:slug" element={<NotificationSingle />} />
        <Route path="/:lang/notifications/:slug" element={<NotificationSingle />} />
        
        <Route path="/departments" element={<Departments />} />
        <Route path="/:lang/departments" element={<Departments />} />

        <Route path="/faculties" element={<Faculties />} />
        <Route path="/:lang/faculties" element={<Faculties />} />
        <Route path="/:lang/ഫാക്കൽറ്റികൾ" element={<Faculties />} />
        
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
      <Footer />
      </PageInfoProvider>
    </Router>
  )
}

export default App
