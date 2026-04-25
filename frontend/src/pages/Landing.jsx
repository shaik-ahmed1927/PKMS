import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="lp-container">
      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <a href="/" style={{display:'flex',alignItems:'center',gap:'12px',textDecoration:'none'}}>
            <svg width="36" height="36" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="52" height="52" rx="12" fill="#f5f5f5"/>
              <rect x="10" y="9" width="22" height="29" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="1.8"/>
              <rect x="10" y="9" width="5" height="29" rx="2" fill="#1a1a1a" opacity="0.08"/>
              <line x1="18" y1="18" x2="28" y2="18" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              <line x1="18" y1="23" x2="28" y2="23" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
              <line x1="18" y1="28" x2="24" y2="28" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" opacity="0.2"/>
              <path d="M31 33 L40 13 L43 14.5 L34 34.5 Z" fill="#1a1a1a"/>
              <path d="M31 33 L34 34.5 L30.5 36.5 Z" fill="#888"/>
              <rect x="39.5" y="11" width="2.5" height="4" rx="1.2" fill="#555" transform="rotate(22 39.5 11)"/>
            </svg>
            <span style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.04em',color:'#1a1a1a',fontFamily:'Georgia,serif'}}>pkms</span>
          </a>
        </div>
        <div className={`lp-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }}>Solutions</a>
          <a href="#resources" onClick={(e) => { e.preventDefault(); scrollToSection('resources'); }}>Resources</a>
        </div>
        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn lp-btn-ghost">Log in</Link>
          <Link to="/register" className="lp-btn lp-btn-grey">Get started</Link>
          <button className="lp-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <header className="lp-hero">
        <h1 className="lp-hero-title">Write, plan, share.<br />With AI at your side.</h1>
        <p className="lp-hero-subtitle">
          pkms is the connected workspace where better, faster work happens.
          A minimal, fast, and local-first personal knowledge management system.
        </p>
        <div className="lp-hero-ctas">
          <Link to="/register" className="lp-btn lp-btn-secondary">Get started free</Link>
          <button onClick={() => scrollToSection('product')} className="lp-btn lp-btn-ghost">Watch demo ↓</button>
        </div>
      </header>

      {/* ─── Features Section ───────────────────────────────────────────── */}
      <section id="product" className="lp-section">
        <h2 className="lp-section-title">Everything you need to think clearly</h2>
        <p className="lp-section-subtitle">A unified workspace for your notes, bookmarks, and learning materials.</p>
        
        <div className="lp-features-grid">
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <h3 className="lp-feature-title">Notes with bidirectional linking</h3>
            <p className="lp-feature-desc">Connect your thoughts seamlessly. Build a personal wiki that grows with your knowledge base over time.</p>
          </div>
          
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </div>
            <h3 className="lp-feature-title">Bookmark manager with tags</h3>
            <p className="lp-feature-desc">Save links for later, organize them with flexible tags, and retrieve them instantly with powerful search.</p>
          </div>
          
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <h3 className="lp-feature-title">Learning materials tracker</h3>
            <p className="lp-feature-desc">Keep track of books, courses, and articles you're consuming. Monitor your progress visually.</p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────────── */}
      <section id="solutions" className="lp-section">
        <h2 className="lp-section-title">How it works</h2>
        <p className="lp-section-subtitle">Get started in minutes and experience a faster way to work.</p>
        
        <div className="lp-steps-grid">
          <div className="lp-step">
            <span className="lp-step-num">01</span>
            <h3 className="lp-step-title">Create an account</h3>
            <p className="lp-step-desc">Sign up for free. No credit card required. Your data belongs to you.</p>
          </div>
          
          <div className="lp-step">
            <span className="lp-step-num">02</span>
            <h3 className="lp-step-title">Add your notes & bookmarks</h3>
            <p className="lp-step-desc">Start dumping your brain. Import your existing knowledge base easily.</p>
          </div>
          
          <div className="lp-step">
            <span className="lp-step-num">03</span>
            <h3 className="lp-step-title">Search everything instantly</h3>
            <p className="lp-step-desc">Find what you need with lightning-fast search across all your content.</p>
          </div>
        </div>
      </section>

      {/* ─── Resources ────────────────────────────────────────────────────── */}
      <section id="resources" className="lp-section">
        <h2 className="lp-section-title">Resources</h2>
        <p className="lp-section-subtitle">Everything you need to learn how to use pkms.</p>
        
        <div className="lp-features-grid">
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <h3 className="lp-feature-title">Documentation</h3>
            <p className="lp-feature-desc">Read our detailed documentation to master every feature and workflow in pkms.</p>
            <Link to="/docs" className="lp-btn lp-btn-secondary" style={{ marginTop: '1rem' }}>Read Docs</Link>
          </div>
          
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="lp-feature-title">Community</h3>
            <p className="lp-feature-desc">Join our Discord community to ask questions, share tips, and meet other users.</p>
            <Link to="/community" className="lp-btn lp-btn-secondary" style={{ marginTop: '1rem' }}>Join Discord</Link>
          </div>
          
          <div className="lp-card">
            <div className="lp-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3 className="lp-feature-title">Blog</h3>
            <p className="lp-feature-desc">Stay up to date with the latest product updates, announcements, and guides.</p>
            <Link to="/blog" className="lp-btn lp-btn-secondary" style={{ marginTop: '1rem' }}>Read Blog</Link>
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="lp-section">
        <h2 className="lp-section-title">Simple pricing</h2>
        <p className="lp-section-subtitle">Everything you need, for free forever.</p>
        
        <div className="lp-pricing-container">
          <div className="lp-pricing-card">
            <h3 className="lp-pricing-tier">Self-hosted</h3>
            <div className="lp-pricing-price">
              $0 <span>/ forever</span>
            </div>
            <p className="lp-pricing-desc">Perfect for individuals who want complete control over their data.</p>
            
            <ul className="lp-pricing-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited notes
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited bookmarks
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Learning progress tracker
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                100% data ownership
              </li>
            </ul>
            
            <Link to="/register" className="lp-btn lp-btn-secondary">Get started for free</Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <svg viewBox="0 0 100 100" width="20" height="20">
              <rect x="15" y="15" width="70" height="70" rx="12" fill="none" stroke="currentColor" strokeWidth="8"/>
              <path d="M35 35v30l30-30v30" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
            pkms
          </div>
          
          <div className="lp-footer-links">
            <a href="https://twitter.com/" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://github.com/shaik-ahmed1927/PKMS" target="_blank" rel="noreferrer">GitHub</a>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          
          <div className="lp-footer-copy">
            &copy; {new Date().getFullYear()} pkms. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
