import React from 'react';
import { Player, PartyPlayer, TypingStats, RaceMode } from '../types';
import WpmChart from './WpmChart';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useStore } from '../store';

interface ResultsModalProps {
  players: Player[];
  onPlayAgain: () => void;
}

const MistakeAnalysis: React.FC<{ mistypedChars: TypingStats['mistypedChars'] }> = ({ mistypedChars }) => {
    const mistakes = Object.entries(mistypedChars)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (mistakes.length === 0) {
        return null;
    }

    return (
        <div className="bg-[#e9ddb8] p-3 rounded-lg mt-4">
            <h4 className="text-center text-sm text-[var(--dl-text)] font-bold mb-2">Mistake Analysis</h4>
            <div className="flex justify-center gap-4 text-center">
                {mistakes.map(([char, count]) => (
                    <div key={char}>
                        <div className="font-mono text-2xl bg-[var(--dl-red)] text-white rounded-md px-2 py-1">
                            {char === ' ' ? '_' : char}
                        </div>
                        <div className="text-xs text-[var(--dl-text)] opacity-70 mt-1">{count}x</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ResultsModal: React.FC<ResultsModalProps> = ({ players, onPlayAgain }) => {
  const trapRef = useFocusTrap<HTMLDivElement>(onPlayAgain);
  const { partyPlayers, raceMode, playerStats, currentLesson, xpGainedThisRace, coinsGainedThisRace } = useStore(state => ({
    partyPlayers: state.partyPlayers,
    raceMode: state.raceMode,
    playerStats: state.playerStats,
    currentLesson: state.currentLesson,
    xpGainedThisRace: state.xpGainedThisRace,
    coinsGainedThisRace: state.coinsGainedThisRace,
  }));
  const isPartyMode = raceMode === RaceMode.PARTY;
  const isOnlineMode = raceMode === RaceMode.ONLINE_RACE;
  const isCourseMode = raceMode === RaceMode.COURSE;
  
  const playerResult = players.find(p => p.isPlayer);
  const isWinner = playerResult?.rank === 1;

  let title = 'Race Finished!';
  let subtitle = '';

  if (isCourseMode && currentLesson) {
    const passed = playerStats.wpm >= currentLesson.goals.wpm && playerStats.accuracy >= currentLesson.goals.accuracy;
    title = passed ? "Lesson Complete!" : "Keep Practicing!";
    subtitle = `Your score: ${playerStats.wpm} WPM, ${playerStats.accuracy}% Accuracy`;
  } else if (isPartyMode) {
    title = `👑 ${partyPlayers.sort((a,b) => (a.rank ?? 0) - (b.rank ?? 0))[0]?.name} Wins! 👑`;
    subtitle = "Here are the final standings.";
  } else if (isOnlineMode) {
    title = playerResult?.rank ? `You finished #${playerResult.rank}!` : 'Race Finished!';
    subtitle = `You typed at ${playerStats.wpm} WPM.`;
  } else {
    title = isWinner ? 'You Won!' : 'Race Finished!';
    subtitle = `You placed #${playerResult?.rank || 'N/A'}`;
  }
  
  const sortedResults: (Player | PartyPlayer)[] = isPartyMode
    ? [...partyPlayers].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
    : [...players].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

  return (
    <div className="modal-backdrop animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="results-title">
      <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
        <h2 id="results-title" className={`text-4xl font-bold text-center mb-2 ${isWinner || isPartyMode || (isCourseMode && title.includes('Complete')) ? 'text-[var(--dl-yellow)] text-shadow-lg' : 'text-[var(--dl-text)]'}`}>
          {title}
        </h2>
        <p className="text-center text-[var(--dl-text)] opacity-80 text-xl mb-6">{subtitle}</p>
        
        {!isPartyMode && (xpGainedThisRace > 0 || coinsGainedThisRace > 0) && (
          <div className="text-center mb-4 bg-[#e9ddb8] p-2 rounded-lg flex justify-center gap-8">
            {xpGainedThisRace > 0 && <p className="text-lg font-bold text-[var(--dl-blue)]">+ {xpGainedThisRace} XP</p>}
            {coinsGainedThisRace > 0 && <p className="text-lg font-bold text-[var(--dl-yellow-shadow)]">+ {coinsGainedThisRace} Coins 🪙</p>}
          </div>
        )}

        {isCourseMode && currentLesson && (
          <div className="bg-[#e9ddb8] p-4 rounded-lg mb-4 text-center">
            <h4 className="font-bold text-[var(--dl-text)]">Lesson Goals</h4>
            <div className="flex justify-center gap-8 mt-2">
                <p><span className="font-semibold text-[var(--dl-text)] opacity-70">WPM: </span>{currentLesson.goals.wpm}</p>
                <p><span className="font-semibold text-[var(--dl-text)] opacity-70">Accuracy: </span>{currentLesson.goals.accuracy}%</p>
            </div>
          </div>
        )}

        {!isCourseMode && (
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {sortedResults.map((p, index) => (
                <div key={p.name + index} className={`flex justify-between items-center p-3 rounded-lg transition-transform duration-300 ${(p as Player).isPlayer ? 'bg-[#fefae0]' : 'bg-[#e9ddb8]'} ${(p as Player).isPlayer && isWinner ? 'scale-105 ring-2 ring-[var(--dl-yellow)] shadow-lg' : ''}`}>
                  <span className="font-semibold text-[var(--dl-text)] truncate pr-2">
                    {p.rank === 1 ? '👑 ' : ''}#{p.rank} {p.name} {(p as Player).isPlayer && '(You)'}
                  </span>
                  <span className="font-bold text-[var(--dl-blue-shadow)]">{p.wpm} WPM</span>
                </div>
              ))}
            </div>
        )}

        {playerResult?.wpmHistory && !isPartyMode && !isCourseMode && <WpmChart data={playerResult.wpmHistory} />}
        {playerStats.mistypedChars && !isPartyMode && <MistakeAnalysis mistypedChars={playerStats.mistypedChars} />}

        <button 
          onClick={onPlayAgain}
          className="w-full btn btn-primary text-xl py-3 mt-8"
        >
          {isCourseMode ? 'Back to Course' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;