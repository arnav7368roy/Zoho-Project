import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, ShieldCheck, Key, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [authMode, setAuthMode] = useState('standard'); // 'standard' or 'keycloak'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keycloakToken, setKeycloakToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithKeycloak, user } = useAuth();
  const navigate = useNavigate();

  // Already logged-in? -> Redirect to Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMode === 'standard') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else {
      if (!keycloakToken.trim()) {
        setError('Please enter a Keycloak SSO Token');
        setLoading(false);
        return;
      }
      const res = await loginWithKeycloak(keycloakToken);
      setLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-card">
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <div style={styles.logoIcon}>
            <Zap size={28} color="#ffffff" />
          </div>
          <h1 style={styles.title}>WorkMatrix Projects</h1>
          <p style={styles.subtitle}>Sign in with your HRMS Credentials or Keycloak SSO</p>
        </div>

        {/* Mode Selector */}
        <div style={styles.modeTabs}>
          <button
            type="button"
            onClick={() => setAuthMode('standard')}
            style={{
              ...styles.tabBtn,
              ...(authMode === 'standard' ? styles.activeTab : {}),
            }}
          >
            <Lock size={16} />
            <span>Standard Login</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('keycloak')}
            style={{
              ...styles.tabBtn,
              ...(authMode === 'keycloak' ? styles.activeTab : {}),
            }}
          >
            <ShieldCheck size={16} />
            <span>Keycloak SSO</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {authMode === 'standard' ? (
            <>
              <div className="form-group">
                <label>Work Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={styles.inputWrapper}>
                  <Key size={18} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Keycloak OIDC Bearer Token</label>
              <div style={styles.inputWrapper}>
                <ShieldCheck size={18} color="#10b981" style={styles.inputIcon} />
                <textarea
                  rows={4}
                  required
                  placeholder="Paste Keycloak Access Token (eyJhbGci...)"
                  value={keycloakToken}
                  onChange={(e) => setKeycloakToken(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>
              <span style={styles.hintText}>
                Keycloak realm is configured as <code>zoho-realm</code> at <code>http://localhost:8080</code>
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.15), transparent), var(--bg-main)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '36px',
    borderRadius: '24px',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  modeTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    backgroundColor: 'var(--bg-input)',
    padding: '4px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    boxShadow: 'var(--shadow-sm)',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    zIndex: 2,
  },
  hintText: {
    fontSize: '0.78rem',
    color: 'var(--text-subtle)',
    marginTop: '4px',
  },
};
