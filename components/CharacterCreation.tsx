import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import CharacterDisplay from './CharacterDisplay';
import { PlayerCharacter, Evolution } from '../types';
import { characterService } from '../services/characterService';

interface CharacterCreationProps {
  onCharacterCreate: (name: string, color: string, evolution: Evolution) => void;
}

const LOGO_IMAGE = "typeracer.jpg";
const PREDEFINED_COLORS = ['#FFD700', '#FFFFFF', '#8A2BE2', '#32CD32', '#1E90FF', '#FF4500'];

const evolutionInfo = {
    [Evolution.ATHLETIC]: {
        name: 'Athletic Duck',
        description: 'Born to run. Starts with a higher Running stat for a faster start in races.',
        color: 'bg-red-500'
    },
    [Evolution.STAMINA]: {
        name: 'Stamina Duck',
        description: 'A resilient racer. Has more energy and is less affected by race hazards.',
        color: 'bg-blue-500'
    },
    [Evolution.INTELLECT]: {
        name: 'Intellect Duck',
        description: 'A quick study. Gains bonus XP from every race to level up faster.',
        color: 'bg-purple-500'
    }
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreate }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [selectedEvolution, setSelectedEvolution] = useState<Evolution | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedEvolution) {
      soundService.init();
      onCharacterCreate(name.trim(), color, selectedEvolution);
    }
  };
  
  const previewCharacter: PlayerCharacter = characterService.getDefaultCharacter(selectedEvolution || Evolution.ATHLETIC);
  previewCharacter.color = color;

  return (
    <div className="w-full max-w-2xl mx-auto text-center animate-fadeIn">
      <img src={LOGO_IMAGE} alt="Gemini Type Racer Logo" className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-4 border-slate-700" />
      <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-2">Create Your Racer</h1>
      
      {!selectedEvolution ? (
          <>
            <p className="text-slate-400 mb-8 text-xl">First, choose your duck's evolution:</p>
            <div className="grid md:grid-cols-3 gap-6">
                {(Object.keys(Evolution) as Array<keyof typeof Evolution>).map(key => {
                    const evo = Evolution[key];
                    const info = evolutionInfo[evo];
                    return (
                        <button key={evo} onClick={() => setSelectedEvolution(evo)} className="card text-left p-6 hover:border-cyan-400 hover:scale-105 transition-all duration-200">
                            <div className={`w-8 h-8 rounded-full ${info.color} mb-3`}></div>
                            <h3 className="text-2xl font-bold text-slate-200 mb-2">{info.name}</h3>
                            <p className="text-slate-400">{info.description}</p>
                        </button>
                    )
                })}
            </div>
          </>
      ) : (
        <div className="animate-fadeIn">
            <div className="my-6">
                <CharacterDisplay character={previewCharacter} isPreview={true} />
                <button onClick={() => setSelectedEvolution(null)} className="text-sm text-cyan-400 hover:underline mt-2">Change Evolution</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="mb-2">
                    <p className="text-slate-300 font-semibold mb-3">Customize your duck's color:</p>
                    <div className="flex justify-center gap-3">
                        {PREDEFINED_COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 border-2 ${color === c ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-slate-600'}`}
                                style={{ backgroundColor: c }}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                    </div>
                </div>
              
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
                  className="btn btn-primary text-2xl py-4"
                >
                  Join Lobby
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default CharacterCreation;
