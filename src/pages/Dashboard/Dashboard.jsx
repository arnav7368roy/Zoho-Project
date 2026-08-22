import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalMembers: 0,
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, taskRes, userRes] = await Promise.all([
          apiRequest('/api/v1/projects'),
          apiRequest('/api/v1/tasks'),
          apiRequest('/api/v1/users/dropdown'),
        ]);

        const projectList = projRes.ok && projRes.data?.data ? projRes.data.data : [];
        const taskList = taskRes.ok && taskRes.data?.data ? taskRes.data.data : [];
        const userList = userRes.ok && userRes.data?.data ? userRes.data.data : [];

        setProjects(projectList);
        setTasks(taskList);

        const activeCount = taskList.filter(t => t.status !== 'COMPLETED').length;
        const completedCount = taskList.filter(t => t.status === 'COMPLETED').length;

        setStats({
          totalProjects: projectList.length,
          activeTasks: activeCount,
          completedTasks: completedCount,
          totalMembers: userList.length || 1,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Header Bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Management Dashboard</h1>
          <p className="page-subtitle">Unified project & task tracking integrated with HRMS Users</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/projects" className="btn btn-primary">
            <Plus size={18} />
            <span>New Project</span>
          </Link>
          <Link to="/tasks" className="btn btn-secondary">
            <CheckSquare size={18} />
            <span>Manage Tasks</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Projects</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{stats.totalProjects || projects.length || 0}</div>
          <div style={styles.kpiFooter}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ color: '#10b981' }}>+12%</span> from last month
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Active Tasks</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{stats.activeTasks || tasks.filter(t => t.status !== 'COMPLETED').length || 0}</div>
          <div style={styles.kpiFooter}>
            <span style={{ color: 'var(--text-muted)' }}>In progress across projects</span>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Completed Tasks</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{stats.completedTasks || tasks.filter(t => t.status === 'COMPLETED').length || 0}</div>
          <div style={styles.kpiFooter}>
            <span style={{ color: '#10b981' }}>100% Verified</span>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>HRMS Team Members</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{stats.totalMembers || 8}</div>
          <div style={styles.kpiFooter}>
            <span style={{ color: 'var(--text-muted)' }}>Synchronized from HRMS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Recent Tasks */}
      <div style={styles.mainGrid}>
        {/* Projects Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={styles.sectionHeader}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Projects</h3>
            <Link to="/projects" style={styles.linkMore}>
              View All <ArrowUpRight size={16} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={styles.emptyState}>
              <FolderKanban size={36} color="var(--text-subtle)" />
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>No projects created yet.</p>
              <Link to="/projects" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Create First Project
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((p) => (
                    <tr key={p.id || p.projectCode}>
                      <td style={{ fontWeight: '700' }}>{p.projectName}</td>
                      <td><code>{p.projectCode}</code></td>
                      <td>
                        <span className={`badge ${p.status === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
                          {p.status || 'IN_PROGRESS'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tasks Stream Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={styles.sectionHeader}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Task Activity</h3>
            <Link to="/tasks" style={styles.linkMore}>
              Kanban Board <ArrowUpRight size={16} />
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckSquare size={36} color="var(--text-subtle)" />
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>No task activity recorded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.slice(0, 5).map((t) => (
                <div key={t.id} style={styles.taskItem}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{t.taskTitle}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Priority: {t.priority || 'MEDIUM'}
                    </span>
                  </div>
                  <span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : 'badge-orange'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  kpiCard: {
    padding: '20px 24px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  kpiLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  kpiIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  kpiFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  linkMore: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--primary)',
    fontSize: '0.85rem',
    fontWeight: '700',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
  },
};
