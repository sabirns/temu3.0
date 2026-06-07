import { useState, useEffect } from 'react'
import { fetchPage, getPageContent } from '../services/wordpressApi'

export function useWordPressPage(pageId) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPage() {
      if (!pageId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchPage(pageId)
        if (data) {
          setPage(getPageContent(data))
        } else {
          setError('Page not found')
        }
      } catch (err) {
        setError('Failed to load page content')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pageId])

  return { page, loading, error }
}

export function useWordPressPages(params = {}) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadPages() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${import.meta.env.VITE_WP_API_URL || 'http://localhost/sabir/mu/wp-json/wp/v2'}/pages`, {
          params: { per_page: 100, ...params }
        })
        
        if (!response.ok) throw new Error('Failed to fetch pages')
        
        const data = await response.json()
        setPages(data.map(getPageContent))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPages()
  }, [])

  return { pages, loading, error }
}
