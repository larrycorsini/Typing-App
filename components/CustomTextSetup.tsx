import React, { useState } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';

const CustomTextSetup: React.FC = () => {
    const { startCustomTextGame, setGameState } = useStore();
    const [text, setText] = useState('');

    const handleStart = () => {
        if (text.trim().length >= 20) {
            startCustomTextGame(text);
        }
    };

    return (
        <div className="card text-center w-full max-w-3xl">
            <h2 className="text-4xl font-bold">Custom Text Race</h2>
            <p className="opacity-80 mt-2 mb-6">Paste your own text below to start a practice race. (Min 20 characters)</p>
            
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-48 bg-white text-lg p-4 rounded-lg border-4 border-[var(--dl-text)] focus:border-yellow-500 focus:ring-0 focus:outline-none transition-colors mb-4 resize-none"
            />

            <div className="flex gap-4">
                 <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="btn btn-secondary w-1/3">
                    Back
                </button>
                <button
                    onClick={handleStart}
                    disabled={text.trim().length < 20}
                    className="btn btn-primary w-2/3"
                >
                    Start Race
                </button>
            </div>
        </div>
    );
};

export default CustomTextSetup;