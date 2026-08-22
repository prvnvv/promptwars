import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { getAttendancePct, safeBunks, classesToRecover, attendanceStatus } from '../utils/attendance';
import { useToast } from '../components/Toast';
import { Plus, Minus, Trash, Edit, RefreshCw, Calculator, X } from 'lucide-react';

export default function Attendance() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  
  // Modals / forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);
  const [newSubTarget, setNewSubTarget] = useState(75);
  
  const [editingSub, setEditingSub] = useState(null);
  const [editAttended, setEditAttended] = useState(0);
  const [editHeld, setEditHeld] = useState(0);

  // Simulation State
  const [simulatingSubId, setSimulatingSubId] = useState(null);
  const [simSkips, setSimSkips] = useState(1);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    setSubjects(db.getSubjects());
  };

  const handleQuickAttend = (sub) => {
    db.updateSubjectAttendance(sub.id, sub.attended + 1, sub.held + 1);
    addToast(`Marked ${sub.name.split(':')[0]} as Attended!`, 'success');
    loadSubjects();
  };

  const handleQuickBunk = (sub) => {
    db.updateSubjectAttendance(sub.id, sub.attended, sub.held + 1);
    addToast(`Marked ${sub.name.split(':')[0]} as Bunked.`, 'warning');
    loadSubjects();
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    db.addSubject({
      name: newSubName,
      credits: Number(newSubCredits),
      targetPct: Number(newSubTarget)
    });

    addToast(`Subject "${newSubName}" added successfully!`, 'success');
    setNewSubName('');
    setShowAddModal(false);
    loadSubjects();
  };

  const handleDeleteSubject = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      db.deleteSubject(id);
      addToast(`Deleted ${name}`, 'danger');
      loadSubjects();
    }
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    setEditAttended(sub.attended);
    setEditHeld(sub.held);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editAttended > editHeld) {
      addToast("Attended classes cannot exceed total classes held!", "danger");
      return;
    }
    db.updateSubjectAttendance(editingSub.id, Number(editAttended), Number(editHeld));
    addToast(`Updated attendance for ${editingSub.name.split(':')[0]}`, 'success');
    setEditingSub(null);
    loadSubjects();
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Attendance Tracker</h1>
          <p>Track class compliance and simulate skip safety margins.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Subject
        </button>
      </header>

      <div className="flex-col">
        {subjects.length === 0 ? (
          <div className="card empty-state">
            <h3>No subjects added yet</h3>
            <p>Add subjects to start tracking attendance compliance.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Subject</button>
          </div>
        ) : (
          subjects.map((sub) => {
            const pct = getAttendancePct(sub.attended, sub.held);
            const status = attendanceStatus(sub.attended, sub.held, sub.targetPct);
            const bunks = safeBunks(sub.attended, sub.held, sub.targetPct);
            const recover = classesToRecover(sub.attended, sub.held, sub.targetPct);
            const isSimulating = simulatingSubId === sub.id;

            // Calculate simulated result
            const simulatedPct = isSimulating ? getAttendancePct(sub.attended, sub.held + Number(simSkips)) : pct;
            const simulatedBunks = isSimulating ? safeBunks(sub.attended, sub.held + Number(simSkips), sub.targetPct) : bunks;

            return (
              <div key={sub.id} className="subject-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{sub.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Credits: {sub.credits} • Target: {sub.targetPct}% • Held: {sub.held}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Visual % badge */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        color: pct >= sub.targetPct ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {pct.toFixed(0)}%
                      </div>
                      <span className={`badge ${
                        status === 'safe' ? 'badge-success' :
                        status === 'near' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {status === 'safe' ? 'Safe' : status === 'near' ? 'Bunk Alert' : 'Critical'}
                      </span>
                    </div>

                    {/* Quick increment buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleQuickAttend(sub)}>Attended</button>
                      <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleQuickBunk(sub)}>Bunked</button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: pct >= sub.targetPct ? 'var(--color-success)' : 'var(--color-danger)'
                    }}
                  />
                </div>

                {/* Bottom stats row & calculations */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--color-bg)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-secondary)' }}>
                    <span>Attended: <strong>{sub.attended}</strong></span>
                    {pct >= sub.targetPct ? (
                      <span style={{ color: 'var(--color-success)' }}>
                        Safe skips remaining: <strong>{bunks}</strong>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-danger)' }}>
                        Attend next <strong>{recover}</strong> classes to recover
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => {
                        setSimulatingSubId(isSimulating ? null : sub.id);
                        setSimSkips(1);
                      }}
                    >
                      <Calculator size={12} /> {isSimulating ? 'Close Sim' : 'Simulate'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => openEditModal(sub)}
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>

                {/* Interactive Bunk Simulator Section */}
                {isSimulating && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-lighter)',
                    border: '1px dashed var(--color-primary)',
                    marginTop: '4px',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calculator size={14} /> Skip Simulator
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Simulating {simSkips} skipped class{simSkips > 1 ? 'es' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={simSkips}
                        onChange={(e) => setSimSkips(e.target.value)}
                        style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{simSkips}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span>New attendance: <strong style={{ color: simulatedPct >= sub.targetPct ? 'var(--color-success)' : 'var(--color-danger)' }}>{simulatedPct.toFixed(1)}%</strong></span>
                      {simulatedPct >= sub.targetPct ? (
                        <span style={{ color: 'var(--color-success)' }}>Still Safe! (Remaining skips: {simulatedBunks})</span>
                      ) : (
                        <span style={{ color: 'var(--color-danger)' }}>Warning: Falls below target {sub.targetPct}%</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddSubject}>
            <div className="modal-header">
              <h2>Add New Subject</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Subject Name (with Code)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UCS411: Artificial Intelligence"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Credits</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="5"
                  value={newSubCredits}
                  onChange={(e) => setNewSubCredits(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Attendance Target (%)</label>
                <select
                  className="form-select"
                  value={newSubTarget}
                  onChange={(e) => setNewSubTarget(e.target.value)}
                >
                  <option value="75">75% (Standard Thapar compliance)</option>
                  <option value="80">80%</option>
                  <option value="85">85%</option>
                  <option value="90">90%</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full">Create Subject</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Attendance Record Modal */}
      {editingSub && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleSaveEdit}>
            <div className="modal-header">
              <h2>Edit Attendance Data</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingSub(null)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Adjust manually to fix incorrect counts for <strong>{editingSub.name}</strong>.
            </p>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Classes Attended</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={editAttended}
                  onChange={(e) => setEditAttended(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Classes Held</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={editHeld}
                  onChange={(e) => setEditHeld(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
