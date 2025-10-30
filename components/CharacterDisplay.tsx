import React from 'react';
import { PlayerCharacter } from '../types';
import { characterService } from '../services/characterService';

interface CharacterDisplayProps {
    character: PlayerCharacter;
    isPreview?: boolean;
    size?: 'small' | 'default';
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, isPreview = false, size = 'default' }) => {
    const hat = !isPreview && character.equippedItems.hat 
        ? characterService.allCustomizationItems.find(i => i.id === character.equippedItems.hat) 
        : null;
        
    const bodyColor = character.color || '#FFD700';
    const containerClasses = ['duck-container'];
    if (size === 'small') {
        containerClasses.push('duck-container--small');
    }

    const patternClass = character.pattern ? `duck-pattern--${character.pattern}` : '';

    return (
        <div className={containerClasses.join(' ')}>
            {/* Duck Parts */}
            <div className="duck-head" style={{ backgroundColor: bodyColor }}>
                {character.pattern !== 'solid' && <div className={`duck-pattern ${patternClass}`}></div>}
            </div>
            <div className="duck-eye"></div>
            <div className="duck-beak"></div>
            <div className="duck-body" style={{ backgroundColor: bodyColor }}>
                {character.pattern !== 'solid' && <div className={`duck-pattern ${patternClass}`}></div>}
            </div>
            <div className="duck-leg"></div>

            {/* Accessories */}
            {hat && (
                <span
                    role="img"
                    aria-label={hat.name}
                    style={{
                        fontSize: '40px',
                        position: 'absolute',
                        top: '-15px',
                        left: '55%',
                        transform: 'translateX(-50%)',
                        zIndex: 20,
                    }}
                >
                    {hat.emoji}
                </span>
            )}
        </div>
    );
};

export default CharacterDisplay;