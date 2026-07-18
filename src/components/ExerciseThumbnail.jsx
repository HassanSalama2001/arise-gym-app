import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { getExerciseVisuals } from '../utils/exerciseImages';

export default function ExerciseThumbnail({ exercise, style }) {
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const [visuals, setVisuals] = useState(null);

  useEffect(() => {
    let activeUrls = [];
    async function loadVisuals() {
      if (!profile) return;
      const mode = profile.visualsMode || 'images';
      const result = await getExerciseVisuals(exercise, mode);
      if (result) {
        if (result.type === 'gif') {
          const url = URL.createObjectURL(result.blob);
          activeUrls.push(url);
          setVisuals({ type: 'gif', url });
        } else if (result.type === 'images') {
          const url0 = URL.createObjectURL(result.blob0);
          activeUrls.push(url0);
          setVisuals({ type: 'images', url: url0 }); // Just use first image as thumbnail
        }
      }
    }
    loadVisuals();
    return () => {
      activeUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [exercise?.id, exercise?.name, exercise?.videoUri, profile]);

  if (!visuals) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: 8 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ ...style, overflow: 'hidden', borderRadius: 8 }}>
      <img src={visuals.url} alt={exercise?.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
    </div>
  );
}
