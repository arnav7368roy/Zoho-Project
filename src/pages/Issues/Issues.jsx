import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import {
  AlertCircle,
  Plus,
  Search,
  ChevronDown,
  X,
  Clock,
  User,
  CheckCircle2,
  Bug,
  ChevronRight,
  Sparkles,
  Edit,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ListOrdered,
  List as ListIcon,
  Code,
  Image as ImageIcon,
  Maximize2,
  Paperclip,
  Filter,
  Columns,
  Table as TableIcon,
  MessageSquare,
  History,
  FileText,
  Layers,
} from 'lucide-react';
import FilterPanel from '../../components/FilterPanel';
import { useAuth } from '../../context/AuthContext';

export default function Issues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'detail'
  const [activeTab, setActiveTab] = useState('Comments');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form state (Matching Screenshots 1 & 2)
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderOptions, setReminderOptions] = useState('None');
  const [addFollowers, setAddFollowers] = useState('');
  const [associatedTeam, setAssociatedTeam] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeList, setAssigneeList] = useState('');
  const [tags, setTags] = useState('');
  const [effortHours, setEffortHours] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ticketType, setTicketType] = useState('Bug');
  const [severity, setSeverity] = useState('Critical');
  const [releaseMilestone, setReleaseMilestone] = useState('None');
  const [affectedMilestone, setAffectedMilestone] = useState('None');
  const [moduleName, setModuleName] = useState('None');
  const [classification, setClassification] = useState('None');
  const [reproducible, setReproducible] = useState('Always');
  const [flag, setFlag] = useState('Internal');
  const [issueStatus, setIssueStatus] = useState('OPEN');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Issue state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const openEditIssue = (issue) => {
    setEditingIssue(issue);
    setProjectId(issue.projectId || (projects[0]?.id || ''));
    setTitle(issue.title || '');
    setDescription(issue.description || '');
    setAssigneeId(issue.assigneeId || '');
    setPriority(issue.priority || 'HIGH');
    setSeverity(issue.severity || 'CRITICAL');
    setTicketType(issue.ticketType || 'Bug');
    setIssueStatus(issue.status || 'OPEN');
    setDueDate(issue.dueDate || '');
    setEffortHours(issue.effortHours || '');
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateIssue = async (e) => {
    if (e) e.preventDefault();
    if (!editingIssue) return;
    setFormError('');
    setSubmitting(true);

    const payload = {
      title,
      description,
      assigneeId: assigneeId || null,
      priority,
      severity,
      ticketType,
      status: issueStatus,
      dueDate: dueDate || null,
      effortHours: effortHours || null,
    };

    const res = await apiRequest(`/api/v1/issues/${editingIssue.id}`, 'PUT', payload);
    setSubmitting(false);

    if (res.ok && res.data?.status) {
      setShowEditModal(false);
      setEditingIssue(null);
      fetchInitialData();
    } else {
      setFormError(res.data?.message || 'Failed to update issue.');
    }
  };

  const issueCategories = [
    'Issue Name',
    'Reporter',
    'Created Time',
    'Associated Team',
    'Assignee',
    'Assignee list',
    'Tags',
    'Last Closed Time',
    'Effort (hours)',
    'Last Modified Time',
    'Due Date',
    'Status',
    'Ticket Type',
    'Severity',
    'Release Milestone',
    'Affected Milestone',
    'Module',
    'Classification',
    'Reproducible',
    'Flag',
    'Escalation Level',
  ];

  const statusOptions = [
    { label: 'Open', value: 'OPEN', color: '#3b82f6' },
    { label: 'In progress', value: 'IN_PROGRESS', color: '#eab308' },
    { label: 'Dev Complete', value: 'DEV_COMPLETE', color: '#64748b' },
    { label: 'PR Merged', value: 'PR_MERGED', color: '#d97706' },
    { label: 'To be tested', value: 'TO_BE_TESTED', color: '#06b6d4' },
    { label: 'Closed', value: 'CLOSED', color: '#10b981' },
    { label: 'Blocked', value: 'BLOCKED', color: '#ef4444' },
    { label: 'On Hold', value: 'ON_HOLD', color: '#475569' },
  ];

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const [issueRes, projRes, userRes] = await Promise.all([
        apiRequest('/api/v1/issues'),
        apiRequest('/api/v1/projects'),
        apiRequest('/api/v1/users/dropdown'),
      ]);

      if (issueRes.ok && issueRes.data?.data) {
        setIssues(issueRes.data.data);
        if (issueRes.data.data.length > 0 && !selectedIssue) {
          setSelectedIssue(issueRes.data.data[0]);
        }
      }
      if (projRes.ok && projRes.data?.data) {
        setProjects(projRes.data.data);
        if (projRes.data.data.length > 0 && !projectId) {
          setProjectId(projRes.data.data[0].id);
        }
      }
      if (userRes.ok && userRes.data?.data) setUsers(userRes.data.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreateIssue = async (e, addMore = false) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!projectId) {
      setFormError('Please select a project.');
      return;
    }
    if (!title) {
      setFormError('Issue Title is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      projectId,
      title,
      description,
      assigneeId: assigneeId || null,
      severity,
      ticketType,
      dueDate: dueDate || null,
      effortHours: effortHours || null,
    };

    const res = await apiRequest('/api/v1/issues', 'POST', payload);
    setSubmitting(false);

    if (res.ok) {
      setTitle('');
      setDescription('');
      if (!addMore) setShowDrawer(false);
      fetchIssues();
    } else {
      setFormError('Failed to create issue.');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedIssue) return;
    setShowStatusDropdown(false);

    const payload = { status: newStatus };
    const res = await apiRequest(`/api/v1/issues/${selectedIssue.id}/status`, 'PUT', payload);

    if (res.ok) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
      fetchIssues();
    }
  };

  const currentStatusObj =
    statusOptions.find((s) => s.value === selectedIssue?.status) || statusOptions[0];

  const [appliedFilters, setAppliedFilters] = useState({});
  const [filterLogic, setFilterLogic] = useState('all');

  // Compute filtered issues based on statusFilter and appliedFilters
  const filteredIssues = issues.filter((iss) => {
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    if (!matchesStatus) return false;

    const filterEntries = Object.entries(appliedFilters);
    if (filterEntries.length === 0) return true;

    const matchesFilterEntry = ([cat, selectedVals]) => {
      if (!selectedVals || selectedVals.length === 0) return true;

      if (cat === 'Status') {
        const statusMap = {
          'Open': 'OPEN',
          'In Progress': 'IN_PROGRESS',
          'Dev Complete': 'DEV_COMPLETE',
          'PR Merged': 'PR_MERGED',
          'To be tested': 'TO_BE_TESTED',
          'Closed': 'CLOSED',
          'Blocked': 'BLOCKED',
          'On Hold': 'ON_HOLD',
        };
        const mappedVals = selectedVals.map((v) => statusMap[v] || v);
        return mappedVals.includes(iss.status);
      }
      if (cat === 'Severity') {
        return selectedVals.some((sev) => iss.severity?.toLowerCase() === sev.toLowerCase());
      }
      if (cat === 'Ticket Type') {
        return selectedVals.some((tt) => iss.ticketType?.toLowerCase() === tt.toLowerCase());
      }
      if (cat === 'Assignee' || cat === 'Reporter' || cat === 'Owner / Assignee') {
        return selectedVals.some((name) =>
          iss.assigneeName?.toLowerCase().includes(name.toLowerCase()) ||
          iss.reporterName?.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (cat === 'Project') {
        return selectedVals.some((pName) =>
          iss.projectName?.toLowerCase().includes(pName.toLowerCase())
        );
      }
      if (cat === 'Issue Name' || cat === 'Task / Issue Name') {
        const query = selectedVals[0]?.toLowerCase() || '';
        return iss.title?.toLowerCase().includes(query) || iss.issueCode?.toLowerCase().includes(query);
      }
      if (cat === 'Tags') {
        const query = selectedVals[0]?.toLowerCase() || '';
        return iss.projectName?.toLowerCase().includes(query);
      }
      return true;
    };

    if (filterLogic === 'any') {
      return filterEntries.some(matchesFilterEntry);
    } else {
      return filterEntries.every(matchesFilterEntry);
    }
  });

  const totalActiveFilters = Object.keys(appliedFilters).length;

  return (
    <div style={styles.container}>
      {/* Top Action Header Toolbar */}
      <div style={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            style={styles.selectFilter}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Issues</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DEV_COMPLETE">Dev Complete</option>
            <option value="CLOSED">Closed</option>
            <option value="BLOCKED">Blocked</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Toggle */}
          <div style={styles.viewToggleGroup}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'table' ? styles.activeViewBtn : {}),
              }}
              title="Table View"
            >
              <TableIcon size={14} /> <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('detail')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'detail' ? styles.activeViewBtn : {}),
              }}
              title="Detail View"
            >
              <Columns size={14} /> <span>Detail</span>
            </button>
          </div>

          <button onClick={() => setShowDrawer(true)} style={styles.createBtn}>
            <Plus size={16} /> <span>Add Issue</span>
          </button>

          {/* Filter Funnel Icon Button (Matching Image 2 & 3) */}
          <button
            onClick={() => setShowFilterPanel(true)}
            style={{
              ...styles.filterBtn,
              ...(totalActiveFilters > 0 ? { borderColor: '#3b82f6', color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}),
            }}
            title="Open Filter Drawer"
          >
            <Filter size={15} color="#2563eb" /> {totalActiveFilters > 0 && <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>({totalActiveFilters})</span>}
          </button>
        </div>
      </div>

      {/* Active Filter Bar (Zoho Projects Style) */}
      {totalActiveFilters > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 24px',
          backgroundColor: '#090d16',
          borderBottom: '1px solid #1e293b',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Active Filters:</span>
          {Object.entries(appliedFilters).map(([cat, vals]) => (
            <span
              key={cat}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                backgroundColor: '#1e293b',
                color: '#60a5fa',
                borderRadius: '16px',
                fontSize: '0.78rem',
                border: '1px solid #334155',
              }}
            >
              <strong>{cat}:</strong> {vals.join(', ')}
              <X
                size={12}
                style={{ cursor: 'pointer', marginLeft: '4px' }}
                onClick={() => {
                  setAppliedFilters((prev) => {
                    const copy = { ...prev };
                    delete copy[cat];
                    return copy;
                  });
                }}
              />
            </span>
          ))}
          <button
            onClick={() => setAppliedFilters({})}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginLeft: 'auto',
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Filter Panel Drawer */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        customCategories={issueCategories}
        users={users}
        projects={projects}
        initialFilters={appliedFilters}
        initialLogic={filterLogic}
        onApplyFilter={({ filters, logic }) => {
          setAppliedFilters(filters);
          setFilterLogic(logic);
        }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading issues directory...
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Matching Image 2) */
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '35px' }}>
                  <input type="checkbox" />
                </th>
                <th style={{ width: '100px' }}>ID</th>
                <th>Issue Name</th>
                <th style={{ width: '150px' }}>Reporter</th>
                <th style={{ width: '140px' }}>Created Time</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '120px' }}>Tags</th>
                <th style={{ width: '140px' }}>Associated Team</th>
                <th style={{ width: '140px' }}>Assignee</th>
                <th style={{ width: '100px' }}>Due Date</th>
                <th style={{ width: '90px' }}>Severity</th>
                <th style={{ width: '70px' }}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {issues.length === 0 ? 'No issues logged in this project.' : `No ${statusFilter === 'ALL' ? '' : statusFilter.replace('_', ' ').toLowerCase() + ' '}issues found.`}
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss, idx) => {
                  const sObj = statusOptions.find((s) => s.value === iss.status) || statusOptions[0];
                  const code = iss.issueCode || `SD2-I${1163 - idx}`;
                  return (
                    <tr
                      key={iss.id}
                      onClick={() => {
                        setSelectedIssue(iss);
                        setViewMode('detail');
                      }}
                      style={styles.tableRow}
                    >
                      <td>
                        <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td style={{ fontWeight: '700', color: '#60a5fa' }}>{code}</td>
                      <td style={{ fontWeight: '600', color: '#ffffff' }}>{iss.title}</td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                        {iss.reporterName || 'Unassigned'}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {iss.createdAt ? new Date(iss.createdAt).toLocaleString() : '-'}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: sObj.color,
                            color: '#ffffff',
                            display: 'inline-block',
                            textAlign: 'center',
                            width: '95px',
                          }}
                        >
                          {sObj.label}
                        </span>
                      </td>
                      <td>
                        <span style={styles.tagPill}>{iss.projectName || 'Project'}</span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Not Associated</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>
                          👤 {iss.assigneeName || 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{iss.dueDate || '-'}</td>
                      <td>
                        <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.8rem' }}>
                          {iss.severity || 'Critical'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditIssue(iss);
                          }}
                          style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}
                          title="Edit Issue"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* DETAIL SPLIT VIEW (Matching Image 1) */
        <div style={styles.mainLayout}>
          {/* Left Issues Directory List */}
          <div style={styles.leftList}>
            <div style={styles.listHeader}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search issues..."
                style={styles.listSearchInput}
              />
            </div>

            <div style={styles.issueItemsContainer}>
              {filteredIssues.map((iss) => {
                const isSelected = selectedIssue?.id === iss.id;
                const sObj = statusOptions.find((s) => s.value === iss.status) || statusOptions[0];

                return (
                  <div
                    key={iss.id}
                    onClick={() => setSelectedIssue(iss)}
                    style={{
                      ...styles.issueCardItem,
                      ...(isSelected ? styles.selectedCardItem : {}),
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa' }}>
                        {iss.issueCode || 'SD2-I1163'}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          backgroundColor: `${sObj.color}22`,
                          color: sObj.color,
                        }}
                      >
                        {sObj.label}
                      </span>
                    </div>

                    <div style={styles.issueCardTitle}>{iss.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      {iss.assigneeName || 'Unassigned'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Pane (Matching Image 1) */}
          {selectedIssue ? (
            <div style={styles.rightDetailPane}>
              {/* Header Box */}
              <div style={styles.detailHeaderBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b' }}>
                      {selectedIssue.issueCode || 'SD2-I1163'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      By {selectedIssue.reporterName || 'Unassigned'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                      📁 {selectedIssue.projectName || 'Project'}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditIssue(selectedIssue)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Edit size={14} /> Edit Issue
                  </button>
                </div>

                <h1 style={styles.detailTitle}>{selectedIssue.title}</h1>

                {/* Status Dropdown Selector Popup (Exact match to Screenshot 2) */}
                <div style={{ position: 'relative', marginTop: '16px', width: 'fit-content' }}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    style={{
                      ...styles.statusDropdownBtn,
                      borderColor: currentStatusObj.color,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: currentStatusObj.color,
                      }}
                    ></span>
                    <span>{currentStatusObj.label}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {showStatusDropdown && (
                    <div style={styles.statusMenuPopup}>
                      <div style={styles.popupSearchBox}>
                        <Search size={14} color="#94a3b8" />
                        <input
                          type="text"
                          placeholder="Search status..."
                          style={styles.popupInput}
                        />
                      </div>
                      {statusOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => handleUpdateStatus(opt.value)}
                          style={styles.statusOptionRow}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: opt.color,
                            }}
                          ></span>
                          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                            {opt.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div style={styles.descriptionSection}>
                <h4 style={styles.sectionHeading}>Description / Details:</h4>
                <p style={styles.descText}>
                  {selectedIssue.description || 'No detailed description provided for this issue.'}
                </p>
              </div>

              {/* Issue Information Grid */}
              <div style={styles.infoGridContainer}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                  ▾ Issue Information
                </h3>

                <div style={styles.gridTwoCols}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Associated Team</span>
                    <span style={styles.infoVal}>Not Associated</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Assignee</span>
                    <span style={styles.infoVal}>
                      👤 {selectedIssue.assigneeName || 'Unassigned'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Assignee List</span>
                    <span style={styles.infoVal}>-</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Effort (hours)</span>
                    <span style={styles.infoVal}>{selectedIssue.effortHours || '0.00'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Due Date</span>
                    <span style={styles.infoVal}>{selectedIssue.dueDate || 'None'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Ticket Type</span>
                    <span style={styles.infoVal}>{selectedIssue.ticketType || 'Bug'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Severity</span>
                    <span style={{ ...styles.infoVal, color: '#ef4444', fontWeight: '700' }}>
                      {selectedIssue.severity || 'Critical'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={{ ...styles.infoVal, color: currentStatusObj.color, fontWeight: '700' }}>
                      ● {currentStatusObj.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Tabs Section (Matching Image 1) */}
              <div style={styles.bottomTabsBar}>
                {[
                  'Comments',
                  'Attachments',
                  'Log Hours',
                  'Link Issue',
                  'Resolution',
                  'Tasks',
                  'Status Timeline',
                  'Activity Stream',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...styles.tabItem,
                      ...(activeTab === tab ? styles.activeTabItem : {}),
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Comment Input Box */}
              <div style={styles.commentEditorBox}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={styles.userAvatarSmall}>A</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.wysiwygBox}>
                      <div style={styles.toolbarRow}>
                        <Bold size={13} style={styles.toolIcon} />
                        <Italic size={13} style={styles.toolIcon} />
                        <Underline size={13} style={styles.toolIcon} />
                        <Strikethrough size={13} style={styles.toolIcon} />
                        <span style={styles.toolDivider}>|</span>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>Puvi ▾</span>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>13 ▾</span>
                        <span style={styles.toolDivider}>|</span>
                        <ListIcon size={13} style={styles.toolIcon} />
                        <ListOrdered size={13} style={styles.toolIcon} />
                        <Code size={13} style={styles.toolIcon} />
                        <ImageIcon size={13} style={styles.toolIcon} />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="To add Issue Comment via email..."
                        style={styles.wysiwygTextarea}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, padding: '40px', color: '#94a3b8', textAlign: 'center' }}>
              Select an issue from the left list to view complete details.
            </div>
          )}
        </div>
      )}

      {/* NEW ISSUE SLIDE-OVER DRAWER */}
      {showDrawer && (
        <div style={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  New Issue
                </h3>
                <span style={styles.standardLayoutBadge}>Standard Layout</span>
              </div>
              <button onClick={() => setShowDrawer(false)} style={styles.closeIconBtn}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ margin: '16px 24px 0 24px', padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <div style={styles.drawerBody}>
              {/* Project & Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={styles.drawerInput}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Issue Title*</label>
                <input
                  type="text"
                  required
                  placeholder="Enter issue title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              {/* Rich Text Toolbar */}
              <div style={{ marginBottom: '20px' }}>
                <label style={styles.drawerLabel}>Description</label>
                <div style={styles.wysiwygBox}>
                  <div style={styles.toolbarRow}>
                    <Bold size={14} style={styles.toolIcon} />
                    <Italic size={14} style={styles.toolIcon} />
                    <Underline size={14} style={styles.toolIcon} />
                    <Strikethrough size={14} style={styles.toolIcon} />
                    <span style={styles.toolDivider}>|</span>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>Puvi ▾</span>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>13 ▾</span>
                    <span style={styles.toolDivider}>|</span>
                    <ListIcon size={14} style={styles.toolIcon} />
                    <ListOrdered size={14} style={styles.toolIcon} />
                    <Code size={14} style={styles.toolIcon} />
                    <ImageIcon size={14} style={styles.toolIcon} />
                    <Maximize2 size={14} style={styles.toolIcon} />
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Enter issue description, actual result, steps..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.wysiwygTextarea}
                  />
                </div>
              </div>

              <div style={styles.dropZone}>
                <Paperclip size={16} color="#94a3b8" />
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Drop files or add attachments here...
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>
                  Maximum 30 files
                </span>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Reminder options ℹ</label>
                  <select
                    value={reminderOptions}
                    onChange={(e) => setReminderOptions(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Daily">Daily</option>
                    <option value="On Due Date">On Due Date</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Add Followers</label>
                  <input
                    type="text"
                    placeholder="Select"
                    value={addFollowers}
                    onChange={(e) => setAddFollowers(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
              </div>

              <div style={styles.sectionHeader}>
                <span>▾ Issue Information</span>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Associated Team</label>
                  <select
                    value={associatedTeam}
                    onChange={(e) => setAssociatedTeam(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="">Select</option>
                    <option value="Backend Core">Backend Core</option>
                    <option value="QA Team">QA Team</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Assignee ℹ</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="">Select</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Assignee list</label>
                <input
                  type="text"
                  placeholder="Select"
                  value={assigneeList}
                  onChange={(e) => setAssigneeList(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Tags</label>
                <input
                  type="text"
                  placeholder="Enter a tag name"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Effort (hours)</label>
                  <input
                    type="text"
                    placeholder=".00"
                    value={effortHours}
                    onChange={(e) => setEffortHours(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Ticket Type*</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="Bug">Bug</option>
                    <option value="Task">Task</option>
                    <option value="Feature">Feature</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                    <option value="Blocker">Blocker</option>
                  </select>
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Release Milestone</label>
                  <select
                    value={releaseMilestone}
                    onChange={(e) => setReleaseMilestone(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Release 2.0">Release 2.0</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Affected Milestone</label>
                  <select
                    value={affectedMilestone}
                    onChange={(e) => setAffectedMilestone(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Sprint 1">Sprint 1</option>
                  </select>
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Module</label>
                  <select
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Project Core">Project Core</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Classification</label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Security">Security</option>
                    <option value="UI Bug">UI Bug</option>
                  </select>
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Reproducible</label>
                  <select
                    value={reproducible}
                    onChange={(e) => setReproducible(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="None">None</option>
                    <option value="Always">Always</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Flag</label>
                  <select
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.drawerFooter}>
              <button
                onClick={(e) => handleCreateIssue(e, false)}
                disabled={submitting}
                style={styles.drawerBlueBtn}
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={(e) => handleCreateIssue(e, true)}
                disabled={submitting}
                style={styles.drawerWhiteBtn}
              >
                Add More
              </button>
              <button onClick={() => setShowDrawer(false)} style={styles.drawerCancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ISSUE SLIDE-OVER DRAWER */}
      {showEditModal && editingIssue && (
        <div style={styles.drawerOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Edit Issue ({editingIssue.issueCode})
                </h3>
              </div>
              <button onClick={() => setShowEditModal(false)} style={styles.closeIconBtn}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px', margin: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateIssue} style={styles.drawerBody}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Issue Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  style={styles.drawerInput}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.drawerLabel}>Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>

                <div>
                  <label style={styles.drawerLabel}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.drawerLabel}>Status</label>
                  <select
                    value={issueStatus}
                    onChange={(e) => setIssueStatus(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DEV_COMPLETE">Dev Complete</option>
                    <option value="QA_IN_PROGRESS">QA In Progress</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label style={styles.drawerLabel}>Ticket Type</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Task">Task</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.drawerLabel}>Effort (hours)</label>
                  <input
                    type="text"
                    value={effortHours}
                    onChange={(e) => setEffortHours(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
                <div>
                  <label style={styles.drawerLabel}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.drawerLabel}>Description / Details</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...styles.drawerInput, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={styles.drawerCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.drawerBlueBtn}
                >
                  {submitting ? 'Saving...' : 'Save Issue Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  selectFilter: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    outline: 'none',
  },
  createBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  filterBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '2px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  viewBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  activeViewBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    fontWeight: '700',
  },
  tableContainer: {
    backgroundColor: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.84rem',
    textAlign: 'left',
    color: '#cbd5e1',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
  },
  tagPill: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    color: '#fbbf24',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  mainLayout: {
    display: 'flex',
    gap: '16px',
    minHeight: '650px',
  },
  leftList: {
    width: '280px',
    backgroundColor: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  listHeader: {
    padding: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listSearchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.82rem',
    outline: 'none',
    width: '100%',
  },
  issueItemsContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  issueCardItem: {
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
  },
  selectedIssueCardItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderLeft: '3px solid #3b82f6',
  },
  issueCardTitle: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  rightDetailPane: {
    flex: 1,
    backgroundColor: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  detailHeaderBox: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#090d16',
  },
  detailTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: '1.4',
    margin: 0,
  },
  statusDropdownBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  statusMenuPopup: {
    position: 'absolute',
    top: '40px',
    left: 0,
    width: '220px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
    zIndex: 100,
    padding: '8px 0',
  },
  popupSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderBottom: '1px solid #f1f5f9',
  },
  popupInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.8rem',
    width: '100%',
  },
  statusOptionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  descriptionSection: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  sectionHeading: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#334155',
    marginTop: '12px',
    marginBottom: '4px',
  },
  descText: {
    fontSize: '0.88rem',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5',
  },
  infoGridContainer: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  gridTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.85rem',
  },
  infoLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  infoVal: {
    color: '#0f172a',
    fontWeight: '600',
  },

  /* Bottom Tabs Section */
  bottomTabsBar: {
    display: 'flex',
    gap: '16px',
    padding: '12px 24px 0 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  tabItem: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.82rem',
    fontWeight: '600',
    paddingBottom: '10px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  activeTabItem: {
    color: '#2563eb',
    fontWeight: '700',
    borderBottom: '2px solid #2563eb',
  },
  commentEditorBox: {
    padding: '16px 24px',
    backgroundColor: '#ffffff',
  },
  userAvatarSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#06b6d4',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Drawer Overlay & Layout */
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '640px',
    height: '100vh',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 25px rgba(0,0,0,0.2)',
  },
  drawerHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  standardLayoutBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  closeIconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
  },
  drawerBody: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  drawerLabel: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
    display: 'block',
  },
  drawerInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '0.85rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  wysiwygBox: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  toolIcon: {
    color: '#64748b',
    cursor: 'pointer',
  },
  toolDivider: {
    color: '#cbd5e1',
  },
  wysiwygTextarea: {
    width: '100%',
    padding: '12px',
    border: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    color: '#0f172a',
    resize: 'vertical',
  },
  dropZone: {
    border: '1px dashed #cbd5e1',
    borderRadius: '6px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  sectionHeader: {
    fontSize: '0.88rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '16px 0',
  },
  drawerFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    gap: '10px',
  },
  drawerBlueBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  drawerWhiteBtn: {
    backgroundColor: '#ffffff',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  drawerCancelBtn: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
