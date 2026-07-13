import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';


/**
 * Renders Gutenberg HTML and classic WordPress content blocks,
 * and initializes interactive behaviors (Accordions, Tabs, and Gallery Lightbox).
 */
export function GutenbergContent({ html, className = "gutenberg-content", style }) {
    const containerRef = useRef(null);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    // Lightbox navigation helpers
    const closeLightbox = () => {
        setLightboxIndex(-1);
        setLightboxImages([]);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    };

    // Keyboard navigation listener
    useEffect(() => {
        if (lightboxIndex === -1 || lightboxImages.length === 0) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage(e);
            if (e.key === 'ArrowLeft') prevImage(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, lightboxImages]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Accordion Toggle Logic
        const handleAccordionClick = (e) => {
            const header = e.target.closest('.custom-accordion-block .accordion-header');
            if (!header) return;

            e.preventDefault();
            const item = header.closest('.accordion-item');
            if (!item) return;

            const block = item.closest('.custom-accordion-block');
            const allItems = block.querySelectorAll('.accordion-item');
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // Close all other items in this block
            allItems.forEach((otherItem) => {
                otherItem.classList.remove('active');
                const otherHeader = otherItem.querySelector('.accordion-header');
                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                const otherContent = otherItem.querySelector('.accordion-content');
                if (otherContent) {
                    otherContent.style.maxHeight = '0px';
                }
            });

            // Toggle selected item
            if (!isActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                if (content) {
                    content.style.maxHeight = `${content.scrollHeight}px`;
                }
            } else {
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                if (content) {
                    content.style.maxHeight = '0px';
                }
            }
        };

        // 2. Tabs Switcher Logic
        const handleTabClick = (e) => {
            const btn = e.target.closest('.custom-tabs-block .tab-nav-btn');
            if (!btn) return;

            e.preventDefault();
            const block = btn.closest('.custom-tabs-block');
            const navButtons = block.querySelectorAll('.tab-nav-btn');
            const panels = block.querySelectorAll('.tab-panel');

            // Find index of the clicked tab button
            const index = Array.from(navButtons).indexOf(btn);
            if (index === -1) return;

            // Deactivate all buttons in this tab group
            navButtons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });

            // Hide all tab panels in this block
            panels.forEach((panel) => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });

            // Activate current tab button and corresponding panel
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const activePanel = panels[index];
            if (activePanel) {
                activePanel.style.display = 'block';
                setTimeout(() => {
                    activePanel.classList.add('active');
                }, 20);
            }
        };

        // 3. Gallery Lightbox Handler
        const handleGalleryClick = (e) => {
            const img = e.target.closest('.gallery .gallery-icon img, .wp-block-gallery img, .wp-block-image img');
            if (!img) return;

            const galleryContainer = img.closest('.gallery, .wp-block-gallery');
            const link = img.closest('a');
            
            // Intercept anchor tags to prevent browser reloading/downloading
            if (link) {
                e.preventDefault();
            }

            let galleryImages = [];
            if (galleryContainer) {
                galleryImages = Array.from(galleryContainer.querySelectorAll('img'));
            } else {
                galleryImages = [img];
            }

            const imagesData = galleryImages.map((el) => {
                const parentLink = el.closest('a');
                const captionEl = el.closest('.gallery-item, figure')?.querySelector('.gallery-caption, figcaption');
                return {
                    src: parentLink ? parentLink.getAttribute('href') : el.getAttribute('src'),
                    thumb: el.getAttribute('src'),
                    caption: captionEl ? captionEl.textContent.trim() : (el.getAttribute('alt') || '')
                };
            });

            const index = galleryImages.indexOf(img);
            if (index === -1) return;

            setLightboxImages(imagesData);
            setLightboxIndex(index);
            document.body.style.overflow = 'hidden';
        };

        // 4. Initialize accordion heights on initial render
        const initActiveAccordions = () => {
            const activeContents = container.querySelectorAll(
                '.custom-accordion-block .accordion-item.active .accordion-content'
            );
            activeContents.forEach((content) => {
                content.style.maxHeight = `${content.scrollHeight}px`;
            });
        };

        // Run initialization
        initActiveAccordions();

        // Attach event delegation listeners
        container.addEventListener('click', handleAccordionClick);
        container.addEventListener('click', handleTabClick);
        container.addEventListener('click', handleGalleryClick);

        return () => {
            // Cleanup listeners
            container.removeEventListener('click', handleAccordionClick);
            container.removeEventListener('click', handleTabClick);
            container.removeEventListener('click', handleGalleryClick);
        };
    }, [html]);

    const activeImage = lightboxIndex !== -1 ? lightboxImages[lightboxIndex] : null;

    return (
        <>
            <div 
                ref={containerRef} 
                className={className} 
                style={style}
                dangerouslySetInnerHTML={{ __html: html }} 
            />

            {/* Custom Lightbox Portal Overlay */}
            {activeImage && createPortal(
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    {lightboxImages.length > 1 && (
                        <button className="lightbox-nav prev" onClick={prevImage} aria-label="Previous">‹</button>
                    )}

                    <div className="lightbox-content">
                        <img 
                            src={activeImage.src || activeImage.thumb} 
                            alt={activeImage.caption || 'Gallery Preview'} 
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="lightbox-info">
                            {lightboxIndex + 1} / {lightboxImages.length}
                            {activeImage.caption && ` - ${activeImage.caption}`}
                        </div>
                    </div>

                    {lightboxImages.length > 1 && (
                        <button className="lightbox-nav next" onClick={nextImage} aria-label="Next">›</button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}

export default GutenbergContent;
