import React from 'react';
import { useStore } from '../store';
import { Evolution } from '../types';

const AbilityButton: React.FC = () => {
    const { playerCharacter, sprintAvailable, activateSprint } = useStore(state => ({
        playerCharacter: state.playerCharacter,
        sprintAvailable: state.sprintAvailable,
        activateSprint: state.activateSprint,
    }));

    if (playerCharacter.evolution !== Evolution.ATHLETIC) {
        return null; // For now, only Athletic has an ability
    }

    const abilityName = 'Sprint';
    const buttonClasses = `ability-button ${sprintAvailable ? 'ability-button--ready' : 'ability-button--cooldown'}`;

    return (
        <button
            className={buttonClasses}
            onClick={activateSprint}
            disabled={!sprintAvailable}
            aria-label={`Activate ${abilityName} ability`}
        >
            <div>{abilityName}</div>
            <div className="text-xs mt-1">{sprintAvailable ? 'Ready' : 'Cooldown'}</div>
        </button>
    );
};

export default AbilityButton;
