import React, { useState } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';

export default function FilterPanel({ isOpen, onClose, onApplyFilter, customCategories }) {
  if (!isOpen) return null;

  const [filterSearch, setFilterSearch] = useState('');
  const [selectedLogic, setSelectedLogic] = useState('all'); // 'any' or 'all'
  const [activeCategory, setActiveCategory] = useState(null);

  const defaultCategories = [
    'Task Name',
    'Status',
    'Completion Percentage',
    'Owner',
    'Associated Team',
    'Priority',
    'Start Date',
    'Due Date',
    'Time Span',
    'Recurrence',
    'Created Time',
    'Completion Date',
    'Last Modified Time',
    'Created By',
    'Task List',
    'Milestone',
    'Dependency status',
    'Tags',
    'Billing Type',
    'Critical Tasks',
    'Planned Effort (in hours)',
    'PR Reviewer',
    'Story Point',
    'Developer Name',
    'Sprint',
  ];

  const categories = customCategories || defaultCategories;

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Panel Header */}
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Filter</h3>
          <button style={styles.resetBtn} onClick={() => setFilterSearch('')}>
            Reset
          </button>
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
          {filteredCategories.map((cat) => (
            <div
              key={cat}
              style={{
                ...styles.categoryItem,
                ...(activeCategory === cat ? styles.activeCategoryItem : {}),
              }}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              <span>{cat}</span>
              <ChevronRight size={14} color="#94a3b8" />
            </div>
          ))}
        </div>

        {/* Bottom Options & Actions */}
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
            <button
              onClick={() => {
                if (onApplyFilter) onApplyFilter(activeCategory);
                onClose();
              }}
              style={styles.findBtn}
            >
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1200,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '320px',
    height: '100vh',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
    animation: 'slideInRight 0.2s ease-out',
  },
  header: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 16px',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#0f172a',
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
    padding: '10px 20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.85rem',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  activeCategoryItem: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '700',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  logicOptions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    fontSize: '0.82rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: '#475569',
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
    padding: '8px 20px',
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
