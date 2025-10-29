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
    
    const accessory = !isPreview && character.equippedItems.accessory 
        ? characterService.allCustomizationItems.find(i => i.id === character.equippedItems.accessory) 
        : null;
        
    const bodyColor = character.color || '#FFD700';
    const containerClasses = ['duck-container'];
    if (size === 'small') {
        containerClasses.push('duck-container--small');
    }

    return (
        <div className={containerClasses.join(' ')}>
            {/* Duck Parts */}
            <div className="duck-head" style={{ backgroundColor: bodyColor }}></div>
            <div className="duck-eye"></div>
            <div className="duck-beak"></div>
            <div className="duck-body" style={{ backgroundColor: bodyColor }}></div>
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
            {accessory && (
                 <span
                    role="img"
                    aria-label={accessory.name}
                    style={{
                        fontSize: '24px',
                        position: 'absolute',
                        top: '65px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 16,
                    }}
                >
                    {accessory.emoji}
                </span>
            )}
        </div>
    );
};

export default CharacterDisplay;