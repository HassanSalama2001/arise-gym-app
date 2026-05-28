import React from 'react';
import BottomSheet from './BottomSheet';
import './ExerciseDetailsSheet.css';

export default function ExerciseDetailsSheet({ exercise, onClose }) {
  if (!exercise) return null;

  const searchQuery = encodeURIComponent(`${exercise.name} exercise tutorial perfect form`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'A': return 'var(--accent-red)';
      case 'B': return 'var(--accent-gold)';
      case 'C': return 'var(--accent-blue)';
      case 'D': return 'var(--success)';
      case 'E': return 'var(--text-secondary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <BottomSheet onClose={onClose} title="EXERCISE DETAILS">
      <div className="exercise-details-container">
        <h2 className="ex-details-name">{exercise.name}</h2>
        
        <div className="ex-tags">
          <span className="ex-chip primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
            {exercise.muscleGroup}
          </span>
          {exercise.difficulty && (
            <span className="ex-chip diff" style={{ borderColor: getDifficultyColor(exercise.difficulty), color: getDifficultyColor(exercise.difficulty) }}>
              Level {exercise.difficulty}
            </span>
          )}
        </div>

        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <div className="ex-secondary-muscles">
            <span className="ex-section-label">SECONDARY</span>
            <div className="ex-chip-group">
              {exercise.secondaryMuscles.map(m => (
                <span key={m} className="ex-chip secondary">{m}</span>
              ))}
            </div>
          </div>
        )}

        <div className="ex-visual-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/>
            <path d="M6 12l2-3 4-1 4 1 2 3"/>
            <path d="M12 11v6"/>
            <path d="M10 22v-5l2-2 2 2v5"/>
          </svg>
          <span>Anatomical Visual Coming Soon</span>
        </div>

        <div className="ex-instructions-section">
          <span className="ex-section-label">INSTRUCTIONS</span>
          <ol className="ex-instructions-list">
            {(exercise.instructions || []).map((step, idx) => (
              <li key={idx}>
                <span className="step-num">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <a 
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="watch-tutorial-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
          </svg>
          WATCH TUTORIAL
        </a>
      </div>
    </BottomSheet>
  );
}
