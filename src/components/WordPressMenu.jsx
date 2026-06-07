import { Link } from 'react-router-dom'

export function WordPressMenuItem({ pageId, label, children, className = '', ...props }) {
  return (
    <Link 
      to={`/page/${pageId}`} 
      className={className}
      {...props}
    >
      {children || label}
    </Link>
  )
}

export function WordPressMenuDropdown({ label, children, className = '' }) {
  return (
    <li className={`nav-item has-dropdown ${className}`} data-dd>
      <a href="#" className="nav-link" aria-haspopup="true" aria-expanded="false">
        {label} <span className="dropdown-arrow">▼</span>
      </a>
      <div className="dropdown-menu">
        {children}
      </div>
    </li>
  )
}

export function WordPressMenuLink({ pageId, label, children }) {
  return (
    <Link to={`/page/${pageId}`} className="dropdown-item">
      <div>
        <strong>{children || label}</strong>
      </div>
    </Link>
  )
}
