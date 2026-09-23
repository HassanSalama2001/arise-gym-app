import { useState, useMemo } from 'react';
import { useNow } from '../../hooks/useNow';
import { toLocalDateString } from '../../utils/date';

/* ── Workout Calendar ─────────────────────────────── */
export default function WorkoutCalendar({ sessions, viewMode, selectedDate, onDateClick }) {
  const nowMs = useNow();
  const now = useMemo(() => new Date(nowMs), [nowMs]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  // Get days for weekly view
  const weekDays = useMemo(() => {
    const start = new Date(now);
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
    start.setDate(now.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [now]);

  // Get days for monthly view
  const monthDays = useMemo(() => {
    const start = new Date(currentMonth);
    const firstDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
    start.setDate(start.getDate() - firstDay);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentMonth]);

  const activeDates = useMemo(() => {
    const set = new Set();
    (sessions || []).forEach(s => set.add(toLocalDateString(s.startTime)));
    return set;
  }, [sessions]);

  const renderDay = (date, isSelected) => {
    const dateStr = toLocalDateString(date);
    const isActive = activeDates.has(dateStr);
    const isToday = dateStr === toLocalDateString(now);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

    return (
      <div
        key={dateStr}
        className={`cal-day ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${!isCurrentMonth && viewMode === 'month' ? 'other-month' : ''}`}
        onClick={() => onDateClick(date)}
      >
        <span className="cal-day-num">{date.getDate()}</span>
        {isActive && <div className="cal-dot" />}
      </div>
    );
  };

  return (
    <div className="workout-calendar">
      {viewMode === 'month' && (
        <div className="cal-month-nav">
          <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
          <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
      
      <div className="cal-days-header">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => <span key={idx}>{d}</span>)}
      </div>

      <div className={`cal-grid ${viewMode}`}>
        {(viewMode === 'week' ? weekDays : monthDays).map(d => renderDay(d, toLocalDateString(d) === selectedDate))}
      </div>
    </div>
  );
}
