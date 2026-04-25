import { Link } from 'react-router-dom';
import './Landing.css';

export default function Docs() {
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
      
      <div style={{ padding: '60px 5%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 className="lp-section-title" style={{ textAlign: 'left' }}>Documentation</h1>
        <p className="lp-section-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>
          Welcome to the pkms documentation. Here you will find everything you need to know about setting up, configuring, and using your personal knowledge management system.
        </p>
        
        <div className="lp-card" style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Getting Started</h3>
          <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>Learn how to create your first note, organize bookmarks, and track learning materials. The dashboard provides an overview of your recent activities and learning progress.</p>
          
          <div style={{ height: '150px', background: 'var(--bg3)', borderRadius: '8px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            More documentation content coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
