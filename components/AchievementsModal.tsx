
import React from 'react';
import { useStore } from '../store';
import { Achievement } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface AchievementsModalProps {
  onClose: () => void;
}

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <div className={`p-4 rounded-lg border-2 transition-all ${achievement.unlocked ? 'bg-[#fefae0] border-[var(--dl-yellow)]' : 'bg-[#e9ddb8] border-[var(--dl-dirt)] opacity-60'}`}>
    <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-[var(--dl-yellow-shadow)]' : 'text-[var(--dl-text)]'}`}>{achievement.name}</h3>
    <p className="text-sm text-[var(--dl-text)] opacity-70">{achievement.description}</p>
  </div>
);

const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = useStore(state => state.achievements);
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div className="modal-backdrop animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="achievements-title">
      <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="achievements-title" className="text-3xl font-bold">Achievements</h2>
          <button onClick={onClose} className="text-[var(--dl-text)] opacity-70 hover:opacity-100 text-3xl" aria-label="Close achievements modal">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {achievements.map(ach => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;