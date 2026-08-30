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
  const [activeCategory, setActiveCategory] = useState(null);

  // Selected values map: { 'Status': ['TO_DO', 'IN_PROGRESS'], 'Priority': ['HIGH'] }
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  // Text inputs for text-based criteria
  const [textFilters, setTextFilters] = useState({});

  const defaultCategories = [
    { name: 'Status', type: 'select', options: ['Open', 'In Progress', 'Dev Complete', 'Ready for QA', 'Closed', 'Blocked', 'On Hold'] },
    { name: 'Priority', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    { name: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { name: 'Ticket Type', type: 'select', options: ['Bug', 'Feature', 'Task', 'Improvement'] },
    { name: 'Owner / Assignee', type: 'userSelect' },
    { name: 'Project', type: 'projectSelect' },
    { name: 'Task / Issue Name', type: 'text' },
    { name: 'Tags', type: 'text' },
    { name: 'Created Time', type: 'select', options: ['Today', 'Yesterday', 'This Week', 'This Month', 'Last 30 Days'] },
    { name: 'Due Date', type: 'select', options: ['Overdue', 'Due Today', 'Due This Week', 'Due This Month'] },
  ];

  const categoryList = customCategories
    ? customCategories.map((c) => (typeof c === 'string' ? { name: c, type: 'text' } : c))
    : defaultCategories;

  const filteredCategories = categoryList.filter((cat) =>
    cat.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

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

  const getCategoryOptionList = (cat) => {
    if (cat.options) return cat.options;
    if (cat.name === 'Owner' || cat.name === 'Assignee' || cat.name === 'Owner / Assignee' || cat.type === 'userSelect') {
      return users.map((u) => u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User');
    }
    if (cat.name === 'Project' || cat.type === 'projectSelect') {
      return projects.map((p) => p.projectName || p.name || 'Project');
    }
    if (cat.name === 'Status') {
      return ['Open', 'In Progress', 'Dev Complete', 'Ready for QA', 'Closed', 'Blocked', 'On Hold'];
    }
    if (cat.name === 'Priority') {
      return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    }
    if (cat.name === 'Severity') {
      return ['Low', 'Medium', 'High', 'Critical'];
    }
    if (cat.name === 'Ticket Type') {
      return ['Bug', 'Feature', 'Task', 'Improvement'];
    }
    return null;
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
              Filter Criteria
            </h3>
            {totalActiveFilterCount > 0 && (
              <span style={styles.activeBadge}>{totalActiveFilterCount}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {totalActiveFilterCount > 0 && (
              <button style={styles.resetBtn} onClick={clearAllFilters}>
                Reset
              </button>
            )}
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
            placeholder="Search filter criteria..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Active Filter Badges preview */}
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

        {/* Categories List */}
        <div style={styles.categoryList}>
          {filteredCategories.map((cat) => {
            const isExpanded = activeCategory === cat.name;
            const selectedVals = selectedFilters[cat.name] || [];
            const optionList = getCategoryOptionList(cat);

            return (
              <div key={cat.name} style={styles.categoryBlock}>
                <div
                  style={{
                    ...styles.categoryItem,
                    ...(isExpanded ? styles.activeCategoryItem : {}),
                  }}
                  onClick={() => setActiveCategory(isExpanded ? null : cat.name)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{cat.name}</span>
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

                {/* Expanded Sub-Options Picker */}
                {isExpanded && (
                  <div style={styles.subOptionsContainer}>
                    {optionList ? (
                      <div style={styles.checkboxList}>
                        {optionList.map((opt) => {
                          const isChecked = selectedVals.includes(opt);
                          return (
                            <label key={opt} style={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFilterValue(cat.name, opt)}
                                style={styles.checkboxInput}
                              />
                              <span style={{ color: isChecked ? '#60a5fa' : '#e2e8f0' }}>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: '8px 0' }}>
                        <input
                          type="text"
                          placeholder={`Filter by ${cat.name}...`}
                          value={textFilters[cat.name] || selectedVals[0] || ''}
                          onChange={(e) => handleTextChange(cat.name, e.target.value)}
                          style={styles.textFilterInput}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Options & Actions */}
        <div style={styles.footer}>
          <div style={styles.logicOptions}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>Match Condition:</span>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="logic"
                value="any"
                checked={selectedLogic === 'any'}
                onChange={() => setSelectedLogic('any')}
              />
              Any of these (OR)
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="logic"
                value="all"
                checked={selectedLogic === 'all'}
                onChange={() => setSelectedLogic('all')}
              />
              All of these (AND)
            </label>
          </div>

          <div style={styles.actionRow}>
            <button onClick={handleApply} style={styles.findBtn}>
              Find / Apply Filters
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(3px)',
    zIndex: 1200,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '360px',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-6px 0 25px rgba(0,0,0,0.5)',
    borderLeft: '1px solid #1e293b',
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
    color: '#60a5fa',
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
    margin: '12px 16px 8px 16px',
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
  subOptionsContainer: {
    padding: '8px 20px 14px 20px',
    backgroundColor: '#090d16',
    borderTop: '1px solid #1e293b',
  },
  checkboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  checkboxInput: {
    accentColor: '#3b82f6',
    cursor: 'pointer',
  },
  textFilterInput: {
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
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
    fontSize: '0.8rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#cbd5e1',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
  },
  findBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
