import React from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import CharacterDisplay from './CharacterDisplay';
import { GameState } from '../types';

const StoryModal: React.FC = () => {
    const { currentBossIntro, confirmStartBossBattle, setGameState } = useStore();
    const trapRef = useFocusTrap<HTMLDivElement>(() => setGameState(GameState.TOURNAMENT_LOBBY));

    if (!currentBossIntro) return null;

    return (
        <div className="modal-backdrop animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="story-title">
            <div ref={trapRef} className="dl-modal max-w-2xl animate-scaleIn text-center" onClick={e => e.stopPropagation()}>
                <h2 id="story-title" className="text-4xl font-bold mb-4">
                    Championship Challenge!
                </h2>
                <div className="my-6">
                     <CharacterDisplay character={currentBossIntro.character} />
                </div>
                <h3 className="text-3xl font-bold mb-2">{currentBossIntro.name}</h3>
                <p className="opacity-80 text-lg mb-4">{currentBossIntro.narrative}</p>
                <p className="text-[var(--dl-yellow-shadow)] text-xl font-semibold italic mb-8">"{currentBossIntro.taunt}"</p>

                <div className="flex gap-4">
                    <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="btn btn-secondary w-1/3">
                        Back Down
                    </button>
                    <button onClick={confirmStartBossBattle} className="btn btn-primary w-2/3">
                        Start Battle!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;