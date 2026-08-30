import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';
import {
  CheckSquare,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  List,
  Kanban,
  Filter,
  Tag,
  Link,
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
  Columns,
} from 'lucide-react';
import FilterPanel from '../../components/FilterPanel';
import ManualLogHoursModal from '../../components/ManualLogHoursModal';
import { useAuth } from '../../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', or 'detail'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('Comments');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [taskLogs, setTaskLogs] = useState([
    {
      id: 'log-1',
      date: '2026-08-29',
      userName: 'Arnav Roy',
      hours: '2.5',
      description: 'Refactored backend task status controller and optimized SQL queries.',
      billable: true,
    },
    {
      id: 'log-2',
      date: '2026-08-30',
      userName: 'Laddu Kumar',
      hours: '4.0',
      description: 'Implemented UI Glassmorphism dark mode theme and responsive drawer.',
      billable: true,
    },
  ]);

  // Live Timer State (Seconds count up for active tasks)
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);
  const [runningTaskId, setRunningTaskId] = useState(null);

  // Stop Timer Modal State
  const [stoppingTask, setStoppingTask] = useState(null);
  const [stopReason, setStopReason] = useState('');
  const [pausingTask, setPausingTask] = useState(null);
  const [pauseReason, setPauseReason] = useState('');
  const [timerSubmitting, setTimerSubmitting] = useState(false);

  // New Task Form State
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskList, setTaskList] = useState('csv Imported TaskList - 1');
  const [assignedTo, setAssignedTo] = useState('');
  const [developerId, setDeveloperId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [plannedEffort, setPlannedEffort] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [storyPoint, setStoryPoint] = useState('');
  const [sprint, setSprint] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [tags, setTags] = useState('');
  const [reminder, setReminder] = useState('None');
  const [recurrence, setRecurrence] = useState('None');
  const [billingType, setBillingType] = useState('None');
  const [workHours, setWorkHours] = useState('0:00');
  const [associatedTeam, setAssociatedTeam] = useState('');
  const [taskStatus, setTaskStatus] = useState('TO_DO');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  const openEditTask = (task) => {
    setEditingTask(task);
    setProjectId(task.projectId || (projects[0]?.id || ''));
    setTitle(task.title || '');
    setDescription(task.description || '');
    setAssignedTo(task.assignedTo || '');
    setPriority(task.priority || 'MEDIUM');
    setStartDate(task.startDate || '');
    setDueDate(task.dueDate || '');
    setTaskStatus(task.status || 'TO_DO');
    setFormError('');
    setShowEditDrawer(true);
  };

  const statusOptions = [
    { value: 'TO_DO', label: 'Open', color: '#3b82f6' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#eab308' },
    { value: 'DEV_COMPLETE', label: 'Dev Complete', color: '#a855f7' },
    { value: 'IN_REVIEW', label: 'In Review', color: '#06b6d4' },
    { value: 'COMPLETED', label: 'Completed', color: '#22c55e' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444' },
  ];

  const handleUpdateTaskStatusDirect = async (newStatus) => {
    if (!selectedTask) return;
    setShowStatusDropdown(false);
    setSelectedTask({ ...selectedTask, status: newStatus });
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: newStatus } : t))
    );

    try {
      await apiRequest(`/api/v1/tasks/${selectedTask.id}`, 'PUT', { status: newStatus });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleUpdateTask = async (e) => {
    if (e) e.preventDefault();
    if (!editingTask) return;
    setFormError('');
    setSubmitting(true);

    const payload = {
      projectId,
      title,
      description,
      assignedTo: assignedTo || null,
      priority,
      status: taskStatus,
      startDate: startDate || null,
      dueDate: dueDate || null,
    };

    const res = await apiRequest(`/api/v1/tasks/${editingTask.id}`, 'PUT', payload);
    setSubmitting(false);

    if (res.ok && res.data?.status) {
      setShowEditDrawer(false);
      setEditingTask(null);
      fetchInitialData();
    } else {
      setFormError(res.data?.message || 'Failed to update task.');
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [taskRes, projRes, userRes] = await Promise.all([
        apiRequest('/api/v1/tasks'),
        apiRequest('/api/v1/projects'),
        apiRequest('/api/v1/users/dropdown'),
      ]);

      if (taskRes.ok && taskRes.data?.data) {
        const fetchedTasks = taskRes.data.data;
        setTasks(fetchedTasks);

        // Check if any task is currently running
        const running = fetchedTasks.find((t) => t.timerStatus === 'RUNNING');
        if (running) {
          setRunningTaskId(running.id);
        } else {
          setRunningTaskId(null);
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
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    }
  }, [tasks, selectedTask]);

  // Interval for Live Timer Ticking
  useEffect(() => {
    let interval = null;
    if (runningTaskId) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setActiveTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runningTaskId]);

  const formatSeconds = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateTask = async (e, addMore = false) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!projectId) {
      setFormError('Please select a project.');
      return;
    }
    if (!title) {
      setFormError('Task Name is required.');
      return;
    }

    setSubmitting(true);

    const payload = {
      projectId,
      title,
      description,
      taskList,
      assignedTo: assignedTo || null,
      developerId: developerId || null,
      reviewerId: reviewerId || null,
      priority,
      plannedEffort: plannedEffort || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      storyPoint: storyPoint || null,
      sprint: sprint || null,
      tags: tags || null,
    };

    const res = await apiRequest('/api/v1/tasks', 'POST', payload);
    setSubmitting(false);

    if (res.ok && res.data?.status) {
      setTitle('');
      setDescription('');
      if (!addMore) setShowDrawer(false);
      fetchInitialData();
    } else {
      setFormError(res.data?.message || 'Failed to create task.');
    }
  };

  // Timer Actions (Start, Pause, Resume, Stop)
  const handleTimerAction = async (task, action) => {
    if (action === 'STOP') {
      setStoppingTask(task);
      setStopReason('');
      return;
    }

    if (action === 'PAUSE') {
      setPausingTask(task);
      setPauseReason('');
      return;
    }

    if (action === 'START' || action === 'RESUME') {
      setRunningTaskId(task.id);
    }

    await apiRequest(`/api/v1/tasks/${task.id}/timer`, 'PUT', { action });
    fetchInitialData();
  };

  const handleConfirmPauseTimer = async () => {
    if (!pausingTask) return;
    setTimerSubmitting(true);

    const res = await apiRequest(`/api/v1/tasks/${pausingTask.id}/timer`, 'PUT', {
      action: 'PAUSE',
      stopReason: pauseReason || 'Timer paused for context switch / break',
    });

    setTimerSubmitting(false);
    if (res.ok) {
      setRunningTaskId(null);
      setPausingTask(null);
      setPauseReason('');
      fetchInitialData();
    }
  };

  const handleConfirmStopTimer = async () => {
    if (!stoppingTask) return;
    setTimerSubmitting(true);

    const res = await apiRequest(`/api/v1/tasks/${stoppingTask.id}/timer`, 'PUT', {
      action: 'STOP',
      stopReason: stopReason || 'Task work log completed',
    });

    setTimerSubmitting(false);
    if (res.ok) {
      setRunningTaskId(null);
      setStoppingTask(null);
      setStopReason('');
      fetchInitialData();
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    await apiRequest(`/api/v1/tasks/${taskId}`, 'PUT', { status: newStatus });
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
    fetchInitialData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: '#0284c7', color: '#ffffff' };
      case 'DEV_COMPLETE':
      case 'COMPLETED':
        return { label: 'Dev Complete', bg: '#d97706', color: '#ffffff' };
      case 'READY_FOR_QA':
      case 'IN_REVIEW':
        return { label: 'Ready for QA', bg: '#0d9488', color: '#ffffff' };
      default:
        return { label: 'Open', bg: '#16a34a', color: '#ffffff' };
    }
  };

  const [appliedFilters, setAppliedFilters] = useState({});
  const [filterLogic, setFilterLogic] = useState('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    if (!matchesSearch || !matchesStatus) return false;

    const filterEntries = Object.entries(appliedFilters);
    if (filterEntries.length === 0) return true;

    const matchesFilterEntry = ([cat, selectedVals]) => {
      if (!selectedVals || selectedVals.length === 0) return true;

      if (cat === 'Status') {
        const statusMap = {
          'Open': 'TO_DO',
          'In Progress': 'IN_PROGRESS',
          'Dev Complete': 'DEV_COMPLETE',
          'Ready for QA': 'READY_FOR_QA',
          'Closed': 'COMPLETED',
        };
        const mappedVals = selectedVals.map((v) => statusMap[v] || v);
        return mappedVals.includes(t.status);
      }
      if (cat === 'Priority') {
        return selectedVals.includes(t.priority);
      }
      if (cat === 'Owner' || cat === 'Assignee' || cat === 'Owner / Assignee') {
        return selectedVals.some((name) =>
          t.assignedToName?.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (cat === 'Project') {
        return selectedVals.some((pName) =>
          t.projectName?.toLowerCase().includes(pName.toLowerCase())
        );
      }
      if (cat === 'Task / Issue Name' || cat === 'Task Name') {
        const query = selectedVals[0]?.toLowerCase() || '';
        return t.title?.toLowerCase().includes(query) || t.taskCode?.toLowerCase().includes(query);
      }
      if (cat === 'Tags') {
        const query = selectedVals[0]?.toLowerCase() || '';
        return t.tags?.toLowerCase().includes(query);
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
    <div>
      {/* Top Toolbar Bar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="ALL">All Open ▾</option>
            <option value="TO_DO">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DEV_COMPLETE">Dev Complete</option>
            <option value="READY_FOR_QA">Ready for QA</option>
          </select>

          <span style={styles.groupByText}>Group By: Task List ▾</span>

          {/* Active Live Ticking Timer Display */}
          {runningTaskId && (
            <div style={styles.runningTimerPill}>
              <Clock size={14} className="animate-spin" />
              <span>Running: <strong>{formatSeconds(activeTimerSeconds)}</strong></span>
            </div>
          )}
        </div>

        <div style={styles.toolbarRight}>
          <button
            onClick={() => setShowFilterPanel(true)}
            style={{
              ...styles.filterBtn,
              ...(totalActiveFilters > 0 ? { borderColor: '#3b82f6', color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}),
            }}
            title="Open Filter Drawer"
          >
            <Filter size={14} /> <span>Filter {totalActiveFilters > 0 && `(${totalActiveFilters})`}</span>
          </button>

          {/* View Toggle */}
          <div style={styles.viewToggleGroup}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'list' ? styles.activeViewBtn : {}),
              }}
            >
              <List size={14} /> <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'kanban' ? styles.activeViewBtn : {}),
              }}
            >
              <Kanban size={14} /> <span>Kanban</span>
            </button>
          </div>

          <button onClick={() => setShowDrawer(true)} style={styles.addTaskBlueBtn}>
            <Plus size={16} /> <span>Add Task</span>
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

      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
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
          Loading tasks...
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div style={styles.listContainer}>
          <div style={styles.groupHeader}>
            <ChevronDown size={16} color="#94a3b8" />
            <span style={{ fontWeight: '700', color: '#f8fafc' }}>
              ≡ Task Directory ({filteredTasks.length})
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{ width: '130px' }}>Timer & Action</th>
                  <th style={{ width: '110px' }}>ID</th>
                  <th>Task Name</th>
                  <th style={{ width: '150px' }}>Project Name</th>
                  <th style={{ width: '160px' }}>Owner</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '130px' }}>Tags</th>
                  <th style={{ width: '100px' }}>Start Date</th>
                  <th style={{ width: '100px' }}>Due Date</th>
                  <th style={{ width: '70px' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No tasks available in this task list.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t, idx) => {
                    const badge = getStatusBadge(t.status);
                    const taskCode = t.taskCode || `TSK-${idx + 1}`;
                    const isRunning = t.id === runningTaskId || t.timerStatus === 'RUNNING';

                    return (
                      <tr
                        key={t.id || taskCode}
                        onClick={() => {
                          setSelectedTask(t);
                          setViewMode('detail');
                        }}
                        style={{ ...styles.tr, cursor: 'pointer' }}
                      >
                        <td>
                          <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                        </td>

                        {/* Live Timer Control Buttons */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isRunning ? (
                              <button
                                onClick={() => handleTimerAction(t, 'PAUSE')}
                                style={styles.iconBtnYellow}
                                title="Pause Timer"
                              >
                                <Pause size={12} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTimerAction(t, 'START')}
                                style={styles.iconBtnGreen}
                                title="Start / Resume Timer"
                              >
                                <Play size={12} />
                              </button>
                            )}

                            <button
                              onClick={() => handleTimerAction(t, 'STOP')}
                              style={styles.iconBtnRed}
                              title="Stop Timer & Log Description"
                            >
                              <Square size={12} />
                            </button>

                            {isRunning && (
                              <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '700' }}>
                                ⏱ Live
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ fontWeight: '700', color: '#60a5fa' }}>{taskCode}</td>
                        <td style={{ fontWeight: '600', color: '#f8fafc' }}>{t.title}</td>
                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Link size={12} /> {t.projectName || 'Default Project'}
                          </span>
                        </td>
                        <td>
                          <div style={styles.ownerCell}>
                            <div style={styles.avatarCircle}>
                              {t.assignedToName?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#e2e8f0' }}>
                              {t.assignedToName || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={t.status}
                            onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                            style={{
                              ...styles.statusSelectPill,
                              backgroundColor: badge.bg,
                            }}
                          >
                            <option value="TO_DO">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DEV_COMPLETE">Dev Complete</option>
                            <option value="READY_FOR_QA">Ready for QA</option>
                          </select>
                        </td>
                        <td>
                          <span style={styles.tagPill}>
                            <Tag size={10} /> {t.tags || t.projectName || 'Task'}
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{t.startDate || '-'}</td>
                        <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{t.dueDate || '-'}</td>
                        <td>
                          <button
                            onClick={() => openEditTask(t)}
                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}
                            title="Edit Task"
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
        </div>
      ) : (
        /* KANBAN BOARD */
        <div style={styles.kanbanBoard}>
          {['TO_DO', 'IN_PROGRESS', 'DEV_COMPLETE', 'READY_FOR_QA'].map((colId) => {
            const colTasks = filteredTasks.filter((t) => (t.status || 'TO_DO') === colId);
            const colTitles = {
              TO_DO: 'Open',
              IN_PROGRESS: 'In Progress',
              DEV_COMPLETE: 'Dev Complete',
              READY_FOR_QA: 'Ready for QA',
            };
            return (
              <div key={colId} style={styles.kanbanColumn}>
                <div style={styles.kanbanColHeader}>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>{colTitles[colId]}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>
                    ({colTasks.length})
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colTasks.map((task) => (
                    <div key={task.id} style={styles.kanbanCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa' }}>
                          {task.taskCode || 'TSK-1'}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleTimerAction(task, 'START')}
                            style={styles.iconBtnGreen}
                          >
                            <Play size={10} />
                          </button>
                          <button
                            onClick={() => handleTimerAction(task, 'STOP')}
                            style={styles.iconBtnRed}
                          >
                            <Square size={10} />
                          </button>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setSelectedTask(task);
                          setViewMode('detail');
                        }}
                        style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ffffff', margin: '6px 0', cursor: 'pointer' }}
                      >
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Owner: {task.assignedToName || 'Rohit Tiwari'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                 })}
        </div>
      ) : (
        /* DETAIL SPLIT VIEW (Matching Zoho Projects Issue & Task Detail View) */
        <div style={styles.mainLayout}>
          {/* Left Tasks Directory List */}
          <div style={styles.leftList}>
            <div style={styles.listHeader}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.listSearchInput}
              />
            </div>

            <div style={styles.issueItemsContainer}>
              {filteredTasks.map((t, idx) => {
                const isSelected = selectedTask?.id === t.id;
                const badge = getStatusBadge(t.status);
                const taskCode = t.taskCode || `TASK${(idx + 1).toString().padStart(4, '0')}`;

                return (
                  <div
                    key={t.id || taskCode}
                    onClick={() => setSelectedTask(t)}
                    style={{
                      ...styles.issueCardItem,
                      ...(isSelected ? styles.selectedIssueCardItem : {}),
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa' }}>
                        {taskCode}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          backgroundColor: `${badge.bg}`,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div style={styles.issueCardTitle}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      👤 {t.assignedToName || 'Unassigned'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Task Detail Pane */}
          {selectedTask ? (
            <div style={styles.rightDetailPane}>
              {/* Header Box */}
              <div style={styles.detailHeaderBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b' }}>
                      {selectedTask.taskCode || 'TASK0005'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      By {selectedTask.assignedToName || 'System Admin'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                      📁 {selectedTask.projectName || 'Zoho Enterprise System'}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditTask(selectedTask)}
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
                    <Edit size={14} /> Edit Task
                  </button>
                </div>

                <h1 style={styles.detailTitle}>{selectedTask.title}</h1>

                {/* Status Dropdown Selector Popup */}
                <div style={{ position: 'relative', marginTop: '16px', width: 'fit-content' }}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    style={{
                      ...styles.statusDropdownBtn,
                      borderColor: getStatusBadge(selectedTask.status).color,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusBadge(selectedTask.status).color,
                      }}
                    ></span>
                    <span>{getStatusBadge(selectedTask.status).label}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {showStatusDropdown && (
                    <div style={styles.statusMenuPopup}>
                      {statusOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => handleUpdateTaskStatusDirect(opt.value)}
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
                          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>
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
                  {selectedTask.description || 'No detailed description provided for this task.'}
                </p>
              </div>

              {/* Task Information Grid */}
              <div style={styles.infoGridContainer}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f8fafc', marginBottom: '16px' }}>
                  ▾ Task Information
                </h3>

                <div style={styles.gridTwoCols}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Owner / Assignee</span>
                    <span style={styles.infoVal}>
                      👤 {selectedTask.assignedToName || 'Unassigned'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Priority</span>
                    <span style={{ ...styles.infoVal, color: selectedTask.priority === 'HIGH' ? '#ef4444' : '#eab308', fontWeight: '700' }}>
                      {selectedTask.priority || 'MEDIUM'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Planned Effort</span>
                    <span style={styles.infoVal}>{selectedTask.plannedEffort ? `${selectedTask.plannedEffort} hrs` : '8.00 hrs'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Due Date</span>
                    <span style={styles.infoVal}>{selectedTask.dueDate || 'None'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Start Date</span>
                    <span style={styles.infoVal}>{selectedTask.startDate || '-'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Task List</span>
                    <span style={styles.infoVal}>{selectedTask.taskList || 'General TaskList'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Tags</span>
                    <span style={styles.infoVal}>{selectedTask.tags || 'Zoho Upgrade'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={{ ...styles.infoVal, color: getStatusBadge(selectedTask.status).color, fontWeight: '700' }}>
                      ● {getStatusBadge(selectedTask.status).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Tabs Section */}
              <div style={styles.bottomTabsBar}>
                {[
                  'Comments',
                  'Attachments',
                  'Log Hours',
                  'Time Logs',
                  'Subtasks',
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

              {/* TAB CONTENT PANELS */}
              {activeTab === 'Log Hours' ? (
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#090d16' }}>
                  {/* Top action bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                        Logged Work Hours for {selectedTask.taskCode || 'TASK0005'}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Total Effort: {selectedTask.plannedEffort || '6.5'} hours
                      </span>
                    </div>

                    <button
                      onClick={() => setShowLogModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> + Add Log Time
                    </button>
                  </div>

                  {/* Logged items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {taskLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Clock size={16} color="#3b82f6" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>
                              {log.description}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                              Logged by <strong>{log.userName}</strong> on {log.date}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {log.billable && (
                            <span
                              style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                color: '#4ade80',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              Billable
                            </span>
                          )}
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#60a5fa' }}>
                            {log.hours} hrs
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Comment Input Box (Default) */
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
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Puvi ▾</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>13 ▾</span>
                          <span style={styles.toolDivider}>|</span>
                          <ListIcon size={13} style={styles.toolIcon} />
                          <ListOrdered size={13} style={styles.toolIcon} />
                          <Code size={13} style={styles.toolIcon} />
                          <ImageIcon size={13} style={styles.toolIcon} />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="To add Task Comment via email..."
                          style={styles.wysiwygTextarea}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, padding: '40px', color: '#94a3b8', textAlign: 'center' }}>
              Select a task from the left list to view complete details.
            </div>
          )}
        </div>
      )}

      {/* Manual Time Logging Modal for Tasks */}
      <ManualLogHoursModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        prefilledItem={selectedTask}
        users={users}
        onLogSaved={(newLog) => {
          setTaskLogs((prev) => [newLog, ...prev]);
        }}
      />>
      )}

      {/* EDIT TASK DRAWER */}
      {showEditDrawer && editingTask && (
        <div style={styles.drawerOverlay} onClick={() => setShowEditDrawer(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#2563eb' }}>
                  Edit {editingTask.taskCode}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Update Task Details
                </h3>
              </div>
              <button onClick={() => setShowEditDrawer(false)} style={styles.closeIconBtn}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px', margin: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateTask} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Project</label>
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
                <label style={styles.drawerLabel}>Assigned To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
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
                  <label style={styles.drawerLabel}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label style={styles.drawerLabel}>Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="TO_DO">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DEV_COMPLETE">Dev Complete</option>
                    <option value="READY_FOR_QA">Ready for QA</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.drawerLabel}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                <label style={styles.drawerLabel}>Description</label>
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
                  onClick={() => setShowEditDrawer(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.drawerBlueBtn}
                >
                  {submitting ? 'Saving...' : 'Save Task Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAUSE TIMER MODAL */}
      {pausingTask && (
        <div style={styles.modalOverlay}>
          <div style={styles.stopModalContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                ⏸ Pause Timer & Log Reason
              </h3>
              <button onClick={() => setPausingTask(null)} style={styles.closeIconBtn}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: 0 }}>
              Task: <strong>{pausingTask.taskCode} - {pausingTask.title}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.drawerLabel}>Why are you pausing this task? *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Taking lunch break, urgent bug fix, meeting, etc."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                style={styles.drawerInput}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPausingTask(null)} style={styles.drawerCancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleConfirmPauseTimer}
                disabled={timerSubmitting}
                style={{ ...styles.drawerBlueBtn, backgroundColor: '#d97706' }}
              >
                {timerSubmitting ? 'Pausing...' : 'Pause & Save Reason'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOP TIMER MODAL */}
      {stoppingTask && (
        <div style={styles.modalOverlay}>
          <div style={styles.stopModalContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                ⏱ Log Work & Stop Timer
              </h3>
              <button onClick={() => setStoppingTask(null)} style={styles.closeIconBtn}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: 0 }}>
              Task: <strong>{stoppingTask.taskCode} - {stoppingTask.title}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.drawerLabel}>Why are you stopping the timer? / Log Notes *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe work completed during this timer session..."
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                style={styles.drawerInput}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setStoppingTask(null)} style={styles.drawerCancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleConfirmStopTimer}
                disabled={timerSubmitting}
                style={styles.drawerBlueBtn}
              >
                {timerSubmitting ? 'Saving Log...' : 'Stop & Save Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK RIGHT SLIDE-OVER DRAWER */}
      {showDrawer && (
        <div style={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div style={styles.drawerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  New Task
                </h3>
                <span style={styles.softwareBadge}>Software Development 🔒</span>
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
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Task Name*</label>
                <input
                  type="text"
                  required
                  placeholder="Enter task name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.drawerInput}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.drawerLabel}>Add Description ▾</label>
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
                    placeholder="Enter detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.wysiwygTextarea}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={styles.drawerLabel}>Task List</label>
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                    Choose Completed List
                  </span>
                </div>
                <select
                  value={taskList}
                  onChange={(e) => setTaskList(e.target.value)}
                  style={styles.drawerInput}
                >
                  <option value="csv Imported TaskList - 1">csv Imported TaskList - 1</option>
                  <option value="xls Imported TaskList - 1">xls Imported TaskList - 1</option>
                  <option value="Sprint Backlog Tasks">Sprint Backlog Tasks</option>
                </select>
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

              <div style={styles.sectionHeader}>
                <span>▾ Task Information</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Owner</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={styles.drawerInput}
                >
                  <option value="">Select User/Resource</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Developer Name *</label>
                  <select
                    value={developerId}
                    onChange={(e) => setDeveloperId(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>PR Reviewer *</label>
                  <select
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="">Select Users</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Planned Effort (in hours) ℹ</label>
                  <input
                    type="text"
                    placeholder=".00"
                    value={plannedEffort}
                    onChange={(e) => setPlannedEffort(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={styles.drawerLabel}>Due Date</label>
                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                      Enter Duration
                    </span>
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Story Point</label>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={storyPoint}
                    onChange={(e) => setStoryPoint(e.target.value)}
                    style={styles.drawerInput}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.drawerLabel}>Sprint *</label>
                <select
                  value={sprint}
                  onChange={(e) => setSprint(e.target.value)}
                  style={styles.drawerInput}
                >
                  <option value="">Select Sprint</option>
                  <option value="Sprint 1 - Core Foundation">Sprint 1 - Core Foundation</option>
                  <option value="Sprint 2 - User Module">Sprint 2 - User Module</option>
                  <option value="Sprint 3 - Final QA">Sprint 3 - Final QA</option>
                </select>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.drawerLabel}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={styles.drawerInput}
                  >
                    <option value="NONE">None</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
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
              </div>
            </div>

            <div style={styles.drawerFooter}>
              <button
                onClick={(e) => handleCreateTask(e, false)}
                disabled={submitting}
                style={styles.drawerBlueBtn}
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={(e) => handleCreateTask(e, true)}
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
    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0 16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '16px',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  selectFilter: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    outline: 'none',
  },
  groupByText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  runningTimerPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#22c55e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.82rem',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
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
  addTaskBlueBtn: {
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
  listContainer: {
    backgroundColor: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '0.88rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  iconBtnGreen: {
    backgroundColor: '#16a34a22',
    color: '#22c55e',
    border: '1px solid #22c55e44',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  iconBtnYellow: {
    backgroundColor: '#eab30822',
    color: '#eab308',
    border: '1px solid #eab30844',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  iconBtnRed: {
    backgroundColor: '#ef444422',
    color: '#ef4444',
    border: '1px solid #ef444444',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  ownerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  avatarCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
    color: '#000000',
    fontWeight: '800',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSelectPill: {
    border: 'none',
    color: '#ffffff',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer',
  },
  tagPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    color: '#c084fc',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.72rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  kanbanColumn: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '14px',
    minHeight: '500px',
  },
  kanbanColHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  kanbanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '12px',
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
  softwareBadge: {
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
  gridTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
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
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopModalContainer: {
    width: '450px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },

  /* Split Detail View Layout (Matching Issues Module) */
  mainLayout: {
    display: 'flex',
    gap: '20px',
    minHeight: 'calc(100vh - 180px)',
  },
  leftList: {
    width: '320px',
    backgroundColor: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#090d16',
  },
  listSearchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
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
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0b0f19',
  },
  sectionHeading: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#94a3b8',
    marginTop: 0,
    marginBottom: '8px',
  },
  descText: {
    fontSize: '0.88rem',
    color: '#cbd5e1',
    margin: 0,
    lineHeight: '1.5',
  },
  infoGridContainer: {
    padding: '24px',
    backgroundColor: '#090d16',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.85rem',
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  infoVal: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  bottomTabsBar: {
    display: 'flex',
    gap: '16px',
    padding: '12px 24px 0 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0b0f19',
  },
  tabItem: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.82rem',
    fontWeight: '600',
    paddingBottom: '10px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  activeTabItem: {
    color: '#60a5fa',
    fontWeight: '700',
    borderBottom: '2px solid #3b82f6',
  },
  commentEditorBox: {
    padding: '16px 24px',
    backgroundColor: '#0b0f19',
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
};
