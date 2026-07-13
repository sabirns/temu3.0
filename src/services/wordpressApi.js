import { WP_CONFIG } from '../config/wpConfig'

const WORDPRESS_API_URL = WP_CONFIG.API_URL

export async function fetchPage(pageId, params = {}) {
  try {
    const defaultParams = {
      _embed: true,
      acf_format: 'standard',
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/pages/${pageId}?${queryString}`)
    if (!response.ok) throw new Error('Page not found')
    return await response.json()
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
    const response = await fetch(`${WORDPRESS_API_URL}/pages?${queryString}`)
    if (!response.ok) throw new Error('Page not found')
    const data = await response.json()
    // Returns an array, we want the first match
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return null
  }
}

export async function fetchPages(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/pages?${queryString}`)
    if (!response.ok) throw new Error('Failed to fetch pages')
    return await response.json()
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

export async function fetchMenus() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/menus`)
    if (!response.ok) throw new Error('Menus not found')
    return await response.json()
  } catch (error) {
    console.error('Error fetching menus:', error)
    return []
  }
}

export async function fetchMenuByLocation(location, lang = '') {
  try {
    const locUrl = lang ? `${WORDPRESS_API_URL}/menu-locations/${location}?lang=${lang}` : `${WORDPRESS_API_URL}/menu-locations/${location}`
    const locRes = await fetch(locUrl, { cache: 'no-cache' })
    if (locRes.ok) {
      const locData = await locRes.json()
      const menuId = locData.menu
      if (menuId) {
        const itemsUrl = lang ? `${WORDPRESS_API_URL}/menu-items?menus=${menuId}&lang=${lang}` : `${WORDPRESS_API_URL}/menu-items?menus=${menuId}`
        const itemsRes = await fetch(itemsUrl, { cache: 'no-cache' })
        if (itemsRes.ok) {
          return await itemsRes.json()
        }
      }
    }
  } catch (e) { /* fall through */ }

  return []
}

export function getFeaturedImage(page) {
  if (page._embedded && page._embedded['wp:featuredmedia']) {
    return page._embedded['wp:featuredmedia'][0].source_url
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
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/notifications?${queryString}`)

    if (!response.ok) {
      console.warn('Notifications endpoint not found')
      return []
    }

    const data = await response.json()
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
        content: notification.content?.rendered || '',
        excerpt: notification.excerpt?.rendered || '',
        link: notification.link || '#',
        date: notification.date,
        slug: notification.slug || '',
        // Store both IDs and the primary category info for display
        categories: notification.notification_category || [],
        categoryName: primaryCategory?.name || null,
        categorySlug: primaryCategory?.slug || null
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
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/departments?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch departments')
    return await res.json()
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
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/activity?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch activities')
    return await res.json()
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
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/courses?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch courses')
    return await res.json()
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
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/student?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch students')
    return await res.json()
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

export async function fetchFacultyDepartment(id, params = {}) {
  try {
    const qs = new URLSearchParams(params)
    const res = await fetch(`${WORDPRESS_API_URL}/faculty_department/${id}?${qs}`)
    if (!res.ok) throw new Error('Faculty department not found')
    return await res.json()
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
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/faculty_department?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch faculty departments')
    return await res.json()
  } catch (error) {
    console.error('Error fetching faculty departments:', error)
    return []
  }
}

export async function fetchFaculties(params = {}) {
  try {
    const defaultParams = {
      per_page: 100,
      status: 'publish',
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams)
    const res = await fetch(`${WORDPRESS_API_URL}/faculties?${qs}`)
    if (!res.ok) throw new Error('Failed to fetch faculties')
    return await res.json()
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
      const res = await fetch(`${WORDPRESS_API_URL}/departments/${id}?${qs}`)
      if (res.ok) return await res.json()
    }

    // Fallback: search by slug
    qs.set('slug', id)
    const res = await fetch(`${WORDPRESS_API_URL}/departments?${qs}`)
    if (!res.ok) throw new Error('Department not found')
    const data = await res.json()
    return data.length > 0 ? data[0] : null
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/posts?${queryString}`)

    if (!response.ok) throw new Error('Failed to fetch posts')

    const data = await response.json()
    return data.map(post => {
      const terms = post._embedded?.['wp:term']?.[0] || []
      const primaryCategory = terms[0] || {}

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        excerpt: post.excerpt?.rendered || '',
        content: post.content?.rendered || '',
        date: post.date,
        link: post.link,
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/posts?${queryString}`)
    if (!response.ok) throw new Error('Post not found')
    const data = await response.json()
    
    if (data.length > 0) {
      const post = data[0]
      const terms = post._embedded?.['wp:term']?.[0] || []
      const primaryCategory = terms[0] || {}

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: post.content?.rendered || '',
        date: post.date,
        link: post.link,
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/courses?${queryString}`)
    if (!response.ok) throw new Error('Course not found')
    const data = await response.json()

    if (data.length > 0) {
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/activity?${queryString}`)
    if (!response.ok) throw new Error('Activity not found')
    const data = await response.json()
    if (data.length > 0) {
      const post = data[0]
      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: post.content?.rendered || '',
        date: post.date,
        link: post.link,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        excerpt: stripHtml(post.excerpt?.rendered || '')
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
    const defaultParams = {
      slug,
      _embed: true,
      _t: Date.now(),
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/faculties?${queryString}`)
    if (!response.ok) throw new Error('Faculty not found')
    const data = await response.json()
    if (data.length > 0) {
      const post = data[0]
      
      const embeddedTerms = post._embedded?.['wp:term'] || []
      const departments = embeddedTerms.flat().filter(term => term.taxonomy === 'faculty_department')
      const childDepartments = departments.filter(term => term.parent !== 0)
      const displayDepartments = childDepartments.length > 0 ? childDepartments : departments
      const departmentNames = displayDepartments.map(d => d.name).join(', ')

      return {
        id: post.id,
        title: stripHtml(post.title?.rendered || ''),
        content: post.content?.rendered || '',
        date: post.date,
        link: post.link,
        slug: post.slug,
        featuredImage: getFeaturedImage(post),
        excerpt: stripHtml(post.excerpt?.rendered || ''),
        acf: post.acf || {},
        department: departmentNames
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }

    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/galleries?${queryString}`)

    if (!response.ok) {
      console.warn('Gallery endpoint not found')
      return []
    }

    const data = await response.json()
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
        video
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
      _t: Date.now(),
      lang: 'ml',
      ...params
    }
    const queryString = new URLSearchParams(defaultParams).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/galleries?${queryString}`)
    if (!response.ok) throw new Error('Gallery not found')
    const data = await response.json()
    if (data.length > 0) {
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

export async function fetchNotification(id, params = {}) {
  try {
    const defaultParams = {
      _embed: true,
      lang: 'ml',
      ...params
    }
    const qs = new URLSearchParams(defaultParams)

    if (/^\d+$/.test(id)) {
      const res = await fetch(`${WORDPRESS_API_URL}/notifications/${id}?${qs}`)
      if (res.ok) {
        const notification = await res.json()
        return formatNotification(notification)
      }
    }

    qs.set('slug', id)
    const res = await fetch(`${WORDPRESS_API_URL}/notifications?${qs}`)
    if (!res.ok) throw new Error('Notification not found')
    const data = await res.json()
    return data.length > 0 ? formatNotification(data[0]) : null
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
    excerpt: notification.excerpt?.rendered || '',
    link: notification.link || '#',
    date: notification.date,
    slug: notification.slug || '',
    categories: notification.notification_category || [],
    categoryName: primaryCategory?.name || null,
    categorySlug: primaryCategory?.slug || null,
    featuredImage: getFeaturedImage(notification)
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
    const response = await fetch(`${WORDPRESS_API_URL}/naac?${queryString}`)
    if (!response.ok) {
      console.warn('Naac endpoint not found (404) — check that post_type=naac is registered with show_in_rest=true')
      return []
    }
    const data = await response.json()
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
    const response = await fetch(`${WORDPRESS_API_URL}/publications?${queryString}`)
    if (!response.ok) {
      console.warn('Publications endpoint not found (404)')
      return []
    }
    const data = await response.json()
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
      categories: parseTerms(post, 'publication_category'),
      primaryCategory: getPrimaryTerm(post, 'publication_category'),
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
    const response = await fetch(`${WORDPRESS_API_URL}/publications?${queryString}`)
    if (!response.ok) throw new Error('Publication not found')
    const data = await response.json()
    if (data.length > 0) {
      const post = data[0]
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
        categories: parseTerms(post, 'publication_category'),
        primaryCategory: getPrimaryTerm(post, 'publication_category'),
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
    const response = await fetch(`${WORDPRESS_API_URL}/notification_category?${queryString}`)
    if (!response.ok) throw new Error('Notification categories not found')
    return await response.json()
  } catch (error) {
    console.error('Error fetching notification categories:', error)
    return []
  }
}

export async function fetchPublicationCategories(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/publication_category?${queryString}`)
    if (!response.ok) throw new Error('Publication categories not found')
    return await response.json()
  } catch (error) {
    console.error('Error fetching publication categories:', error)
    return []
  }
}

