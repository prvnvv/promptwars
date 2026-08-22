import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { RatingStars } from '../components/RatingInput';
import { Search, Plus, BookOpen, Download, Link, X } from 'lucide-react';

export default function StudyResources() {
  const { addToast } = useToast();
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('notes');
  const [url, setUrl] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    setResources(db.getStudyResources());
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    db.addStudyResource({
      title,
      subject,
      type,
      url: cleanUrl || '#'
    });

    addToast(`Uploaded Study Resource: "${title}"!`, 'success');
    setShowAddModal(false);
    setTitle('');
    setSubject('');
    setType('notes');
    setUrl('');
    loadResources();
  };

  const handleDownload = (resId, e) => {
    // Increment download count locally
    const idx = resources.findIndex(r => r.id === resId);
    if (idx !== -1) {
      const updated = [...resources];
      updated[idx].downloads += 1;
      db.saveStudyResources(updated);
      setResources(updated);
      addToast('Download started / link copied!', 'success');
    }
  };

  const filteredRes = resources.filter((res) => {
    const matchQuery = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       res.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = activeType === 'all' ? true : res.type === activeType;
    return matchQuery && matchType;
  });

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Study Resources Library</h1>
          <p>Handwritten class notes, EST & MST previous year question papers (PYQs), and syllabus textbooks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Share Resource
        </button>
      </header>

      {/* Filter and search block */}
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
            placeholder="Search notes by subject or topic name..."
            className="form-input"
            style={{ border: 'none', background: 'transparent', flex: 1, padding: '10px 4px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'notes', 'pyq', 'book'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`btn btn-sm ${activeType === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {t === 'pyq' ? 'PYQs' : t === 'notes' ? 'Class Notes' : t === 'book' ? 'Textbooks' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {filteredRes.length === 0 ? (
        <div className="card empty-state">
          <BookOpen size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '10px' }} />
          <h3>No study materials found</h3>
          <p>Try searching for another subject or upload resource notes yourself.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredRes.map((res) => (
            <div key={res.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${
                    res.type === 'notes' ? 'badge-success' :
                    res.type === 'pyq' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {res.type === 'notes' ? 'Notes' : res.type === 'pyq' ? 'PYQ' : 'Textbook'}
                  </span>
                  
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Uploaded: {res.uploadedBy || 'Anonymous'}
                  </span>
                </div>

                <h3 style={{ fontWeight: 600, fontSize: '1rem', marginTop: '10px', lineHeight: 1.4 }}>
                  {res.title}
                </h3>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Course Code: <strong>{res.subject}</strong>
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: '10px',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RatingStars rating={res.rating} size={14} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ({res.downloads} downloads)
                  </span>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleDownload(res.id, e)}
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> Get Link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal-body" onSubmit={handleAddResource}>
            <div className="modal-header">
              <h2>Share Study Resource</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-col">
              <div className="form-group">
                <label className="form-label">Resource Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UMA003 Math MST handwritten summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Code / Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UMA003 (Mathematics-I)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resource Category</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="notes">Lecture / Handwritten Notes</option>
                  <option value="pyq">Previous Year Papers (MST/EST)</option>
                  <option value="book">Reference PDF Textbook</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Link (Google Drive / OneDrive / GitHub)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://drive.google.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Upload Resource Info
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
