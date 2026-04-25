import { Link } from 'react-router-dom';
import './Landing.css';

export default function Blog() {
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
        <h1 className="lp-section-title" style={{ textAlign: 'left' }}>pkms Blog</h1>
        <p className="lp-section-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>
          Product updates, thoughts on knowledge management, and guides.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px' }}>
          <div className="lp-card">
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>APRIL 25, 2026</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text)' }}>Welcome to pkms v1.0</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>We are thrilled to announce the official release of our personal knowledge management system. Built for speed, privacy, and simplicity, pkms helps you connect your thoughts and build a local-first repository of your knowledge.</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/register" className="lp-btn lp-btn-secondary">Try it now</Link>
            </div>
          </div>
          
          <div className="lp-card">
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>APRIL 20, 2026</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text)' }}>Why Local-First Matters</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>In an era of cloud services, your thoughts and notes should belong to you. Exploring the benefits of a local-first architecture for knowledge management, ensuring you always have access to your data without relying on external servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
