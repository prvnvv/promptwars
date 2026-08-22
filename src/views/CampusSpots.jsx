import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { RatingStars, RatingInput } from '../components/RatingInput';
import { Search, Plus, MapPin, Clock, MessageSquare, ShieldAlert, User, X } from 'lucide-react';

export default function CampusSpots() {
  const { addToast } = useToast();
  const [spots, setSpots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Selected spot details
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Modals / forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Add Spot fields
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('food');
  const [newDesc, setNewDesc] = useState('');
  const [newBusyTimes, setNewBusyTimes] = useState('5:00 PM - 8:00 PM');

  // Review parameters (6 specific metrics)
  const [studyable, setStudyable] = useState(3);
  const [couples, setCouples] = useState(3);
  const [food, setFood] = useState(3);
  const [hangout, setHangout] = useState(3);
  const [strictness, setStrictness] = useState(3);
  const [isolation, setIsolation] = useState(3);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadSpots();
    setCurrentUser(db.getCurrentUser());

    const handleAuth = () => setCurrentUser(db.getCurrentUser());
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  const loadSpots = () => {
    setSpots(db.getCampusSpots());
  };

  useEffect(() => {
    if (selectedSpot) {
      const updated = spots.find(s => s.id === selectedSpot.id);
      if (updated) setSelectedSpot(updated);
    }
  }, [spots]);

  const handleAddSpot = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    const added = db.addCampusSpot({
      name: newName,
      category: newCategory,
      description: newDesc,
      busyTimes: newBusyTimes
    });

    addToast(`Suggested spot: "${newName}"!`, 'success');
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
    setNewBusyTimes('5:00 PM - 8:00 PM');
    loadSpots();
    setSelectedSpot(added);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please sign in to write reviews.', 'danger');
      return;
    }
    if (!comment.trim()) {
      addToast('Please write a status comment!', 'warning');
      return;
    }

    const res = db.addSpotReview(selectedSpot.id, {
      studyable,
      couples,
      food,
      hangout,
      strictness,
      isolation,
      comment
    });

    if (res.success) {
      addToast('Review submitted anonymously!', 'success');
      setShowReviewModal(false);
      setComment('');
      setStudyable(3);
      setCouples(3);
      setFood(3);
      setHangout(3);
      setStrictness(3);
      setIsolation(3);
      loadSpots();
    } else {
      addToast(res.message, 'danger');
    }
  };

  const filteredSpots = spots.filter((s) => {
    const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'all' ? true : s.category === activeCategory;
    return matchQuery && matchCat;
  });

  const userHasReviewed = selectedSpot && currentUser && selectedSpot.reviews.some(r => r.userId === currentUser.id);

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Campus Spots Directory</h1>
          <p>Find the best libraries, food plazas, study spaces, and chill hangouts around Thapar.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Suggest Spot
        </button>
      </header>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0 12px',
          flex: 1,
          minWidth: '260px'
        }}>
          <Search size={18} style={{ color: 'var(--color-text-muted)', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search spots by name or keyword..."
            className="form-input"
            style={{ border: 'none', background: 'transparent', flex: 1, padding: '10px 4px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'food', 'study', 'chill'].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {c === 'all' ? 'All Areas' : c === 'food' ? 'Food & Cafes' : c === 'study' ? 'Quiet Study' : 'Chill Hangouts'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        {/* Left List of Spots */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">Campus Spots Directory</div>

          {filteredSpots.length === 0 ? (
            <div className="card empty-state">
              <h3>No spots found</h3>
              <p>Add a new campus area to help students discover it.</p>
            </div>
          ) : (
            filteredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: selectedSpot?.id === spot.id ? 'var(--color-primary)' : 'var(--color-border)',
                  padding: '16px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.98rem' }}>{spot.name}</h4>
                  <span className={`badge ${
                    spot.category === 'food' ? 'badge-primary' :
                    spot.category === 'study' ? 'badge-success' : 'badge-info'
                  }`}>
                    {spot.category}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {spot.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <RatingStars rating={spot.rating} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {spot.reviewsCount} reviews
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Details Panel */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedSpot ? (
            <div className="card flex-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin color="var(--color-primary)" /> {selectedSpot.name}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                    Category: <strong>{selectedSpot.category.toUpperCase()}</strong>
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

              <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {selectedSpot.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
                  <Clock size={14} /> Peak Hours: <strong>{selectedSpot.busyTimes}</strong>
                </div>

                {/* Grid of 6 parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>📖 Study-able:</span>
                    <strong>{selectedSpot.studyable || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>👩‍❤️‍👨 Couples Presence:</span>
                    <strong>{selectedSpot.couples || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>🍔 Food & Drinks:</span>
                    <strong>{selectedSpot.food || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>🎉 Chill / Hangout Vibe:</span>
                    <strong>{selectedSpot.hangout || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>👮 Strictness/Guards:</span>
                    <strong>{selectedSpot.strictness || '0.0'}/5</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>🤫 Isolation/Quietness:</span>
                    <strong>{selectedSpot.isolation || '0.0'}/5</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="card-title">Reviews & Current Status ({selectedSpot.reviews.length})</div>

                {selectedSpot.reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <h3>No reviews yet</h3>
                    <p>Is this spot crowded? Is the food good? Write an anonymous review above!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedSpot.reviews.map((rev) => (
                      <div key={rev.id} className="review-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            <User size={12} /> Anonymous Student
                          </div>
                          <RatingStars rating={rev.rating} size={12} />
                        </div>

                        {/* Parameter breakdown in review */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'var(--color-bg-card)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                          <div>Study: {rev.studyable}/5</div>
                          <div>Couples: {rev.couples}/5</div>
                          <div>Food: {rev.food}/5</div>
                          <div>Hangout: {rev.hangout}/5</div>
                          <div>Strictness: {rev.strictness}/5</div>
                          <div>Isolation: {rev.isolation}/5</div>
                        </div>

                        <p style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
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
              <MapPin size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
              <h3>No Spot Selected</h3>
              <p>Select a location from the campus directory list on the left to view details and reviews.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Spot Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddSpot}>
            <div className="modal-header">
              <h2>Suggest Campus Spot</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Spot Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Nirvana Pool Room"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spot Category</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="food">Food Plaza / Canteen</option>
                  <option value="study">Quiet Study Zone / Reading Room</option>
                  <option value="chill">Chill Area / Sports Spot</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Spot Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Describe location details, quality, Wi-Fi standard, etc."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Peak/Busy Hours</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5:00 PM - 8:00 PM"
                  value={newBusyTimes}
                  onChange={(e) => setNewBusyTimes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Suggest Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Review Modal */}
      {showReviewModal && selectedSpot && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddReview}>
            <div className="modal-header">
              <h2>Review {selectedSpot.name}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <RatingInput
                label="📖 Study-able Environment (1 = Noisy, 5 = Silence/LTS level)"
                value={studyable}
                onChange={setStudyable}
              />

              <RatingInput
                label="👩‍❤️‍👨 Couples/Social Vibe (1 = Empty/Formal, 5 = Highly popular couples spot)"
                value={couples}
                onChange={setCouples}
              />

              <RatingInput
                label="🍔 Food & Refreshment standard (1 = No food/Bad, 5 = Jaggi Level snacks)"
                value={food}
                onChange={setFood}
              />

              <RatingInput
                label="🎉 Chill / Recreational Vibe (1 = Study-only, 5 = Great for hangout/games)"
                value={hangout}
                onChange={setHangout}
              />

              <RatingInput
                label="👮 Strictness & Security checks (1 = Free entry/No guards, 5 = Strict ID/Time checks)"
                value={strictness}
                onChange={setStrictness}
              />

              <RatingInput
                label="🤫 Isolation/Quietness (1 = Fully crowded, 5 = Extremely isolated/peaceful)"
                value={isolation}
                onChange={setIsolation}
              />

              <div className="form-group">
                <label className="form-label">Review / Status Comment</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="What is the current crowd? Are sockets working? How is the food?"
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
