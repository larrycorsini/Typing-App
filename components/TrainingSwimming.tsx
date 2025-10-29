import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';

const ALPHABET = "asdfjkl;";

const generateText = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return result;
};

const TrainingSwimming: React.FC = () => {
    const finishTraining = useStore(state => state.finishTraining);
    const [text, setText] = useState(generateText(100));
    const [typed, setTyped] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameOver) return;
        const { key } = e;

        if (key.length === 1 && ALPHABET.includes(key)) {
            e.preventDefault();
            if (key === text[typed.length]) {
                setTyped(prev => prev + key);
            } else {
                // Game over on first mistake
                setGameOver(true);
                const score = typed.length; // Score is the successful streak
                finishTraining('swimming', score);
            }
        }
    }, [gameOver, typed, text, finishTraining]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="card w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-2">Swimming Training: Rhythm Typing</h1>
            <p className="opacity-80 mb-6">Type the sequence of home row keys. One mistake and it's over!</p>
            
            {gameOver ? (
                <div className="animate-scaleIn">
                    <h2 className="text-5xl font-bold text-[var(--dl-red)] mb-4">Mistake!</h2>
                    <p className="text-2xl">You typed {typed.length} letters correctly.</p>
                    <p className="opacity-80 mt-4">Returning to training ground...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-inner text-3xl font-mono tracking-widest select-none border-4 border-[var(--dl-text)]">
                    <span className="text-[var(--dl-blue-shadow)]">{typed}</span>
                    <span className="relative">
                        <span className="absolute left-0 top-0 bottom-0 w-full bg-[var(--dl-yellow)] opacity-40 rounded-sm animate-pulse" />
                        <span className="opacity-40">{text.substring(typed.length)}</span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default TrainingSwimming;