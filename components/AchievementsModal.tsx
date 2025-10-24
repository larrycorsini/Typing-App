
import React from 'react';
import { useStore } from '../store';
import { Achievement } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface AchievementsModalProps {
  onClose: () => void;
}

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <div className={`p-4 rounded-lg border-2 transition-all ${achievement.unlocked ? 'bg-yellow-900/40 border-yellow-500' : 'bg-slate-700 border-slate-600 opacity-60'}`}>
    <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-300'}`}>{achievement.name}</h3>
    <p className="text-sm text-slate-400">{achievement.description}</p>
  </div>
);

const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = useStore(state => state.achievements);
  const trapRef = useFocusTrap<HTMLDivElement>(onClose);

  return (
    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="achievements-title">
      <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="achievements-title" className="text-3xl font-bold text-cyan-400">Achievements</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-cyan-400 text-3xl" aria-label="Close achievements modal">&times;</button>
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