export async function fetchPublicationCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/publication_category?${queryString}`)
    if (!response.ok) throw new Error('Publication category not found')
    const data = await response.json()
    return data.length > 0 ? data[0] : null
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
    const response = await fetch(`${WORDPRESS_API_URL}/iqac?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) {
      console.warn('IQAC endpoint not found (404) — check that post_type=iqac is registered with show_in_rest=true')
      return []
    }
    const data = await response.json()
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
    const response = await fetch(`${WORDPRESS_API_URL}/iqac?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('IQAC post not found')
    const data = await response.json()
    if (data.length > 0) {
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
    const response = await fetch(`${WORDPRESS_API_URL}/iqac_category?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('IQAC categories not found')
    const data = await response.json()
    return data.map(cat => ({ ...cat, name: stripHtml(cat.name || '') }))
  } catch (error) {
    console.error('Error fetching IQAC categories:', error)
    return []
  }
}

export async function fetchIqacCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/iqac_category?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('IQAC category not found')
    const data = await response.json()
    return data.length > 0 ? data[0] : null
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
    const response = await fetch(`${WORDPRESS_API_URL}/nss?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) {
      console.warn('NSS endpoint not found (404) — check that post_type=nss is registered with show_in_rest=true')
      return []
    }
    const data = await response.json()
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
    const response = await fetch(`${WORDPRESS_API_URL}/nss?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('NSS post not found')
    const data = await response.json()
    if (data.length > 0) {
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
    const response = await fetch(`${WORDPRESS_API_URL}/nss_category?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('NSS categories not found')
    const data = await response.json()
    return data.map(cat => ({ ...cat, name: stripHtml(cat.name || '') }))
  } catch (error) {
    console.error('Error fetching NSS categories:', error)
    return []
  }
}

export async function fetchNssCategoryBySlug(slug, params = {}) {
  try {
    const queryString = new URLSearchParams({ slug, ...params }).toString()
    const response = await fetch(`${WORDPRESS_API_URL}/nss_category?${queryString}`, { cache: 'no-cache' })
    if (!response.ok) throw new Error('NSS category not found')
    const data = await response.json()
    return data.length > 0 ? data[0] : null
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

export function fixWordPressUrls(content) {
  if (!content || typeof content !== 'string') return content

  const wpBaseUrl = WP_CONFIG.SITE_URL

  let result = content.replace(new RegExp(escapeRegex(wpBaseUrl), 'g'), (match, offset, str) => {
    const sub = str.substring(offset, offset + 150)
    const isAsset = /\.(jpg|jpeg|png|gif|pdf|doc|docx|mp4|zip|css|js)/i.test(sub)
    if (isAsset) return match
    return ''
  })

  // Make relative WordPress asset paths absolute by prepending the site URL
  result = result.replace(
    /((?:href|src|action|data)=["'])(\/wp-(?:content|includes|uploads)\/)/gi,
    (match, prefix, path) => prefix + wpBaseUrl + path
  )

  return result
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
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
            const tRes = await fetch(
              `${WP_CONFIG.API_URL}/${endpoint}/${translatedId}?_fields=slug`
            )
            if (tRes.ok) {
              const tData = await tRes.json()
              if (tData.slug) slugs[lang] = tData.slug
            }
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
    const res = await fetch(
      `${WP_CONFIG.API_URL}/${endpoint}/${postId}`
    )
    if (!res.ok) return null
    const post = await res.json()

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
      const tRes = await fetch(
        `${WP_CONFIG.API_URL}/${endpoint}/${translatedId}?_fields=slug`
      )
      if (tRes.ok) {
        const tData = await tRes.json()
        if (tData.slug) return tData.slug
      }
    }

    return null
  } catch (e) {
    console.warn('fetchPolylangTranslation failed:', e)
    return null
  }
}
