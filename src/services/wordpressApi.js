import { WP_CONFIG } from '../config/wpConfig.js'

const WORDPRESS_API_URL = WP_CONFIG.API_URL

// In-memory cache & request deduplication store
const apiCache = new Map()
const pendingRequests = new Map()
const DEFAULT_TTL_MS = 3 * 60 * 1000 // 3 minutes TTL

export async function fetchWithCache(url, options = {}, ttlMs = DEFAULT_TTL_MS) {
  const cacheKey = typeof url === 'string' ? url : JSON.stringify(url)

  const cached = apiCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }

  const requestPromise = (async () => {
    try {
      const res = await fetch(url, options)
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status} for ${url}`)
      }
      const data = await res.json()
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, requestPromise)
  return requestPromise
}

export function clearApiCache() {
  apiCache.clear()
  pendingRequests.clear()
}

export async function fetchPage(pageId, params = {}) {
  try {
    const defaultParams = {
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    return await fetchWithCache(`${WORDPRESS_API_URL}/pages/${pageId}?${queryString}`)
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function fetchPageBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/pages?${queryString}`)
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return null
  }
}

export async function fetchPages(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    return await fetchWithCache(`${WORDPRESS_API_URL}/pages?${queryString}`)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

export async function searchContent(query, lang = 'ml') {
  try {
    const params = new URLSearchParams({
      search: query,
      lang: lang,
      _embed: true,
      per_page: 20
    })
    
    const [posts, pages] = await Promise.all([
      fetchWithCache(`${WORDPRESS_API_URL}/posts?${params.toString()}`),
      fetchWithCache(`${WORDPRESS_API_URL}/pages?${params.toString()}`)
    ])
    
    return { posts: posts || [], pages: pages || [] }
  } catch (error) {
    console.error('Error searching content:', error)
    return { posts: [], pages: [] }
  }
}

export async function fetchMenus() {
  try {
    return await fetchWithCache(`${WORDPRESS_API_URL}/menus`, {}, 10 * 60 * 1000)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return []
  }
}

export async function fetchMenuByLocation(location, lang = '') {
  try {
    const locUrl = lang ? `${WORDPRESS_API_URL}/menu-locations/${location}?lang=${lang}` : `${WORDPRESS_API_URL}/menu-locations/${location}`
    const locData = await fetchWithCache(locUrl, {}, 10 * 60 * 1000)
    const menuId = locData?.menu
    if (menuId) {
      const itemsUrl = lang ? `${WORDPRESS_API_URL}/menu-items?menus=${menuId}&lang=${lang}` : `${WORDPRESS_API_URL}/menu-items?menus=${menuId}`
      const items = await fetchWithCache(itemsUrl, {}, 10 * 60 * 1000)
      if (Array.isArray(items)) {
        return items.map(item => ({
          ...item,
          url: cleanWordPressUrl(item.url)
        }))
      }
    }
  } catch (e) { /* fall through */ }

  return []
}

export function getFeaturedImage(page) {
  if (page._embedded && page._embedded['wp:featuredmedia']) {
    return fixAssetUrl(page._embedded['wp:featuredmedia'][0].source_url)
  }
  return null
}

export function getPageContent(page) {
  return {
    id: page.id,
    title: fixWordPressUrls(stripHtml(page.title?.rendered || '')),
    content: fixWordPressUrls(page.content?.rendered || ''),
    excerpt: fixWordPressUrls(page.excerpt?.rendered || ''),
    date: page.date,
    modified: page.modified,
    slug: page.slug,
    featuredImage: getFeaturedImage(page),
    meta: page.meta || {},
    acf: page.acf || {}
  }
}

export async function fetchNotifications(params = {}) {
  try {
    const defaultParams = {
      per_page: 10,
      status: 'publish',
      _embed: true, // Embed terms and other related data
      acf_format: 'standard',
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/notifications?${queryString}`)
    if (!Array.isArray(data)) return []

    return data.map(notification => {
      // Find notification categories in embedded data
      const embeddedTerms = notification._embedded?.['wp:term'] || []
      const categories = embeddedTerms.flat().filter(term => term.taxonomy === 'notification_category')

      // Prioritize specific terms over generic 'Announcements'
      let primaryCategory = categories[0] || null

      if (categories.length > 1) {
        const specificCategory = categories.find(cat =>
          cat.slug !== 'announcements' &&
          cat.name !== 'Announcements' &&
          cat.name !== 'അറിയിപ്പുകൾ' // Malayalam for Announcements/Notifications
        )
        if (specificCategory) {
          primaryCategory = specificCategory
        }
      }

      return {
        id: notification.id,
        title: stripHtml(notification.title?.rendered || ''),
        content: fixWordPressUrls(notification.content?.rendered || ''),
        excerpt: fixWordPressUrls(notification.excerpt?.rendered || ''),
        link: cleanWordPressUrl(notification.link || '#'),
        date: notification.date,
        slug: notification.slug || '',
        // Store both IDs and the primary category info for display
        categories: notification.notification_category || [],
        categoryName: primaryCategory?.name || null,
        categorySlug: primaryCategory?.slug || null,
        pdf: getNotificationPdf(notification),
        acf: notification.acf || {}
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function fetchDepartments(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/departments?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching departments:', error)
    return []
  }
}

export async function fetchActivities(params = {}) {
  try {
    const defaultParams = {
      per_page: 20,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/activity?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

export async function fetchCourses(params = {}) {
  try {
    const defaultParams = {
      per_page: 20,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/courses?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export async function fetchStudents(params = {}) {
  try {
    const defaultParams = {
      per_page: 20,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/student?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

export async function fetchFacultyDepartment(id, params = {}) {
  try {
    const qs = new URLSearchParams(params).toString()
    const url = qs ? `${WORDPRESS_API_URL}/faculty_department/${id}?${qs}` : `${WORDPRESS_API_URL}/faculty_department/${id}`
    return await fetchWithCache(url)
  } catch (error) {
    console.error('Error fetching faculty department:', error)
    return null
  }
}

export async function fetchFacultyDepartments(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/faculty_department?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching faculty departments:', error)
    return []
  }
}

export function getFacultyProfileUrl(f) {
  if (!f) return null
  const profile = f.acf?.profile
  if (typeof profile === 'string' && profile.trim().length > 0) {
    const trimmed = profile.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.endsWith('.pdf')) {
      return fixAssetUrl(trimmed)
    }
  }
  if (typeof profile === 'object' && profile !== null) {
    if (profile.url) return fixAssetUrl(profile.url)
    if (profile.source_url) return fixAssetUrl(profile.source_url)
    if (profile.link) return fixAssetUrl(profile.link)
  }
  if (f.profilePdf && typeof f.profilePdf === 'string' && f.profilePdf.trim().length > 0) {
    return fixAssetUrl(f.profilePdf.trim())
  }
  const attachments = (f._embedded?.['wp:attachment'] || []).flat()
  const pdf = attachments.find(att => att.mime_type === 'application/pdf' || (att.source_url && att.source_url.endsWith('.pdf')))
  return pdf?.source_url ? fixAssetUrl(pdf.source_url) : null
}

export async function fetchFaculties(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/faculties?${qs}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return []
  }
}

export async function fetchDepartment(id, params = {}) {
  try {
    const defaultParams = {
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams)

    // Try fetching by numeric ID first
    if (/^\d+$/.test(id)) {
      try {
        const data = await fetchWithCache(`${WORDPRESS_API_URL}/departments/${id}?${qs.toString()}`)
        if (data) return data
      } catch {}
    }

    // Fallback: search by slug
    qs.set('slug', id)
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/departments?${qs.toString()}`)
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching department:', error)
    return null
  }
}

export async function fetchPosts(params = {}) {
  try {
    const defaultParams = {
      per_page: 5,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/posts?${queryString}`)
    if (!Array.isArray(data)) return []

    return data.map(post => {
      const terms = post._embedded?.['wp:term']?.[0] || []
      const primaryCategory = terms[0] || {}

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        date: post.date,
        link: cleanWordPressUrl(post.link || '#'),
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        category: primaryCategory.name || null,
        categorySlug: primaryCategory.slug || null
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function fetchPostBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/posts?${queryString}`)
    
    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      const terms = post._embedded?.['wp:term']?.[0] || []
      const primaryCategory = terms[0] || {}

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        date: post.date,
        link: cleanWordPressUrl(post.link || '#'),
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        category: primaryCategory.name || null,
        categorySlug: primaryCategory.slug || null
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

export async function fetchCourseBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/courses?${queryString}`)

    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: post.content?.rendered || '',
        excerpt: post.excerpt?.rendered || '',
        date: post.date,
        link: post.link,
        slug: post.slug,
        featuredImage: getFeaturedImage(post)
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    return null
  }
}

export async function fetchActivityBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/activity?${queryString}`)
    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      let activityTypeId = null
      let activityTypeName = ''
      const terms = post._embedded?.['wp:term'] || []
      if (Array.isArray(terms)) {
        for (const group of terms) {
          if (Array.isArray(group)) {
            for (const term of group) {
              if (term.taxonomy === 'activity_type') {
                activityTypeId = term.id
                activityTypeName = term.name
                break
              }
            }
          }
        }
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: post.content?.rendered || '',
        date: post.date,
        link: post.link,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        excerpt: stripHtml(post.excerpt?.rendered || ''),
        activityTypeId,
        activityTypeName
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching activity:', error)
    return null
  }
}

export async function fetchFacultyBySlug(slug, params = {}) {
  try {
    const decodedSlug = decodeURIComponent(slug)
    const defaultParams = {
      slug: decodedSlug,
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    let data = await fetchWithCache(`${WORDPRESS_API_URL}/faculties?${queryString}`)
    
    // Fallback try raw slug if decoded didn't return matches
    if ((!data || data.length === 0) && slug !== decodedSlug) {
      const rawParams = new URLSearchParams({ ...defaultParams, slug }).toString()
      data = await fetchWithCache(`${WORDPRESS_API_URL}/faculties?${rawParams}`)
    }

    if (data && data.length > 0) {
      const post = data[0]
      
      const embeddedTerms = post._embedded?.['wp:term'] || []
      const departments = embeddedTerms.flat().filter(term => term.taxonomy === 'faculty_department')
      const childDepartments = departments.filter(term => term.parent !== 0)
      
      // Select strictly the child department term
      let selectedDepartment = null
      if (childDepartments.length > 0) {
        selectedDepartment = childDepartments[childDepartments.length - 1]
      } else if (departments.length > 0) {
        selectedDepartment = departments[0]
      }

      const departmentName = selectedDepartment ? stripHtml(selectedDepartment.name || '') : ''

      // Extract attachments/PDF profiles if available
      const attachments = post._embedded?.['wp:attachment'] || []
      const pdfAttachment = attachments.find(att => att.mime_type === 'application/pdf' || att.source_url?.endsWith('.pdf'))
      
      let profileUrl = getFacultyProfileUrl(post)

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        date: post.date,
        link: cleanWordPressUrl(post.link || '#'),
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        excerpt: stripHtml(post.excerpt?.rendered || ''),
        acf: post.acf || {},
        department: departmentName,
        profilePdf: profileUrl,
        attachments: attachments.map(att => ({ id: att.id, title: stripHtml(att.title?.rendered || ''), url: fixAssetUrl(att.source_url) }))
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return null
  }
}

export async function fetchGallery(params = {}) {
  try {
    const defaultParams = {
      per_page: 8,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/galleries?${queryString}`)
    if (!Array.isArray(data)) return []

    return data.map(item => {
      const acfImages = item.acf?.photo_gallery?.gallery_images?.[0]
      const firstImage = Array.isArray(acfImages) ? acfImages[0]?.full_image_url : acfImages?.full_image_url
      const video = item.acf?.video || ''
      const videoId = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1]
      const thumb = getFeaturedImage(item) || firstImage
      return {
        id: item.id,
        title: stripHtml(item.title?.rendered || ''),
        desc: stripHtml(item.excerpt?.rendered || ''),
        image: thumb || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/images/placeholder.jpg'),
        link: item.link,
        slug: item.slug,
        galleryCategory: item.gallery_category,
        video,
        acf: item.acf,
        _embedded: item._embedded
      }
    })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return []
  }
}

export async function fetchGalleryBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/galleries?${queryString}`)
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0]
      return {
        id: item.id,
        title: stripHtml(item.title?.rendered || ''),
        content: fixWordPressUrls(item.content?.rendered || ''),
        image: getFeaturedImage(item) || '/images/placeholder.jpg',
        acf: item.acf || {},
        date: item.date
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching gallery by slug:', error)
    return null
  }
}

export async function fetchSliders(params = {}) {
  try {
    const { location, lang = 'ml', per_page = 20, ...rest } = params

    let locationTermId = null
    const locSlug = location ? String(location).toLowerCase().trim() : null

    if (locSlug) {
      if (typeof location === 'number' || /^\d+$/.test(location)) {
        locationTermId = Number(location)
      } else {
        try {
          const terms = await fetchWithCache(`${WORDPRESS_API_URL}/slider_location?slug=${encodeURIComponent(locSlug)}`, {}, 600 * 1000)
          if (Array.isArray(terms) && terms.length > 0) {
            locationTermId = terms[0].id
          }
        } catch {
          // slider_location endpoint might not be available
        }
      }
    }

    const queryParams = {
      _embed: true,
      acf_format: 'standard',
      lang,
      per_page,
      ...rest
    }

    const qs = new URLSearchParams(queryParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/slider?${qs}`)

    if (!Array.isArray(data)) return []

    let filtered = data
    if (locSlug) {
      const isLandingMatch = (slide) => {
        const embeddedTerms = (slide._embedded?.['wp:term'] || []).flat()
        if (embeddedTerms.some(t => (t.taxonomy === 'slider_location' || !t.taxonomy) && t.slug === 'landing-page')) return true
        if (Array.isArray(slide.class_list) && slide.class_list.some(c => c.includes('slider_location-landing-page'))) return true
        return false
      }

      const isHomeMatch = (slide) => {
        const embeddedTerms = (slide._embedded?.['wp:term'] || []).flat()
        if (embeddedTerms.some(t => (t.taxonomy === 'slider_location' || !t.taxonomy) && t.slug === 'home-page')) return true
        if (Array.isArray(slide.class_list) && slide.class_list.some(c => c.includes('slider_location-home-page'))) return true
        if (locationTermId && Array.isArray(slide.slider_location) && slide.slider_location.includes(locationTermId)) return true
        return false
      }

      if (locSlug === 'landing-page') {
        filtered = filtered.filter(slide => {
          if (locationTermId && Array.isArray(slide.slider_location) && slide.slider_location.includes(locationTermId)) {
            return true
          }
          return isLandingMatch(slide)
        })
      } else if (locSlug === 'home-page') {
        // Must match home-page and strictly never match landing-page
        const matchedHome = filtered.filter(slide => !isLandingMatch(slide) && isHomeMatch(slide))
        if (matchedHome.length > 0) {
          filtered = matchedHome
        } else {
          // Fallback: If home-page slides are not yet tagged with the new taxonomy term,
          // include all untagged slides while strictly excluding landing-page slides
          filtered = filtered.filter(slide => !isLandingMatch(slide))
        }
      } else {
        filtered = filtered.filter(slide => {
          if (locationTermId && Array.isArray(slide.slider_location) && slide.slider_location.includes(locationTermId)) {
            return true
          }
          const embeddedTerms = (slide._embedded?.['wp:term'] || []).flat()
          return embeddedTerms.some(t => (t.taxonomy === 'slider_location' || !t.taxonomy) && t.slug === locSlug) ||
            (Array.isArray(slide.class_list) && slide.class_list.some(c => c.includes(`slider_location-${locSlug}`)))
        })
      }
    }

    // Filter by language if multilingual
    const slideLang = lang
    filtered = filtered.filter(s => {
      if (s.lang) return s.lang === slideLang
      if (s.translations) return !!s.translations[slideLang === 'ml' ? 'ml_IN' : 'en_US'] || s.translations[slideLang]
      return true
    })

    return filtered.map(s => {
      const rawContent = typeof s.acf?.content === 'string'
        ? fixWordPressUrls(s.acf.content)
        : (s.acf?.content?.rendered
          ? fixWordPressUrls(s.acf.content.rendered)
          : (s.content?.rendered ? fixWordPressUrls(s.content.rendered) : ''))

      return {
        id: s.id,
        title: s.title?.rendered || '',
        content: rawContent,
        sub: rawContent,
        image: getFeaturedImage(s) || (typeof s.acf?.image === 'string' ? fixAssetUrl(s.acf.image) : (s.acf?.image?.url ? fixAssetUrl(s.acf.image.url) : null)) || '/images/slider.jpg',
        buttons: s.acf?.slider_buttons || [],
        raw: s
      }
    })
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return []
  }
}

export function getNotificationPdf(notification) {
  if (!notification) return null

  // 1. Check ACF fields (file, pdf, document, attachment, etc.)
  const acf = notification.acf || {}
  const rawFile = acf.file || acf.pdf || acf.document || acf.notification_file || acf.attachment || acf.upload_file
  
  if (typeof rawFile === 'string' && rawFile.trim() && !/^\d+$/.test(rawFile.trim())) {
    return fixAssetUrl(rawFile.trim())
  }
  if (typeof rawFile === 'object' && rawFile !== null) {
    if (rawFile.url) return fixAssetUrl(rawFile.url)
    if (rawFile.source_url) return fixAssetUrl(rawFile.source_url)
    if (rawFile.link) return fixAssetUrl(rawFile.link)
    if (Array.isArray(rawFile) && rawFile.length > 0) {
      const first = rawFile[0]
      if (typeof first === 'string') return fixAssetUrl(first)
      if (first?.url) return fixAssetUrl(first.url)
    }
  }

  // 2. Check embedded attachments
  const attachments = (notification._embedded?.['wp:attachment'] || []).flat()
  const pdfAtt = attachments.find(att =>
    att.mime_type === 'application/pdf' || att.source_url?.toLowerCase().endsWith('.pdf')
  )
  if (pdfAtt?.source_url) {
    return fixAssetUrl(pdfAtt.source_url)
  }

  // 3. Fallback: Check if content has an embedded link to a PDF
  const rawContent = notification.content?.rendered || notification.content || ''
  if (typeof rawContent === 'string' && rawContent.length > 0) {
    const match = rawContent.match(/href=["']([^"']*\.pdf[^"']*)["']/i)
    if (match && match[1]) {
      return fixAssetUrl(match[1])
    }
  }

  return null
}

export async function fetchNotification(id, params = {}) {
  try {
    const { lang: _ignoredLang, ...restParams } = params
    const defaultParams = {
      _embed: true,
      acf_format: 'standard',
      ...restParams
    }
    const qs = new URLSearchParams(defaultParams)

    let post = null
    if (/^\d+$/.test(id)) {
      try {
        const res = await fetchWithCache(`${WORDPRESS_API_URL}/notifications/${id}?${qs.toString()}`)
        if (res && res.id) post = res
      } catch {}
    }

    if (!post) {
      qs.set('slug', id)
      let data = await fetchWithCache(`${WORDPRESS_API_URL}/notifications?${qs.toString()}`)
      if (Array.isArray(data) && data.length > 0) {
        post = data[0]
      } else {
        // Try fallback with alternative decoded/encoded slug
        try {
          const altSlug = id.includes('%') ? decodeURIComponent(id) : encodeURIComponent(id)
          if (altSlug !== id) {
            qs.set('slug', altSlug)
            data = await fetchWithCache(`${WORDPRESS_API_URL}/notifications?${qs.toString()}`)
            if (Array.isArray(data) && data.length > 0) post = data[0]
          }
        } catch {}
      }
    }

    if (!post) return null

    let pdfUrl = getNotificationPdf(post)
    const rawFile = post.acf?.file || post.acf?.pdf || post.acf?.document || post.acf?.attachment
    if (!pdfUrl && rawFile && /^\d+$/.test(String(rawFile).trim())) {
      try {
        const mediaUrl = await fetchMedia(Number(rawFile))
        if (mediaUrl) pdfUrl = fixAssetUrl(mediaUrl)
      } catch {}
    }

    const formatted = formatNotification(post)
    formatted.pdf = pdfUrl
    formatted.acf = post.acf || {}
    formatted._links = post._links
    formatted.translations = post.translations
    return formatted
  } catch (error) {
    console.error('Error fetching notification:', error)
    return null
  }
}

function formatNotification(notification) {
  const embeddedTerms = notification._embedded?.['wp:term'] || []
  const categories = embeddedTerms.flat().filter(term => term.taxonomy === 'notification_category')
  let primaryCategory = categories[0] || null
  if (categories.length > 1) {
    const specificCategory = categories.find(cat =>
      cat.slug !== 'announcements' && cat.name !== 'Announcements' && cat.name !== 'അറിയിപ്പുകൾ'
    )
    if (specificCategory) primaryCategory = specificCategory
  }
  return {
    id: notification.id,
    title: stripHtml(notification.title?.rendered || ''),
    content: fixWordPressUrls(notification.content?.rendered || ''),
    excerpt: fixWordPressUrls(notification.excerpt?.rendered || ''),
    link: cleanWordPressUrl(notification.link || '#'),
    date: notification.date,
    slug: notification.slug || '',
    categories: notification.notification_category || [],
    categoryName: primaryCategory?.name || null,
    categorySlug: primaryCategory?.slug || null,
    featuredImage: getFeaturedImage(notification),
    pdf: getNotificationPdf(notification),
    acf: notification.acf || {}
  }
}

export async function fetchNaacPosts(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/naac?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(post => {
      let primaryCategory = getPrimaryTerm(post, 'naac_category')
      if (!primaryCategory) {
        const rawIds = post.naac_category || []
        if (rawIds.length > 0 && post._embedded?.['wp:term']) {
          const allTerms = post._embedded['wp:term'].flat()
          const matched = allTerms.find(t => rawIds.includes(t.id))
          if (matched) primaryCategory = { id: matched.id, name: matched.name, slug: matched.slug }
        }
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        _links: post._links,
        translations: post.translations,
        categories: parseTerms(post, 'naac_category'),
        primaryCategory
      }
    })
  } catch (error) {
    console.error('Error fetching naac posts:', error)
    return []
  }
}

function parseTerms(post, taxonomy) {
  const embeddedTerms = post._embedded?.['wp:term'] || []
  return embeddedTerms.flat().filter(term => term.taxonomy === taxonomy)
}

function getPrimaryTerm(post, taxonomy) {
  const terms = parseTerms(post, taxonomy)
  return terms.length > 0 ? { id: terms[0].id, name: terms[0].name, slug: terms[0].slug } : null
}

export function getPublicationPdf(post) {
  if (!post) return null
  const rawFile = post.acf?.file || post.acf?.pdf || post.acf?.document
  if (typeof rawFile === 'string' && rawFile.trim() && !/^\d+$/.test(rawFile.trim())) {
    return fixAssetUrl(rawFile.trim())
  }
  if (typeof rawFile === 'object' && rawFile?.url) {
    return fixAssetUrl(rawFile.url)
  }
  const attachments = post._embedded?.['wp:attachment'] || []
  const pdfAtt = attachments.find(att =>
    att.mime_type === 'application/pdf' || att.source_url?.toLowerCase().endsWith('.pdf')
  )
  if (pdfAtt?.source_url) {
    return fixAssetUrl(pdfAtt.source_url)
  }
  return null
}

export async function fetchPublications(params = {}) {
  try {
    const defaultParams = {
      per_page: 50,
      status: 'publish',
      _embed: true,
      acf_format: 'standard',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/publications?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(post => ({
      id: post.id,
      title: stripHtml(post.title?.rendered || ''),
      content: fixWordPressUrls(post.content?.rendered || ''),
      excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
      date: post.date,
      slug: post.slug,
      featuredImage: getFeaturedImage(post),
      editor: stripHtml(post.acf?.editor || ''),
      price: stripHtml(post.acf?.price || ''),
      pdf: getPublicationPdf(post),
      categories: parseTerms(post, 'publication_category'),
      primaryCategory: getPrimaryTerm(post, 'publication_category'),
      acf: post.acf || {},
      _links: post._links,
      translations: post.translations,
      lang: post.lang
    }))
  } catch (error) {
    console.error('Error fetching publications:', error)
    return []
  }
}

export async function fetchPublicationBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      acf_format: 'standard',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/publications?${queryString}`)
    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      let pdfUrl = getPublicationPdf(post)
      const rawFile = post.acf?.file || post.acf?.pdf
      if (!pdfUrl && rawFile && /^\d+$/.test(String(rawFile).trim())) {
        try {
          const mediaUrl = await fetchMedia(Number(rawFile))
          if (mediaUrl) pdfUrl = fixAssetUrl(mediaUrl)
        } catch {}
      }

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        editor: stripHtml(post.acf?.editor || ''),
        price: stripHtml(post.acf?.price || ''),
        pdf: pdfUrl,
        categories: parseTerms(post, 'publication_category'),
        primaryCategory: getPrimaryTerm(post, 'publication_category'),
        acf: post.acf || {},
        _links: post._links,
        translations: post.translations,
        lang: post.lang
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching publication by slug:', error)
    return null
  }
}

export async function fetchNotificationCategories(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/notification_category?${queryString}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching notification categories:', error)
    return []
  }
}

export async function fetchPublicationCategories(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/publication_category?${queryString}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching publication categories:', error)
    return []
  }
}

export async function fetchPublicationCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/publication_category?${queryString}`)
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching publication category by slug:', error)
    return null
  }
}

export async function fetchIqacPosts(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/iqac?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(post => {
      const embeddedTerms = post._embedded?.['wp:term'] || []
      let iqacCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'iqac_category')
      let primaryCategory = iqacCategoryTerms[0] || null
      if (!primaryCategory) {
        const rawIds = post.iqac_category || []
        if (rawIds.length > 0 && post._embedded?.['wp:term']) {
          const allTerms = post._embedded['wp:term'].flat()
          const matched = allTerms.find(t => rawIds.includes(t.id))
          if (matched) primaryCategory = { id: matched.id, name: matched.name, slug: matched.slug }
        }
      }
      if (!primaryCategory && iqacCategoryTerms.length === 0 && post._embedded?.['wp:term']) {
        iqacCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'iqac_category')
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        _links: post._links,
        translations: post.translations,
        categories: iqacCategoryTerms.map(t => ({ id: t.id, name: stripHtml(t.name || ''), slug: t.slug })),
        primaryCategory: primaryCategory ? { ...primaryCategory, name: stripHtml(primaryCategory.name || '') } : null
      }
    })
  } catch (error) {
    console.error('Error fetching IQAC posts:', error)
    return []
  }
}

export async function fetchIqacPostBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/iqac?${queryString}`)
    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      const embeddedTerms = post._embedded?.['wp:term'] || []
      let iqacCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'iqac_category')
      let primaryCategory = iqacCategoryTerms[0] || null
      if (!primaryCategory) {
        const rawIds = post.iqac_category || []
        if (rawIds.length > 0 && post._embedded?.['wp:term']) {
          const allTerms = post._embedded['wp:term'].flat()
          const matched = allTerms.find(t => rawIds.includes(t.id))
          if (matched) primaryCategory = { id: matched.id, name: matched.name, slug: matched.slug }
        }
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        _links: post._links,
        translations: post.translations,
        categories: iqacCategoryTerms.map(t => ({ id: t.id, name: stripHtml(t.name || ''), slug: t.slug })),
        primaryCategory: primaryCategory ? { ...primaryCategory, name: stripHtml(primaryCategory.name || '') } : null
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching IQAC post by slug:', error)
    return null
  }
}

