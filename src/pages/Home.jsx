import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import About, { ParallaxLetters } from '../components/About'
import { fetchGallery, getLanguageContext, fetchPosts, fetchPage, fetchPageBySlug, fetchMenuByLocation, fetchActivities, fetchWithCache, cleanWordPressUrl, fixWordPressUrls, fetchMedia, fetchSliders } from '../services/wordpressApi'
import SocialActivitiesGrid from '../components/SocialActivitiesGrid'
import { WP_CONFIG } from '../config/wpConfig'




function Home() {
	const location = useLocation()
	const [searchParams] = useSearchParams()
	const lang = getLanguageContext(location.pathname, searchParams)

	const [slides, setSlides] = useState([])
	const [currentSlide, setCurrentSlide] = useState(0)
	const [loadingSlides, setLoadingSlides] = useState(true)
	const [newsIndex, setNewsIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [isHeroPaused, setIsHeroPaused] = useState(false)
	const [galleryItems, setGalleryItems] = useState([])
	const [newsItems, setNewsItems] = useState([])
	const [loadingNews, setLoadingNews] = useState(true)
	const [homePageData, setHomePageData] = useState(null)
	const [loadingHomePage, setLoadingHomePage] = useState(true)
	const [cardsToShow, setCardsToShow] = useState(3)
	const [topMenuItems, setTopMenuItems] = useState([])
	const [portalTab, setPortalTab] = useState('all')
	const [socialActivities, setSocialActivities] = useState([])

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
			setLoadingSlides(true)
			setNewsIndex(0)
			try {
				const [slidesData, gallery, news, homePage, topMenu, activitiesData] = await Promise.all([
					fetchSliders({ location: 'home-page', lang }),
					fetchGallery({ lang, per_page: 8 }),
					fetchPosts({ lang, per_page: 6 }),
					lang === 'ml' ? fetchPageBySlug('home-page-ml', { lang }) : fetchPage(465, { lang }),
					fetchMenuByLocation('top_menu_1', lang),
					fetchActivities({ activity_type: 1991, lang, per_page: 50 })
				])
				setSlides(slidesData || [])
				setGalleryItems(gallery || [])
				setNewsItems(news || [])
				setTopMenuItems(topMenu || [])
				setSocialActivities(activitiesData || [])

				if (homePage?.acf?.buttons_2 && Array.isArray(homePage.acf.buttons_2)) {
					await Promise.all(
						homePage.acf.buttons_2.map(async (item) => {
							if (!item.image) return
							if (typeof item.image === 'number') {
								item.image = await fetchMedia(item.image)
							} else if (typeof item.image === 'string' && /^\d+$/.test(item.image)) {
								item.image = await fetchMedia(item.image)
							} else if (typeof item.image === 'object') {
								if (item.image.url) {
									item.image = item.image.url
								} else if (item.image.ID || item.image.id) {
									item.image = await fetchMedia(item.image.ID || item.image.id)
								} else {
									item.image = null
								}
							}
						})
					)
				}
				if (homePage?.acf?.buttons && Array.isArray(homePage.acf.buttons)) {
					await Promise.all(
						homePage.acf.buttons.map(async (item) => {
							if (item.icon && typeof item.icon === 'number') {
								item.icon = await fetchMedia(item.icon)
							}
						})
					)
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
		if (slides.length === 0 || isHeroPaused) return
		const timer = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % slides.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [slides.length, isHeroPaused])

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
			<section className="hero-and-about-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
				<ParallaxLetters />
				{/* Hero Slider */}
				{slides.length > 0 && (
					<div className="container slider_wrapper" style={{ position: 'relative', zIndex: 2 }}>
						<div className="hero-slider" onMouseEnter={() => setIsHeroPaused(true)} onMouseLeave={() => setIsHeroPaused(false)}>
							<div className="slider-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
								{slides.map((slide, index) => (
									<div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
										<div className="slide-bg" style={{ backgroundImage: `url('${slide.image}')` }}></div>
										<div className="container">
											<div className="slide-content-wrapper">
												<div className="slide-content">
													<h2 className="slide-title">{slide.title}</h2>
													{slide.content && (
														<div
															className="slide-sub"
															dangerouslySetInnerHTML={{ __html: slide.content }}
														/>
													)}
													{slide.buttons.length > 0 && (
														<div className="slide-cta">
															{slide.buttons.map((btn, i) => {
																const linkUrl = typeof btn.button_link === 'string'
																	? cleanWordPressUrl(btn.button_link)
																	: (btn.button_link?.url ? cleanWordPressUrl(btn.button_link.url) : '#')
																const target = (typeof btn.button_link === 'object' && btn.button_link?.target)
																	? btn.button_link.target
																	: '_self'
																return (
																	<a
																		key={i}
																		href={linkUrl}
																		className={`btn ${i === 0 ? 'primary' : ''}`}
																		target={target}
																		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
																	>
																		{btn.button_text}
																	</a>
																)
															})}
														</div>
													)}
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
					</div>
				)}

				{/* About Section */}
				<About homePageData={homePageData} />
			</section>

			{/* News Section */}
			<section className="news-slider-section" id="news" style={{ minHeight: '400px' }}>
				<div className="container">
					<div className="section-head reveal reveal-up">
						<div>
							<h2>{lang === 'ml' ? '📰 വാർത്തകൾ' : '📰 Latest News & Announcements'}</h2>
							<p>{lang === 'ml' ? 'സർവകലാശാലയിലെ പുതിയ സംഭവവികാസങ്ങളും പരിഷ്‌കാരങ്ങളും.' : 'The latest developments and reforms in the university.'}</p>
						</div>
						<Link
							to={lang === 'ml' ? '/news' : `/${lang}/news`}
							className="btn primary"
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
													{new Date(news.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
			<section className="gallery-slider-section research-band" id="gallery" style={{ minHeight: '400px' }}>
				<div className="container">
					<div className="section-head reveal reveal-up">
						<div>
							<h2>{lang === 'ml' ? '📸 വിസ്മയ കാഴ്ചകൾ' : '📸 University Gallery'}</h2>
							<p>{lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ പരിപാടികളുടെ ചിത്രങ്ങൾ.' : 'Photos of various programs at Malayalam University.'}</p>
						</div>
						<Link to={lang === 'ml' ? '/gallery' : `/${lang}/gallery`} className="btn primary">{lang === 'ml' ? 'ഗാലറി കാണുക →' : 'View All Gallery →'}</Link>
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
					<div className="section-head reveal reveal-up">
						<div>
							<h2>{lang === 'ml' ? 'പദ്ധതികളും സംരംഭങ്ങളും' : 'Projects & Initiatives'}</h2>
							<p>{lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ പദ്ധതികളും സംരംഭങ്ങളും.' : 'Various projects and initiatives of Malayalam University.'}</p>
						</div>
						<Link
							to={lang === 'ml' ? '/initiatives' : `/${lang}/initiatives`}
							className="btn primary"
						>
							{lang === 'ml' ? 'കൂടുതൽ കാണുക →' : 'View All Initiatives →'}
						</Link>
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

								const cleanedPath = cleanWordPressUrl(linkUrl)
								const isExternal = cleanedPath.startsWith('http')
								const internalPath = isExternal ? linkUrl : cleanedPath

								const linkText = typeof btnLinkField === 'object' && btnLinkField?.title ? btnLinkField.title : (lang === 'ml' ? 'കൂടുതൽ അറിയുക →' : 'Explore →')
								const iconUrl = typeof btn.icon === 'object' && btn.icon?.url ? btn.icon.url : btn.icon
								return (
									<article className="card" key={index}>
										{iconUrl ? (
											<img className="icon" src={iconUrl} alt={btn.title || ''} loading="lazy" decoding="async" />
										) : (
											<div className="icon">⟡</div>
										)}
										<h3>{btn.title}</h3>
										<p dangerouslySetInnerHTML={{ __html: btn.description }}></p>
										<div className="meta">
											{isExternal ? (
												<a className="link" href={linkUrl} target="_blank" rel="noopener noreferrer">{linkText}</a>
											) : (
												<Link className="link" to={internalPath}>{linkText}</Link>
											)}
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
										<a className="link" href="#vision">{lang === 'ml' ? 'കൂടുതൽ അറിയുക →' : 'Explore →'}</a>
									</div>
								</article>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Socially Committed Activities Section */}
			<section id="social-activities" className="section" style={{ background: 'var(--bg0, #f8fafc)', padding: '30px 0 !important', borderTop: '1px solid var(--stroke, rgba(0,0,0,0.06))' }}>
				<div className="container">
					<div className="section-head reveal reveal-up active" style={{ marginBottom: '32px' }}>
						<div>
							<h2>{lang === 'ml' ? 'സാമൂഹികപ്രതിബദ്ധതാ പ്രവർത്തനങ്ങൾ' : 'Socially Committed Activities'}</h2>
							<p>{lang === 'ml' ? 'മലയാളസർവകലാശാലയുടെ വിവിധ സാമൂഹിക പ്രതിബദ്ധതയുള്ള സേവന പ്രവർത്തനങ്ങൾ.' : 'Socially committed activities and community initiatives of Malayalam University.'}</p>
						</div>
						<Link
							to={lang === 'ml' ? '/ml/%e0%b4%b8%e0%b4%be%e0%b4%ae%e0%b5%82%e0%b4%b9%e0%b4%bf%e0%b4%95-%e0%b4%aa%e0%b5%8d%e0%b4%b0%e0%b4%a4%e0%b4%bf%e0%b4%ac%e0%b4%a6%e0%b5%8d%e0%b4%a7%e0%b4%a4%e0%b4%af%e0%b5%81%e0%b4%b3%e0%b5%8d%e0%b4%b3/' : '/en/extension-activities'}
							className="btn primary"
						>
							{lang === 'ml' ? 'കൂടുതൽ കാണുക →' : 'View All Activities →'}
						</Link>
					</div>

					<SocialActivitiesGrid activities={socialActivities} lang={lang} />
				</div>
			</section>

			<section className="principles-banner" id="principles">
				<div className="container">
					<div className="principles-statement reveal reveal-up active">
						<h2>{lang === 'ml' ? 'ഇതൊരു പുകയിലവിരുദ്ധ, ലഹരിവിരുദ്ധ, റാഗിങ്ങ് രഹിത, ഹരിത കാമ്പസ്‌ ആണ്' : 'This is a Tobacco-Free, Substance-Free, Ragging-Free, Green Campus'}</h2>
						<p>{lang === 'ml' ? 'മലയാള സർവകലാശാലയിൽ, എല്ലാ വിദ്യാർത്ഥികൾക്കും ഉദ്യോഗസ്ഥർക്കും അധ്യാപകർക്കും സുരക്ഷിതവും സൗഹൃദപരവും പരിസ്ഥിതി സൗഹൃദപരവുമായ ഒരു പഠന-ജോലി അന്തരീക്ഷം നൽകുന്നതിന് ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്.' : 'At Malayalam University, we are committed to providing a safe, friendly, and environmentally sustainable study-work environment for all students, staff, and teachers.'}</p>
					</div>
				</div>
			</section>

			<section className="campus-section" id="campus">
				<div className="container">


					<div className="campus-story">
						<div className="story-grid">
							<div className="story-text">
								<h3>{lang === 'ml' ? 'ക്യാമ്പസും സൗകര്യങ്ങളും' : 'Campus & Facilities'}</h3>
								<p><b>{lang === 'ml' ? 'അറിവ് പ്രകൃതിയെയും സംസ്കാരത്തെയും ഒന്നിപ്പിക്കുന്നിടം' : 'Where Knowledge Unites Nature and Culture'}</b></p>
								<p>
									{lang === 'ml' ?
										'മലയാളസർവകലാശാലയുടെ കാമ്പസ് അവിശ്വസനീയമായ സ്വാഭാവിക സൗന്ദര്യവും, സമാധാനപൂർവകമായ പഠനവാതവരണവും വാഗ്ദാനം ചെയ്യുന്നു. ആധുനിക സൗകര്യങ്ങൾ, നീളംകൊണ്ട് വിരലെടുത്ത ശാഖകൾ, വൈവിധ്യമാർന്ന പഠനകേന്ദ്രങ്ങൾ, ഗവേഷണ പ്രോജക്റ്റുകൾ, ശാഖകളുമായി സമന്വയിച്ച കൃത്യമായ സൗകര്യങ്ങൾ എല്ലാം വിദ്യാർഥികൾക്ക് ഉത്തമമായ പഠന അനുഭവം നൽകുന്നു. വിപുലമായ ഗ്രന്ഥാലയം, വിശാലമായ ഗാർഡൻ, വിവിധ ശില്പകലാസംഗ്രഹങ്ങൾ, പൈതൃക മ്യൂസിയം തുടങ്ങിയവയും അതിന്റെ ഭാഗമാണ്. സഹജമായ പഠനവാതവരണവും സൗഹൃദപരമായ ക്ലാസുകൾ, വിദ്യാർത്ഥികളിൽ പ്രചോദനവും ഉന്നമനവും ഉണ്ടാക്കുന്നു.' :
										'The campus of Malayalam University offers incredible natural beauty and a peaceful learning environment. Modern facilities, diverse learning centers, research projects, and well-integrated amenities provide students with an excellent educational experience. A comprehensive library, expansive gardens, various art collections, and a heritage museum are all part of this campus. The natural learning atmosphere and friendly classes inspire and uplift the students.'
									}
								</p>
							</div>
							<div className="story-image" style={{ backgroundImage: "url('images/campus.jpg')", backgroundSize: 'cover' }}>
							</div>
						</div>
					</div>


					<div className="campus-highlights">
						<div className="campus-card has-image">
							<div className="card-bg" style={{ backgroundImage: "url('/images/gallery1.jpg')" }}></div>
							<div className="card-overlay"></div>
							<div className="card-content">
								<div className="card-icon">🌳</div>
								<h3>{lang === 'ml' ? 'ഹരിത കാമ്പസ്' : 'Green Campus'}</h3>
								<p>{lang === 'ml' ? 'പ്രകൃതിയുമായി പൂർണ്ണമായും ചേർന്നിരിക്കുന്ന കാമ്പസ്. വിദ്യാർത്ഥികൾക്ക് ശാന്തവും സുന്ദരവുമായ ഒരു അന്തരീക്ഷം.' : 'Perfectly integrated with nature for an ideal environment. The campus provides a serene and beautiful atmosphere for students.'}</p>
							</div>
						</div>
						<div className="campus-card has-image">
							<div className="card-bg" style={{ backgroundImage: "url('/images/gallery2.jpg')" }}></div>
							<div className="card-overlay"></div>
							<div className="card-content">
								<div className="card-icon">🏛️</div>
								<h3>{lang === 'ml' ? 'ആധുനിക സൗകര്യങ്ങൾ' : 'Modern Facilities'}</h3>
								<p>{lang === 'ml' ? 'ആധുനിക സൗകര്യങ്ങളും സമഗ്രമായ പഠനവും ഉറപ്പാക്കുന്നു. ഡിജിറ്റൽ ലൈബ്രറികളും മികച്ച ക്ലാസ് മുറികളും ലഭ്യമാണ്.' : 'Equipped with modern facilities for comprehensive learning. We provide digital libraries and smart classrooms.'}</p>
							</div>
						</div>
						<div className="campus-card has-image">
							<div className="card-bg" style={{ backgroundImage: "url('/images/gallery3.jpg')" }}></div>
							<div className="card-overlay"></div>
							<div className="card-content">
								<div className="card-icon">🎭</div>
								<h3>{lang === 'ml' ? 'കലാ സാംസ്കാരികം' : 'Art & Culture'}</h3>
								<p>{lang === 'ml' ? 'പഠനവും കലാസാംസ്കാരിക പ്രവർത്തനങ്ങളും ഒരുമിച്ചു കൊണ്ടുപോകുന്നു. പൈതൃകവും കലയും പ്രോത്സാഹിപ്പിക്കുന്നു.' : 'Blending learning with vibrant arts and cultural activities. We encourage heritage and artistic talents among students.'}</p>
							</div>
						</div>
					</div>


					<div className="facility-grid">
						{topMenuItems.length > 0 ? topMenuItems.map((item, index) => {
							const url = item.url || '#'
							const cleanedPath = cleanWordPressUrl(url)
							const isExternal = cleanedPath.startsWith('http')
							const internalPath = isExternal ? url : cleanedPath
							return isExternal ? (
								<a key={item.id || index} href={url} className="facility-item" target={item.target || '_self'} rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}>
									{item.title?.rendered || item.title}
								</a>
							) : (
								<Link key={item.id || index} to={internalPath} className="facility-item">
									{item.title?.rendered || item.title}
								</Link>
							)
						}) : (
							<>
								<span className="facility-item">{lang === 'ml' ? 'പൈതൃക മ്യൂസിയം' : 'Heritage Museum'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഐ.ടി സൗകര്യങ്ങൾ' : 'IT Facilities'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഗ്രന്ഥാലയം' : 'Library'}</span>
								<span className="facility-item">{lang === 'ml' ? 'തിയേറ്റർ' : 'Theater'}</span>
								<span className="facility-item">{lang === 'ml' ? 'യാത്രാസൗകര്യങ്ങൾ' : 'Transport Facilities'}</span>
								<span className="facility-item">{lang === 'ml' ? 'സ്പോർട്സ്' : 'Sports'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഭാഷാ ലാബ്' : 'Language Lab'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ശാസ്ത്ര ലാബ്' : 'Science Lab'}</span>
								<span className="facility-item">{lang === 'ml' ? 'മീഡിയ ലാബ്' : 'Media Lab'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഇ-ലേണിംഗ് സൗകര്യങ്ങൾ' : 'E-Learning Facilities'}</span>
								<span className="facility-item">{lang === 'ml' ? 'കയ്യെഴുത്തു ഗ്രന്ഥാലയം' : 'Manuscript Library'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഫീൽഡ് ട്രിപ്പുകൾ' : 'Field Trips'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ഇന്റേൺഷിപ്പ്' : 'Internship'}</span>
								<span className="facility-item">{lang === 'ml' ? 'ആരോഗ്യവും ക്ഷേമവും കേന്ദ്രം' : 'Health & Wellness Center'}</span>
							</>
						)}
					</div>


					{/* <div className="campus-cta">
						<h3>കാമ്പസ് നേരിൽ കാണൂ ·</h3>
						<p>മലയാളസർവകലാശാലയുടെ വിവിധ കാമ്പസ് സൗകര്യങ്ങൾ, അങ്കണങ്ങൾ, ക്ലാസുകൾ, ഗാർഡൻ, ലൈബ്രറി, മ്യൂസിയം എന്നിവ
							ദൂരവീക്ഷണത്തിലൂടെ അനുഭവപ്പെടുന്നതിനുള്ള ഒരു ഓൺലൈൻ സവാരി ആണ്.</p>
						<a href="#" className="btn2 primary" style={{ marginLeft: '15px' }}>Virtual tour →</a>
					</div> */}
				</div>
			</section>


			{/* Quick Links / Portals Section */}
			<section className="portals-section">
				<div className="container">
					{homePageData?.acf?.buttons_2?.length > 0 && (
						<>
							{(() => {
								const catSet = new Set()
								homePageData.acf.buttons_2.forEach(item => {
									if (item.category) catSet.add(item.category)
								})
								const categories = ['all', ...Array.from(catSet)]
								const catLabels = {
									all: lang === 'ml' ? 'എല്ലാം' : 'All',
									...Object.fromEntries(
										homePageData.acf.buttons_2
											.filter(item => item.category)
											.map(item => [item.category, item.category])
									)
								}
								const filtered = portalTab === 'all'
									? homePageData.acf.buttons_2
									: homePageData.acf.buttons_2.filter(item => item.category === portalTab)
								return (
									<>
										{categories.length > 1 && (
											<div className="portals-tabs">
												{categories.map(cat => (
													<button
														key={cat}
														className={`portals-tab ${portalTab === cat ? 'active' : ''}`}
														onClick={() => setPortalTab(cat)}
													>
														{catLabels[cat] || cat}
													</button>
												))}
											</div>
										)}
										<div className="portals-grid">
											{filtered.map((item, index) => {
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
																<img src={imgSrc} alt={item.title} loading="lazy" decoding="async" />
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
											})}
										</div>
									</>
								)
							})()}
						</>
					)}
					{(!homePageData?.acf?.buttons_2 || homePageData.acf.buttons_2.length === 0) && (
						<div className="portals-grid">
							<a href="https://ugc.ac.in" target="_blank" rel="noopener noreferrer" className="portal-card">
								<div className="portal-icon">
									<img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/91/University_Grants_Commission_%28India%29_logo.png/220px-University_Grants_Commission_%28India%29_logo.png" alt="UGC" loading="lazy" decoding="async" />
								</div>
								<div className="portal-text">
									<h3>UGC</h3>
									<p>{lang === 'ml' ? 'യൂണിവേഴ്സിറ്റി ഗ്രാന്റ്സ് കമ്മീഷൻ' : 'University Grants Commission'}</p>
								</div>
							</a>
						</div>
					)}
				</div>
			</section>
		</main>
	)
}

export default Home
