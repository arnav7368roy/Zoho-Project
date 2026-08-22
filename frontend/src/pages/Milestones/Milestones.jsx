import React from 'react';
import { Flag, Plus, Calendar, CheckCircle2 } from 'lucide-react';

export default function Milestones() {
  const milestonesList = [
    {
      id: 'MS-01',
      name: 'Sprint 1 - Core Foundation & Authentication',
      status: 'Active',
      startDate: '2026-08-01',
      dueDate: '2026-08-31',
      progress: 75,
      owner: 'Arnav Roy',
    },
    {
      id: 'MS-02',
      name: 'Sprint 2 - User Management & Task Workflows',
      status: 'Upcoming',
      startDate: '2026-09-01',
      dueDate: '2026-09-30',
      progress: 25,
      owner: 'Rohit Tiwari',
    },
    {
      id: 'MS-03',
      name: 'Sprint 3 - Final QA, Security & Deployment',
      status: 'Upcoming',
      startDate: '2026-10-01',
      dueDate: '2026-10-31',
      progress: 0,
      owner: 'Sonu Kumar',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
            Milestones Management
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Track project phases, release schedules, and target deadlines
          </span>
        </div>
        <button
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> <span>Add Milestone</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {milestonesList.map((m) => (
          <div
            key={m.id}
            style={{
              backgroundColor: '#0b0f19',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#60a5fa' }}>{m.id}</span>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  backgroundColor: m.status === 'Active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                  color: m.status === 'Active' ? '#22c55e' : '#94a3b8',
                }}
              >
                {m.status}
              </span>
            </div>

            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>{m.name}</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <Calendar size={14} />
              <span>{m.startDate} ~ {m.dueDate}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                <span>Completion</span>
                <span>{m.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${m.progress}%`, height: '100%', backgroundColor: '#2563eb' }}></div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              Owner: <strong style={{ color: '#f8fafc' }}>{m.owner}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
