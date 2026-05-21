import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import templates from '../data/templates.json';
import { useAlert } from '../context/AlertContext';
import './WorkoutsScreen.css';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const DIFFICULTY_MAP = {
  E: { label: 'Beginner', cls: 'chip-green' },
  D: { label: 'Intermediate', cls: 'chip-gold' },
  C: { label: 'Advanced', cls: 'chip-red' },
};

function ExerciseCard({ exercise, onClick }) {
  const diff = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.E;
  return (
    <div
      className="exercise-card card"
      onClick={onClick}
      id={`exercise-${exercise.id}`}
    >
      <div className="exercise-card-main">
        <div className="exercise-card-info">
          <span className="exercise-name">{exercise.name}</span>
          <div className="exercise-chips">
            <span className="chip chip-blue">{exercise.muscleGroup}</span>
            <span className={`chip ${diff.cls}`}>{diff.label}</span>
          </div>
        </div>
        <svg className="exercise-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
        <div className="exercise-secondary">
          <span className="section-label">Also: {exercise.secondaryMuscles.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, exerciseCount, onDelete, onClick }) {
  const { showConfirm } = useAlert();
  const [swipedLeft, setSwipedLeft] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  function handleTouchStart(e) { setTouchStartX(e.touches[0].clientX); }
  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (dx > 60) setSwipedLeft(true);
    else if (dx < -20) setSwipedLeft(false);
    setTouchStartX(null);
  }

  return (
    <div className="plan-card-wrapper" onClick={onClick}>
      <motion.div
        className="plan-card card"
        animate={{ x: swipedLeft ? -80 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="plan-card-top">
          <span className="plan-name">{plan.name}</span>
          <span className="chip chip-blue">{exerciseCount} exercises</span>
        </div>
        <div className="plan-card-meta">
          <span className="section-label">Created {new Date(plan.createdAt).toLocaleDateString()}</span>
        </div>
      </motion.div>
      <AnimatePresence>
        {swipedLeft && (
          <motion.button
            className="plan-delete-btn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={async () => {
              const confirmed = await showConfirm(`Are you sure you want to delete "${plan.name}"?`, 'Delete Plan?', { danger: true });
              if (confirmed) {
                onDelete(plan.id);
              }
              setSwipedLeft(false);
            }}
          >
            Delete
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function CreatePlanSheet({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    await db.workoutPlans.add({ name: name.trim(), createdAt: Date.now() });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <motion.div
      className="bottom-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bottom-sheet"
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className="bottom-sheet-handle" />
        <h3 className="sheet-title">CREATE PLAN</h3>
        <div className="sheet-field">
          <label className="section-label" htmlFor="plan-name-input">PLAN NAME</label>
          <input
            id="plan-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Push Day, Full Body..."
            style={{ marginTop: 8 }}
            autoFocus
          />
        </div>
        <div className="sheet-actions" style={{ marginTop: 24, paddingBottom: 24 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>CANCEL</button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            style={{ flex: 2 }}
          >
            {saving ? 'SAVING...' : 'CREATE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateExerciseSheet({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    await db.exercises.add({
      name: name.trim(),
      muscleGroup,
      difficulty: 'E',
      equipment: 'Any',
      instructions: ['Custom exercise.'],
      mistakes: [],
      tips: [],
      secondaryMuscles: []
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <motion.div
      className="bottom-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bottom-sheet"
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className="bottom-sheet-handle" />
        <h3 className="sheet-title">CREATE EXERCISE</h3>
        <div className="sheet-field">
          <label className="section-label" htmlFor="ex-name-input">EXERCISE NAME</label>
          <input
            id="ex-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Weighted Pull-Up"
            style={{ marginTop: 8 }}
            autoFocus
          />
        </div>
        <div className="sheet-field" style={{ marginTop: 16 }}>
          <label className="section-label" htmlFor="ex-muscle-select">MUSCLE GROUP</label>
          <select 
            id="ex-muscle-select"
            value={muscleGroup}
            onChange={e => setMuscleGroup(e.target.value)}
            style={{ 
              marginTop: 8, width: '100%', padding: '12px', 
              background: 'var(--bg-void)', border: '1px solid var(--border)', 
              color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-display)', fontWeight: 700
            }}
          >
            {MUSCLE_GROUPS.filter(g => g !== 'All').map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="sheet-actions" style={{ marginTop: 24, paddingBottom: 24 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>CANCEL</button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            style={{ flex: 2 }}
          >
            {saving ? 'SAVING...' : 'CREATE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WorkoutsScreen() {
  const { showConfirm, showAlert, showToast } = useAlert();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('exercises');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  // Reset pagination when searching or filtering
  React.useEffect(() => {
    setVisibleCount(30);
  }, [search, filter]);

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const plans = useLiveQuery(() => db.workoutPlans.orderBy('createdAt').reverse().toArray(), []);
  const planExercises = useLiveQuery(() => db.planExercises.toArray(), []);

  const isLoading = exercises === undefined;

  const filtered = useMemo(() => {
    if (!exercises) return []; // Still loading
    try {
      return exercises.filter(ex => {
        if (!ex) return false;
        const matchSearch = !search || (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));
        const matchFilter = filter === 'All' || ex.muscleGroup === filter;
        return matchSearch && matchFilter;
      });
    } catch (e) {
      console.error('Filter error:', e);
      return [];
    }
  }, [exercises, search, filter]);

  const planExerciseCount = useMemo(() => {
    if (!planExercises) return {};
    return planExercises.reduce((acc, pe) => {
      acc[pe.planId] = (acc[pe.planId] || 0) + 1;
      return acc;
    }, {});
  }, [planExercises]);

  async function handleDeletePlan(id) {
    await db.planExercises.where('planId').equals(id).delete();
    await db.workoutPlans.delete(id);
  }

  return (
    <div className="screen" id="workouts-screen">
      <div className="screen-content">
        {/* Header */}
        <div className="workouts-header">
          <h1 className="screen-title">WORKOUTS</h1>
          {activeTab === 'plans' && (
            <button
              className="icon-btn"
              onClick={() => setShowCreatePlan(true)}
              aria-label="Create Plan"
              id="create-plan-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          )}
          {activeTab === 'exercises' && (
            <button
              className="icon-btn"
              onClick={() => setShowCreateExercise(true)}
              aria-label="Create Exercise"
              id="create-exercise-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="tab-pills" id="workout-tabs">
          <button
            className={`tab-pill ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
            id="tab-exercises"
          >EXERCISES</button>
          <button
            className={`tab-pill ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
            id="tab-plans"
          >MY PLANS</button>
          <button
            className={`tab-pill ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
            id="tab-discover"
          >DISCOVER</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'exercises' ? (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search */}
              <div className="search-bar-wrapper">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  id="exercise-search"
                  className="search-input"
                  type="search"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>

              {/* Filter chips */}
              <div className="filter-chips" id="muscle-filters">
                {MUSCLE_GROUPS.map(g => (
                  <button
                    key={g}
                    className={`filter-chip ${filter === g ? 'active' : ''}`}
                    onClick={() => setFilter(g)}
                    id={`filter-${g.toLowerCase()}`}
                  >{g}</button>
                ))}
              </div>

              {/* Exercise count */}
              <div className="results-count">
                <span className="section-label">{filtered.length} EXERCISES</span>
              </div>

              {/* Exercise list */}
              <div 
                className="exercise-list" 
                style={{ minHeight: '400px' }}
              >
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shimmer card" style={{ height: 80, borderRadius: 'var(--radius-md)', marginBottom: 12 }} />
                  ))
                ) : (
                  <>
                    {filtered.slice(0, visibleCount).map((ex, i) => (
                      <div
                        key={ex.id}
                        className="exercise-card-animate"
                        style={{ animationDelay: `${Math.min(i * 0.015, 0.2)}s`, opacity: 0 }}
                      >
                        <ExerciseCard
                          exercise={ex}
                          onClick={() => navigate(`/exercise/${ex.id}`)}
                        />
                      </div>
                    ))}
                    
                    {filtered.length > visibleCount && (
                      <button 
                        className="btn-ghost" 
                        style={{ marginTop: 12, padding: '16px' }} 
                        onClick={() => setVisibleCount(prev => prev + 50)}
                      >
                        LOAD MORE (+{filtered.length - visibleCount})
                      </button>
                    )}

                    {filtered.length === 0 && (
                      <div className="empty-state">
                        <span style={{ fontSize: 32 }}>🔍</span>
                        <p>No exercises found</p>
                        <span className="section-label">Try a different search or filter</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'plans' ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {plans && plans.length > 0 ? (
                <div className="plans-list">
                  {plans.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      exerciseCount={planExerciseCount[plan.id] || 0}
                      onDelete={handleDeletePlan}
                      onClick={async () => {
                        const confirmed = await showConfirm(`Start training with "${plan.name}"?`, 'Start Workout?');
                        if (confirmed) {
                          navigate('/log', { state: { planId: plan.id } });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span style={{ fontSize: 40 }}>📋</span>
                  <p>No plans yet</p>
                  <span className="section-label">Tap + to create your first plan</span>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 16, width: 'auto', padding: '12px 32px' }}
                    onClick={() => setShowCreatePlan(true)}
                    id="create-first-plan-btn"
                  >CREATE PLAN</button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="plans-list mt-8">
                {templates.map(tpl => (
                  <div key={tpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, color: 'var(--text-primary)' }}>{tpl.name}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {tpl.exercises.length} Exercises included
                      </p>
                    </div>
                    <button 
                      className="btn-primary" 
                      onClick={async () => {
                        const planId = await db.workoutPlans.add({ name: tpl.name, createdAt: Date.now() });
                        const pes = tpl.exercises.map((e, i) => ({
                          planId,
                          exerciseId: e.exerciseId,
                          order: i
                        }));
                        await db.planExercises.bulkAdd(pes);
                        showToast(`Cloned "${tpl.name}" successfully!`);
                        setActiveTab('plans');
                      }}
                    >
                      CLONE TO MY PLANS
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Plan Sheet */}
      <AnimatePresence>
        {showCreatePlan && (
          <CreatePlanSheet
            onClose={() => setShowCreatePlan(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Create Exercise Sheet */}
      <AnimatePresence>
        {showCreateExercise && (
          <CreateExerciseSheet
            onClose={() => setShowCreateExercise(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
