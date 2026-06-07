import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import About from '../components/About'
import { fetchGallery, getLanguageContext, fetchPosts, fetchPageBySlug } from '../services/wordpressApi'
import { WP_CONFIG } from '../config/wpConfig'

const slides = [
	{
		id: 1,
		title: 'മലയാള ഭാഷയുടെ പൈതൃകത്തെ പരിപാലിക്കുകയും പ്രോത്സാഹിപ്പിക്കുകയും',
		sub: 'മലയാള സർവകലാശാല മലയാള ഭാഷ, സാഹിത്യം, സംസ്കാരം എന്നിവയുടെ സംരക്ഷണത്തിനും പ്രചാരണത്തിനും വികസനത്തിനും സമർപ്പിച്ചിരിക്കുന്നു.',
		image: '/images/slider.jpg'
	},
	{
		id: 2,
		title: 'ഉന്നത നിലവാരത്തിലുള്ള അക്കാദമിക് പ്രോഗ്രാമുകളും ഗവേഷണ സംരംഭങ്ങളും',
		sub: 'ഞങ്ങൾ UG, PG, PhD ലെവലുകളിൽ വൈവിധ്യമാർന്ന അക്കാദമിക് പ്രോഗ്രാമുകൾ വാഗ്ദാനം ചെയ്യുന്നു.',
		image: '/images/slider2.jpg'
	},
	{
		id: 3,
		title: 'ഹരിത കാമ്പസ്: പുകയിലവിരുദ്ധ, ലഹരിവിരുദ്ധ, റാഗിങ്ങ് രഹിത',
		sub: 'മലയാള സർവകലാശാല വിദ്യാർത്ഥികൾക്കും സ്റ്റാഫിനും സുരക്ഷിതവും സൗഹൃദപരവുമായ ഒരു പഠന-ജോലി അന്തരീക്ഷം നൽകുന്നു.',
		image: '/images/slider.jpg'
	},
	{
		id: 4,
		title: 'അന്തർദേശീയ കോളബറേഷനുകളും ഗവേഷണ പങ്കാളിത്തങ്ങളും',
		sub: 'ലോകമെമ്പാടുമുള്ള പ്രമുഖ സർവകലാശാലകളുമായുള്ള കോളബറേഷനിലൂടെ ഞങ്ങൾ ഗ്ലോബൽ ആകുന്നു.',
		image: '/images/slider2.jpg'
	}
]

const notifications = [
	{ id: 1, type: 'urgent', title: 'പ്രവേശന റജിസ്ട്രേഷൻ അവസാന തീയതി', description: 'PG പ്രോഗ്രാമുകൾക്കുള്ള അപേക്ഷാ അവസാന തീയതി: 2024-06-30', date: '2024-06-20', link: '#admissions' },
	{ id: 2, type: 'warning', title: 'പരീക്ഷാ സമയക്രമം പുറത്തുവിട്ടു', description: 'മേയ്-ജൂൺ 2024 സെമസ്റ്റർ പരീക്ഷാ സമയക്രമം ഡൗൺലോഡ് ചെയ്യുക', date: '2024-06-18', link: '#exams' },
	{ id: 3, type: 'info', title: 'ലൈബ്രറി അവധി അറിയിപ്പ്', description: '15.06.2024 ന് ലൈബ്രറി ദിവസം മുഴുവൻ അടച്ചിരിക്കും', date: '2024-06-15', link: '#library' }
]




