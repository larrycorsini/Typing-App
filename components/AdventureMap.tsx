import React from 'react';
import { useStore } from '../store';
import { mapService } from '../services/mapService';
import { MapNode } from '../types';
import { GameState } from '../types';

const Node: React.FC<{ node: MapNode }> = ({ node }) => {
    const { playerCharacter, startMapNodeActivity } = useStore();
    const isCompleted = node.id <= playerCharacter.mapProgress;
    const isUnlocked = node.id <= playerCharacter.mapProgress + 1;
    const isActive = node.id === playerCharacter.mapProgress + 1;

    let nodeClasses = 'map-node ';
    if (isActive) nodeClasses += 'map-node--active ';
    else if (isCompleted) nodeClasses += 'map-node--completed ';
    else nodeClasses += 'map-node--locked ';

    let emoji = '🏁';
    switch (node.type) {
        case 'RACE': nodeClasses += 'map-node--race'; emoji = '🏁'; break;
        case 'TRAINING': nodeClasses += 'map-node--training'; emoji = '💪'; break;
        case 'SHOP': nodeClasses += 'map-node--shop'; emoji = '🛍️'; break;
        case 'BOSS': nodeClasses += 'map-node--boss'; emoji = '👑'; break;
    }

    const handleClick = () => {
        if (isUnlocked) {
            startMapNodeActivity(node.id);
        }
    };

    return (
        <button 
            className={nodeClasses}
            style={{ top: node.position.top, left: node.position.left }}
            onClick={handleClick}
            disabled={!isUnlocked}
            aria-label={node.name}
            title={node.name}
        >
            {emoji}
        </button>
    );
};

const AdventureMap: React.FC = () => {
    const { setGameState, playerCharacter } = useStore();
    const mapZones = mapService.getMapData();
    const allNodes = mapService.getAllNodes();

    const getPathCoords = () => {
        if (allNodes.length < 2) return '';
        let pathString = `M ${parseFloat(allNodes[0].position.left)} ${parseFloat(allNodes[0].position.top)} `;
        for(let i=1; i < allNodes.length; i++) {
            pathString += `L ${parseFloat(allNodes[i].position.left)} ${parseFloat(allNodes[i].position.top)} `;
        }
        return pathString;
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">
             <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold dl-title-text">Duck Life Racer</h1>
                <p className="mt-2 text-xl opacity-80">Your adventure begins!</p>
            </div>
            <div className="adventure-map">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute' }}>
                    <path
                        d={getPathCoords()}
                        stroke="var(--dl-dirt)"
                        strokeWidth="1.5"
                        strokeDasharray="3 1.5"
                        strokeLinecap="round"
                        fill="none"
                        transform="scale(1, 0.98)"
                    />
                </svg>

                {allNodes.map(node => <Node key={node.id} node={node} />)}
            </div>
             <div className="card flex flex-wrap justify-center gap-3">
                 <button onClick={() => setGameState(GameState.COURSE_LOBBY)} className="btn btn-secondary">Typing Course</button>
                 <button onClick={() => setGameState(GameState.ONLINE_LOBBY)} className="btn btn-secondary">Online Race</button>
                 <button onClick={() => setGameState(GameState.PARTY_SETUP)} className="btn btn-secondary">Party Race</button>
                 <button onClick={() => setGameState(GameState.CUSTOM_TEXT_SETUP)} className="btn btn-secondary">Custom Text</button>
             </div>
        </div>
    );
};

export default AdventureMap;
