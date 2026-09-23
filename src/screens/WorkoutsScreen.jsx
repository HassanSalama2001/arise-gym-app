import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import templates from '../data/templates.json';
import { TRAINED_MUSCLE_GROUPS } from '../data/muscleGroups';
import { useAlert } from '../context/useAlert';
import posturalIssues, { categories as correctiveCategories } from '../data/posturalIssues';
import PosturalIssueDetail from '../components/PosturalIssueDetail';
import BottomSheet from '../components/BottomSheet';
import CreateCustomExerciseSheet from '../components/CreateCustomExerciseSheet';
import CreateCorrectiveSheet from '../components/CreateCorrectiveSheet';
import './WorkoutsScreen.css';

const MUSCLE_GROUPS = ['All', ...TRAINED_MUSCLE_GROUPS, 'Cardio'];

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
    <BottomSheet
      onClose={onClose}
      title="CREATE PLAN"
      footer={
        <div className="sheet-actions" style={{ display: 'flex', gap: 8 }}>
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
      }
    >
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
    </BottomSheet>
  );
}

export default function WorkoutsScreen() {
  const { showToast } = useAlert();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('exercises');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [showCreateCorrective, setShowCreateCorrective] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const [correctiveFilter, setCorrectiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  const trackedIssues = useLiveQuery(() => db.userPosturalIssues.toArray(), []);
  const customIssues = useLiveQuery(() => db.customPosturalIssues.toArray(), []);

  const allPosturalIssues = useMemo(() => {
    return [...posturalIssues, ...(customIssues || [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [customIssues]);

  // Reset pagination when the search or filter changes
  const [pagedFor, setPagedFor] = useState({ search, filter });
  if (pagedFor.search !== search || pagedFor.filter !== filter) {
    setPagedFor({ search, filter });
    setVisibleCount(30);
  }

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const plans = useLiveQuery(async () => {
    const list = await db.workoutPlans.toArray();
    return list.sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeB !== timeA) return timeB - timeA;
      return a.name.localeCompare(b.name);
    });
  }, []);
  const planExercises = useLiveQuery(() => db.planExercises.toArray(), []);

  const isLoading = exercises === undefined;

  const filtered = useMemo(() => {
    if (!exercises) return []; // Still loading
    try {
      const res = exercises.filter(ex => {
        if (!ex) return false;
        const matchSearch = !search || (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));
        const matchFilter = filter === 'All' || ex.muscleGroup === filter;
        return matchSearch && matchFilter;
      });
      return res.sort((a, b) => a.name.localeCompare(b.name));
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
            className={`tab-pill ${activeTab === 'corrective' ? 'active' : ''}`}
            onClick={() => setActiveTab('corrective')}
            id="tab-corrective"
          >CORRECTIVE</button>
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

              <div style={{ marginTop: 16 }}>
                <button 
                  className="btn-ghost btn-dashed-gold"
                  onClick={() => setShowCreateExercise(true)}
                >
                  + ADD CUSTOM EXERCISE
                </button>
              </div>

              {/* Exercise count */}
              <div className="section mt-16" style={{ marginBottom: 8 }}>
                <span className="section-label">EXERCISE LIBRARY ({filtered.length})</span>
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
              <div style={{ marginBottom: 16 }}>
                <button 
                  className="btn-ghost btn-dashed-gold"
                  onClick={() => setShowCreatePlan(true)}
                >
                  + CREATE NEW PLAN
                </button>
              </div>

              {plans && plans.length > 0 ? (
                <>
                  <div className="section mt-16" style={{ marginBottom: 8 }}>
                    <span className="section-label">MY TRAINING PLANS ({plans.length})</span>
                  </div>
                  <div className="plans-list">
                    {plans.map(plan => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        exerciseCount={planExerciseCount[plan.id] || 0}
                        onDelete={handleDeletePlan}
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <span style={{ fontSize: 40 }}>📋</span>
                  <p>No plans yet</p>
                  <span className="section-label">Create your first custom training plan above</span>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'corrective' ? (
            <motion.div
              key="corrective"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Category Filters */}
              <div className="filter-chips" id="corrective-filters">
                {correctiveCategories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip ${correctiveFilter === cat ? 'active' : ''}`}
                    onClick={() => setCorrectiveFilter(cat)}
                    id={`corrective-filter-${cat.toLowerCase().replace(' ', '-')}`}
                  >{cat}</button>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <button 
                  className="btn-ghost btn-dashed-gold"
                  onClick={() => setShowCreateCorrective(true)}
                >
                  + ADD CUSTOM CORRECTIVE
                </button>
              </div>

              {/* Tracked Plans Section */}
              {trackedIssues && trackedIssues.length > 0 && (
                <div className="section mt-16">
                  <span className="section-label">MY ACTIVE CORRECTIVE PLANS</span>
                  <div className="plans-list mt-8">
                    {trackedIssues.map(record => {
                      const issueData = allPosturalIssues.find(p => p.id === record.issueId);
                      if (!issueData) return null;
                      const progress = Math.min(100, (record.completedSessions / record.targetSessions) * 100);
                      const isCompleted = record.status === 'resolved';

                      return (
                        <div
                          key={record.id}
                          className="plan-card card"
                          onClick={() => setSelectedIssue(issueData)}
                          style={{ borderLeft: isCompleted ? '3px solid #4caf50' : '3px solid var(--accent-gold)' }}
                        >
                          <div className="plan-card-top">
                            <span className="plan-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{issueData.icon}</span> {issueData.name}
                            </span>
                            <span className="chip chip-gold" style={{ fontSize: 11 }}>
                              {record.completedSessions} / {record.targetSessions} SESSIONS
                            </span>
                          </div>
                          
                          <div className="progress-bar-bg mt-8">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${progress}%`,
                                background: isCompleted ? '#4caf50' : 'linear-gradient(90deg, var(--accent-gold), #ffc107)' 
                              }}
                            />
                          </div>
                          <div className="plan-card-meta mt-8" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span className="section-label">Timing: {record.position === 'both' ? 'Warm-up & Cool-down' : record.position === 'warmup' ? 'Warm-up' : 'Cool-down'}</span>
                            <span className="section-label" style={{ color: isCompleted ? '#4caf50' : 'var(--text-secondary)' }}>
                              {isCompleted ? 'RESOLVED' : `${record.targetSessions - record.completedSessions} sessions left`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Issues Library */}
              <div className="section mt-24">
                <span className="section-label">POSTURAL LIBRARY ({allPosturalIssues.filter(issue => correctiveFilter === 'All' || issue.category === correctiveFilter).length})</span>
                <div className="plans-list mt-8">
                  {allPosturalIssues
                    .filter(issue => correctiveFilter === 'All' || issue.category === correctiveFilter)
                    .map(issue => {
                      const isTracked = trackedIssues && trackedIssues.some(ti => ti.issueId === issue.id && ti.status === 'active');
                      return (
                        <div
                          key={issue.id}
                          className="plan-card card"
                          onClick={() => setSelectedIssue(issue)}
                          style={{ opacity: isTracked ? 0.7 : 1 }}
                        >
                          <div className="plan-card-top">
                            <span className="plan-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 20 }}>{issue.icon}</span>
                              {issue.name}
                            </span>
                            {isTracked && <span className="chip chip-gold" style={{ fontSize: 10 }}>ACTIVE</span>}
                          </div>
                          <div className="plan-card-meta" style={{ display: 'flex', gap: 12 }}>
                            <span className="section-label">{issue.category}</span>
                            <span className="section-label">•</span>
                            <span className="section-label">{issue.timeline} duration</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="section mt-16" style={{ marginBottom: 8 }}>
                <span className="section-label">DISCOVER TEMPLATES ({templates.length})</span>
              </div>
              <div className="plans-list">
                {templates.slice().sort((a, b) => a.name.localeCompare(b.name)).map(tpl => (
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
                          order: i,
                          targetSets: e.targetSets || 3,
                          targetReps: e.targetReps || 10
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
          <CreateCustomExerciseSheet
            onClose={() => setShowCreateExercise(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Postural Issue Detail Sheet */}
      <AnimatePresence>
        {selectedIssue && (
          <PosturalIssueDetail
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Corrective Sheet */}
      <AnimatePresence>
        {showCreateCorrective && (
          <CreateCorrectiveSheet
            onClose={() => setShowCreateCorrective(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
