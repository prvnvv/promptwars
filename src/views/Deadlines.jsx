import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { Plus, Trash, CheckSquare, Square, X, Calendar } from 'lucide-react';

export default function Deadlines() {
  const { addToast } = useToast();
  const [deadlines, setDeadlines] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form / modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('medium');

  // Filter state
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, done

  useEffect(() => {
    loadDeadlines();
    setSubjects(db.getSubjects());
  }, []);

  const loadDeadlines = () => {
    setDeadlines(db.getDeadlines());
  };

  const handleAddDeadline = (e) => {
    e.preventDefault();
    if (!title.trim() || !due) {
      addToast('Please fill out the title and due date!', 'warning');
      return;
    }

    db.addDeadline({
      title,
      subject,
      due,
      priority
    });

    addToast(`Added deadline: "${title}"`, 'success');
    setShowAddModal(false);
    setTitle('');
    setSubject('');
    setDue('');
    setPriority('medium');
    loadDeadlines();
  };

  const handleToggleStatus = (id, currentStatus) => {
    db.toggleDeadline(id);
    addToast(currentStatus === 'pending' ? 'Marked task as completed!' : 'Marked task as pending.', 'success');
    loadDeadlines();
  };

  const handleDeleteDeadline = (id, name) => {
    if (window.confirm(`Delete deadline: "${name}"?`)) {
      db.deleteDeadline(id);
      addToast('Deadline removed', 'info');
      loadDeadlines();
    }
  };

  const filteredDls = deadlines.filter((dl) => {
    if (filterStatus === 'pending') return dl.status === 'pending';
    if (filterStatus === 'done') return dl.status === 'done';
    return true;
  }).sort((a, b) => {
    // Sort pending first, then sort by due date
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    return new Date(a.due) - new Date(b.due);
  });

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Academic Deadlines</h1>
          <p>Keep track of MST, EST, assignments, quizzes, and project evaluations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Deadline
        </button>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'pending', 'done'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {status} ({deadlines.filter(d => status === 'all' ? true : status === 'pending' ? d.status === 'pending' : d.status === 'done').length})
          </button>
        ))}
      </div>

      <div className="card">
        {filteredDls.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '10px' }} />
            <h3>No deadlines found</h3>
            <p>You are completely caught up with your submissions!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDls.map((dl) => (
              <div
                key={dl.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  background: dl.status === 'done' ? 'var(--color-bg-hover)' : 'var(--color-bg-card)',
                  opacity: dl.status === 'done' ? 0.75 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <button
                    onClick={() => handleToggleStatus(dl.id, dl.status)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}
                  >
                    {dl.status === 'done' ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontWeight: 600,
                      textDecoration: dl.status === 'done' ? 'line-through' : 'none',
                      color: dl.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text)'
                    }}>
                      {dl.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span>{dl.subject || 'General'}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} /> {new Date(dl.due).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${
                    dl.priority === 'high' ? 'badge-danger' :
                    dl.priority === 'medium' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {dl.priority}
                  </span>
                  
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-danger)', borderColor: 'transparent', padding: '4px' }}
                    onClick={() => handleDeleteDeadline(dl.id, dl.title)}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddDeadline}>
            <div className="modal-header">
              <h2>Add New Deadline</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Deadline Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Lab Report Submission"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject (Optional)</label>
                <select
                  className="form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">General / None</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Create Deadline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
