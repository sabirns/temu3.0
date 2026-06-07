import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Departments from './pages/Departments'
import DepartmentSingle from './pages/DepartmentSingle'
import Notifications from './pages/Notifications'
import NotificationSingle from './pages/NotificationSingle'
import WordPressPage from './templates/WordPressPage'

import GallerySingle from './pages/GallerySingle'
import Galleries from './pages/Galleries'
import News from './pages/News'
import NewsSingle from './pages/NewsSingle'
import Naac from './pages/Naac'
import NaacSingle from './pages/NaacSingle'
import Publications from './pages/Publications'
import PublicationSingle from './pages/PublicationSingle'
import PublicationCategory from './pages/PublicationCategory'
import ScrollToTop from './components/ScrollToTop'
import DocumentTitle from './components/DocumentTitle'
import { PageInfoProvider } from './services/PageInfoContext'

function App() {
  return (
    <Router>
      <ScrollToTop />
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
        <Route path="/:lang/ഫാക്കൽറ്റികൾ" element={<Departments />} />
        
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
        <Route path="/:lang/naac" element={<Naac />} />
        <Route path="/naac/:categorySlug/:slug" element={<NaacSingle />} />
        <Route path="/:lang/naac/:categorySlug/:slug" element={<NaacSingle />} />
        
        <Route path="/publications" element={<Publications />} />
        <Route path="/:lang/publications" element={<Publications />} />
        <Route path="/publications/:slug" element={<PublicationSingle />} />
        <Route path="/:lang/publications/:slug" element={<PublicationSingle />} />
        <Route path="/publication-category/:categorySlug" element={<PublicationCategory />} />
        <Route path="/:lang/publication-category/:categorySlug" element={<PublicationCategory />} />
        
        <Route path="/page/:pageId" element={<WordPressPage />} />
        <Route path="/:lang/page/:pageId" element={<WordPressPage />} />
        
        <Route path="/:slug/*" element={<WordPressPage />} />
        <Route path="/:lang/:slug/*" element={<WordPressPage />} />
      </Routes>
      <Footer />
      </PageInfoProvider>
    </Router>
  )
}

export default App
