import { MapZone, Evolution, MapNode } from '../types';

const mapData: MapZone[] = [
    {
        name: "Beginner's Meadow",
        nodes: [
            { id: 1, name: 'First Steps', type: 'RACE', position: { top: '80%', left: '15%' }, bots: [{ name: 'Rookie', targetWpm: 20, evolution: Evolution.STAMINA }] },
            { id: 2, name: 'Training', type: 'TRAINING', position: { top: '65%', left: '30%' } },
            { id: 3, name: 'The Bridge', type: 'RACE', position: { top: '50%', left: '15%' }, bots: [{ name: 'Walker', targetWpm: 25, evolution: Evolution.ATHLETIC }, { name: 'Pacer', targetWpm: 28, evolution: Evolution.STAMINA }] },
            { id: 4, name: 'The Shop', type: 'SHOP', position: { top: '35%', left: '30%' } },
            { id: 5, name: 'Meadow Boss', type: 'BOSS', position: { top: '20%', left: '15%' }, bossId: 'paddles' },
        ],
    },
    {
        name: "Quagmire Swamp",
        nodes: [
             { id: 6, name: 'Muddy Path', type: 'RACE', position: { top: '20%', left: '45%' }, bots: [{ name: 'Slogger', targetWpm: 45, evolution: Evolution.STAMINA }, { name: 'Mire', targetWpm: 50, evolution: Evolution.STAMINA }] },
             { id: 7, name: 'Bog Race', type: 'RACE', position: { top: '40%', left: '60%' }, bots: [{ name: 'Swampy', targetWpm: 55, evolution: Evolution.ATHLETIC }, { name: 'Leech', targetWpm: 58, evolution: Evolution.INTELLECT }] },
             { id: 8, name: 'Swamp Boss', type: 'BOSS', position: { top: '60%', left: '45%' }, bossId: 'quackmire' },
        ]
    },
     {
        name: "Sky High Peaks",
        nodes: [
             { id: 9, name: 'Cliffside Dash', type: 'RACE', position: { top: '60%', left: '75%' }, bots: [{ name: 'Rocky', targetWpm: 70, evolution: Evolution.ATHLETIC }, { name: 'Vertigo', targetWpm: 72, evolution: Evolution.STAMINA }] },
             { id: 10, name: 'Summit Sprint', type: 'RACE', position: { top: '40%', left: '85%' }, bots: [{ name: 'EagleEye', targetWpm: 78, evolution: Evolution.INTELLECT }, { name: 'Peak', targetWpm: 80, evolution: Evolution.INTELLECT }] },
             { id: 11, name: 'Peak Boss', type: 'BOSS', position: { top: '20%', left: '75%' }, bossId: 'aeroduck' },
        ]
    },
    {
        name: "Champion's Arena",
        nodes: [
            { id: 12, name: 'Final Challenge', type: 'BOSS', position: { top: '80%', left: '90%' }, bossId: 'champion' },
        ]
    }
];

export const mapService = {
    getMapData: (): MapZone[] => {
        return mapData;
    },
    
    getAllNodes: (): MapNode[] => {
        return mapData.flatMap(zone => zone.nodes);
    },

    getNodeById: (id: number): MapNode | undefined => {
        return mapData.flatMap(zone => zone.nodes).find(node => node.id === id);
    },
    
    getNodeByBossId: (bossId: string): MapNode | undefined => {
        return mapData.flatMap(zone => zone.nodes).find(node => node.bossId === bossId);
    }
};
