import React, { useState } from 'react';
import { X, Clock, Calendar, FileText, CheckCircle2, User, DollarSign } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function ManualLogHoursModal({
  isOpen,
  onClose,
  prefilledItem = null, // { id, code, title, type: 'task' | 'issue' }
  onLogSaved,
  users = [],
}) {
  if (!isOpen) return null;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('2');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [selectedUser, setSelectedUser] = useState('Arnav Roy');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const totalHours = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;
    const formattedHours = totalHours.toFixed(2);

    const newLogEntry = {
      id: `manual-log-${Date.now()}`,
      date,
      hours: formattedHours,
      hoursNum: totalHours,
      description: description || 'Manual work log entry',
      billable,
      userName: selectedUser,
      createdAt: new Date().toISOString(),
      itemCode: prefilledItem?.code || prefilledItem?.taskCode || prefilledItem?.issueCode || 'GEN-LOG',
      itemTitle: prefilledItem?.title || prefilledItem?.name || 'General Project Activity',
    };

    try {
      // If logging for a specific task
      if (prefilledItem && prefilledItem.id) {
        await apiRequest(`/api/v1/tasks/${prefilledItem.id}/logs`, 'POST', {
          hours: totalHours,
          description: description || 'Manual work log entry',
          logDate: date,
        });
      }

      setSuccessMsg('Hours logged successfully!');

      if (onLogSaved) {
        onLogSaved(newLogEntry);
      }

      setTimeout(() => {
        setSaving(false);
        setSuccessMsg('');
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error logging hours manually:', err);
      // Fallback local save
      if (onLogSaved) {
        onLogSaved(newLogEntry);
      }
      setSaving(false);
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconCircle}>
              <Clock size={18} color="#3b82f6" />
            </div>
            <div>
              <h3 style={styles.title}>Log Work Hours Manually</h3>
              <p style={styles.subtitle}>
                {prefilledItem
                  ? `Logging time for: ${prefilledItem.code || prefilledItem.taskCode || prefilledItem.issueCode || ''} - ${prefilledItem.title || ''}`
                  : 'Add manual work logs to your timesheet'}
              </p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={styles.body}>
          {/* Item Banner if prefilled */}
          {prefilledItem && (
            <div style={styles.itemBanner}>
              <span style={styles.itemBadge}>
                {prefilledItem.code || prefilledItem.issueCode || prefilledItem.taskCode || 'TICKET'}
              </span>
              <span style={styles.itemTitle}>{prefilledItem.title}</span>
            </div>
          )}

          {/* Date & Time Row */}
          <div style={styles.formRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>
                <Calendar size={13} color="#94a3b8" /> Log Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Minutes</label>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  style={styles.select}
                >
                  <option value="0">00 m</option>
                  <option value="15">15 m</option>
                  <option value="30">30 m</option>
                  <option value="45">45 m</option>
                </select>
              </div>
            </div>
          </div>

          {/* User & Billable Status */}
          <div style={styles.formRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>
                <User size={13} color="#94a3b8" /> Employee / Logged By
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={styles.select}
              >
                <option value="Arnav Roy">Arnav Roy (Admin)</option>
                <option value="Laddu Kumar">Laddu Kumar (Developer)</option>
                <option value="Rohit Tiwari">Rohit Tiwari (QA Engineer)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name || `${u.firstName} ${u.lastName || ''}`}>
                    {u.name || `${u.firstName} ${u.lastName || ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>
                <DollarSign size={13} color="#94a3b8" /> Billing Status
              </label>
              <select
                value={billable ? 'true' : 'false'}
                onChange={(e) => setBillable(e.target.value === 'true')}
                style={styles.select}
              >
                <option value="true">Billable Hours</option>
                <option value="false">Non-Billable Hours</option>
              </select>
            </div>
          </div>

          {/* Work Description */}
          <div>
            <label style={styles.label}>
              <FileText size={13} color="#94a3b8" /> Work Description / Remarks
            </label>
            <textarea
              placeholder="Describe what was accomplished during this logged period..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={styles.textarea}
            />
          </div>

          {/* Feedback Msg */}
          {successMsg && (
            <div style={styles.successBox}>
              <CheckCircle2 size={16} color="#22c55e" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? 'Saving Log...' : 'Add Log Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '520px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
    color: '#f8fafc',
    overflow: 'hidden',
    animation: 'scaleUp 0.18s ease-out',
  },
  header: {
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#090d16',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    margin: '2px 0 0 0',
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  body: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  itemBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  itemTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '6px',
    color: '#4ade80',
    fontSize: '0.82rem',
    fontWeight: '600',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
    borderTop: '1px solid #1e293b',
    paddingTop: '16px',
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '9px 18px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '9px 22px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
};