export async function fetchIqacCategories(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/iqac_category?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(cat => ({ ...cat, name: stripHtml(cat.name || '') }))
  } catch (error) {
    console.error('Error fetching IQAC categories:', error)
    return []
  }
}

export async function fetchIqacCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/iqac_category?${queryString}`)
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching IQAC category by slug:', error)
    return null
  }
}

export async function fetchNssPosts(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      acf_format: 'standard',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/nss?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(post => {
      const embeddedTerms = post._embedded?.['wp:term'] || []
      let nssCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'nss_category')
      let primaryCategory = nssCategoryTerms[0] || null
      if (!primaryCategory) {
        const rawIds = post.nss_category || []
        if (rawIds.length > 0 && post._embedded?.['wp:term']) {
          const allTerms = post._embedded['wp:term'].flat()
          const matched = allTerms.find(t => rawIds.includes(t.id))
          if (matched) primaryCategory = { id: matched.id, name: matched.name, slug: matched.slug }
        }
      }
      if (!primaryCategory && nssCategoryTerms.length === 0 && post._embedded?.['wp:term']) {
        nssCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'nss_category')
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        acf: post.acf || {},
        _links: post._links,
        translations: post.translations,
        categories: nssCategoryTerms.map(t => ({ id: t.id, name: stripHtml(t.name || ''), slug: t.slug })),
        primaryCategory: primaryCategory ? { ...primaryCategory, name: stripHtml(primaryCategory.name || '') } : null
      }
    })
  } catch (error) {
    console.error('Error fetching NSS posts:', error)
    return []
  }
}

export async function fetchNssPostBySlug(slug, params = {}) {
  try {
    const defaultParams = {
      slug,
      _embed: true,
      acf_format: 'standard',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/nss?${queryString}`)
    if (Array.isArray(data) && data.length > 0) {
      const post = data[0]
      const embeddedTerms = post._embedded?.['wp:term'] || []
      let nssCategoryTerms = embeddedTerms.flat().filter(term => term.taxonomy === 'nss_category')
      let primaryCategory = nssCategoryTerms[0] || null
      if (!primaryCategory) {
        const rawIds = post.nss_category || []
        if (rawIds.length > 0 && post._embedded?.['wp:term']) {
          const allTerms = post._embedded['wp:term'].flat()
          const matched = allTerms.find(t => rawIds.includes(t.id))
          if (matched) primaryCategory = { id: matched.id, name: matched.name, slug: matched.slug }
        }
      }
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: fixWordPressUrls(post.content?.rendered || ''),
        excerpt: fixWordPressUrls(post.excerpt?.rendered || ''),
        date: post.date,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        acf: post.acf || {},
        _links: post._links,
        translations: post.translations,
        categories: nssCategoryTerms.map(t => ({ id: t.id, name: stripHtml(t.name || ''), slug: t.slug })),
        primaryCategory: primaryCategory ? { ...primaryCategory, name: stripHtml(primaryCategory.name || '') } : null
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching NSS post by slug:', error)
    return null
  }
}

