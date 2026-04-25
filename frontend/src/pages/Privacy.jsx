import { Link } from 'react-router-dom';
import './Landing.css';

export default function Privacy() {
  return (
    <div className="lp-container">
      <nav className="lp-nav" style={{ position: 'relative' }}>
        <div className="lp-nav-logo">
          <Link to="/" style={{display:'flex',alignItems:'center',gap:'12px',textDecoration:'none'}}>
            <span style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.04em',color:'#1a1a1a',fontFamily:'Georgia,serif'}}>pkms</span>
          </Link>
        </div>
        <div className="lp-nav-actions">
          <Link to="/" className="lp-btn lp-btn-ghost">Back to Home</Link>
        </div>
      </nav>
      
      <div style={{ padding: '60px 5%', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--text)' }}>
        <h1 className="lp-section-title" style={{ textAlign: 'left' }}>Privacy Policy</h1>
        <p className="lp-section-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>
          Last updated: April 25, 2026
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px', lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Information Collection</h2>
            <p style={{ color: 'var(--text2)' }}>When you create an account, we collect your name, email address, and an encrypted password. This is required to identify you and sync your data securely across devices.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Data Storage</h2>
            <p style={{ color: 'var(--text2)' }}>All your notes, bookmarks, tags, and learning materials are securely stored in our database. Since pkms aims to be a private workspace, we do not share this data with any third parties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Cookies and Tracking</h2>
            <p style={{ color: 'var(--text2)' }}>We only use strictly necessary cookies and local storage tokens to maintain your login session. We do not use third-party tracking scripts or advertising cookies.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Your Rights</h2>
            <p style={{ color: 'var(--text2)' }}>You have full control over your data. You can export your data or delete your account at any time, which will permanently remove all your stored information from our systems.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
