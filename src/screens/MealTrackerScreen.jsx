import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getToday } from '../utils/date';
import BottomSheet from '../components/BottomSheet';
import { useAlert } from '../context/AlertContext';
import { playClickSound } from '../utils/audio';
import { hapticClick } from '../utils/haptics';
import './MealTrackerScreen.css';

export default function MealTrackerScreen() {
  const navigate = useNavigate();
  const { showAlert, showConfirm, showToast } = useAlert();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [activeMealSheet, setActiveMealSheet] = useState(null); // 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  const [activeCustomWater, setActiveCustomWater] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Form states for adding meal
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Form states for custom water
  const [waterAmount, setWaterAmount] = useState('250');

  // Query logs from Dexie
  const loggedMeals = useLiveQuery(
    () => db.meals.where('date').equals(selectedDate).toArray(),
    [selectedDate]
  );
  const loggedHydration = useLiveQuery(
    () => db.hydration.where('date').equals(selectedDate).toArray(),
    [selectedDate]
  );
  
  // Suggestions from DB
  const suggestions = useLiveQuery(() => db.mealSuggestions.toArray(), []);

  // Compute totals
  const totalCalories = loggedMeals ? loggedMeals.reduce((acc, m) => acc + (parseFloat(m.calories) || 0), 0) : 0;
  const totalProtein = loggedMeals ? loggedMeals.reduce((acc, m) => acc + (parseFloat(m.protein) || 0), 0) : 0;
  const totalCarbs = loggedMeals ? loggedMeals.reduce((acc, m) => acc + (parseFloat(m.carbs) || 0), 0) : 0;
  const totalFat = loggedMeals ? loggedMeals.reduce((acc, m) => acc + (parseFloat(m.fat) || 0), 0) : 0;

  const calorieTarget = profile?.calorieGoal || 2000;
  const proteinTarget = profile?.proteinGoal || 150;
  const carbsTarget = profile?.carbsGoal || 250;
  const fatTarget = profile?.fatGoal || 70;
  const waterTarget = profile?.waterGoal || 3000;

  const totalWater = loggedHydration ? loggedHydration.reduce((acc, h) => acc + (parseInt(h.amountMl) || 0), 0) : 0;

  // Handle adding meal
  const handleAddMeal = async (type) => {
    if (!foodName.trim()) {
      await showAlert('Please enter a food name.', 'Validation Error');
      return;
    }
    
    playClickSound();
    hapticClick();

    await db.meals.add({
      date: selectedDate,
      type,
      foodName: foodName.trim(),
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      createdAt: Date.now()
    });

    showToast(`Logged ${foodName.trim()} to ${type}`);
    resetMealForm();
  };

  const resetMealForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setActiveMealSheet(null);
  };

  // Handle deleting meal
  const handleDeleteMeal = async (id, name) => {
    const confirmed = await showConfirm(`Are you sure you want to delete "${name}"?`, 'Delete Log?');
    if (!confirmed) return;

    playClickSound();
    hapticClick();

    await db.meals.delete(id);
    showToast(`Deleted ${name}`);
  };

  // Handle quick water log
  const handleLogWater = async (amount) => {
    playClickSound();
    hapticClick();

    await db.hydration.add({
      date: selectedDate,
      amountMl: parseInt(amount),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`Logged +${amount}ml Water`);
    setActiveCustomWater(false);
  };

  // Handle delete water log
  const handleDeleteWater = async (id, amount) => {
    const confirmed = await showConfirm(`Delete water log of ${amount}ml?`, 'Delete Log?');
    if (!confirmed) return;

    playClickSound();
    hapticClick();

    await db.hydration.delete(id);
    showToast('Deleted water log');
  };

  // Get dynamic suggestions for active category
  const getSuggestionsForType = (type) => {
    if (!suggestions) return [];
    return suggestions.filter(s => s.mealType === type);
  };

  const applySuggestion = (suggestion) => {
    setFoodName(suggestion.name);
    setCalories(suggestion.calories || '');
    setProtein(suggestion.protein || '');
    setCarbs(suggestion.carbs || '');
    setFat(suggestion.fat || '');
  };

  // Format date headers
  const getDisplayDate = () => {
    const today = getToday();
    if (selectedDate === today) return 'TODAY';
    
    const d = new Date(selectedDate);
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  };

  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="screen" id="meal-tracker-screen">
      <div className="screen-content">
        {/* Header with Nav */}
        <div className="meal-tracker-header">
          <button className="icon-btn back-btn" onClick={() => navigate('/')} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1 className="screen-title">NUTRITION CHAMBER</h1>
          <div style={{ width: 44 }} /> {/* Spacer */}
        </div>

        {/* Date Navigator */}
        <div className="date-navigator card">
          <button className="date-nav-btn" onClick={() => adjustDate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="date-display">{getDisplayDate()}</span>
          <button className="date-nav-btn" onClick={() => adjustDate(1)} disabled={selectedDate === getToday()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Summary Dashboard */}
        <div className="nutrition-dashboard mt-16">
          <div className="summary-card card card-glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-label">DAILY CALORIE SUM</span>
              {profile?.nutritionGoalType && (
                <span className="goal-type-badge font-display" style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: profile.nutritionGoalType === 'cut' ? 'rgba(255, 68, 68, 0.15)' : profile.nutritionGoalType === 'bulk' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(79, 195, 247, 0.15)',
                  color: profile.nutritionGoalType === 'cut' ? 'var(--accent-red)' : profile.nutritionGoalType === 'bulk' ? 'var(--success)' : 'var(--accent-blue)',
                  border: `1px solid ${profile.nutritionGoalType === 'cut' ? 'rgba(255, 68, 68, 0.3)' : profile.nutritionGoalType === 'bulk' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(79, 195, 247, 0.3)'}`,
                  letterSpacing: '0.05em'
                }}>
                  {profile.nutritionGoalType === 'cut' ? '🔥 CUT' : profile.nutritionGoalType === 'bulk' ? '💪 BULK' : '⚖️ MAINTAIN'}
                </span>
              )}
            </div>
            
            <div className="calorie-summary-val mt-8" style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="value stat-number">{Math.round(totalCalories)}</span>
              <span className="unit" style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/ {calorieTarget} KCAL</span>
            </div>

            {/* Calorie Progress Bar */}
            <div className="calorie-progress-bar-container mt-12" style={{ width: '100%' }}>
              <div className="progress-bar" style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min((totalCalories / calorieTarget) * 100, 100)}%`, 
                    background: 'linear-gradient(90deg, var(--accent-blue), #00E676)',
                    boxShadow: '0 0 8px var(--accent-blue-dim)'
                  }} 
                />
              </div>
            </div>

            {/* Macros breakdown */}
            <div className="macros-breakdown mt-16">
              <div className="macro-bar-item">
                <span className="macro-label">PROTEIN</span>
                <div className="macro-progress-track">
                  <div className="macro-progress-fill protein-fill" style={{ width: `${Math.min((totalProtein / proteinTarget) * 100, 100)}%` }} />
                </div>
                <span className="macro-value">{Math.round(totalProtein)}g / {proteinTarget}g</span>
              </div>
              <div className="macro-bar-item mt-8">
                <span className="macro-label">CARBS</span>
                <div className="macro-progress-track">
                  <div className="macro-progress-fill carbs-fill" style={{ width: `${Math.min((totalCarbs / carbsTarget) * 100, 100)}%` }} />
                </div>
                <span className="macro-value">{Math.round(totalCarbs)}g / {carbsTarget}g</span>
              </div>
              <div className="macro-bar-item mt-8">
                <span className="macro-label">FATS</span>
                <div className="macro-progress-track">
                  <div className="macro-progress-fill fat-fill" style={{ width: `${Math.min((totalFat / fatTarget) * 100, 100)}%` }} />
                </div>
                <span className="macro-value">{Math.round(totalFat)}g / {fatTarget}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Tracker */}
        <div className="hydration-section mt-16 card">
          <div className="hydration-header">
            <div>
              <span className="section-label">HYDRATION STATUS</span>
              <div className="hydration-stats mt-4">
                <span className="water-value stat-number">{totalWater}</span>
                <span className="water-target"> / {waterTarget} ml</span>
              </div>
            </div>
            <span style={{ fontSize: 32 }}>💧</span>
          </div>

          <div className="hydration-bar mt-12">
            <div className="progress-bar">
              <div className="progress-fill water-fill" style={{ width: `${Math.min((totalWater / waterTarget) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="water-quick-logs mt-16">
            <button className="btn-ghost water-quick-btn" onClick={() => handleLogWater(250)}>+250ml</button>
            <button className="btn-ghost water-quick-btn" onClick={() => handleLogWater(500)}>+500ml</button>
            <button className="btn-ghost water-quick-btn" onClick={() => handleLogWater(750)}>+750ml</button>
            <button className="btn-ghost water-quick-btn" onClick={() => setActiveCustomWater(true)}>CUSTOM</button>
          </div>

          {loggedHydration && loggedHydration.length > 0 && (
            <div className="water-history-list mt-12">
              <span className="section-label" style={{ fontSize: 9 }}>HYDRATION LOGS:</span>
              <div className="water-logs-scroller mt-4">
                {loggedHydration.map(h => (
                  <div key={h.id} className="water-log-tag">
                    <span>{h.amountMl}ml ({h.time})</span>
                    <button className="delete-log-tag-btn" onClick={() => handleDeleteWater(h.id, h.amountMl)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meal Categories */}
        <div className="meals-section mt-24">
          <span className="section-label">MEAL TRACKER PROTOCOL</span>
          
          {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
            const mealsOfType = loggedMeals ? loggedMeals.filter(m => m.type === mealType) : [];
            const categoryCalories = mealsOfType.reduce((acc, m) => acc + m.calories, 0);

            return (
              <div key={mealType} className="meal-category-card card mt-12">
                <div className="meal-cat-header">
                  <div>
                    <h3 className="meal-cat-title">{mealType.toUpperCase()}</h3>
                    <span className="meal-cat-sub font-display">{categoryCalories} kcal logged</span>
                  </div>
                  <button className="btn-ghost add-meal-cat-btn" onClick={() => setActiveMealSheet(mealType)}>
                    + ADD
                  </button>
                </div>

                {mealsOfType.length > 0 ? (
                  <div className="meals-list mt-8">
                    {mealsOfType.map(meal => (
                      <div key={meal.id} className="logged-meal-row">
                        <div className="logged-meal-info">
                          <span className="logged-meal-name">{meal.foodName}</span>
                          <span className="logged-meal-macros">
                            {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                          </span>
                        </div>
                        <button className="delete-meal-row-btn" onClick={() => handleDeleteMeal(meal.id, meal.foodName)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-category-text mt-8">No meals logged yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Meal Bottom Sheet */}
      <AnimatePresence>
        {activeMealSheet !== null && (
          <BottomSheet onClose={resetMealForm} title={`ADD ${activeMealSheet.toUpperCase()}`}>
            <div className="meal-form">
              <label className="section-label">Food / Meal Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Grilled Chicken breast" 
                value={foodName} 
                onChange={e => setFoodName(e.target.value)} 
                className="mt-4"
                id="food-name-input"
              />

              <div className="form-row mt-12">
                <div style={{ flex: 1 }}>
                  <label className="section-label">Calories (kcal)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={calories} 
                    onChange={e => setCalories(e.target.value)} 
                    className="mt-4"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="section-label">Protein (g)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={protein} 
                    onChange={e => setProtein(e.target.value)} 
                    className="mt-4"
                  />
                </div>
              </div>

              <div className="form-row mt-12">
                <div style={{ flex: 1 }}>
                  <label className="section-label">Carbs (g)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={carbs} 
                    onChange={e => setCarbs(e.target.value)} 
                    className="mt-4"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="section-label">Fat (g)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={fat} 
                    onChange={e => setFat(e.target.value)} 
                    className="mt-4"
                  />
                </div>
              </div>

              {/* Suggestions Panel */}
              {getSuggestionsForType(activeMealSheet).length > 0 && (
                <div className="suggestions-panel mt-16">
                  <span className="section-label text-accent">HEALTHY MEAL PREPS</span>
                  <div className="suggestions-list mt-8">
                    {getSuggestionsForType(activeMealSheet).map((s, idx) => (
                      <div 
                        key={idx} 
                        className="suggestion-item-card card clickable-suggestion"
                        onClick={() => setSelectedRecipe(s)}
                      >
                        <div className="sugg-header">
                          <span className="sugg-name">{s.name}</span>
                          <span className="chip chip-gold" style={{ fontSize: 9 }}>{s.calories} kcal</span>
                        </div>
                        {s.protein !== undefined && (
                          <div className="sugg-macros mt-4">
                            <span className="sugg-macro-tag p-tag">P: {s.protein}g</span>
                            <span className="sugg-macro-tag c-tag">C: {s.carbs}g</span>
                            <span className="sugg-macro-tag f-tag">F: {s.fat}g</span>
                          </div>
                        )}
                        <p className="sugg-recipe-preview mt-4">
                          {s.recipe ? (s.recipe.length > 80 ? s.recipe.substring(0, 80) + '...' : s.recipe) : 'No instructions available.'}
                        </p>
                        <div className="sugg-actions mt-8">
                          <span className="view-prep-link">Tap to View Preparation</span>
                          <button 
                            className="btn-ghost apply-sugg-btn-sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              applySuggestion(s);
                            }}
                          >
                            APPLY
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary mt-20" onClick={() => handleAddMeal(activeMealSheet)} id="log-meal-submit-btn">
                LOG MEAL
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Custom Water Bottom Sheet */}
      <AnimatePresence>
        {activeCustomWater && (
          <BottomSheet onClose={() => setActiveCustomWater(false)} title="LOG CUSTOM WATER">
            <div className="meal-form">
              <label className="section-label">Amount (ml)</label>
              <input 
                type="number" 
                placeholder="250" 
                value={waterAmount} 
                onChange={e => setWaterAmount(e.target.value)} 
                className="mt-4"
                id="custom-water-input"
              />
              <button className="btn-primary mt-16" onClick={() => handleLogWater(waterAmount)} id="custom-water-submit-btn">
                LOG WATER
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Recipe Preparation Details Bottom Sheet */}
      <AnimatePresence>
        {selectedRecipe !== null && (
          <BottomSheet 
            onClose={() => setSelectedRecipe(null)} 
            title={`PREPARE: ${selectedRecipe.name.toUpperCase()}`}
            className="recipe-details-sheet"
          >
            <div className="recipe-details-content">
              {selectedRecipe.image && (
                <div className="recipe-image-wrapper">
                  <img src={selectedRecipe.image} alt={selectedRecipe.name} className="recipe-image" />
                  <div className="recipe-image-glow" />
                </div>
              )}
              
              {/* Premium Macros Grid */}
              <div className="recipe-macros-grid mt-16">
                <div className="recipe-macro-card kcal-box">
                  <span className="macro-title">ENERGY</span>
                  <span className="macro-val">{selectedRecipe.calories} kcal</span>
                </div>
                <div className="recipe-macro-card p-box">
                  <span className="macro-title">PROTEIN</span>
                  <span className="macro-val">{selectedRecipe.protein || 0}g</span>
                </div>
                <div className="recipe-macro-card c-box">
                  <span className="macro-title">CARBS</span>
                  <span className="macro-val">{selectedRecipe.carbs || 0}g</span>
                </div>
                <div className="recipe-macro-card f-box">
                  <span className="macro-title">FATS</span>
                  <span className="macro-val">{selectedRecipe.fat || 0}g</span>
                </div>
              </div>

              {/* Ingredients List */}
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div className="recipe-section mt-20">
                  <span className="section-label text-accent">REQUIRED INGREDIENTS</span>
                  <ul className="ingredients-list mt-8">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="ingredient-item">
                        <span className="bullet">⚡</span>
                        <span className="text">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preparation Instructions */}
              <div className="recipe-section mt-20">
                <span className="section-label text-accent">PREPARATION PROTOCOL</span>
                <div className="instructions-text mt-8">
                  {selectedRecipe.recipe ? (
                    selectedRecipe.recipe.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                      <p key={idx} className="instruction-paragraph">{paragraph}</p>
                    ))
                  ) : (
                    <p className="instruction-paragraph empty-recipe">No instructions provided.</p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn-primary mt-24 w-100" 
                onClick={() => {
                  playClickSound();
                  hapticClick();
                  applySuggestion(selectedRecipe);
                  setSelectedRecipe(null);
                }}
              >
                APPLY TO LOGGING FORM
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
