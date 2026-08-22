import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { Plus, Trash, Clock, MapPin, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Timetable() {
  const { addToast } = useToast();
  const [timetable, setTimetable] = useState({});
  const [activeDay, setActiveDay] = useState('Monday');
  const [subjects, setSubjects] = useState([]);

  // Form / modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classTime, setClassTime] = useState('09:00 AM - 10:00 AM');
  const [classRoom, setClassRoom] = useState('LT-102');
  const [classType, setClassType] = useState('Lecture');

  useEffect(() => {
    loadTimetable();
    setSubjects(db.getSubjects());
  }, []);

  const loadTimetable = () => {
    setTimetable(db.getTimetable());
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      addToast('Please select a subject first or create one in the Attendance tab!', 'warning');
      return;
    }

    db.addTimetableSlot(activeDay, {
      subject: selectedSubject,
      time: classTime,
      room: classRoom,
      type: classType
    });

    addToast(`Added class slot to ${activeDay}!`, 'success');
    setShowAddModal(false);
    loadTimetable();
  };

  const handleDeleteSlot = (slotId) => {
    if (window.confirm('Delete this class slot?')) {
      db.deleteTimetableSlot(activeDay, slotId);
      addToast('Slot removed from timetable', 'info');
      loadTimetable();
    }
  };

  const currentSlots = timetable[activeDay] || [];

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Weekly Timetable</h1>
          <p>Organize and check daily classrooms, lab sessions, and time slots.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Slot
        </button>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        scrollbarWidth: 'none'
      }}>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`btn ${activeDay === day ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: '20px', flexShrink: 0 }}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Classes Scheduled for {activeDay}</span>
          <span className="badge badge-primary">{currentSlots.length} Total</span>
        </div>

        {currentSlots.length === 0 ? (
          <div className="empty-state">
            <Clock size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '10px' }} />
            <h3>No classes scheduled</h3>
            <p>Perfect day to study at learning center or relax at Jaggi!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentSlots.map((slot) => (
              <div key={slot.id} className="timetable-slot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontWeight: 600 }}>{slot.subject}</h3>
                    <span className="badge badge-info">{slot.type}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {slot.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {slot.room}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-danger)', borderColor: 'transparent' }}
                  onClick={() => handleDeleteSlot(slot.id)}
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddSlot}>
            <div className="modal-header">
              <h2>Add Class Slot ({activeDay})</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Select Subject</label>
                {subjects.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                    Please add a subject in the "Attendance" tab first.
                  </p>
                ) : (
                  <select
                    className="form-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Time Window</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 09:00 AM - 10:00 AM"
                  value={classTime}
                  onChange={(e) => setClassTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Room Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. LT-102, CIL Lab, G-Block"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Type</label>
                <select
                  className="form-select"
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Lab">Lab Session</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={subjects.length === 0}>
                Add to Timetable
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
