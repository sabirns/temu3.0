import { useState, useEffect } from 'react'
import { useSearchParams, Link, useParams } from 'react-router-dom'
import { searchContent, stripHtml } from '../services/wordpressApi'

function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const { lang: urlLang } = useParams()
    const lang = urlLang || 'ml'

    const [results, setResults] = useState({ posts: [], pages: [] })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!query) {
            setResults({ posts: [], pages: [] })
            return
        }

        async function fetchResults() {
            setIsLoading(true)
            const data = await searchContent(query, lang)
            setResults(data)
            setIsLoading(false)
        }

        fetchResults()
    }, [query, lang])

    const totalResults = results.posts.length + results.pages.length

    return (
        <main className="page-main">
            <div className="page-header" style={{ background: 'var(--navy-900)', color: '#fff', padding: '60px 0' }}>
                <div className="container">
                    <h1 className="page-title">{lang === 'ml' ? 'തിരയൽ ഫലങ്ങൾ' : 'Search Results'}</h1>
                    <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px' }}>
                        <Link to={`/${lang}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {lang === 'ml' ? 'പൂമുഖം' : 'Home'}
                        </Link>
                        <span>/</span>
                        <span style={{ color: '#ffd700', fontWeight: '600' }}>
                            {lang === 'ml' ? 'തിരയുക' : 'Search'}
                        </span>
                    </nav>
                </div>
            </div>

            <section className="search-results-section" style={{ padding: '60px 0', minHeight: '50vh' }}>
                <div className="container">
                    <div style={{ marginBottom: '40px' }}>
                        <h2>
                            {lang === 'ml' 
                                ? `"${query}" നായുള്ള തിരയൽ ഫലങ്ങൾ` 
                                : `Search results for "${query}"`}
                        </h2>
                        <p style={{ color: 'var(--navy-600)', marginTop: '8px' }}>
                            {isLoading ? (lang === 'ml' ? 'തിരയുന്നു...' : 'Searching...') : (
                                lang === 'ml' ? `${totalResults} ഫലങ്ങൾ കണ്ടെത്തി` : `Found ${totalResults} results`
                            )}
                        </p>
                    </div>

                    {!isLoading && totalResults === 0 && query && (
                        <div className="empty-state" style={{ padding: '40px', background: 'var(--sky-100)', borderRadius: '16px', textAlign: 'center' }}>
                            <p style={{ fontSize: '18px', color: 'var(--navy-800)' }}>
                                {lang === 'ml' ? 'ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല. മറ്റൊരു പദം ഉപയോഗിച്ച് തിരയുക.' : 'No results found. Try searching with a different term.'}
                            </p>
                        </div>
                    )}

                    <div className="results-grid" style={{ display: 'grid', gap: '24px' }}>
                        {results.pages.map(page => (
                            <div key={`page-${page.id}`} className="search-result-card" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--sky-200)', color: 'var(--navy-800)', borderRadius: '20px', fontWeight: '600' }}>
                                        {lang === 'ml' ? 'പേജ്' : 'Page'}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
                                    <Link to={`/${lang}/${page.slug}`} style={{ color: 'var(--navy-900)', textDecoration: 'none' }}>
                                        {stripHtml(page.title?.rendered || '')}
                                    </Link>
                                </h3>
                                <div 
                                    style={{ color: 'var(--navy-700)', fontSize: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    dangerouslySetInnerHTML={{ __html: page.excerpt?.rendered || '' }}
                                />
                                <div style={{ marginTop: '16px' }}>
                                    <Link to={`/${lang}/${page.slug}`} className="btn primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                                        {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read More'}
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {results.posts.map(post => (
                            <div key={`post-${post.id}`} className="search-result-card" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--sky-200)', color: 'var(--navy-800)', borderRadius: '20px', fontWeight: '600' }}>
                                        {lang === 'ml' ? 'വാർത്ത' : 'News'}
                                    </span>
                                    <span style={{ fontSize: '13px', color: 'var(--navy-600)' }}>
                                        {new Date(post.date).toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US')}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
                                    <Link to={`/${lang}/news/${post.slug}`} style={{ color: 'var(--navy-900)', textDecoration: 'none' }}>
                                        {stripHtml(post.title?.rendered || '')}
                                    </Link>
                                </h3>
                                <div 
                                    style={{ color: 'var(--navy-700)', fontSize: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || '' }}
                                />
                                <div style={{ marginTop: '16px' }}>
                                    <Link to={`/${lang}/news/${post.slug}`} className="btn primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                                        {lang === 'ml' ? 'കൂടുതൽ വായിക്കുക' : 'Read More'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Search
