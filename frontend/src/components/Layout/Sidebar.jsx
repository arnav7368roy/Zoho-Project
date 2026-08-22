import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Flag,
  Clock,
  FileText,
  Users,
  Home,
  BarChart3,
  MessageSquare,
  LogOut,
  ChevronDown,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentProjects() {
      try {
        const res = await apiRequest('/api/v1/projects?page=1&limit=5');
        if (isMounted && res.ok && res.data?.status) {
          setRecentProjects(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load recent projects:', err);
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    }

    fetchRecentProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Collaboration', path: '/collaboration', icon: MessageSquare },
  ];

  const overviewNav = [
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Issues', path: '/issues', icon: AlertCircle },
    { name: 'Milestones', path: '/milestones', icon: Flag },
    { name: 'Time Logs', path: '/time-logs', icon: Clock },
    { name: 'Expense Claims', path: '/expenses', icon: FileText },
    { name: 'Test Cases', path: '/test-cases', icon: Award },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Top Header Logo Dropdown */}
      <div style={styles.brand}>
        <div style={styles.brandLogo}>
          <Layers size={20} color="#3b82f6" />
          <span style={styles.brandTitle}>WorkMatrix</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>

      {/* Scrollable Nav Area */}
      <div style={styles.scrollNav}>
        {/* Main Nav */}
        <nav style={styles.navGroup}>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.activeNavLink : {}),
                })}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Overview Section */}
        <div style={styles.sectionHeader}>Overview</div>
        <nav style={styles.navGroup}>
          {overviewNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.activeNavLink : {}),
                })}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Recent Projects Section — LIVE DATA FROM DB */}
        <div style={styles.sectionHeader}>Recent Projects</div>
        <div style={styles.projectList}>
          {projectsLoading ? (
            <div style={styles.projectEmpty}>Loading projects...</div>
          ) : recentProjects.length === 0 ? (
            <div style={styles.projectEmpty}>No projects yet</div>
          ) : (
            recentProjects.map((proj) => (
              <div
                key={proj.id}
                style={styles.projectItem}
                onClick={() => navigate('/projects')}
              >
                <div style={styles.projectIcon}>
                  {(proj.projectCode || 'NA').slice(0, 2)}
                </div>
                <span style={styles.projectName}>{proj.projectName}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Footer Profile */}
      <div
        style={{ ...styles.footer, cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
        title="View Profile"
      >
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.firstName?.charAt(0) || 'A'}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>
              {user?.firstName} {user?.lastName || ''}
            </span>
            <span style={styles.userRole}>{user?.roleName || 'Admin'}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            logout();
          }}
          style={styles.logoutBtn}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: '#090d16',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    userSelect: 'none',
  },
  brand: {
    padding: '16px 18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  scrollNav: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 10px',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '16px',
  },
  sectionHeader: {
    fontSize: '0.72rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: 'var(--text-subtle)',
    padding: '8px 12px 4px 12px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '6px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  activeNavLink: {
    color: '#ffffff',
    fontWeight: '700',
    borderBottom: '2px solid #3b82f6',
    paddingBottom: '6px',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#cbd5e1',
    transition: 'background 0.15s ease',
  },
  projectEmpty: {
    padding: '8px 12px',
    fontSize: '0.78rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
  projectIcon: {
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    fontSize: '0.68rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  projectName: {
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#060911',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    flexShrink: 0,
  },
};
