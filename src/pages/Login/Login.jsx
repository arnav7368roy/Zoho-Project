import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Key, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged-in? -> Redirect to Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
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
          <p style={styles.subtitle}>Sign in with your HRMS credentials</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
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
              <Lock size={18} color="var(--text-muted)" style={styles.inputIcon} />
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
    background:
      'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.15), transparent), var(--bg-main)',
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
    marginBottom: '28px',
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
};
