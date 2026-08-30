import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown, X, Check, Filter } from 'lucide-react';

export default function FilterPanel({
  isOpen,
  onClose,
  onApplyFilter,
  customCategories,
  users = [],
  projects = [],
  initialFilters = {},
  initialLogic = 'all',
}) {
  if (!isOpen) return null;

  const [filterSearch, setFilterSearch] = useState('');
  const [selectedLogic, setSelectedLogic] = useState(initialLogic); // 'any' or 'all'
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Selected values map: { 'Status': ['Open', 'In Progress'], 'Priority': ['HIGH'] }
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  // Text inputs map
  const [textFilters, setTextFilters] = useState({});

  const defaultCategories = [
    'Issue Name',
    'Task Name',
    'Status',
    'Priority',
    'Severity',
    'Ticket Type',
    'Assignee',
    'Reporter',
    'Project',
    'Tags',
    'Created Time',
    'Due Date',
    'Module',
    'Classification',
    'Reproducible',
    'Flag',
  ];

  const categories = (customCategories || defaultCategories).map((c) =>
    typeof c === 'string' ? c : c.name
  );

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const getCategoryOptions = (catName) => {
    const nameLower = catName.toLowerCase();

    if (nameLower.includes('status')) {
      return ['Open', 'In Progress', 'Dev Complete', 'Ready for QA', 'Closed', 'Blocked', 'On Hold'];
    }
    if (nameLower.includes('priority')) {
      return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    }
    if (nameLower.includes('severity')) {
      return ['Critical', 'High', 'Medium', 'Low'];
    }
    if (nameLower.includes('ticket type') || nameLower.includes('type')) {
      return ['Bug', 'Feature', 'Task', 'Improvement'];
    }
    if (
      nameLower.includes('assignee') ||
      nameLower.includes('reporter') ||
      nameLower.includes('owner') ||
      nameLower.includes('developer') ||
      nameLower.includes('reviewer') ||
      nameLower.includes('user')
    ) {
      if (users && users.length > 0) {
        return users.map(
          (u) => u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User'
        );
      }
      return ['Arnav Roy', 'Laddu Kumar', 'Rohit Tiwari', 'System Admin', 'QA Tester'];
    }
    if (nameLower.includes('project')) {
      if (projects && projects.length > 0) {
        return projects.map((p) => p.projectName || p.name || 'Project');
      }
      return ['Zoho Enterprise Upgrade', 'Verification Test Project', 'Zoho Enterprise System'];
    }
    if (nameLower.includes('time') || nameLower.includes('date')) {
      return ['Today', 'Yesterday', 'This Week', 'This Month', 'Overdue', 'Last 30 Days'];
    }
    if (nameLower.includes('reproducible')) {
      return ['Always', 'Sometimes', 'Never', 'Random'];
    }
    if (nameLower.includes('flag')) {
      return ['Internal', 'External', 'Customer'];
    }
    if (nameLower.includes('classification')) {
      return ['Security', 'UI/UX', 'Performance', 'Crash', 'Data Integrity', 'General'];
    }
    if (nameLower.includes('module')) {
      return ['Authentication', 'Dashboard', 'Task Management', 'Issue Tracker', 'Reports', 'Settings'];
    }

    return null; // Null means text input
  };

  const toggleFilterValue = (catName, val) => {
    setSelectedFilters((prev) => {
      const current = prev[catName] || [];
      const updated = current.includes(val)
        ? current.filter((item) => item !== val)
        : [...current, val];

      if (updated.length === 0) {
        const copy = { ...prev };
        delete copy[catName];
        return copy;
      }
      return { ...prev, [catName]: updated };
    });
  };

  const handleTextChange = (catName, textVal) => {
    setTextFilters((prev) => ({ ...prev, [catName]: textVal }));
    setSelectedFilters((prev) => {
      if (!textVal.trim()) {
        const copy = { ...prev };
        delete copy[catName];
        return copy;
      }
      return { ...prev, [catName]: [textVal.trim()] };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setTextFilters({});
    setFilterSearch('');
    setExpandedCategory(null);
  };

  const handleApply = () => {
    if (onApplyFilter) {
      onApplyFilter({
        filters: selectedFilters,
        logic: selectedLogic,
      });
    }
    onClose();
  };

  const totalActiveFilterCount = Object.keys(selectedFilters).reduce(
    (acc, k) => acc + (selectedFilters[k]?.length || 0),
    0
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Panel Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>
              Filter
            </h3>
            {totalActiveFilterCount > 0 && (
              <span style={styles.activeBadge}>{totalActiveFilterCount}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={styles.resetBtn} onClick={clearAllFilters}>
              Reset
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={16} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            placeholder="Filter Search"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Active Filter Badges Preview */}
        {totalActiveFilterCount > 0 && (
          <div style={styles.activeFiltersRow}>
            {Object.entries(selectedFilters).map(([cat, vals]) => (
              <span key={cat} style={styles.filterChip}>
                <strong>{cat}:</strong> {vals.join(', ')}
                <X
                  size={12}
                  style={{ cursor: 'pointer', marginLeft: '4px' }}
                  onClick={() => {
                    setSelectedFilters((prev) => {
                      const copy = { ...prev };
                      delete copy[cat];
                      return copy;
                    });
                  }}
                />
              </span>
            ))}
          </div>
        )}

        {/* Categories List with Inline Accordion Dropdowns */}
        <div style={styles.categoryList}>
          {filteredCategories.map((cat) => {
            const isExpanded = expandedCategory === cat;
            const selectedVals = selectedFilters[cat] || [];
            const options = getCategoryOptions(cat);

            return (
              <div key={cat} style={styles.categoryBlock}>
                {/* Category Header Line */}
                <div
                  style={{
                    ...styles.categoryItem,
                    ...(isExpanded ? styles.activeCategoryItem : {}),
                  }}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{cat}</span>
                    {selectedVals.length > 0 && (
                      <span style={styles.catCountBadge}>{selectedVals.length}</span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={14} color="#60a5fa" />
                  ) : (
                    <ChevronRight size={14} color="#64748b" />
                  )}
                </div>

                {/* Inline Accordion Dropdown Content (Expands directly underneath!) */}
                {isExpanded && (
                  <div style={styles.inlineDropdown}>
                    {options ? (
                      <div style={styles.checkboxGroup}>
                        {options.map((opt) => {
                          const isChecked = selectedVals.includes(opt);
                          return (
                            <label key={opt} style={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFilterValue(cat, opt)}
                                style={styles.checkboxInput}
                              />
                              <span
                                style={{
                                  color: isChecked ? '#60a5fa' : '#e2e8f0',
                                  fontWeight: isChecked ? '700' : '400',
                                }}
                              >
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      /* Text search box directly underneath */
                      <div style={{ padding: '4px 0' }}>
                        <input
                          type="text"
                          placeholder={`Enter ${cat}...`}
                          value={textFilters[cat] || selectedVals[0] || ''}
                          onChange={(e) => handleTextChange(cat, e.target.value)}
                          style={styles.inlineTextInput}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Options & Action Buttons */}
        <div style={styles.footer}>
          <div style={styles.logicOptions}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="logic"
                value="any"
                checked={selectedLogic === 'any'}
                onChange={() => setSelectedLogic('any')}
              />
              Any of these
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="logic"
                value="all"
                checked={selectedLogic === 'all'}
                onChange={() => setSelectedLogic('all')}
              />
              All of these
            </label>
          </div>

          <div style={styles.actionRow}>
            <button onClick={handleApply} style={styles.findBtn}>
              Find
            </button>
            <button onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(2px)',
    zIndex: 1200,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '340px',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-6px 0 25px rgba(0,0,0,0.5)',
    borderLeft: '1px solid #1e293b',
    animation: 'slideInRight 0.15s ease-out',
  },
  header: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#090d16',
  },
  activeBadge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 16px',
    padding: '8px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
  },
  activeFiltersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '8px 16px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0d1322',
    maxHeight: '90px',
    overflowY: 'auto',
  },
  filterChip: {
    backgroundColor: '#1e293b',
    color: '#60a5fa',
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    padding: '3px 8px',
    fontSize: '0.72rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  categoryList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  categoryBlock: {
    borderBottom: '1px solid #1e293b',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: '0.85rem',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  activeCategoryItem: {
    backgroundColor: '#1e293b',
    color: '#60a5fa',
    fontWeight: '700',
  },
  catCountBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '0.68rem',
    borderRadius: '10px',
    padding: '1px 6px',
    fontWeight: '800',
  },
  inlineDropdown: {
    padding: '10px 20px 14px 28px',
    backgroundColor: '#090d16',
    borderTop: '1px solid #1e293b',
    animation: 'fadeIn 0.15s ease',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  checkboxInput: {
    accentColor: '#3b82f6',
    cursor: 'pointer',
    width: '15px',
    height: '15px',
  },
  inlineTextInput: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.82rem',
    outline: 'none',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #1e293b',
    backgroundColor: '#090d16',
  },
  logicOptions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '14px',
    fontSize: '0.82rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: '#cbd5e1',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
  },
  findBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 24px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
