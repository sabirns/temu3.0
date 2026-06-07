import { createContext, useContext, useState, useCallback } from 'react'

const PageInfoContext = createContext()

export function PageInfoProvider({ children }) {
  const [pageInfo, setPageInfo] = useState({ id: null, postType: null, translationSlugs: null })
  const resetPageInfo = useCallback(() => {
    setPageInfo({ id: null, postType: null, translationSlugs: null })
  }, [])
  return (
    <PageInfoContext.Provider value={{ pageInfo, setPageInfo, resetPageInfo }}>
      {children}
    </PageInfoContext.Provider>
  )
}

export function usePageInfo() {
  const ctx = useContext(PageInfoContext)
  if (!ctx) throw new Error('usePageInfo must be used within PageInfoProvider')
  return ctx
}
