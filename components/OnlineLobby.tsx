import React from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import PlayerCard from './PlayerCard';

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
            <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                <h2 className="text-4xl font-bold text-cyan-400">Online Race Room</h2>
                <p className="text-slate-400 mt-2 mb-6">
                    {onlineCountdown > 0 ? `Race starting in ${onlineCountdown}...` : 'Waiting for more players...'}
                </p>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 border-y-2 border-slate-700/50 py-4 mb-6">
                    {players.map((player) => (
                        <div key={player.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg animate-fadeIn">
                             <span className={`font-semibold ${player.isPlayer ? 'text-cyan-300' : 'text-slate-200'}`}>{player.name} {player.isPlayer && '(You)'}</span>
                             <span className="text-sm text-green-400">Ready</span>
                        </div>
                    ))}
                </div>
                 <button onClick={() => setGameState(GameState.LOBBY)} className="w-full bg-red-600/80 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-500/80">
                    Leave Room
                </button>
            </div>
        );
    }

    return (
        <div className="text-center w-full max-w-3xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-4xl font-bold text-cyan-400">Online Lobby</h2>
            <p className="text-slate-400 mt-2 mb-6">Join a room or create a new one to race against others.</p>
            <p className="text-sm text-yellow-400 mb-4">Status: {socketStatus}</p>

            <div className="flex gap-4 mb-6">
                <button onClick={createOnlineRoom} className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-500">
                    Create New Room
                </button>
                 <button onClick={() => setGameState(GameState.LOBBY)} className="flex-1 bg-slate-600/80 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-500/80">
                    Back to Main Lobby
                </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-300 mb-4">Available Rooms</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border-t-2 border-slate-700/50 pt-4">
                {onlineRooms.length > 0 ? onlineRooms.map(room => (
                    <div key={room.id} className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
                        <div>
                            <p className="font-bold text-lg text-slate-200">Room {room.id}</p>
                            <p className="text-sm text-slate-400">{room.players.map(p => p.name).join(', ')}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold">{room.playerCount} / 8</p>
                             <button 
                                onClick={() => joinOnlineRoom(room.id)}
                                disabled={room.state !== 'waiting' || room.playerCount >= 8}
                                className="mt-1 bg-cyan-500 text-slate-900 font-bold py-1 px-4 rounded-md text-sm hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
                             >
                                {room.state === 'waiting' ? 'Join' : 'In Progress'}
                             </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 py-8">No rooms available. Why not create one?</p>
                )}
            </div>
        </div>
    );
};

export default OnlineLobby;
