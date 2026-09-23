export default function NutritionGoalsSection({ profile, isProfileComplete, latestWeight, recommendedGoal, recommendedCalories, recommendedMacros, onApplyRecommendation, onResetGoals, onUpdateSetting }) {
  return (
    <div className="settings-section mt-24">
      <span className="section-label">NUTRITION GOALS</span>
      <div className="settings-card card mt-8">
        {isProfileComplete ? (
          <div className="recommendation-banner">
            <div className="recommendation-text">
              Based on your body stats and {latestWeight.source === 'inbody' ? 'latest InBody scan' : 'latest weight'}, we recommend a <strong>{recommendedGoal.toUpperCase()}</strong>:
              <br />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>
                Recommended: <strong>{recommendedCalories} kcal</strong> | P: {recommendedMacros.protein}g | C: {recommendedMacros.carbs}g | F: {recommendedMacros.fat}g
              </span>
            </div>
            <button 
              className="btn-primary" 
              style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
              onClick={onApplyRecommendation}
            >
              ⚡ APPLY RECOMMENDATION
            </button>
          </div>
        ) : (
          <div className="recommendation-banner warning">
            <div className="recommendation-text" style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>⚠️</span>
              <span>Complete your <strong>Body Profile</strong> and log at least one weight/InBody scan to receive personalized nutrition target recommendations.</span>
            </div>
          </div>
        )}

        <div className="goals-grid">
          {/* Daily Calories */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Daily Calories</label>
            <div className="goal-input-wrapper">
              <input 
                type="number"
                className="settings-input"
                placeholder="Auto"
                defaultValue={profile.calorieGoal || ''}
                key={profile.calorieGoal}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdateSetting('calorieGoal', val > 0 ? val : null);
                }}
              />
              <span className="goal-input-unit">kcal</span>
            </div>
          </div>

          {/* Water Goal */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Water Target</label>
            <div className="goal-input-wrapper">
              <input 
                type="number"
                className="settings-input"
                placeholder="3000"
                defaultValue={profile.waterGoal || 3000}
                key={profile.waterGoal}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 3000;
                  onUpdateSetting('waterGoal', val);
                }}
              />
              <span className="goal-input-unit">ml</span>
            </div>
          </div>

          {/* Protein */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Protein</label>
            <div className="goal-input-wrapper">
              <input 
                type="number"
                className="settings-input"
                placeholder="Auto"
                defaultValue={profile.proteinGoal || ''}
                key={profile.proteinGoal}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdateSetting('proteinGoal', val > 0 ? val : null);
                }}
              />
              <span className="goal-input-unit">g</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Carbohydrates</label>
            <div className="goal-input-wrapper">
              <input 
                type="number"
                className="settings-input"
                placeholder="Auto"
                defaultValue={profile.carbsGoal || ''}
                key={profile.carbsGoal}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdateSetting('carbsGoal', val > 0 ? val : null);
                }}
              />
              <span className="goal-input-unit">g</span>
            </div>
          </div>

          {/* Fat */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Fat</label>
            <div className="goal-input-wrapper">
              <input 
                type="number"
                className="settings-input"
                placeholder="Auto"
                defaultValue={profile.fatGoal || ''}
                key={profile.fatGoal}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdateSetting('fatGoal', val > 0 ? val : null);
                }}
              />
              <span className="goal-input-unit">g</span>
            </div>
          </div>

          {/* Goal Type Badge */}
          <div className="goal-input-box">
            <label className="section-label" style={{ fontSize: '11px' }}>Goal Type</label>
            <select
              className="settings-select"
              value={profile.nutritionGoalType || ''}
              onChange={e => onUpdateSetting('nutritionGoalType', e.target.value || null)}
            >
              <option value="">None / Custom</option>
              <option value="cut">Cut (Deficit)</option>
              <option value="maintain">Maintain (Balance)</option>
              <option value="bulk">Bulk (Surplus)</option>
            </select>
          </div>
        </div>

        {(profile.calorieGoal || profile.proteinGoal || profile.carbsGoal || profile.fatGoal || profile.nutritionGoalType) && (
          <button 
            className="btn-ghost mt-16" 
            style={{ fontSize: '12px', minHeight: '32px', padding: '4px' }}
            onClick={onResetGoals}
          >
            RESET TO DEFAULT / AUTO
          </button>
        )}
      </div>
    </div>
  );
}
