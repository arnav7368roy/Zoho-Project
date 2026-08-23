import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import { FolderKanban, Plus, Search, Calendar, Users, X, UserPlus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper for Manager/User display name resolution
  const getDisplayName = (m) => {
    if (!m) return '';
    if (typeof m === 'string') return m;
    const fullName = [
      m.firstName || m.first_name || m.given_name,
      m.lastName || m.last_name || m.family_name
    ].filter(Boolean).join(' ').trim();
    
    return (
      fullName ||
      m.name ||
      m.fullName ||
      m.full_name ||
      m.userName ||
      m.user_name ||
      m.label ||
      m.email ||
      m.employeeCode ||
      m.employee_code ||
      (m.id ? `User (${String(m.id).substring(0, 6)})` : '')
    );
  };
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  
  // Form State for New / Edit Project
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [managerId, setManagerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State for Assign Member
  const [assignUserId, setAssignUserId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const openEditModal = (project) => {
    setEditingProject(project);
    setProjectName(project.projectName || '');
    setProjectCode(project.projectCode || '');
    setManagerId(project.managerId || project.manager_id || project.manager?.id || '');
    setStartDate(project.startDate || '');
    setEndDate(project.endDate || '');
    setDescription(project.description || '');
    setProjectStatus(project.status || 'ACTIVE');
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setFormError('');
    setSubmitting(true);

    const payload = {
      projectName,
      projectCode,
      managerId: managerId || undefined,
      startDate: startDate || null,
      endDate: endDate || null,
      description,
      status: projectStatus,
    };

    const res = await apiRequest(`/api/v1/projects/${editingProject.id}`, 'PUT', payload);
    setSubmitting(false);

    if (res.ok && res.data?.status) {
      setShowEditModal(false);
      setEditingProject(null);
      fetchProjects();
    } else {
      setFormError(res.data?.message || 'Failed to update project.');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    const res = await apiRequest('/api/v1/projects');
    if (res.ok && res.data?.data) {
      setProjects(res.data.data);
    }
    setLoading(false);
  };

  const fetchDropdowns = async () => {
    try {
      const [mgrRes, userRes] = await Promise.all([
        apiRequest('/api/v1/projects/project-manager-dropdown'),
        apiRequest('/api/v1/users/dropdown'),
      ]);

      const userList = userRes.ok && userRes.data?.data ? userRes.data.data : [];
      const mgrList = (mgrRes.ok && Array.isArray(mgrRes.data?.data) && mgrRes.data.data.length > 0)
        ? mgrRes.data.data
        : userList;

      setManagers(mgrList);
      setUsers(userList);
    } catch (err) {
      console.error('Failed to fetch dropdowns:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDropdowns();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const payload = {
      projectName,
      projectCode,
      managerId: managerId || user?.id,
      startDate: startDate || null,
      endDate: endDate || null,
      description,
    };

    const res = await apiRequest('/api/v1/projects', 'POST', payload);
    setSubmitting(false);

    if (res.ok && res.data?.status) {
      setShowCreateModal(false);
      setProjectName('');
      setProjectCode('');
      setManagerId('');
      setStartDate('');
      setEndDate('');
      setDescription('');
      fetchProjects();
    } else {
      setFormError(res.data?.message || 'Failed to create project.');
    }
  };

  const openAssignModal = async (project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
    const res = await apiRequest(`/api/v1/project-member?projectId=${project.id}`);
    if (res.ok && res.data?.data) {
      setProjectMembers(res.data.data);
    } else {
      setProjectMembers([]);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignUserId || !selectedProject) return;
    setAssignSubmitting(true);

    const res = await apiRequest('/api/v1/project-member', 'POST', {
      projectId: selectedProject.id,
      userId: assignUserId,
    });
    setAssignSubmitting(false);

    if (res.ok && res.data?.status) {
      setAssignUserId('');
      const memberRes = await apiRequest(`/api/v1/project-member?projectId=${selectedProject.id}`);
      if (memberRes.ok && memberRes.data?.data) setProjectMembers(memberRes.data.data);
    } else {
      alert(res.data?.message || 'Failed to assign member.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove member from project?')) return;
    const res = await apiRequest(`/api/v1/project-member/${memberId}`, 'DELETE');
    if (res.ok && res.data?.status) {
      setProjectMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects Directory</h1>
          <p className="page-subtitle">Manage company projects, managers, timeline & assignees</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar} className="glass-card">
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by project name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <FolderKanban size={48} color="var(--text-subtle)" />
          <h3>No Projects Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px 0' }}>
            {searchTerm ? 'No projects match your search.' : 'Get started by creating your first project.'}
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {filteredProjects.map((p) => (
            <div key={p.id || p.projectCode} className="glass-card" style={styles.projectCard}>
              <div>
                <div style={styles.cardTop}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
                      {p.projectCode}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{p.projectName}</h3>
                  </div>
                  <span className={`badge ${p.status === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
                    {p.status || 'ACTIVE'}
                  </span>
                </div>

                <p style={styles.projectDesc}>
                  {p.description || 'No detailed description provided for this project.'}
                </p>

                <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div><strong>Manager:</strong> {p.managerName || 'Unassigned'}</div>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.footerItem}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{p.startDate ? `${p.startDate} to ${p.endDate || 'Ongoing'}` : 'No date set'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(p)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}
                    title="Edit Project"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openAssignModal(p)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}
                  >
                    <UserPlus size={14} />
                    <span>Members</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div style={styles.modalHeader}>
              <h2>Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="badge badge-red" style={{ marginBottom: '16px', padding: '8px 12px' }}>{formError}</div>}

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Timesheet Portal v2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Project Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRJ-TSP-01"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Project Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Manager (Default: Me)</option>
                  {managers.map((m) => (
                    <option key={m.id || m.value || m.userId} value={m.id || m.value || m.userId}>
                      {getDisplayName(m) || `Manager ${m.id || ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of project objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div style={styles.modalHeader}>
              <h2>Edit Project ({editingProject.projectCode})</h2>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="badge badge-red" style={{ marginBottom: '16px', padding: '8px 12px' }}>{formError}</div>}

            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Project Code *</label>
                <input
                  type="text"
                  required
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Project Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m.id || m.value || m.userId} value={m.id || m.value || m.userId}>
                      {getDisplayName(m) || `Manager ${m.id || ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Project Status</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Members Modal */}
      {showAssignModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div style={styles.modalHeader}>
              <h2>Project Members ({selectedProject.projectName})</h2>
              <button onClick={() => setShowAssignModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignMember} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <select
                required
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              >
                <option value="">Select Employee to Assign...</option>
                {users.map((u) => (
                  <option key={u.id || u.value || u.userId} value={u.id || u.value || u.userId}>
                    {getDisplayName(u)} {u.employeeCode || u.employee_code ? `(${u.employeeCode || u.employee_code})` : ''}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={assignSubmitting} className="btn btn-primary">
                {assignSubmitting ? 'Assigning...' : 'Assign'}
              </button>
            </form>

            <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Assigned Project Members:</h4>
            {projectMembers.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No members assigned to this project yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {projectMembers.map((mem) => (
                  <div key={mem.id} style={styles.memberItem}>
                    <div>
                      <strong>{mem.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({mem.employeeCode})</span>
                    </div>
                    <button onClick={() => handleRemoveMember(mem.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  filterBar: {
    padding: '12px 20px',
    marginBottom: '24px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  projectCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  memberItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
};
