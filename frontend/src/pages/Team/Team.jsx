import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import { Users, Mail, Phone, ShieldCheck, Search } from 'lucide-react';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const res = await apiRequest('/api/v1/users');
      if (res.ok && res.data?.data) {
        setUsers(res.data.data);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">HRMS Team Members</h1>
          <p className="page-subtitle">Synchronized users from HRMS shared database</p>
        </div>
      </div>

      <div style={styles.grid}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading team members...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Users size={36} color="var(--text-subtle)" />
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>No team members found.</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="glass-card" style={styles.userCard}>
              <div style={styles.userTop}>
                <div style={styles.avatar}>{u.firstName?.charAt(0) || 'U'}</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                    {u.firstName} {u.lastName || ''}
                  </h3>
                  <span className="badge badge-blue">{u.employeeCode || 'EMP'}</span>
                </div>
              </div>

              <div style={styles.infoList}>
                <div style={styles.infoRow}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{u.email}</span>
                </div>
                {u.mobileNumber && (
                  <div style={styles.infoRow}>
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{u.mobileNumber}</span>
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                <ShieldCheck size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: '600' }}>HRMS & Keycloak Sync</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  userCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  userTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.78rem',
  },
};