export async function fetchNssCategories(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/nss_category?${queryString}`)
    if (!Array.isArray(data)) return []
    return data.map(cat => ({ ...cat, name: stripHtml(cat.name || '') }))
  } catch (error) {
    console.error('Error fetching NSS categories:', error)
    return []
  }
}

export async function fetchNssCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/nss_category?${queryString}`)
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching NSS category by slug:', error)
    return null
  }
}

export function getLanguageContext(pathname, searchParams) {
  // 1. Check path prefix (e.g., /en/notifications)
  const pathParts = pathname.split('/').filter(Boolean)
  if (pathParts[0] === 'ml' || pathParts[0] === 'en') {
    return pathParts[0]
  }

  // 2. Check search params (fallback)
  const langParam = searchParams.get('lang')
  if (langParam === 'ml' || langParam === 'en') {
    return langParam
  }

  // 3. Default
  return 'ml'
}

export function fixAssetUrl(url) {
  if (!url || typeof url !== 'string') return url
  const trimmed = url.trim()
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed
  }

  const wpBaseUrl = WP_CONFIG.SITE_URL.replace(/\/$/, '')
  const isAsset = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz|7z|mp4|mp3|avi|mov|webp|svg|avif)(?:[?#].*)?$/i.test(trimmed) ||
                  trimmed.includes('/wp-content/') ||
                  trimmed.includes('/wp-includes/') ||
                  trimmed.includes('/uploads/')

  if (!isAsset) return trimmed

  if (trimmed.startsWith('/')) {
    return `${wpBaseUrl}${trimmed}`
  }
  if (trimmed.startsWith('wp-content/') || trimmed.startsWith('uploads/')) {
    return `${wpBaseUrl}/${trimmed}`
  }

  return trimmed
    .replace(/^https?:\/\/(?:www\.)?(?!archive\.)malayalamuniversity\.edu\.in(?:\/sabir\/mu)?/i, wpBaseUrl)
    .replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/sabir\/mu)?/i, wpBaseUrl)
    .replace(/^https?:\/\/tessst\.com\/temu_cms/i, wpBaseUrl)
    .replace(/^http:\/\/cms\.malayalamuniversity\.edu\.in/i, wpBaseUrl)
}

