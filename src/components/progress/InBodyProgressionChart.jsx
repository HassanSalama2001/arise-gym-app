import { useState, useMemo } from 'react';
import { calculateInBodyScore, calculateBMI, lbsToKg } from '../../utils/calorieEngine';

export default function InBodyProgressionChart({ scans, profile }) {
  const [chartMode, setChartMode] = useState('overview');
  
  const unitPreference = profile?.unitPreference || 'kg';
  const height = profile?.height || 0;
  const gender = profile?.gender || '';

  // Process scans to calculate missing scores on-the-fly
  const processedScans = useMemo(() => {
    if (!scans) return [];
    const sorted = [...scans].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map(scan => {
      let score = scan.score || 0;
      if (score === 0 && height && gender) {
        const weightKg = unitPreference === 'lbs' ? lbsToKg(scan.weight) : scan.weight;
        const smmKg = unitPreference === 'lbs' ? lbsToKg(scan.smm) : scan.smm;
        score = calculateInBodyScore(weightKg, smmKg, scan.bf, height, gender);
      }
      return {
        ...scan,
        score
      };
    });
  }, [scans, height, gender, unitPreference]);

  if (!processedScans || processedScans.length === 0) {
    return (
      <div className="chart-empty chart-card card" style={{ height: 'auto', padding: '24px 16px', flexDirection: 'column' }}>
        <span style={{ fontSize: 24, marginBottom: 8 }}>📊</span>
        <span className="section-label" style={{ fontSize: 12 }}>NO INBODY SCANS LOGGED YET</span>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4 }}>
          Go to the Profile tab and log your InBody scan data to view progression.
        </p>
      </div>
    );
  }

  if (processedScans.length === 1) {
    const single = processedScans[0];
    return (
      <div className="chart-card card" style={{ padding: 16 }}>
        <span className="section-label">INBODY OVERVIEW</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 16px 0', textAlign: 'center', lineHeight: 1.4 }}>
          Log at least 2 scans to unlock progression charts. Here is your latest scan:
        </p>
        <div className="stat-overview-row" style={{ marginBottom: 0 }}>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ fontSize: 18 }}>{single.weight}{unitPreference}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Weight</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--success)', fontSize: 18 }}>{single.smm}{unitPreference}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Muscle</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--accent-red)', fontSize: 18 }}>{single.bf}%</span>
            <span className="section-label" style={{ fontSize: 9 }}>Fat</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--accent-gold)', fontSize: 18 }}>{single.score}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Score</span>
          </div>
        </div>
      </div>
    );
  }

  // Delta calculations
  const firstScan = processedScans[0];
  const latestScan = processedScans[processedScans.length - 1];
  
  const scoreDelta = latestScan.score - firstScan.score;
  const smmDelta = latestScan.smm - firstScan.smm;
  const bfDelta = latestScan.bf - firstScan.bf;

  const W = 340;
  const H = 120;
  const PAD = 15;

  // Overview mode coordinates
  const smmVals = processedScans.map(s => s.smm);
  let smmMin = Math.min(...smmVals);
  let smmMax = Math.max(...smmVals);
  if (smmMin === smmMax) { smmMin -= 1; smmMax += 1; }
  else { const padding = (smmMax - smmMin) * 0.1 || 1; smmMin -= padding; smmMax += padding; }

  const bfVals = processedScans.map(s => s.bf);
  let bfMin = Math.min(...bfVals);
  let bfMax = Math.max(...bfVals);
  if (bfMin === bfMax) { bfMin -= 1; bfMax += 1; }
  else { const padding = (bfMax - bfMin) * 0.1 || 1; bfMin -= padding; bfMax += padding; }

  const smmPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const y = H - PAD - 15 - (((s.smm - smmMin) / (smmMax - smmMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const smmLinePath = smmPts.map(([x, y]) => `${x},${y}`).join(' ');
  const smmAreaPath = `M${smmPts[0][0]},${H - PAD - 5} L${smmLinePath.split(' ').join(' L')} L${smmPts[smmPts.length - 1][0]},${H - PAD - 5} Z`;

  const bfPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const y = H - PAD - 15 - (((s.bf - bfMin) / (bfMax - bfMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const bfLinePath = bfPts.map(([x, y]) => `${x},${y}`).join(' ');
  const bfAreaPath = `M${bfPts[0][0]},${H - PAD - 5} L${bfLinePath.split(' ').join(' L')} L${bfPts[bfPts.length - 1][0]},${H - PAD - 5} Z`;

  // Deep Dive Mode computations
  const getDeepDiveData = () => {
    switch (chartMode) {
      case 'score':
        return processedScans.map(s => s.score);
      case 'weight':
        return processedScans.map(s => s.weight);
      case 'smm':
        return processedScans.map(s => s.smm);
      case 'bf':
        return processedScans.map(s => s.bf);
      case 'bfm':
        return processedScans.map(s => Math.round(s.weight * (s.bf / 100) * 10) / 10);
      case 'bmi':
        return processedScans.map(s => calculateBMI(unitPreference === 'lbs' ? lbsToKg(s.weight) : s.weight, height));
      default:
        return [];
    }
  };

  const deepDiveVals = getDeepDiveData();
  let ddMin = Math.min(...deepDiveVals);
  let ddMax = Math.max(...deepDiveVals);
  if (ddMin === ddMax) { ddMin -= 1; ddMax += 1; }
  else { const padding = (ddMax - ddMin) * 0.1 || 1; ddMin -= padding; ddMax += padding; }

  const ddPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const val = deepDiveVals[i];
    const y = H - PAD - 15 - (((val - ddMin) / (ddMax - ddMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const ddLinePath = ddPts.map(([x, y]) => `${x},${y}`).join(' ');
  const ddAreaPath = `M${ddPts[0][0]},${H - PAD - 5} L${ddLinePath.split(' ').join(' L')} L${ddPts[ddPts.length - 1][0]},${H - PAD - 5} Z`;

  const getDeepDiveColor = () => {
    if (chartMode === 'score') return 'var(--accent-gold)';
    if (chartMode === 'weight') return 'var(--accent-blue)';
    if (chartMode === 'smm') return 'var(--success)';
    if (chartMode === 'bf' || chartMode === 'bfm') return 'var(--accent-red)';
    return 'var(--text-secondary)';
  };

  const getDeepDiveTitle = () => {
    const titles = {
      score: 'InBody Score',
      weight: `Weight (${unitPreference})`,
      smm: `Muscle - SMM (${unitPreference})`,
      bf: 'Body Fat (%)',
      bfm: `Body Fat Mass (${unitPreference})`,
      bmi: 'Body Mass Index (BMI)'
    };
    return titles[chartMode] || '';
  };

  return (
    <div className="inbody-progression-section">
      {/* 1. Delta Badges */}
      <div className="inbody-delta-row">
        <div className={`delta-badge ${scoreDelta >= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">SCORE</span>
          <span className="delta-value">{firstScan.score} → {latestScan.score}</span>
          <span className="delta-diff">{scoreDelta >= 0 ? `▲+${scoreDelta}` : `▼${scoreDelta}`}</span>
        </div>
        <div className={`delta-badge ${smmDelta >= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">SMM</span>
          <span className="delta-value" style={{ fontSize: 10 }}>{firstScan.smm} → {latestScan.smm}</span>
          <span className="delta-diff">{smmDelta >= 0 ? `▲+${Math.round(smmDelta*10)/10}` : `▼${Math.round(smmDelta*10)/10}`}</span>
        </div>
        <div className={`delta-badge ${bfDelta <= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">BF%</span>
          <span className="delta-value" style={{ fontSize: 10 }}>{firstScan.bf}% → {latestScan.bf}%</span>
          <span className="delta-diff">{bfDelta <= 0 ? `▼${Math.abs(Math.round(bfDelta*10)/10)}%` : `▲+${Math.round(bfDelta*10)/10}%`}</span>
        </div>
      </div>

      {/* 2. Chart Toggle Controls */}
      <div className="inbody-chart-controls mt-16">
        <div className="tab-pills" style={{ margin: 0 }}>
          <button 
            className={`tab-pill ${chartMode === 'overview' ? 'active' : ''}`}
            onClick={() => setChartMode('overview')}
            style={{ fontSize: 10, padding: '4px 8px' }}
          >
            OVERVIEW
          </button>
          <button 
            className={`tab-pill ${chartMode !== 'overview' ? 'active' : ''}`}
            onClick={() => setChartMode('score')}
            style={{ fontSize: 10, padding: '4px 8px' }}
          >
            DEEP DIVE
          </button>
        </div>

        {chartMode !== 'overview' && (
          <select 
            value={chartMode} 
            onChange={e => setChartMode(e.target.value)}
            className="chart-selector-dropdown"
          >
            <option value="score">InBody Score</option>
            <option value="weight">Body Weight</option>
            <option value="smm">Muscle (SMM)</option>
            <option value="bf">Body Fat (%)</option>
            <option value="bfm">Body Fat Mass</option>
            <option value="bmi">BMI</option>
          </select>
        )}
      </div>

      {/* 3. SVG Chart Card */}
      <div className="chart-card card mt-12" style={{ padding: '16px 12px 24px 12px', position: 'relative' }}>
        {chartMode === 'overview' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>🟢 SMM (Left Y)</span>
              <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>🔴 BF% (Right Y)</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H + 15}`} className="area-chart">
              <defs>
                <linearGradient id="smmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--success)" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="var(--accent-red)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Draw SMM Area and Line */}
              <path d={smmAreaPath} fill="url(#smmGrad)"/>
              <polyline points={smmLinePath} fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Draw BF% Area and Line */}
              <path d={bfAreaPath} fill="url(#bfGrad)"/>
              <polyline points={bfLinePath} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Point Circles */}
              {smmPts.map(([x, y], i) => (
                <circle key={`smm-${i}`} cx={x} cy={y} r="3.5" fill="var(--success)"/>
              ))}
              {bfPts.map(([x, y], i) => (
                <circle key={`bf-${i}`} cx={x} cy={y} r="3" fill="var(--accent-red)"/>
              ))}

              {/* X Axis Date Labels */}
              {processedScans.map((scan, i) => {
                const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
                const isBoundary = i === 0 || i === processedScans.length - 1;
                const isMiddle = processedScans.length > 3 && i === Math.floor(processedScans.length / 2);
                if (isBoundary || isMiddle) {
                  return (
                    <text 
                      key={`lbl-${i}`}
                      x={x} 
                      y={H + 10} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="var(--text-muted)" 
                      fontFamily="var(--font-display)"
                      fontWeight="600"
                    >
                      {new Date(scan.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ color: getDeepDiveColor(), fontWeight: 'bold' }}>{getDeepDiveTitle().toUpperCase()}</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H + 15}`} className="area-chart">
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={getDeepDiveColor()} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={getDeepDiveColor()} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={ddAreaPath} fill="url(#ddGrad)"/>
              <polyline points={ddLinePath} fill="none" stroke={getDeepDiveColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {ddPts.map(([x, y], i) => (
                <g key={`dd-pt-${i}`}>
                  <circle cx={x} cy={y} r="4.5" fill="var(--bg-card)" stroke={getDeepDiveColor()} strokeWidth="2"/>
                  <text 
                    x={x} 
                    y={y - 8} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fill="var(--text-primary)" 
                    fontFamily="var(--font-display)"
                    fontWeight="700"
                  >
                    {deepDiveVals[i]}
                  </text>
                </g>
              ))}

              {/* X Axis Date Labels */}
              {processedScans.map((scan, i) => {
                const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
                const isBoundary = i === 0 || i === processedScans.length - 1;
                const isMiddle = processedScans.length > 3 && i === Math.floor(processedScans.length / 2);
                if (isBoundary || isMiddle) {
                  return (
                    <text 
                      key={`dd-lbl-${i}`}
                      x={x} 
                      y={H + 10} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="var(--text-muted)" 
                      fontFamily="var(--font-display)"
                      fontWeight="600"
                    >
                      {new Date(scan.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
