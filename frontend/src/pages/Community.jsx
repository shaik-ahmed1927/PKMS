import { Link } from 'react-router-dom';
import './Landing.css';

export default function Community() {
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
      
      <div style={{ padding: '80px 5%', maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h1 className="lp-section-title">Join our Community</h1>
        <p className="lp-section-subtitle">
          Connect with other pkms users, share your workflows, and get help.
        </p>
        
        <div style={{ padding: '40px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Discord Server</h3>
          <p style={{ color: 'var(--text2)', marginBottom: '24px' }}>Our Discord server is currently invite-only for early testers.</p>
          <button className="lp-btn lp-btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', width: '100%' }}>Invite Link Disabled</button>
        </div>
      </div>
    </div>
  );
}
