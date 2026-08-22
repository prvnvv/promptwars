import React, { useMemo } from 'react';
import { Star } from 'lucide-react';

/**
 * Display-only star rating component
 */
export function RatingStars({ rating, size = 16 }) {
  const rounded = Math.round(rating);
  
  return (
    <div className="stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rounded ? 'star-filled' : 'star-empty'}
          fill={s <= rounded ? '#F59E0B' : 'transparent'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Interactive rating input component with full accessibility
 */
export function RatingInput({ value, onChange, label, size = 24, name }) {
  // Memoize the rating buttons to prevent unnecessary re-renders
  const buttons = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => ({
      star,
      id: `rating-${name}-${star}`,
      ariaLabel: `Rate ${star} out of 5`,
      isSelected: star <= value
    }));
  }, [value, name]);

  const handleKeyDown = (e, starValue) => {
    // Allow keyboard navigation
    if (e.key === 'ArrowRight' && starValue < 5) {
      onChange(starValue + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && starValue > 1) {
      onChange(starValue - 1);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      onChange(starValue);
      e.preventDefault();
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '12px' }}>
      {label && (
        <label htmlFor={`rating-${name}-label`} className="form-label">
          {label}
        </label>
      )}
      <div 
        role="group" 
        aria-labelledby={label ? `rating-${name}-label` : undefined}
        style={{ display: 'flex', gap: '8px' }}
      >
        {buttons.map(({ star, id, ariaLabel, isSelected }) => (
          <button
            key={star}
            id={id}
            type="button"
            onClick={() => onChange(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            aria-label={ariaLabel}
            aria-pressed={isSelected}
            className={isSelected ? 'star-button-selected' : 'star-button'}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Star
              size={size}
              className={isSelected ? 'star-filled' : 'star-empty'}
              fill={isSelected ? '#F59E0B' : 'transparent'}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <div className="form-hint" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
        Use arrow keys to adjust, Enter to confirm. Current rating: {value}/5
      </div>
    </div>
  );
}
