

export default function MuscleRadarChart({ muscleLevels }) {
  const axes = ['Chest', 'Back', 'Arms', 'Legs', 'Shoulders', 'Core'];
  const maxLevel = 10;
  const width = 280;
  const height = 240;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 70;

  const levelsMap = {};
  axes.forEach(a => { levelsMap[a] = 1; });
  if (muscleLevels) {
    muscleLevels.forEach(([mg, data]) => {
      const match = axes.find(a => a.toLowerCase() === mg.toLowerCase());
      if (match) {
        levelsMap[match] = data.level;
      }
    });
  }

  const getCoordinates = (index, value) => {
    const angle = (index * 60) * Math.PI / 180 - Math.PI / 2;
    const factor = Math.min(value, maxLevel) / maxLevel;
    const d = radius * factor;
    return {
      x: centerX + d * Math.cos(angle),
      y: centerY + d * Math.sin(angle)
    };
  };

  const gridLevels = [2, 4, 6, 8, 10];
  const gridPaths = gridLevels.map(lvl => {
    const points = Array.from({ length: 6 }).map((_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  const userPoints = Array.from({ length: 6 }).map((_, i) => {
    const lvl = levelsMap[axes[i]];
    const { x, y } = getCoordinates(i, lvl);
    return `${x},${y}`;
  });
  const userPath = userPoints.join(' ');

  const userVertices = Array.from({ length: 6 }).map((_, i) => {
    const lvl = levelsMap[axes[i]];
    return getCoordinates(i, lvl);
  });

  const labelPositions = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 60) * Math.PI / 180 - Math.PI / 2;
    const d = radius + 15;
    return {
      name: axes[i].toUpperCase(),
      level: levelsMap[axes[i]],
      x: centerX + d * Math.cos(angle),
      y: centerY + d * Math.sin(angle)
    };
  });

  return (
    <div className="radar-chart-container">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(79, 195, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(79, 195, 247, 0.02)" />
          </radialGradient>
        </defs>

        {gridPaths.map((path, idx) => (
          <polygon
            key={idx}
            points={path}
            fill="none"
            stroke="rgba(30, 58, 84, 0.4)"
            strokeWidth="1"
            strokeDasharray={idx < 4 ? "3 3" : "none"}
          />
        ))}

        {Array.from({ length: 6 }).map((_, i) => {
          const outer = getCoordinates(i, maxLevel);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(30, 58, 84, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={userPath}
          fill="url(#radarGlow)"
          stroke="var(--accent-blue)"
          strokeWidth="2"
        />

        {userVertices.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="var(--bg-void)"
            stroke="var(--accent-blue)"
            strokeWidth="1.5"
          />
        ))}

        {labelPositions.map((pos, i) => {
          let textAnchor = 'middle';
          if (i === 1 || i === 2) textAnchor = 'start';
          if (i === 4 || i === 5) textAnchor = 'end';
          
          let dy = '0.35em';
          if (i === 0) dy = '-0.1em';
          if (i === 3) dy = '1.1em';

          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y}
                textAnchor={textAnchor}
                dy={dy}
                className="radar-label"
              >
                {pos.name}
              </text>
              <text
                x={pos.x}
                y={pos.y}
                textAnchor={textAnchor}
                dy={i === 0 ? '-1.3em' : i === 3 ? '2.2em' : '1.3em'}
                className="radar-level-label"
              >
                LVL {pos.level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
