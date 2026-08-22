import React from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ rating, size = 16 }) {
  const rounded = Math.round(rating);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rounded ? 'star-filled' : 'star-empty'}
          fill={s <= rounded ? '#F59E0B' : 'transparent'}
        />
      ))}
    </div>
  );
}

export function RatingInput({ value, onChange, label, size = 24 }) {
  return (
    <div className="form-group" style={{ marginBottom: '12px' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <Star
              size={size}
              className={star <= value ? 'star-filled' : 'star-empty'}
              fill={star <= value ? '#F59E0B' : 'transparent'}
              style={{ transition: 'transform 0.1s ease', cursor: 'pointer' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
