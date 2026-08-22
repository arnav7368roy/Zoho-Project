import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  LogOut,
  Key,
  CheckCircle,
  X,
  Calendar,
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/v1/auth/me');
      if (res.ok && res.data?.status && res.data?.data) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!newPassword || !confirmPassword) {
      setPwError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      const res = await apiRequest('/api/v1/auth/change-password', 'POST', {
        newPassword,
        confirmPassword,
      });
      if (res.ok && res.data?.status) {
        setPwSuccess('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPwSuccess('');
        }, 1500);
      } else {
        setPwError(res.data?.message || 'Failed to change password.');
      }
    } catch {
      setPwError('An error occurred. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const p = profileData || user || {};
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
  const initials = `${(p.firstName || 'U')[0]}${(p.lastName || '')[0] || ''}`.toUpperCase();

  return (
    <div style={pageStyle}>
      {/* Page Title */}
      <div style={pageTitleRow}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)' }}>
            My Profile
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Your account information and settings
          </p>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div style={spinnerStyle} />
        </div>
      ) : (
        <div style={mainGrid}>
          {/* Left: Avatar Card */}
          <div style={avatarCard}>
            <div style={avatarCircle}>{initials}</div>
            <h2 style={{ margin: '16px 0 4px', fontSize: '1.3rem', fontWeight: '800', color: 'var(--text)', textAlign: 'center' }}>
              {fullName}
            </h2>
            <span style={roleBadge}>
              <Shield size={12} /> {p.roleName || p.role || 'Member'}
            </span>
            {p.employeeCode && (
              <span style={empCodeBadge}>
                {p.employeeCode}
              </span>
            )}

            <div style={{ marginTop: '24px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setShowPasswordModal(true)} style={changePwBtnStyle}>
                <Key size={15} /> Change Password
              </button>
              <button onClick={handleLogout} style={logoutCardBtnStyle}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>

          {/* Right: Info Grid */}
          <div style={infoCard}>
            <h3 style={sectionTitle}>Account Details</h3>

            <div style={infoGrid}>
              <InfoRow icon={User} label="Full Name" value={fullName} />
              <InfoRow icon={Mail} label="Email Address" value={p.email || 'Not set'} />
              <InfoRow icon={Phone} label="Mobile" value={p.mobileNumber || p.mobile || 'Not set'} />
              <InfoRow icon={Briefcase} label="Designation" value={p.designationName || p.designation || 'Not set'} />
              <InfoRow icon={Building2} label="Department" value={p.departmentName || p.department || 'Not set'} />
              <InfoRow icon={Shield} label="Role" value={p.roleName || p.role || 'Member'} />
              {p.employeeCode && (
                <InfoRow icon={User} label="Employee Code" value={p.employeeCode} highlighted />
              )}
              {p.createdAt && (
                <InfoRow
                  icon={Calendar}
                  label="Account Created"
                  value={new Date(p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                />
              )}
            </div>

            {/* Account Status */}
            <div style={statusRow}>
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '700' }}>
                Account Active
              </span>
              {p.isVerified && (
                <>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.875rem', color: '#60a5fa', fontWeight: '600' }}>
                    Email Verified
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPwError('');
                  setPwSuccess('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} style={{ padding: '24px' }}>
              {pwError && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', color: '#f87171', fontSize: '0.875rem', fontWeight: '600' }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '8px', color: '#34d399', fontSize: '0.875rem', fontWeight: '600' }}>
                  {pwSuccess}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={formLabel}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={formInput}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={formLabel}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={formInput}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={pwLoading} style={submitBtnStyle}>
                  {pwLoading ? 'Saving...' : 'Save Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={cancelBtnStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: single info row
function InfoRow({ icon: Icon, label, value, highlighted }) {
  return (
    <div style={infoRowStyle}>
      <div style={infoRowLeft}>
        <Icon size={15} style={{ color: '#60a5fa', flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: highlighted ? '800' : '600',
        color: highlighted ? '#60a5fa' : 'var(--text)',
        fontFamily: highlighted ? 'monospace' : 'inherit',
        background: highlighted ? 'rgba(96,165,250,0.1)' : 'transparent',
        padding: highlighted ? '2px 8px' : '0',
        borderRadius: highlighted ? '6px' : '0',
      }}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────

const pageStyle = {
  padding: '0',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
};

const pageTitleRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '28px',
  flexWrap: 'wrap',
  gap: '12px',
};

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: '280px 1fr',
  gap: '24px',
  alignItems: 'start',
};

const avatarCard = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const avatarCircle = {
  width: '88px',
  height: '88px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: '800',
  boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
};

const roleBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 12px',
  borderRadius: '20px',
  background: 'rgba(139,92,246,0.15)',
  color: '#a78bfa',
  fontSize: '0.78rem',
  fontWeight: '700',
  marginTop: '8px',
};

const empCodeBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: '6px',
  background: 'rgba(96,165,250,0.12)',
  color: '#60a5fa',
  fontSize: '0.78rem',
  fontWeight: '800',
  fontFamily: 'monospace',
  marginTop: '6px',
  letterSpacing: '0.05em',
};

const infoCard = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '28px',
};

const sectionTitle = {
  margin: '0 0 20px',
  fontSize: '1rem',
  fontWeight: '800',
  color: 'var(--text)',
  paddingBottom: '14px',
  borderBottom: '1px solid var(--border-color)',
};

const infoGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid var(--border-color)',
};

const infoRowLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statusRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '20px',
  padding: '12px 16px',
  background: 'rgba(16,185,129,0.08)',
  border: '1px solid rgba(16,185,129,0.2)',
  borderRadius: '10px',
};

// Buttons
const logoutBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  background: 'rgba(239,68,68,0.12)',
  color: '#ef4444',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const changePwBtnStyle = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: 'rgba(59,130,246,0.12)',
  color: '#60a5fa',
  border: '1px solid rgba(59,130,246,0.3)',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '700',
  cursor: 'pointer',
};

const logoutCardBtnStyle = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: 'rgba(239,68,68,0.12)',
  color: '#ef4444',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: '700',
  cursor: 'pointer',
};

// Modal
const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(9,13,22,0.85)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px',
};

const modalBox = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
  overflow: 'hidden',
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: '#0f172a',
};

const formLabel = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.82rem',
  fontWeight: '600',
  color: '#94a3b8',
};

const formInput = {
  width: '100%',
  padding: '10px 14px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const submitBtnStyle = {
  flex: 1,
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '700',
  cursor: 'pointer',
};

const cancelBtnStyle = {
  flex: 1,
  padding: '10px 18px',
  background: 'rgba(255,255,255,0.06)',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '3px solid rgba(59,130,246,0.2)',
  borderTop: '3px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
