import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { RatingStars, RatingInput } from '../components/RatingInput';
import { Search, Plus, Youtube, ThumbsUp, ExternalLink, X } from 'lucide-react';

export default function YoutubeChannels() {
  const { addToast } = useToast();
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected channel for reviews
  const [selectedChan, setSelectedChan] = useState(null);

  // Modals / forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form fields
  const [newChanName, setNewChanName] = useState('');
  const [newChanCreator, setNewChanCreator] = useState('');
  const [newChanSubject, setNewChanSubject] = useState('');
  const [newChanUrl, setNewChanUrl] = useState('');
  const [newChanRating, setNewChanRating] = useState(5);

  // Review comment fields
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = () => {
    setChannels(db.getYoutubeChannels());
  };

  useEffect(() => {
    if (selectedChan) {
      const updated = channels.find(c => c.id === selectedChan.id);
      if (updated) setSelectedChan(updated);
    }
  }, [channels]);

  const handleAddChannel = (e) => {
    e.preventDefault();
    if (!newChanName.trim() || !newChanSubject.trim()) return;

    // Auto prepend https if not present
    let url = newChanUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const added = db.addYoutubeChannel({
      channelName: newChanName,
      creator: newChanCreator || 'Unknown',
      subject: newChanSubject,
      url,
      rating: newChanRating
    });

    addToast(`Submitted YouTube Channel: "${newChanName}"!`, 'success');
    setShowAddModal(false);
    setNewChanName('');
    setNewChanCreator('');
    setNewChanSubject('');
    setNewChanUrl('');
    loadChannels();
    setSelectedChan(added);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    db.addYoutubeReview(selectedChan.id, {
      rating,
      comment
    });

    addToast('Review submitted!', 'success');
    setShowReviewModal(false);
    setComment('');
    setRating(5);
    loadChannels();
  };

  const handleUpvote = (chanId, e) => {
    e.stopPropagation();
    const idx = channels.findIndex(c => c.id === chanId);
    if (idx !== -1) {
      const updated = [...channels];
      updated[idx].votes += 1;
      db.saveYoutubeChannels(updated);
      setChannels(updated);
      addToast('Upvoted resource!', 'success');
    }
  };

  const filteredChans = channels.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.channelName.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>YouTube Channels Directory</h1>
          <p>Discover student-recommended tutorial channels for MST & EST prep.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Suggest Channel
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
          placeholder="Search by channel name or subject..."
          className="form-input"
          style={{ border: 'none', background: 'transparent', flex: 1, padding: '12px 4px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        {/* Left List */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title">YouTube Creators</div>

          {filteredChans.length === 0 ? (
            <div className="card empty-state">
              <h3>No channels found</h3>
              <p>Add a new YouTube creator to help peers.</p>
            </div>
          ) : (
            filteredChans.map((chan) => (
              <div
                key={chan.id}
                onClick={() => setSelectedChan(chan)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: selectedChan?.id === chan.id ? 'var(--color-primary)' : 'var(--color-border)',
                  padding: '16px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.98rem' }}>{chan.channelName}</h4>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => handleUpvote(chan.id, e)}
                  >
                    <ThumbsUp size={12} /> {chan.votes}
                  </button>
                </div>
                
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '4px 0 8px' }}>
                  {chan.subject}
                </div>
                
                <RatingStars rating={chan.rating} />
              </div>
            ))
          )}
        </div>

        {/* Right Details Panel */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedChan ? (
            <div className="card flex-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Youtube color="red" /> {selectedChan.channelName}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                    Creator: {selectedChan.creator} • Subject focus: <strong>{selectedChan.subject}</strong>
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedChan.url && (
                    <a
                      href={selectedChan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Visit Channel <ExternalLink size={14} />
                    </a>
                  )}
                  <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
                    Write Review
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Current Standing
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <RatingStars rating={selectedChan.rating} size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedChan.rating}/5 rating</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                  <span style={{ fontSize: '0.85rem' }}>{selectedChan.votes} helpful votes</span>
                </div>
              </div>

              <div>
                <div className="card-title">Recommended Playlists & Comments ({selectedChan.reviews.length})</div>

                {selectedChan.reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <h3>No comments yet</h3>
                    <p>Tell other Thapar students how this channel helped you save your SGPA.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedChan.reviews.map((rev) => (
                      <div key={rev.id} className="review-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <RatingStars rating={rev.rating} size={12} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Student Vote</span>
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
              <Youtube size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
              <h3>No YouTube Channel Selected</h3>
              <p>Select a creator channel on the left to examine links and study feedback.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Youtube Channel Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddChannel}>
            <div className="modal-header">
              <h2>Suggest YouTube Channel</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Channel Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gate Smashers"
                  value={newChanName}
                  onChange={(e) => setNewChanName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Creator (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Varun Singla"
                  value={newChanCreator}
                  onChange={(e) => setNewChanCreator(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Courses Covered</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operating Systems, DBMS"
                  value={newChanSubject}
                  onChange={(e) => setNewChanSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">YouTube Playlist/Channel URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://youtube.com/..."
                  value={newChanUrl}
                  onChange={(e) => setNewChanUrl(e.target.value)}
                />
              </div>

              <RatingInput
                label="Your Rating"
                value={newChanRating}
                onChange={setNewChanRating}
              />

              <button type="submit" className="btn btn-primary btn-full">
                Add Channel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Review Modal */}
      {showReviewModal && selectedChan && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddReview}>
            <div className="modal-header">
              <h2>Review {selectedChan.channelName}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <RatingInput
                label="Helpfulness Rating"
                value={rating}
                onChange={setRating}
              />

              <div className="form-group">
                <label className="form-label">Review / Recommended Playlist Chapters</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Which playlists are best? Did it help in MSTs or ESTs?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
