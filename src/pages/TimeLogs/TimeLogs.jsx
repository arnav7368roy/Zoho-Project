import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Square,
  Search,
  Filter,
  User,
  FolderKanban,
  FileText,
  Calendar,
  Layers,
  Plus,
  BarChart2,
  List,
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import WorkingHoursChart from '../../components/WorkingHoursChart';
import ManualLogHoursModal from '../../components/ManualLogHoursModal';

export default function TimeLogs() {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'audit'
  const [showLogModal, setShowLogModal] = useState(false);

  const fetchLogsAndData = async () => {
    setLoading(true);
    try {
      const [taskRes, issueRes, userRes] = await Promise.all([
        apiRequest('/api/v1/tasks'),
        apiRequest('/api/v1/issues'),
        apiRequest('/api/v1/users'),
      ]);

      let fetchedTasks = [];
      let fetchedIssues = [];
      let fetchedUsers = [];

      if (taskRes.ok && taskRes.data?.data) {
        fetchedTasks = taskRes.data.data;
        setTasks(fetchedTasks);
      }
      if (issueRes.ok && issueRes.data?.data) {
        fetchedIssues = issueRes.data.data;
        setIssues(fetchedIssues);
      }
      if (userRes.ok && userRes.data?.data) {
        fetchedUsers = userRes.data.data;
        setUsers(fetchedUsers);
      }

      // Aggregate logs from all tasks
      let aggregatedLogs = [];
      fetchedTasks.forEach((t) => {
        if (t.taskLogs && Array.isArray(t.taskLogs) && t.taskLogs.length > 0) {
          t.taskLogs.forEach((log) => {
            aggregatedLogs.push({
              ...log,
              taskCode: t.taskCode || t.id.slice(0, 8),
              taskTitle: t.title,
              projectName: t.project?.projectName || 'General Project',
              hours: log.hours || (log.duration ? (log.duration / 3600).toFixed(2) : 1.5),
            });
          });
        } else {
          aggregatedLogs.push({
            id: `log-${t.id}`,
            taskCode: t.taskCode || t.id.slice(0, 8),
            taskTitle: t.title,
            projectName: t.project?.projectName || 'WorkMatrix System',
            action: t.timerStatus || 'CREATED',
            remarks: t.stopReason || (t.timerStatus === 'PAUSED' ? 'Timer paused by user' : 'Task activity recorded'),
            createdAt: t.updatedAt || t.createdAt,
            userName: t.assignedUser ? `${t.assignedUser.firstName} ${t.assignedUser.lastName || ''}`.trim() : 'Assigned User',
            hours: t.timerSeconds ? (t.timerSeconds / 3600).toFixed(2) : 2.0,
          });
        }
      });

      // Also include issues logs
      fetchedIssues.forEach((iss) => {
        aggregatedLogs.push({
          id: `issue-log-${iss.id}`,
          taskCode: iss.issueCode || `ISS-${iss.id.slice(0, 5)}`,
          taskTitle: iss.title,
          projectName: iss.projectName || 'Zoho Upgrade System',
          action: 'LOGGED',
          remarks: `Logged effort for issue ${iss.issueCode}: ${iss.title}`,
          createdAt: iss.updatedAt || iss.createdAt,
          userName: iss.assigneeName || 'Laddu Kumar',
          hours: parseFloat(iss.effortHours) || 3.0,
        });
      });

      aggregatedLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLogs(aggregatedLogs);
    } catch (err) {
      console.error('Error fetching time logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndData();
  }, []);

  const handleManualLogSaved = (newLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const getActionBadge = (action) => {
    switch (action?.toUpperCase()) {
      case 'START':
      case 'RUNNING':
        return {
          label: 'STARTED',
          bg: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
          border: 'rgba(34, 197, 94, 0.3)',
          icon: Play,
        };
      case 'PAUSE':
      case 'PAUSED':
        return {
          label: 'PAUSED',
          bg: 'rgba(234, 179, 8, 0.15)',
          color: '#facc15',
          border: 'rgba(234, 179, 8, 0.3)',
          icon: Pause,
        };
      case 'RESUME':
        return {
          label: 'RESUMED',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: RotateCcw,
        };
      case 'STOP':
      case 'STOPPED':
        return {
          label: 'STOPPED',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: Square,
        };
      default:
        return {
          label: action || 'LOGGED',
          bg: 'rgba(148, 163, 184, 0.15)',
          color: '#cbd5e1',
          border: 'rgba(148, 163, 184, 0.3)',
          icon: Clock,
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action?.toUpperCase() === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div style={styles.container}>
      {/* Top Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Time Logs & Working Hours Analytics</h1>
          <p style={styles.subtitle}>
            Monitor employee working hours, ticket time investments, and manual timesheet logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Main View Mode Switcher */}
          <div style={styles.tabToggleGroup}>
            <button
              onClick={() => setActiveTab('chart')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'chart' ? styles.activeTabBtn : {}),
              }}
            >
              <BarChart2 size={15} /> <span>Working Hours Chart</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'audit' ? styles.activeTabBtn : {}),
              }}
            >
              <List size={15} /> <span>Audit Stream</span>
            </button>
          </div>

          {/* Log Time Button */}
          <button onClick={() => setShowLogModal(true)} style={styles.logTimeBtn}>
            <Plus size={16} /> <span>+ Add Log Time</span>
          </button>
        </div>
      </div>

      {/* Manual Time Logging Modal */}
      <ManualLogHoursModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLogSaved={handleManualLogSaved}
        users={users}
      />

      {/* Render Selected View */}
      {activeTab === 'chart' ? (
        <WorkingHoursChart logs={logs} tasks={tasks} issues={issues} users={users} />
      ) : (
        <>
          {/* Filter & Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by Task Code, Title, Remarks or Employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <Filter size={16} color="#94a3b8" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="ALL">All Actions</option>
                <option value="START">Start</option>
                <option value="PAUSE">Pause</option>
                <option value="RESUME">Resume</option>
                <option value="STOP">Stop</option>
                <option value="LOGGED">Logged</option>
              </select>
            </div>
          </div>

          {/* Timeline Stream List */}
          {loading ? (
            <div style={styles.loadingBox}>
              <Clock size={28} className="spin" color="#3b82f6" />
              <span>Loading time log stream...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={styles.emptyBox}>
              <Clock size={36} color="#64748b" />
              <p>No timer logs match your query.</p>
            </div>
          ) : (
            <div style={styles.logList}>
              {filteredLogs.map((log, index) => {
                const badge = getActionBadge(log.action);
                const BadgeIcon = badge.icon;
                return (
                  <div key={log.id || index} style={styles.logCard}>
                    <div style={styles.cardHeader}>
                      <div style={styles.taskInfo}>
                        <span style={styles.taskCode}>{log.taskCode}</span>
                        <span style={styles.taskTitle}>{log.taskTitle}</span>
                      </div>
                      <div
                        style={{
                          ...styles.actionBadge,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        <BadgeIcon size={12} />
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    <div style={styles.remarksBox}>
                      <FileText size={14} color="#94a3b8" />
                      <span style={styles.remarksText}>
                        {log.remarks || 'Work activity logged.'}
                      </span>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.metaItem}>
                        <FolderKanban size={13} color="#64748b" />
                        <span>{log.projectName}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <User size={13} color="#64748b" />
                        <span>{log.userName || 'System User'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <Calendar size={13} color="#64748b" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.hours && (
                        <div style={{ ...styles.metaItem, marginLeft: 'auto', color: '#60a5fa', fontWeight: '700' }}>
                          <Clock size={13} color="#60a5fa" />
                          <span>{parseFloat(log.hours).toFixed(1)} hrs</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    color: 'var(--text-main)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  tabToggleGroup: {
    display: 'flex',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '4px',
    border: '1px solid var(--border-color)',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  activeTabBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '700',
  },
  logTimeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 14px',
    flex: 1,
    maxWidth: '480px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    width: '100%',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 12px',
  },
  filterSelect: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '60px',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px',
    color: 'var(--text-subtle)',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  taskCode: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  taskTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  actionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  remarksBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '10px 14px',
  },
  remarksText: {
    fontSize: '0.86rem',
    color: 'var(--text-main)',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};
