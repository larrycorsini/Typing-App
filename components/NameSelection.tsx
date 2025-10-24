

import React, { useState } from 'react';
import { soundService } from '../services/soundService';

interface NameSelectionProps {
  onNameSubmit: (name: string) => void;
}

const LOGO_IMAGE = "/typeracer.jpg";

const NameSelection: React.FC<NameSelectionProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      soundService.init(); // Initialize audio on first user interaction
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <img src={LOGO_IMAGE} alt="Gemini Type Racer Logo" className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-4 border-slate-700" />
      <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-4">Gemini Type Racer</h1>
      <p className="text-slate-400 mb-8">Enter your name to join the race!</p>
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