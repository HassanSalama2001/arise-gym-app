import { useMemo } from 'react';
import { buildActivityCalendar, toWeekColumns } from '../../utils/progressStats';
import { parseLocalDate } from '../../utils/date';

const WEEKS = 26;
const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

// Four intensity steps, by sessions that day and how heavy they were.
function level(day) {
  if (!day.sessions) return 0;
  if (day.sessions > 1 || day.volume >= 8000) return 3;
  if (day.volume >= 3000) return 2;
  return 1;
}

const COLORS = [
  'var(--bg-void)',
  'rgba(79, 195, 247, 0.25)',
  'rgba(79, 195, 247, 0.55)',
  'var(--accent-blue)',
];

export default function ActivityHeatmap({ sessions }) {
  const columns = useMemo(() => toWeekColumns(buildActivityCalendar(sessions, { weeks: WEEKS })), [sessions]);
  const trained = useMemo(() => columns.flat().filter(d => d.sessions > 0).length, [columns]);

  const monthLabels = columns.map((week, i) => {
    const first = parseLocalDate(week[0].date);
    const prev = i > 0 ? parseLocalDate(columns[i - 1][0].date) : null;
    return !prev || first.getMonth() !== prev.getMonth()
      ? first.toLocaleDateString([], { month: 'short' }).toUpperCase()
      : '';
  });

  return (
    <div className="card mt-8" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span className="section-label">ACTIVITY</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trained} days trained</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 3, minWidth: 'min-content' }}>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 10px)', gap: 3, marginTop: 14 }}>
            {DAY_LABELS.map((d, i) => (
              <span key={i} style={{ fontSize: 8, color: 'var(--text-muted)', lineHeight: '10px' }}>{d}</span>
            ))}
          </div>
          {columns.map((week, i) => (
            <div key={week[0].date} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 8, height: 11, color: 'var(--text-muted)' }}>{monthLabels[i]}</span>
              {week.map(day => (
                <div
                  key={day.date}
                  title={day.future ? day.date : `${day.date}: ${day.sessions} session${day.sessions === 1 ? '' : 's'}${day.volume ? `, ${Math.round(day.volume).toLocaleString()} volume` : ''}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS[level(day)],
                    opacity: day.future ? 0.25 : 1,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Less</span>
        {COLORS.map(color => (
          <div key={color} style={{ width: 9, height: 9, borderRadius: 2, background: color, border: '1px solid rgba(255,255,255,0.04)' }} />
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}
