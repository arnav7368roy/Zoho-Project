import React, { useState } from 'react';
import { Search, ChevronRight, ChevronLeft, X, Check, Filter } from 'lucide-react';

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
  const [subSearch, setSubSearch] = useState('');
  const [selectedLogic, setSelectedLogic] = useState(initialLogic); // 'any' or 'all'
  const [activeCategory, setActiveCategory] = useState(null);

  // Selected values map: { 'Status': ['TO_DO', 'IN_PROGRESS'], 'Priority': ['HIGH'] }
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  // Text inputs map
  const [textFilters, setTextFilters] = useState({});

  const defaultCategories = [
    'Status',
    'Priority',
    'Severity',
    'Ticket Type',
    'Assignee',
    'Reporter',
    'Project',
    'Issue Name',
    'Task Name',
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

  const selectAllCategoryValues = (catName, allOptions) => {
    const current = selectedFilters[catName] || [];
    if (current.length === allOptions.length) {
      // Clear
      setSelectedFilters((prev) => {
        const copy = { ...prev };
        delete copy[catName];
        return copy;
      });
    } else {
      // Select All
      setSelectedFilters((prev) => ({
        ...prev,
        [catName]: [...allOptions],
      }));
    }
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
    setActiveCategory(null);
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

  const activeCategoryOptions = activeCategory ? getCategoryOptions(activeCategory) : null;
  const filteredSubOptions = activeCategoryOptions
    ? activeCategoryOptions.filter((opt) =>
        opt.toLowerCase().includes(subSearch.toLowerCase())
      )
    : [];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawerWrapper} onClick={(e) => e.stopPropagation()}>
        {/* LEFT SUB-PANE (Flyout Pane for category options, Zoho Projects style) */}
        {activeCategory && (
          <div style={styles.subFlyoutPane}>
            <div style={styles.subFlyoutHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#f8fafc' }}>
                  {activeCategory}
                </span>
                {selectedFilters[activeCategory]?.length > 0 && (
                  <span style={styles.catCountBadge}>
                    {selectedFilters[activeCategory].length}
                  </span>
                )}
              </div>
              <button
                style={styles.resetBtn}
                onClick={() => {
                  setSelectedFilters((prev) => {
                    const copy = { ...prev };
                    delete copy[activeCategory];
                    return copy;
                  });
                }}
              >
                Clear
              </button>
            </div>

            {activeCategoryOptions ? (
              <>
                {/* Search inside options if list is long */}
                {activeCategoryOptions.length > 4 && (
                  <div style={styles.subSearchBox}>
                    <Search size={13} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder={`Search ${activeCategory}...`}
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      style={styles.subSearchInput}
                    />
                  </div>
                )}

                {/* Select All Checkbox Row */}
                <div style={styles.selectAllRow}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        selectedFilters[activeCategory]?.length === activeCategoryOptions.length &&
                        activeCategoryOptions.length > 0
                      }
                      onChange={() => selectAllCategoryValues(activeCategory, activeCategoryOptions)}
                      style={styles.checkboxInput}
                    />
                    <span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '0.82rem' }}>
                      (Select All)
                    </span>
                  </label>
                </div>

                {/* Checkbox Options List */}
                <div style={styles.subOptionsList}>
                  {filteredSubOptions.map((opt) => {
                    const isChecked = (selectedFilters[activeCategory] || []).includes(opt);
                    return (
                      <label key={opt} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilterValue(activeCategory, opt)}
                          style={styles.checkboxInput}
                        />
                        <span
                          style={{
                            color: isChecked ? '#60a5fa' : '#e2e8f0',
                            fontWeight: isChecked ? '700' : '400',
                            fontSize: '0.85rem',
                          }}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Text search input for category */
              <div style={{ padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Enter search keyword for {activeCategory}:
                </label>
                <input
                  type="text"
                  placeholder={`Type ${activeCategory}...`}
                  value={textFilters[activeCategory] || selectedFilters[activeCategory]?.[0] || ''}
                  onChange={(e) => handleTextChange(activeCategory, e.target.value)}
                  style={styles.textFilterInput}
                  autoFocus
                />
              </div>
            )}

            <div style={styles.subFlyoutFooter}>
              <button
                onClick={() => setActiveCategory(null)}
                style={styles.subDoneBtn}
              >
                <Check size={14} /> Done
              </button>
            </div>
          </div>
        )}

        {/* RIGHT MAIN DRAWER (Category List) */}
        <div style={styles.mainDrawer}>
          {/* Header */}
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
              placeholder="Filter Search"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Categories List */}
          <div style={styles.categoryList}>
            {filteredCategories.map((cat) => {
              const isSelected = activeCategory === cat;
              const selectedVals = selectedFilters[cat] || [];

              return (
                <div
                  key={cat}
                  style={{
                    ...styles.categoryItem,
                    ...(isSelected ? styles.activeCategoryItem : {}),
                  }}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSubSearch('');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{cat}</span>
                    {selectedVals.length > 0 && (
                      <span style={styles.catCountBadge}>{selectedVals.length}</span>
                    )}
                  </div>
                  <ChevronRight size={14} color={isSelected ? '#60a5fa' : '#64748b'} />
                </div>
              );
            })}
          </div>

          {/* Footer Logic & Action Buttons */}
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
  drawerWrapper: {
    display: 'flex',
    height: '100vh',
    position: 'relative',
  },
  subFlyoutPane: {
    width: '280px',
    height: '100vh',
    backgroundColor: '#090d16',
    borderRight: '1px solid #1e293b',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.4)',
    animation: 'slideInLeft 0.15s ease-out',
    zIndex: 1210,
  },
  subFlyoutHeader: {
    padding: '16px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0d1322',
  },
  subSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '10px 14px',
    padding: '6px 10px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
  },
  subSearchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.8rem',
    outline: 'none',
    width: '100%',
  },
  selectAllRow: {
    padding: '8px 18px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0f172a',
  },
  subOptionsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subFlyoutFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #1e293b',
    backgroundColor: '#0d1322',
  },
  subDoneBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  mainDrawer: {
    width: '320px',
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
  categoryList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: '0.85rem',
    color: '#cbd5e1',
    borderBottom: '1px solid #1e293b',
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
    width: '15px',
    height: '15px',
  },
  textFilterInput: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.85rem',
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
    flex: 1,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
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