export function cleanWordPressUrl(url) {
  if (!url || typeof url !== 'string') return url
  const trimmed = url.trim()
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed
  }

  const wpBaseUrl = WP_CONFIG.SITE_URL.replace(/\/$/, '')

  // If it's an asset (image, pdf, doc, etc.)
  const isAsset = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz|7z|mp4|mp3|avi|mov|webp|svg|avif)(?:[?#].*)?$/i.test(trimmed) ||
                  trimmed.includes('/wp-content/') ||
                  trimmed.includes('/wp-includes/') ||
                  trimmed.includes('/uploads/')
  if (isAsset) {
    return fixAssetUrl(trimmed)
  }

  const knownBases = [
    wpBaseUrl,
    'https://cms.malayalamuniversity.edu.in',
    'http://cms.malayalamuniversity.edu.in',
    'https://malayalamuniversity.edu.in/sabir/mu',
    'http://malayalamuniversity.edu.in/sabir/mu',
    'https://malayalamuniversity.edu.in',
    'http://malayalamuniversity.edu.in',
    'https://www.malayalamuniversity.edu.in',
    'http://www.malayalamuniversity.edu.in',
    'https://tessst.com/temu_cms',
    'http://tessst.com/temu_cms',
    'http://localhost/sabir/mu',
    'https://localhost/sabir/mu',
  ]

  let cleaned = trimmed
  for (const base of knownBases) {
    if (base && cleaned.startsWith(base)) {
      cleaned = cleaned.slice(base.length) || '/'
      break
    }
  }

  cleaned = cleaned.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/sabir\/mu)?/i, '')

  return cleaned || '/'
}

