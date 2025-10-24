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
        <div className="text-center w-full max-w-3xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-4xl font-bold text-cyan-400">Custom Text Race</h2>
            <p className="text-slate-400 mt-2 mb-6">Paste your own text below to start a practice race. (Min 20 characters)</p>
            
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-48 bg-slate-900 text-lg p-4 rounded-lg border-2 border-slate-700 focus:border-cyan-400 focus:ring-0 focus:outline-none transition-colors mb-4 resize-none"
            />

            <div className="flex gap-4">
                 <button onClick={() => setGameState(GameState.LOBBY)} className="w-1/3 bg-slate-600/80 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-500/80">
                    Back
                </button>
                <button
                    onClick={handleStart}
                    disabled={text.trim().length < 20}
                    className="w-2/3 bg-cyan-500 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Start Race with Custom Text
                </button>
            </div>
        </div>
    );
};

export default CustomTextSetup;
