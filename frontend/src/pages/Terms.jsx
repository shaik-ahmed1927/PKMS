import { Link } from 'react-router-dom';
import './Landing.css';

export default function Terms() {
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
        <h1 className="lp-section-title" style={{ textAlign: 'left' }}>Terms of Service</h1>
        <p className="lp-section-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>
          Last updated: April 25, 2026
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px', lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>1. Introduction</h2>
            <p style={{ color: 'var(--text2)' }}>Welcome to pkms. By using our application, you agree to these Terms of Service. Please read them carefully.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>2. Your Data</h2>
            <p style={{ color: 'var(--text2)' }}>pkms is designed as a local-first application. Your notes, bookmarks, and materials belong to you. We do not sell or claim ownership of any content you create or store within the system.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>3. Acceptable Use</h2>
            <p style={{ color: 'var(--text2)' }}>You agree not to use the service for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>4. Disclaimer of Warranties</h2>
            <p style={{ color: 'var(--text2)' }}>The service is provided on an "as is" and "as available" basis without any warranties of any kind, whether express or implied.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>5. Changes to Terms</h2>
            <p style={{ color: 'var(--text2)' }}>We reserve the right to modify these terms at any time. If we make changes, we will provide notice by updating the date at the top of these terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
