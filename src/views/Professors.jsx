import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { RatingStars, RatingInput } from '../components/RatingInput';
import { Search, Plus, Calendar, User, MessageSquare, AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function Professors() {
  const { addToast } = useToast();
  const [professors, setProfessors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected professor for viewing reviews
  const [selectedProf, setSelectedProf] = useState(null);

  // Modals / forms state
  const [showAddProfModal, setShowAddProfModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // New professor form fields
  const [newProfName, setNewProfName] = useState('');
  const [newProfDept, setNewProfDept] = useState('Computer Science & Engineering');
  const [newProfAttendance, setNewProfAttendance] = useState('Strict 75%');

  // New review form fields (Advanced parameters)
  const [rating, setRating] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [gradingLeniency, setGradingLeniency] = useState(3);
  const [accessibility, setAccessibility] = useState(5);
  const [attendanceStrictness, setAttendanceStrictness] = useState(3);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadProfessors();
    setCurrentUser(db.getCurrentUser());
    
    const handleAuth = () => setCurrentUser(db.getCurrentUser());
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  const loadProfessors = () => {
    setProfessors(db.getProfessors());
  };

  useEffect(() => {
    if (selectedProf) {
      const updated = professors.find(p => p.id === selectedProf.id);
      if (updated) setSelectedProf(updated);
    }
  }, [professors]);

  const handleAddProfessor = (e) => {
    e.preventDefault();
    if (!newProfName.trim()) return;

    const added = db.addProfessor({
      name: newProfName,
      department: newProfDept,
      attendanceStyle: newProfAttendance
    });

    addToast(`Added professor: "${newProfName}"!`, 'success');
    setShowAddProfModal(false);
    setNewProfName('');
    loadProfessors();
    setSelectedProf(added);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please sign in using your Thapar account to write reviews.', 'danger');
      return;
    }
    if (!comment.trim()) {
      addToast('Please enter a review comment!', 'warning');
      return;
    }

    const res = db.addProfessorReview(selectedProf.id, {
      rating,
      teachingQuality,
      gradingLeniency,
      accessibility,
      attendanceStrictness,
      comment
    });

    if (res.success) {
      addToast('Review submitted anonymously!', 'success');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
      setTeachingQuality(5);
      setGradingLeniency(3);
      setAccessibility(5);
      setAttendanceStrictness(3);
      loadProfessors();
    } else {
      addToast(res.message, 'danger');
    }
  };

  const filteredProfs = professors.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
  });

  // Check if current user has already left a review on the selected professor
  const userHasReviewed = selectedProf && currentUser && selectedProf.reviews.some(r => r.userId === currentUser.id);

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Professor Intelligence</h1>
          <p>Read anonymous reviews on teaching standards, grading policies, and accessibility.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddProfModal(true)}>
          <Plus size={16} /> Add Professor
        </button>
      </header>

      {/* Search Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0 12px',
        marginBottom: '20px'
      }}>
        <Search size={18} style={{ color: 'var(--color-text-muted)', marginRight: '8px' }} />
        <input
          type="text"
          placeholder="Search by professor name or department..."
          className="form-input"
          style={{ border: 'none', background: 'transparent', flex: 1, padding: '12px 4px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        {/* Left Side: Professor List */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">Professors Directory</div>
          
          {filteredProfs.length === 0 ? (
            <div className="card empty-state">
              <h3>No professors found</h3>
              <p>Add a new professor to start gathering reviews.</p>
            </div>
          ) : (
            filteredProfs.map((prof) => (
              <div
                key={prof.id}
                onClick={() => setSelectedProf(prof)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: selectedProf?.id === prof.id ? 'var(--color-primary)' : 'var(--color-border)',
                  padding: '16px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <h4 style={{ fontWeight: 600, fontSize: '0.98rem' }}>{prof.name}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '4px 0 8px' }}>
                  {prof.department}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <RatingStars rating={prof.rating} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {prof.reviewsCount} reviews
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Professor details and review list */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedProf ? (
            <div className="card flex-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{selectedProf.name}</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                    {selectedProf.department}
                  </p>
                </div>
                
                {currentUser ? (
                  userHasReviewed ? (
                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 12px' }}>
                      <ShieldAlert size={14} /> Already Reviewed
                    </span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
                      Write Anonymous Review
                    </button>
                  )
                ) : (
                  <span className="badge badge-danger" style={{ padding: '8px 12px' }}>
                    Sign in to write reviews
                  </span>
                )}
              </div>

              {/* Aggregated ratings breakdown */}
              <div className="grid-2" style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                    {selectedProf.rating || '0.0'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                    <RatingStars rating={selectedProf.rating} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Overall Rating (Teaching, Grading & Access)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>📚 Teaching Quality:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{selectedProf.teachingQuality || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>⚖️ Grading Leniency:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{selectedProf.gradingLeniency || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>🤝 Accessibility:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{selectedProf.accessibility || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>⏰ Attendance Strictness:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{selectedProf.attendanceStrictness || '0.0'}/5</strong>
                  </div>
                </div>
              </div>

              {/* Review feedback list */}
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <MessageSquare size={14} /> Student Testimonials ({selectedProf.reviewsCount})
                </div>

                {selectedProf.reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <AlertCircle size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '6px' }} />
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your academic experience anonymously!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedProf.reviews.map((rev) => (
                      <div key={rev.id} className="review-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            <User size={12} /> Anonymous Student
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {rev.created_at}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px', background: 'var(--color-bg-card)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                          <div>Quality: {rev.teachingQuality}/5</div>
                          <div>Leniency: {rev.gradingLeniency}/5</div>
                          <div>Access: {rev.accessibility}/5</div>
                          <div>Strictness: {rev.attendanceStrictness}/5</div>
                        </div>

                        <p style={{ fontSize: '0.86rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card empty-state" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <User size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
              <h3>No Professor Selected</h3>
              <p>Select a professor from the directory list on the left to inspect reviews.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Professor Modal */}
      {showAddProfModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddProfessor}>
            <div className="modal-header">
              <h2>Add Professor</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddProfModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Khanna"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newProfDept}
                  onChange={(e) => setNewProfDept(e.target.value)}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Basic Sciences (Maths/Physics)">Basic Sciences (Maths/Physics)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Attendance Strictness Policy</label>
                <select
                  className="form-select"
                  value={newProfAttendance}
                  onChange={(e) => setNewProfAttendance(e.target.value)}
                >
                  <option value="Strict 75%">Strict 75% Compliance</option>
                  <option value="Regular checks, strict 75%">Regular checks, strict 75%</option>
                  <option value="Lenient / Hybrid">Lenient / Hybrid</option>
                  <option value="No attendance rules">No attendance rules</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Add Professor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Review Modal */}
      {showReviewModal && selectedProf && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddReview}>
            <div className="modal-header">
              <h2>Review {selectedProf.name}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <RatingInput
                label="Overall Class Rating"
                value={rating}
                onChange={setRating}
              />

              <RatingInput
                label="📚 Teaching Quality"
                value={teachingQuality}
                onChange={setTeachingQuality}
              />

              <RatingInput
                label="⚖️ Grading Leniency (1 = Harsh/Hard, 5 = Chill/Easy)"
                value={gradingLeniency}
                onChange={setGradingLeniency}
              />

              <RatingInput
                label="🤝 Accessibility / Helpfulness"
                value={accessibility}
                onChange={setAccessibility}
              />

              <RatingInput
                label="⏰ Attendance Strictness (1 = Chill/Proxy Allowed, 5 = Exact 75%)"
                value={attendanceStrictness}
                onChange={setAttendanceStrictness}
              />

              <div className="form-group">
                <label className="form-label">Review / Comment</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Share details about lectures, exams, marks checking, lab standards, etc. Keep it anonymous but constructve!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Submit Review Anonymously
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
