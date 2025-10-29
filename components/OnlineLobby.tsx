import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

const OnlineLobby: React.FC = () => {
    const { 
        onlineRooms, 
        currentRoomId,
        players, 
        socketStatus, 
        createOnlineRoom, 
        joinOnlineRoom, 
        setGameState,
        onlineCountdown
    } = useStore();

    if (currentRoomId) {
        return (
            <div className="card text-center w-full max-w-2xl">
                <h2 className="text-4xl font-bold">Online Race Room</h2>
                <p className="opacity-80 mt-2 mb-6">
                    {onlineCountdown > 0 ? `Race starting in ${onlineCountdown}...` : 'Waiting for more players...'}
                </p>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 border-y-2 border-[var(--dl-dirt)] py-4 mb-6">
                    {players.map((player) => (
                        <div key={player.id} className="flex justify-between items-center bg-[#e9ddb8] p-3 rounded-lg animate-fadeIn">
                             <span className={`font-semibold ${player.isPlayer ? 'text-[var(--dl-blue-shadow)]' : ''}`}>{player.name} {player.isPlayer && '(You)'}</span>
                             <span className="text-sm text-[var(--dl-green-dark)]">Ready</span>
                        </div>
                    ))}
                </div>
                 <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="w-full btn btn-danger">
                    Leave Room
                </button>
            </div>
        );
    }

    return (
        <div className="card text-center w-full max-w-3xl">
            <h2 className="text-4xl font-bold">Online Lobby</h2>
            <p className="opacity-80 mt-2 mb-6">Join a room or create a new one to race against others.</p>
            <p className="text-sm text-[var(--dl-yellow-shadow)] mb-4">Status: {socketStatus}</p>

            <div className="flex gap-4 mb-6">
                <button onClick={createOnlineRoom} className="flex-1 btn btn-success">
                    Create New Room
                </button>
                 <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="flex-1 btn btn-secondary">
                    Back to Map
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-4">Available Rooms</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border-t-2 border-[var(--dl-dirt)] pt-4">
                {onlineRooms.length > 0 ? onlineRooms.map(room => (
                    <div key={room.id} className="flex justify-between items-center bg-[#e9ddb8] p-4 rounded-lg">
                        <div>
                            <p className="font-bold text-lg">Room {room.id}</p>
                            <p className="text-sm opacity-70">{room.players.map(p => p.name).join(', ')}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold">{room.playerCount} / 8</p>
                             <button 
                                onClick={() => joinOnlineRoom(room.id)}
                                disabled={room.state !== 'waiting' || room.playerCount >= 8}
                                className="mt-1 btn btn-primary text-sm p-2"
                             >
                                {room.state === 'waiting' ? 'Join' : 'In Progress'}
                             </button>
                        </div>
                    </div>
                )) : (
                    <p className="opacity-70 py-8">No rooms available. Why not create one?</p>
                )}
            </div>
        </div>
    );
};

export default OnlineLobby;