import { getRankInfo, RANKS } from '../../data/progression';
import BottomSheet from '../../components/BottomSheet';

/* ── Rank Progression Sheet ─────────────────────── */
export default function RankProgressionSheet({ currentXP, onClose }) {
  const currentRankInfo = getRankInfo(currentXP);
  
  return (
    <BottomSheet 
      onClose={onClose} 
      title="RANK PROGRESSION"
      footer={
        <button className="btn-primary w-full" onClick={onClose} style={{ marginBottom: 8 }}>GOT IT</button>
      }
    >
      <div className="rank-list mt-16">
        {RANKS.map(rank => {
          const isUnlocked = currentXP >= rank.xpRequired;
          const isCurrent = currentRankInfo.current.rank === rank.rank;
          const xpToReach = rank.xpRequired - currentXP;
          
          return (
            <div key={rank.rank} className={`rank-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}>
              <div className="rank-item-badge" style={{ borderColor: rank.color, color: rank.color }}>
                {rank.rank}
              </div>
              <div className="rank-item-info">
                <span className="rank-item-name">{rank.name}</span>
                <span className="section-label">
                  {isUnlocked 
                    ? (isCurrent ? 'CURRENT RANK' : 'UNLOCKED') 
                    : `REACH AT: ${rank.xpRequired.toLocaleString()} XP (${xpToReach.toLocaleString()} REMAINING)`}
                </span>
              </div>
              {isUnlocked && <div className="rank-check">✓</div>}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
