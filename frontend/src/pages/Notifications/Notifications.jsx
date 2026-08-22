import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  Bell,
  CheckCheck,
  CheckSquare,
  AlertCircle,
  Clock,
  FolderKanban,
  User,
  X,
  ChevronRight,
  Filter,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const TYPE_CONFIG = {
  TASK_ASSIGNED:    { icon: CheckSquare,  color: '#3b82f6', bg: '#eff6ff', label: 'Task Assigned',    path: '/tasks' },
  TASK_COMPLETED:   { icon: CheckSquare,  color: '#10b981', bg: '#f0fdf4', label: 'Task Completed',   path: '/tasks' },
  ISSUE:            { icon: AlertCircle,  color: '#ef4444', bg: '#fef2f2', label: 'Issue',             path: '/issues' },
  TIMER:            { icon: Clock,        color: '#f59e0b', bg: '#fffbeb', label: 'Timer',             path: '/tasks' },
  PROJECT_UPDATE:   { icon: FolderKanban, color: '#8b5cf6', bg: '#f5f3ff', label: 'Project Update',   path: '/projects' },
  LEAVE_REQUEST:    { icon: User,         color: '#06b6d4', bg: '#ecfeff', label: 'Leave Request',    path: '/' },
  EMPLOYEE_ADDED:   { icon: User,         color: '#64748b', bg: '#f8fafc', label: 'Employee Added',   path: '/' },
  DEFAULT:          { icon: Bell,         color: '#94a3b8', bg: '#f8fafc', label: 'Notification',     path: '/' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | UNREAD | READ
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const unreadOnly = filter === 'UNREAD';
      const res = await apiRequest(`/api/v1/notifications/my?limit=50${unreadOnly ? '&unreadOnly=true' : ''}`);
      if (res.ok && res.data?.data?.notifications) {
        let notifs = res.data.data.notifications;
        if (filter === 'READ') notifs = notifs.filter((n) => n.isRead);
        setNotifications(notifs);
        setTotal(res.data.data.total || notifs.length);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await apiRequest('/api/v1/notifications/read-all', 'PATCH');
  };

  const handleNotifClick = async (notif) => {
    // Mark as read in backend
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      await apiRequest(`/api/v1/notifications/${notif.id}/read`, 'PATCH');
    }

    // Navigate to relevant page based on type
    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.DEFAULT;
    navigate(cfg.path);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const groupedByDate = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label;
    if (date.toDateString() === today.toDateString()) label = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <Bell size={22} color="#3b82f6" style={{ marginRight: '10px' }} />
            All Notifications
            {unreadCount > 0 && (
              <span style={styles.unreadCountBadge}>{unreadCount} new</span>
            )}
          </h1>
          <p style={styles.pageSubtitle}>
            Task assignments, issue updates, project activity and system alerts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchNotifications} style={styles.refreshBtn} title="Refresh">
            <RefreshCw size={14} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {['ALL', 'UNREAD', 'READ'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterTab,
              ...(filter === f ? styles.filterTabActive : {}),
            }}
          >
            {f === 'ALL' ? `All (${total})` : f === 'UNREAD' ? `Unread (${unreadCount})` : 'Read'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {loading ? (
          <div style={styles.centerState}>
            <RefreshCw size={28} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', color: '#94a3b8' }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.centerState}>
            <div style={styles.emptyIconBox}>
              <Bell size={36} color="#cbd5e1" />
            </div>
            <h3 style={{ color: '#334155', fontWeight: '700', marginTop: '16px', fontSize: '1.1rem' }}>
              {filter === 'UNREAD' ? 'No unread notifications' : "You're all caught up!"}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
              {filter === 'UNREAD'
                ? 'All notifications have been read.'
                : 'New task assignments, issue updates and alerts will appear here.'}
            </p>
          </div>
        ) : (
          <div style={styles.notifGroups}>
            {Object.entries(groupedByDate).map(([dateLabel, items]) => (
              <div key={dateLabel} style={styles.group}>
                {/* Date Section Header */}
                <div style={styles.groupDateLabel}>{dateLabel}</div>

                {/* Notification Items */}
                {items.map((notif) => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.DEFAULT;
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      style={{
                        ...styles.notifCard,
                        ...(notif.isRead ? {} : styles.notifCardUnread),
                      }}
                    >
                      {/* Unread pulse dot */}
                      {!notif.isRead && <span style={styles.unreadPulse}></span>}

                      {/* Left: Sender Avatar */}
                      <div style={{ ...styles.senderAvatar, backgroundColor: cfg.color }}>
                        {notif.senderName?.charAt(0) || 'Z'}
                      </div>

                      {/* Center: Content */}
                      <div style={styles.notifContent}>
                        <div style={styles.notifHeadRow}>
                          {/* Type Tag */}
                          <span style={{ ...styles.typePill, backgroundColor: cfg.bg, color: cfg.color }}>
                            <Icon size={11} />
                            <span>{cfg.label}</span>
                          </span>
                          <span style={styles.timeText}>{timeAgo(notif.createdAt)}</span>
                        </div>

                        <div style={styles.notifTitle}>{notif.title}</div>
                        <div style={styles.notifMessage}>{notif.message}</div>

                        {notif.senderName && (
                          <div style={styles.senderRow}>
                            <User size={11} color="#94a3b8" />
                            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{notif.senderName}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Arrow */}
                      <div style={styles.arrowBox}>
                        <ChevronRight size={16} color="#cbd5e1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '0 0 40px 0',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 32px 16px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  pageTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
  },
  unreadCountBadge: {
    marginLeft: '12px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  pageSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
    paddingLeft: '32px',
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  markAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '7px 14px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  filterTabs: {
    display: 'flex',
    gap: '0',
    padding: '0 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  filterTab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterTabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
    fontWeight: '700',
  },
  contentArea: {
    maxWidth: '780px',
    margin: '24px auto 0 auto',
    padding: '0 16px',
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  emptyIconBox: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  groupDateLabel: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    padding: '12px 0 6px 0',
  },
  notifCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px 18px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  notifCardUnread: {
    backgroundColor: '#f0f7ff',
    borderColor: '#bfdbfe',
    borderLeft: '3px solid #3b82f6',
  },
  unreadPulse: {
    position: 'absolute',
    top: '18px',
    left: '10px',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
  },
  senderAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
  },
  notifHeadRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  typePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  timeText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '3px',
  },
  notifMessage: {
    fontSize: '0.83rem',
    color: '#475569',
    lineHeight: '1.45',
    marginBottom: '6px',
  },
  senderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  arrowBox: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '4px',
    flexShrink: 0,
  },
};
