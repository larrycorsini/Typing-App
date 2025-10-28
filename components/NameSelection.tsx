

import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import CharacterDisplay from './CharacterDisplay';
import { PlayerCharacter } from '../types';

interface NameSelectionProps {
  onNameSubmit: (name: string, color: string) => void;
}

const LOGO_IMAGE = "typeracer.jpg";
const PREDEFINED_COLORS = ['#FFD700', '#FFFFFF', '#8A2BE2', '#32CD32', '#1E90FF', '#FF4500'];

const NameSelection: React.FC<NameSelectionProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      soundService.init(); // Initialize audio on first user interaction
      onNameSubmit(name.trim(), color);
    }
  };
  
  const previewCharacter: PlayerCharacter = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      equippedItems: { hat: null, accessory: null },
      color: color,
      running: 1,
      swimming: 1,
      flying: 1,
      energy: 100,
      maxEnergy: 100,
      coins: 0,
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <img src={LOGO_IMAGE} alt="Gemini Type Racer Logo" className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-4 border-slate-700" />
      <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-2">Gemini Type Racer</h1>
      <p className="text-slate-400 mb-6">Create your racer to join the fun!</p>

      <div className="my-6">
        <CharacterDisplay character={previewCharacter} isPreview={true} />
      </div>

      <div className="mb-6">
        <p className="text-slate-300 font-semibold mb-3">Customize your duck's color:</p>
        <div className="flex justify-center gap-3">
            {PREDEFINED_COLORS.map(c => (
                <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 border-2 ${color === c ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                />
            ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Racer Name"
          maxLength={15}
          className="bg-slate-800 text-center text-2xl p-4 rounded-lg border-2 border-slate-700 focus:border-cyan-400 focus:ring-0 focus:outline-none transition-colors"
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="bg-cyan-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-2xl hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Join Lobby
        </button>
      </form>
    </div>
  );
};

export default NameSelection;