export function fixWordPressUrls(content) {
  if (!content || typeof content !== 'string') return content

  // Parse HTML attribute values specifically (href, src, action, etc.)
  return content.replace(
    /\b(href|src|action|data-[a-z-]+)=(["'])(.*?)\2/gi,
    (match, attr, quote, url) => {
      if (!url || url === '#' || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return match
      }

      const isAssetPath = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz|7z|mp4|mp3|avi|mov|webp|svg|avif)(?:[?#].*)?$/i.test(url) ||
                          url.includes('/wp-content/') ||
                          url.includes('/wp-includes/') ||
                          url.includes('/uploads/')

      if (attr.toLowerCase() === 'src' || isAssetPath) {
        return `${attr}=${quote}${fixAssetUrl(url)}${quote}`
      }

      const cleanedUrl = cleanWordPressUrl(url)
      return `${attr}=${quote}${cleanedUrl}${quote}`
    }
  )
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function stripHtml(html) {
  if (!html) return ''
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>?/gm, '')
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  } catch {
    return html.replace(/<[^>]*>?/gm, '')
  }
}

function pluralizePostType(postType) {
  const map = {
    page: 'pages',
    post: 'posts',
    gallery: 'galleries',
    notification: 'notifications',
    department: 'departments',
    activity: 'activity',
    faculty: 'faculties',
    naac: 'naac',
    publication: 'publications',
    faculty_department: 'faculty_department',
    iqac: 'iqac',
    nss: 'nss',
  }
  return map[postType] || `${postType}s`
}

export async function extractTranslationSlugs(post, postType = 'page') {
  if (!post) return null

  // Method 1: _links.translations — Polylang adds full URLs from which we extract the slug directly
  const links = post._links?.translations
  if (links && Array.isArray(links)) {
    const slugs = {}
    const localeMap = { en_US: 'en', ml_IN: 'ml' }
    for (const link of links) {
      const lang = localeMap[link.lang] || link.lang?.split('_')[0]
      if (lang && (lang === 'ml' || lang === 'en')) {
        try {
          const url = new URL(link.href)
          const slug = url.pathname.split('/').filter(Boolean).pop()
          if (slug) slugs[lang] = decodeURIComponent(slug)
        } catch {}
      }
    }
    if (Object.keys(slugs).length > 0) return slugs
  }

  // Method 2: translations field (post IDs) — e.g. { "en": 123, "ml": 456 }
  if (post.translations) {
    const slugs = {}
    const endpoint = pluralizePostType(postType)
    for (const [lang, translatedId] of Object.entries(post.translations)) {
      if (lang === 'ml' || lang === 'en') {
        if (translatedId === post.id) {
          // Same post — use current slug
          slugs[lang] = post.slug
        } else {
          // Different post — fetch its slug
          try {
            const tData = await fetchWithCache(
              `${WP_CONFIG.API_URL}/${endpoint}/${translatedId}?_fields=slug`
            )
            if (tData && tData.slug) slugs[lang] = tData.slug
          } catch {}
        }
      }
    }
    if (Object.keys(slugs).length > 0) return slugs
  }

  return null
}

export async function fetchPolylangTranslation(postId, postType, targetLang) {
  try {
    const endpoint = pluralizePostType(postType)
    // Don't use _fields here — WordPress may strip _links when _fields is present
    const post = await fetchWithCache(
      `${WP_CONFIG.API_URL}/${endpoint}/${postId}`
    )
    if (!post) return null

    // Method 1: _links.translations (extract slug from translation URL)
    const links = post._links?.translations
    if (links && Array.isArray(links)) {
      const localeMap = { en_US: 'en', ml_IN: 'ml' }
      for (const link of links) {
        const linkLang = localeMap[link.lang] || link.lang?.split('_')[0]
        if (linkLang === targetLang) {
          const url = new URL(link.href, WP_CONFIG.SITE_URL)
          const slug = url.pathname.split('/').filter(Boolean).pop()
          if (slug) return decodeURIComponent(slug)
        }
      }
    }

    // Method 2: translations (post IDs, standard Polylang REST API field)
    const translations = post.translations || post.pll_translations
    if (translations && translations[targetLang]) {
      const translatedId = translations[targetLang]
      if (translatedId === postId) {
        return post.slug
      }
      try {
        const tData = await fetchWithCache(
          `${WP_CONFIG.API_URL}/${endpoint}/${translatedId}?_fields=slug`
        )
        if (tData && tData.slug) return tData.slug
      } catch {}
    }

    return null
  } catch (e) {
    console.warn('fetchPolylangTranslation failed:', e)
    return null
  }
}

export async function fetchMedia(id) {
  if (!id) return null
  try {
    const data = await fetchWithCache(`${WORDPRESS_API_URL}/media/${id}`)
    return data?.source_url ? fixAssetUrl(data.source_url) : null
  } catch (e) {
    console.warn(`Failed to resolve media ID ${id}:`, e)
    return null
  }
}
