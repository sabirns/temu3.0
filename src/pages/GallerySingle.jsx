import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { fetchGalleryBySlug, getLanguageContext, extractTranslationSlugs } from '../services/wordpressApi'
import { usePageInfo } from '../services/PageInfoContext'
import '../styles/pages.css'

function deriveFullFromThumb(url) {
  if (!url || typeof url !== 'string') return null
  return url.replace(/-\d+x\d+(?=\.[^.]+$)/, '')
}

function getFullImageUrl(img) {
  if (typeof img === 'string') return img
  if (img.full_image_url && typeof img.full_image_url === 'string') return img.full_image_url
  if (img.source_url) return img.source_url
  const s = img.sizes || {}
  const bigSizes = ['2048x2048', '1920x1920', 'full', 'large', 'medium_large']
  for (const k of bigSizes) {
    if (s[k]) return s[k]
  }
  if (img.url) return img.url
  return deriveFullFromThumb(img.thumbnail_image_url) || null
}

function getThumbnailUrl(img) {
  if (typeof img === 'string') return img
  if (img.thumbnail_image_url && typeof img.thumbnail_image_url === 'string') return img.thumbnail_image_url
  const s = img.sizes || {}
  if (s.thumbnail) return s.thumbnail
  if (s.medium) return s.medium
  if (s.medium_large) return s.medium_large
  return img.url || img.source_url || null
}

function GallerySingle() {
  const { slug } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const lang = getLanguageContext(location.pathname, searchParams)
  
  const { setPageInfo } = usePageInfo()

  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageTitle, setImageTitle] = useState('')

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true)
      try {
        const decodedSlug = decodeURIComponent(slug);
        const data = await fetchGalleryBySlug(decodedSlug, { lang, _t: Date.now() })
        if (data) setPageInfo({ id: data.id, postType: 'gallery', translationSlugs: await extractTranslationSlugs(data, 'gallery') })
        setGallery(data)
      } catch (error) {
        console.error("Error loading gallery:", error)
      }
      setLoading(false)
    }
    if (slug) {
      loadGallery()
    }
  }, [slug, lang])

  // Handle images extraction
  let images = []
  let cleanContent = gallery?.content || ''

  if (gallery?.acf?.photo_gallery?.gallery_images && Array.isArray(gallery.acf.photo_gallery.gallery_images)) {
    const raw = gallery.acf.photo_gallery.gallery_images
    images = Array.isArray(raw[0]) ? raw[0] : raw
  } else if (gallery?.acf?.gallery && Array.isArray(gallery.acf.gallery)) {
    images = gallery.acf.gallery
  } else if (gallery?.content) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(gallery.content, 'text/html')
    const imgElements = doc.querySelectorAll('img')
    
    if (imgElements.length > 0) {
      imgElements.forEach((img, index) => {
        const thumbSrc = img.getAttribute('src')
        const fullSrc = img.getAttribute('data-full-url') || img.getAttribute('data-orig-file') || img.getAttribute('src')

        images.push({
          url: thumbSrc,
          full_image_url: fullSrc,
          alt: img.getAttribute('alt') || `Gallery Image ${index + 1}`,
          title: img.getAttribute('title') || img.closest('figure')?.querySelector('figcaption')?.textContent || ''
        })
      })

      // Optional: Clean content by removing figures/images to avoid duplication
      const tempDoc = parser.parseFromString(gallery.content, 'text/html')
      tempDoc.querySelectorAll('figure, img, .wp-block-gallery').forEach(el => el.remove())
      cleanContent = tempDoc.body.innerHTML.trim()
    }
  }

  const openLightbox = (img, index) => {
    setSelectedImage(getFullImageUrl(img))
    setCurrentIndex(index)
    setImageTitle(typeof img === 'string' ? '' : img.title || img.caption || '')
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  const nextImage = (e) => {
    e.stopPropagation()
    const nextIdx = (currentIndex + 1) % images.length
    const img = images[nextIdx]
    setSelectedImage(getFullImageUrl(img))
    setCurrentIndex(nextIdx)
    setImageTitle(typeof img === 'string' ? '' : img.title || img.caption || '')
  }

  const prevImage = (e) => {
    e.stopPropagation()
    const prevIdx = (currentIndex - 1 + images.length) % images.length
    const img = images[prevIdx]
    setSelectedImage(getFullImageUrl(img))
    setCurrentIndex(prevIdx)
    setImageTitle(typeof img === 'string' ? '' : img.title || img.caption || '')
  }

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage(e)
      if (e.key === 'ArrowLeft') prevImage(e)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedImage, currentIndex, images])

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>{lang === 'ml' ? 'ഗാലറി ലോഡ് ചെയ്യുന്നു...' : 'Loading gallery...'}</p>
        </div>
      </main>
    )
  }

  if (!gallery) {
    return (
      <main className="page-container">
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', color: 'var(--primary)', marginBottom: '20px' }}>Oops!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>{lang === 'ml' ? 'ഗാലറി കണ്ടെത്താനായില്ല' : 'Gallery not found'}</p>
          <Link to={`/?lang=${lang}`} className="btn primary">Go Home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="gallery-single-page">
      {/* Premium Hero Banner */}
      <section className="inner-hero" style={{ backgroundImage: gallery.image ? `url(${gallery.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {gallery.image && <div className="inner-hero-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1 }}></div>}
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <nav className="breadcrumb">
            <Link to={`/?lang=${lang}`}>{lang === 'ml' ? 'ഹോം' : 'Home'}</Link>
            <span>/</span>
            <span>{lang === 'ml' ? 'ചിത്രശാല' : 'Gallery'}</span>
            <span>/</span>
            <span dangerouslySetInnerHTML={{ __html: gallery.title }} />
          </nav>
          <h1 className="inner-hero-title" dangerouslySetInnerHTML={{ __html: gallery.title }} />
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {cleanContent && (
          <div 
            className="gallery-description wordpress-content" 
            dangerouslySetInnerHTML={{ __html: cleanContent }} 
            style={{ 
              marginBottom: '40px',
              fontSize: '18px',
              lineHeight: '1.8',
              color: 'var(--text)',
              maxWidth: '800px'
            }} 
          />
        )}

        {images.length > 0 ? (
          <div className="gallery-grid">
            {images.map((img, index) => {
              const imgUrl = getThumbnailUrl(img)
              if (!imgUrl) return null
              
              const imgAlt = typeof img === 'string' ? '' : img.alt || img.alt_text || img.title || `Gallery Image ${index + 1}`

              return (
                <div 
                  key={index} 
                  className="gallery-item-wrapper" 
                  onClick={() => openLightbox(img, index)}
                >
                  <img 
                    src={imgUrl} 
                    alt={imgAlt} 
                    loading="lazy"
                  />
                  <div className="gallery-item-overlay">
                    <span>🔍</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {lang === 'ml' ? 'ഈ ഗാലറിയിൽ ചിത്രങ്ങളൊന്നുമില്ല.' : 'No images found in this gallery.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">×</button>

          {images.length > 1 && (
            <button className="lightbox-nav prev" onClick={prevImage} aria-label="Previous">‹</button>
          )}

          <div className="lightbox-content">
            <img 
              src={selectedImage} 
              alt={imageTitle || 'Gallery Preview'} 
              onClick={(e) => e.stopPropagation()}
            />
            <div className="lightbox-info">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <button className="lightbox-nav next" onClick={nextImage} aria-label="Next">›</button>
          )}
        </div>
      )}
    </main>
  )
}

export default GallerySingle