function Home() {
	const location = useLocation()
	const [searchParams] = useSearchParams()
	const lang = getLanguageContext(location.pathname, searchParams)

	const [currentSlide, setCurrentSlide] = useState(0)
	const [newsIndex, setNewsIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [galleryItems, setGalleryItems] = useState([])
	const [newsItems, setNewsItems] = useState([])
	const [loadingNews, setLoadingNews] = useState(true)
	const [homePageData, setHomePageData] = useState(null)
	const [loadingHomePage, setLoadingHomePage] = useState(true)
	const [cardsToShow, setCardsToShow] = useState(3)

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) setCardsToShow(1)
			else if (window.innerWidth < 1100) setCardsToShow(2)
			else setCardsToShow(3)
		}
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		const loadData = async () => {
			setLoadingNews(true)
			setLoadingHomePage(true)
			setNewsIndex(0)
			try {
				const [gallery, news, homePage] = await Promise.all([
					fetchGallery({ lang, per_page: 8 }),
					fetchPosts({ lang, per_page: 6 }),
					fetchPageBySlug('home-page-ml')
				])
				setGalleryItems(gallery || [])
				setNewsItems(news || [])

				if (homePage?.acf?.buttons_2) {
					const resolveMedia = async (id) => {
						try {
							const res = await fetch(`${WP_CONFIG.API_URL}/media/${id}`)
							if (res.ok) {
								const media = await res.json()
								return media.source_url
							}
						} catch (e) {
							console.warn('Failed to resolve media:', e)
						}
						return null
					}
					for (const item of homePage.acf.buttons_2) {
						if (item.image) {
							if (typeof item.image === 'number') {
								const url = await resolveMedia(item.image)
								item.image = url
							} else if (typeof item.image === 'string') {
								if (/^\d+$/.test(item.image)) {
									const url = await resolveMedia(item.image)
									item.image = url
								}
							} else if (typeof item.image === 'object') {
								if (item.image.url) {
									item.image = item.image.url
								} else if (item.image.ID || item.image.id) {
									const url = await resolveMedia(item.image.ID || item.image.id)
									item.image = url
								} else {
									item.image = null
								}
							}
						}
					}
				}
				setHomePageData(homePage || null)
			} catch (error) {
				console.error("Home data fetch failed", error)
			} finally {
				setLoadingNews(false)
				setLoadingHomePage(false)
			}
		}
		loadData()
	}, [lang])

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % slides.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		if (!isPaused && newsItems.length > cardsToShow) {
			const timer = setInterval(() => {
				setNewsIndex(prev => (prev + 1) % (newsItems.length - (cardsToShow - 1)))
			}, 8000)
			return () => clearInterval(timer)
		} else {
			setNewsIndex(0)
		}
	}, [isPaused, newsItems.length, cardsToShow])

	useEffect(() => {
		const revealElements = document.querySelectorAll('.reveal')

		const revealOnScroll = () => {
			revealElements.forEach(el => {
				const elementTop = el.getBoundingClientRect().top
				const elementVisible = 150

				if (elementTop < window.innerHeight - elementVisible) {
					el.classList.add('active')
				}
			})
		}

		window.addEventListener('scroll', revealOnScroll)
		revealOnScroll()

		return () => window.removeEventListener('scroll', revealOnScroll)
	}, [])

	const scrollToId = (id) => {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<main id="home">
			{/* Hero Slider */}
			<div className="hero-slider">
				<div className="slider-container">
					{slides.map((slide, index) => (
						<div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
							<div className="slide-bg" style={{ backgroundImage: `url('${slide.image}')` }}></div>
							<div className="container">
								<div className="slide-content-wrapper">
									<div className="slide-content">
										<h2 className="slide-title">{slide.title}</h2>
										<p className="slide-sub">{slide.sub}</p>
										<div className="slide-cta">
											<button className="btn primary" onClick={() => scrollToId('initiatives')}>About University</button>
											<button className="btn" onClick={() => scrollToId('academics')}>Academic Programs</button>
										</div>
									</div>
									<div className="slide-image-preview">
										<div className="preview-frame">
											<div className="preview-image" style={{ backgroundImage: `url('${slide.image}')` }}></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="slider-dots">
					{slides.map((_, index) => (
						<button
							key={index}
							className={`dot ${index === currentSlide ? 'active' : ''}`}
							onClick={() => setCurrentSlide(index)}
							aria-label={`Go to slide ${index + 1}`}
						></button>
					))}
				</div>

				<button className="slider-arrow prev" onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)} aria-label="Previous slide"></button>
				<button className="slider-arrow next" onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)} aria-label="Next slide"></button>

				<div className="slide-counter">
					<span className="current">{String(currentSlide + 1).padStart(2, '0')}</span> / <span className="total">{String(slides.length).padStart(2, '0')}</span>
				</div>
			</div>

			{/* About Section */}
			<About />

			{/* News Section */}
			<section className="news-slider-section" id="news" style={{ minHeight: '400px' }}>
				<div className="container">
					<div className="section-head reveal reveal-up">
						<div>
							<h2>📰 വാർത്തകൾ / Latest News & Announcements</h2>
							<p>സർവകലാശാലയിലെ പുതിയ സംഭവവികാസങ്ങളും പരിഷ്‌കാരങ്ങളും.</p>
						</div>
						<Link 
							to={lang === 'ml' ? '/news' : `/${lang}/news`} 
							className="btn"
						>
							{lang === 'ml' ? 'എല്ലാ വാർത്തകളും കാണുക →' : 'View All News →'}
						</Link>
					</div>

					<div className="news-slider-container">
						<div 
							className="news-slider-track" 
							id="newsSliderTrack"
							style={{ transform: `translateX(-${newsIndex * (100 / cardsToShow)}%)` }}
						>
							{loadingNews ? (
								<div className="loading-state" style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
									<div className="loading-spinner"></div>
									<p>{lang === 'ml' ? 'വാർത്തകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading news...'}</p>
								</div>
							) : newsItems.length > 0 ? (
								newsItems.map(news => (
									<Link 
										key={news.id} 
										to={lang === 'ml' ? `/news/${news.slug}` : `/${lang}/news/${news.slug}`}
										className="news-text-card-home"
									>
										<div className="news-content-home">
											<div className="news-meta-home">
												{news.category && (
													<span className={`news-badge-mini ${news.categorySlug || 'default'}`}>
														{news.category}
													</span>
												)}
												<span className="news-date-home">
													{new Date(news.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
												</span>
											</div>
											<h3 className="news-title-home">{news.title}</h3>
											<p className="news-excerpt-home" dangerouslySetInnerHTML={{ __html: news.excerpt }} />
											<div className="news-footer-home">
												<span className="read-more-text">
													{lang === 'ml' ? 'കൂടുതൽ വായിക്കുക →' : 'Read More →'}
												</span>
											</div>
										</div>
									</Link>
								))
							) : (
								<div className="empty-state" style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
									<p>{lang === 'ml' ? 'വാർത്തകളൊന്നും കണ്ടെത്തിയില്ല.' : 'No news found.'}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Gallery Section */}
			<section className="gallery-slider-section" id="gallery" style={{ minHeight: '400px' }}>
				<div className="container">
					<div className="section-head reveal reveal-up">
						<div>
							<h2>📸 വിസ്മയ കാഴ്ചകൾ / University Gallery</h2>
							<p>മലയാളസർവകലാശാലയുടെ വിവിധ പരിപാടികളുടെ ചിത്രങ്ങൾ.</p>
						</div>
						<Link to={lang === 'ml' ? '/gallery' : `/${lang}/gallery`} className="btn">View All Gallery →</Link>
					</div>

					<div className="gallery-slider-container">
						<div className="gallery-slider-track" id="gallerySliderTrack">
							{galleryItems.map(item => (
								<Link
									key={item.id}
									to={lang === 'ml' ? `/gallery/${item.slug}` : `/${lang}/gallery/${item.slug}`}
									className="gallery-card"
								>
									<img src={item.image} alt={item.title} loading="lazy" />
									<div className="gallery-overlay">
										<h3>{item.title}</h3>
										<p>{item.desc}</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* About/Projects Section */}
			<section id="initiatives" className="section">
				<div className="container">
					<div className="section-head">
						<div>
							<h2>പദ്ധതികളും സംരംഭങ്ങളും</h2>
							<p>മലയാളസർവകലാശാലയുടെ വിവിധ പദ്ധതികളും സംരംഭങ്ങളും.</p>
						</div>
						<a className="btn" href="#contact">Directory / Contact</a>
					</div>

					<div className="grid">
						{loadingHomePage ? (
							<div className="loading-state" style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
								<div className="loading-spinner"></div>
								<p>{lang === 'ml' ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}</p>
							</div>
						) : homePageData?.acf?.buttons?.length > 0 ? (
							homePageData.acf.buttons.map((btn, index) => {
								const btnLinkField = btn.external_link || btn.link || '#'
								const linkUrl = typeof btnLinkField === 'object' && btnLinkField?.url ? btnLinkField.url : btnLinkField
								const linkText = typeof btnLinkField === 'object' && btnLinkField?.title ? btnLinkField.title : 'Explore →'
								const iconUrl = typeof btn.icon === 'object' && btn.icon?.url ? btn.icon.url : btn.icon
								return (
									<article className="card" key={index}>
										{iconUrl ? (
											<img className="icon" src={iconUrl} alt={btn.title || ''} />
										) : (
											<div className="icon">⟡</div>
										)}
										<h3>{btn.title}</h3>
										<p dangerouslySetInnerHTML={{ __html: btn.description }}></p>
										<div className="meta">
											<a className="link" href={linkUrl}>{linkText}</a>
										</div>
									</article>
								)
							})
						) : (
							<>
								<article className="card">
									<div className="icon">⟡</div>
									<h3></h3>
									<p>.</p>
									<div className="meta">
										<a className="link" href="#vision">Explore →</a>
									</div>
								</article>
							</>
						)}
					</div>
				</div>
			</section>

			<section className="principles-banner" id="principles">
				<div className="container">
					<div className="principles-statement reveal reveal-up active">
						<h2>ഇതൊരു പുകയിലവിരുദ്ധ, ലഹരിവിരുദ്ധ, റാഗിങ്ങ് രഹിത, ഹരിത കാമ്പസ്‌ ആണ്</h2>
						<p>മലയാള സർവകലാശാലയിൽ, എല്ലാ വിദ്യാർത്ഥികൾക്കും ഉദ്യോഗസ്ഥർക്കും അധ്യാപകർക്കും സുരക്ഷിതവും സൗഹൃദപരവും
							പരിസ്ഥിതി സൗഹൃദപരവുമായ ഒരു പഠന-ജോലി അന്തരീക്ഷം നൽകുന്നതിന് ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്.</p>
					</div>
				</div>
			</section>

			<section className="campus-section" id="campus">
				<div className="container">

				
					<div className="campus-story">
						<div className="story-grid">
							<div className="story-text">
								<h3>കാമ്പസും കാമ്പസ് ജീവിതവും</h3>
								<p><b>അറിവ് പ്രകൃതിയെയും സംസ്കാരത്തെയും ഒന്നിപ്പിക്കുന്നിടം</b></p>
								<p>
									മലയാളസർവകലാശാലയുടെ കാമ്പസ് അവിശ്വസനീയമായ സ്വാഭാവിക സൗന്ദര്യവും, സമാധാനപൂർവകമായ പഠനവാതവരണവും
									വാഗ്ദാനം ചെയ്യുന്നു. ആധുനിക സൗകര്യങ്ങൾ, നീളംകൊണ്ട് വിരലെടുത്ത ശാഖകൾ, വൈവിധ്യമാർന്ന
									പഠനകേന്ദ്രങ്ങൾ, ഗവേഷണ പ്രോജക്റ്റുകൾ, ശാഖകളുമായി സമന്വയിച്ച കൃത്യമായ സൗകര്യങ്ങൾ എല്ലാം
									വിദ്യാർഥികൾക്ക് ഉത്തമമായ പഠന അനുഭവം നൽകുന്നു. വിപുലമായ ഗ്രന്ഥാലയം, വിശാലമായ ഗാർഡൻ, വിവിധ
									ശില്പകലാസംഗ്രഹങ്ങൾ, പൈതൃക മ്യൂസിയം തുടങ്ങിയവയും അതിന്റെ ഭാഗമാണ്. സഹജമായ പഠനവാതവരണവും
									സൗഹൃദപരമായ ക്ലാസുകൾ, വിദ്യാർത്ഥികളിൽ പ്രചോദനവും ഉന്നമനവും ഉണ്ടാക്കുന്നു.
								</p>
								<a href="#" className="btn2 primary" style={{ marginLeft: '15px' }}>
									കൂടുതല്‍ വായിക്കുക →</a>
							</div>
							<div className="story-image" style={{ backgroundImage: "url('images/campus.jpg')", backgroundSize: 'cover' }}>
							</div>
						</div>
					</div>

				
					<div className="campus-highlights">
						<div className="campus-card">
							<div className="card-icon">🌳</div>
							<h3>ഹരിത കാമ്പസ്</h3>
							<p>മലയാളസർവകലാശാലയുടെ ഹരിത കാമ്പസ് പ്രകൃതിയുമായി പൂർണ്ണമായും ചേർന്നിരിക്കുന്നു. വിശാലമായ തോട്ടങ്ങളും
								പൂക്കളും ശുദ്ധമായ വായുമാലിന്യവും പഠനത്തിന് അനുയോജ്യമായ പരിസ്ഥിതി സൃഷ്ടിക്കുന്നു. കാലാവസ്ഥയുടെ
								മികച്ച അനുയോജ്യതയിൽ വിദ്യാർത്ഥികൾക്ക് ഉത്തമമായ പഠനവും വിശ്രമവും നൽകുന്നു.</p>
						</div>
						<div className="campus-card">
							<div className="card-icon">🏛️</div>
							<h3>ആധുനിക സൗകര്യങ്ങൾ</h3>
							<p>മലയാളസർവകലാശാലയിൽ ഏറ്റവും പുതിയ സാങ്കേതിക വിദ്യകളും ആധുനിക സൗകര്യങ്ങളും സമഗ്രമായ പഠനത്തിനായി
								ഒരുക്കിയിട്ടുണ്ട്. സ്മാർട്ട്ബോർഡുകൾ, കമ്പ്യൂട്ടർ ലാബുകൾ, wi-fi സൗകര്യങ്ങൾ, ഗ്രന്ഥാലയം,
								സപ്പോർട്ട് സേവനങ്ങൾ എന്നിവ വിദ്യാർത്ഥികൾക്ക് മികച്ച പഠന അനുഭവം നൽകുന്നു.</p>
						</div>
						<div className="campus-card">
							<div className="card-icon">🎭</div>
							<h3>കലാ സാംസ്കാരികം</h3>
							<p>മലയാളസർവകലാശാല പഠനവും കലാസാംസ്കാരിക പ്രവർത്തനങ്ങളും സമന്വയിച്ചുള്ള ഒരു പ്രധാന കേന്ദ്രമാണ്. ഓരോ
								വർഷവും കലാപരിപാടികൾ, നാടകങ്ങൾ, സംഗീതമേളകൾ, കലാസമ്മേളനങ്ങൾ എന്നിവ വിദ്യാർത്ഥികളുടെ സൃഷ്ടിപരമായ
								കഴിവുകളെ മികവുറ്റവാക്കുന്നു. സാംസ്കാരിക വൈവിധ്യത്തിന് ഉത്തമ പ്രോത്സാഹനമാണ് ഇവിടെ നൽകപ്പെടുന്നത്.
							</p>
						</div>
					</div>

				
					<div className="facility-grid">
						<span className="facility-item">പൈതൃക മ്യൂസിയം</span>
						<span className="facility-item">ഐ.ടി സൗകര്യങ്ങൾ</span>
						<span className="facility-item">ഗ്രന്ഥാലയം</span>                
						<span className="facility-item">തിയേറ്റർ</span>
						<span className="facility-item">യാത്രാസൗകര്യങ്ങൾ</span>
						<span className="facility-item">സ്പോർട്സ്</span>
						<span className="facility-item">ഭാഷാ ലാബ്</span>
						<span className="facility-item">ശാസ്ത്ര ലാബ്</span>
						<span className="facility-item">മീഡിയ ലാബ്</span>
						<span className="facility-item">ഇ-ലേണിംഗ് സൗകര്യങ്ങൾ</span>
						<span className="facility-item">കയ്യെഴുത്തു ഗ്രന്ഥാലയം</span>
						<span className="facility-item">ഫീൽഡ് ട്രിപ്പുകൾ</span>
						<span className="facility-item">ഇന്റേൺഷിപ്പ്</span>
						<span className="facility-item">ആരോഗ്യവും ക്ഷേമവും കേന്ദ്രം</span>
					</div>

					
					<div className="campus-cta">
						<h3>കാമ്പസ് നേരിൽ കാണൂ ·</h3>
						<p>മലയാളസർവകലാശാലയുടെ വിവിധ കാമ്പസ് സൗകര്യങ്ങൾ, അങ്കണങ്ങൾ, ക്ലാസുകൾ, ഗാർഡൻ, ലൈബ്രറി, മ്യൂസിയം എന്നിവ
							ദൂരവീക്ഷണത്തിലൂടെ അനുഭവപ്പെടുന്നതിനുള്ള ഒരു ഓൺലൈൻ സവാരി ആണ്.</p>
						<a href="#" className="btn2 primary" style={{ marginLeft: '15px' }}>Virtual tour →</a>
					</div>
				</div>
			</section>


			{/* Quick Links / Portals Section */}
			<section className="portals-section">
				<div className="container">
					<div className="portals-grid">
						{homePageData?.acf?.buttons_2?.length > 0 ? (
							homePageData.acf.buttons_2.map((item, index) => {
								const linkField = item.external_link || item.link || '#'
								const linkUrl = typeof linkField === 'object' && linkField?.url ? linkField.url : linkField
								const linkTarget = typeof linkField === 'object' && linkField?.target ? linkField.target : (item.external_link ? '_blank' : '_self')
								const imgSrc = typeof item.image === 'object' && item.image?.url ? item.image.url : item.image
								return (
									<a key={index} href={linkUrl} className="portal-card"
										target={linkTarget === '_blank' ? '_blank' : undefined}
										rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
									>
										<div className="portal-icon">
											{imgSrc ? (
												<img src={imgSrc} alt={item.title} />
											) : (
												<span className={item.icon}></span>
											)}
										</div>
										<div className="portal-text">
											<h3>{item.title}</h3>
											<p>{item.description}</p>
										</div>
									</a>
								)
							})
						) : (
							<>
								<a href="https://ugc.ac.in" target="_blank" rel="noopener noreferrer" className="portal-card">
									<div className="portal-icon">
										<img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/91/University_Grants_Commission_%28India%29_logo.png/220px-University_Grants_Commission_%28India%29_logo.png" alt="UGC" />
									</div>
									<div className="portal-text">
										<h3>UGC</h3>
										<p>{lang === 'ml' ? 'യൂണിവേഴ്സിറ്റി ഗ്രാന്റ്സ് കമ്മീഷൻ' : 'University Grants Commission'}</p>
									</div>
								</a>
							</>
						)}
					</div>
				</div>
			</section>
		</main>
	)
}

export default Home
