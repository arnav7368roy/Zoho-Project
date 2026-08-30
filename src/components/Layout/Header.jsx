import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Star,
  ChevronDown,
  Search,
  Bell,
  Sun,
  Moon,
  CheckCheck,
  X,
  Clock,
  AlertCircle,
  CheckSquare,
  Layers,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  const [activeProject] = useState({
    code: 'ZT-74',
    name: 'NCR 2.0 {ADVANCE}',
  });

  const projectTabs = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Reports', path: '/reports' },
    { name: 'Documents', path: '/documents' },
    { name: 'Milestones', path: '/milestones' },
    { name: 'Time Logs', path: '/time-logs' },
    { name: 'Issues', path: '/issues' },
    { name: 'Users', path: '/team' },
    { name: 'Test Cases', path: '/test-cases' },
  ];

  // Fetch notifications — correct endpoint: /api/v1/notifications/my
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await apiRequest('/api/v1/notifications/my?limit=20');
      if (res.ok && res.data?.data?.notifications) {
        const notifs = res.data.data.notifications;
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.isRead).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Notification fetch error:', e);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], issues: [], projects: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close search & notification dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Global Search Results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ tasks: [], issues: [], projects: [] });
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const [taskRes, issueRes, projRes] = await Promise.all([
          apiRequest('/api/v1/tasks'),
          apiRequest('/api/v1/issues'),
          apiRequest('/api/v1/projects'),
        ]);

        const q = searchQuery.toLowerCase().trim();

        const tasks = taskRes.ok && taskRes.data?.data
          ? taskRes.data.data.filter(
              (t) =>
                t.title?.toLowerCase().includes(q) ||
                t.taskCode?.toLowerCase().includes(q) ||
                t.projectName?.toLowerCase().includes(q)
            ).slice(0, 5)
          : [];

        const issues = issueRes.ok && issueRes.data?.data
          ? issueRes.data.data.filter(
              (i) =>
                i.title?.toLowerCase().includes(q) ||
                i.issueCode?.toLowerCase().includes(q) ||
                i.projectName?.toLowerCase().includes(q)
            ).slice(0, 5)
          : [];

        const projects = projRes.ok && projRes.data?.data
          ? projRes.data.data.filter(
              (p) =>
                p.projectName?.toLowerCase().includes(q) ||
                p.projectCode?.toLowerCase().includes(q)
            ).slice(0, 5)
          : [];

        setSearchResults({ tasks, issues, projects });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBellClick = () => {
    setShowNotifDropdown((prev) => !prev);
    if (!showNotifDropdown) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await apiRequest('/api/v1/notifications/read-all', 'PATCH');
  };

  const handleMarkOneRead = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await apiRequest(`/api/v1/notifications/${id}/read`, 'PATCH');
  };

  const handleViewAll = () => {
    setShowNotifDropdown(false);
    navigate('/notifications');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED': return <CheckSquare size={14} color="#3b82f6" />;
      case 'ISSUE': return <AlertCircle size={14} color="#ef4444" />;
      case 'TIMER': return <Clock size={14} color="#22c55e" />;
      default: return <Bell size={14} color="#94a3b8" />;
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const totalResultsCount =
    searchResults.tasks.length + searchResults.issues.length + searchResults.projects.length;

  return (
    <header style={styles.headerContainer}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        {/* Project Title & Selector */}
        <div style={styles.projectTitleBox}>
          <Star size={16} color="#f59e0b" fill="#f59e0b" style={{ cursor: 'pointer' }} />
          <h2 style={styles.projectCodeTitle}>
            <span style={{ color: '#94a3b8', fontWeight: '500' }}>{activeProject.code}</span>{' '}
            {activeProject.name}
          </h2>
          <ChevronDown size={14} color="#94a3b8" style={{ cursor: 'pointer' }} />
        </div>

        {/* Header Right Actions */}
        <div style={styles.rightActions}>
          {/* ---- GLOBAL SEARCH BAR ---- */}
          <div style={{ position: 'relative' }} ref={searchRef}>
            <div style={styles.searchBox}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search tasks, issues, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchDropdown(true);
                }}
                style={styles.searchInput}
              />
              {searchQuery && (
                <X
                  size={14}
                  color="#94a3b8"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                />
              )}
            </div>

            {/* Global Search Results Dropdown Popup */}
            {showSearchDropdown && (
              <div style={styles.searchDropdownPopup}>
                {searchLoading ? (
                  <div style={styles.searchStatusMsg}>Searching workspace...</div>
                ) : totalResultsCount === 0 ? (
                  <div style={styles.searchStatusMsg}>
                    No tasks, issues, or projects matching "{searchQuery}"
                  </div>
                ) : (
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {/* Issues Category */}
                    {searchResults.issues.length > 0 && (
                      <div style={styles.searchGroup}>
                        <div style={styles.searchGroupTitle}>🐛 Issues ({searchResults.issues.length})</div>
                        {searchResults.issues.map((iss) => (
                          <div
                            key={iss.id}
                            style={styles.searchResultItem}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                              navigate('/issues');
                            }}
                          >
                            <span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '0.78rem' }}>
                              {iss.issueCode || 'SD2-I1005'}
                            </span>
                            <span style={styles.resultTitleText}>{iss.title}</span>
                            <span style={styles.resultBadgePill}>{iss.status || 'OPEN'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tasks Category */}
                    {searchResults.tasks.length > 0 && (
                      <div style={styles.searchGroup}>
                        <div style={styles.searchGroupTitle}>📌 Tasks ({searchResults.tasks.length})</div>
                        {searchResults.tasks.map((t) => (
                          <div
                            key={t.id}
                            style={styles.searchResultItem}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                              navigate('/tasks');
                            }}
                          >
                            <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '0.78rem' }}>
                              {t.taskCode || 'TSK'}
                            </span>
                            <span style={styles.resultTitleText}>{t.title}</span>
                            <span style={styles.resultBadgePill}>{t.status || 'TO_DO'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects Category */}
                    {searchResults.projects.length > 0 && (
                      <div style={styles.searchGroup}>
                        <div style={styles.searchGroupTitle}>📁 Projects ({searchResults.projects.length})</div>
                        {searchResults.projects.map((p) => (
                          <div
                            key={p.id}
                            style={styles.searchResultItem}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                              navigate('/');
                            }}
                          >
                            <span style={{ fontWeight: '700', color: '#eab308', fontSize: '0.78rem' }}>
                              {p.projectCode || 'PRJ'}
                            </span>
                            <span style={styles.resultTitleText}>{p.projectName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* ---- NOTIFICATION BELL WITH DROPDOWN ---- */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={handleBellClick}
              style={{
                ...styles.iconBtn,
                ...(showNotifDropdown ? styles.iconBtnActive : {}),
              }}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={styles.badgeDot}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifDropdown && (
              <div style={styles.notifDropdown}>
                {/* Panel Header */}
                <div style={styles.notifHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color="#3b82f6" />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span style={styles.unreadBadge}>{unreadCount} new</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={styles.headerActionBtn}
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} /> <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      style={styles.closeBtn}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div style={styles.notifList}>
                  {notifLoading ? (
                    <div style={styles.emptyState}>Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div style={styles.emptyState}>
                      <Bell size={28} color="#cbd5e1" />
                      <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkOneRead(n.id)}
                        style={{
                          ...styles.notifItem,
                          ...(n.isRead ? {} : styles.notifItemUnread),
                        }}
                      >
                        {/* Unread dot */}
                        {!n.isRead && <span style={styles.unreadDot}></span>}

                        {/* Icon */}
                        <div style={styles.notifIconBox}>
                          {getNotifIcon(n.type)}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.notifTitle}>{n.title}</div>
                          <div style={styles.notifMsg}>{n.message}</div>
                          <div style={styles.notifTime}>{timeAgo(n.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Panel Footer */}
                <div style={styles.notifFooter}>
                  <button onClick={handleViewAll} style={styles.viewAllBtn}>
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* ---- END NOTIFICATION BELL ---- */}

          <div style={styles.userAvatarBtn} title={user?.email}>
            {user?.firstName?.charAt(0) || 'A'}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Row */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsList}>
          {projectTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className="nav-tab-link"
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

const styles = {
  headerContainer: {
    backgroundColor: '#090d16',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 24px',
    height: '52px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  projectTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  projectCodeTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    padding: '4px 10px',
    width: '240px',
    transition: 'all 0.2s ease',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.82rem',
    outline: 'none',
    width: '100%',
  },
  searchDropdownPopup: {
    position: 'absolute',
    top: '42px',
    left: 0,
    width: '380px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    border: '1px solid #1e293b',
    zIndex: 1000,
    overflow: 'hidden',
  },
  searchStatusMsg: {
    padding: '16px',
    fontSize: '0.82rem',
    color: '#94a3b8',
    textAlign: 'center',
  },
  searchGroup: {
    borderBottom: '1px solid #1e293b',
  },
  searchGroupTitle: {
    padding: '8px 14px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: '#090d16',
    letterSpacing: '0.5px',
  },
  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #1e293b',
    transition: 'background 0.15s ease',
  },
  resultTitleText: {
    flex: 1,
    fontSize: '0.82rem',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  resultBadgePill: {
    fontSize: '0.68rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    fontWeight: '600',
  },
  iconBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
    color: '#60a5fa',
  },
  badgeDot: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.62rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #090d16',
  },

  // Notification Dropdown
  notifDropdown: {
    position: 'absolute',
    top: '42px',
    right: 0,
    width: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    border: '1px solid #e2e8f0',
    zIndex: 200,
    overflow: 'hidden',
    animation: 'slideDown 0.18s ease-out',
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '12px',
  },
  headerActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifList: {
    maxHeight: '340px',
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.15s ease',
    backgroundColor: '#ffffff',
  },
  notifItemUnread: {
    backgroundColor: '#eff6ff',
  },
  unreadDot: {
    position: 'absolute',
    left: '6px',
    top: '18px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },
  notifIconBox: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '2px',
  },
  notifMsg: {
    fontSize: '0.8rem',
    color: '#475569',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  notifTime: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  notifFooter: {
    padding: '10px 16px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  userAvatarBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  tabsRow: {
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    overflowX: 'auto',
  },
  tabsList: {
    display: 'flex',
    gap: '4px',
  },
};
