import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const TRAINING_DURATION = 20;

const TrainingFlying: React.FC = () => {
    const finishTraining = useStore(state => state.finishTraining);
    const [timeLeft, setTimeLeft] = useState(TRAINING_DURATION);
    const [score, setScore] = useState(0);
    const [targetChar, setTargetChar] = useState('');
    const [position, setPosition] = useState({ top: '50%', left: '50%' });

    const generateNewTarget = useCallback(() => {
        setTargetChar(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
        setPosition({
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
        });
    }, []);

    useEffect(() => {
        generateNewTarget();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishTraining('flying', score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [finishTraining, generateNewTarget, score]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (timeLeft <= 0) return;
        if (e.key === targetChar) {
            setScore(prev => prev + 1);
            generateNewTarget();
        }
    }, [timeLeft, targetChar, generateNewTarget]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="card w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-2">Flying Training: Letter Jumping</h1>
            <p className="opacity-80 mb-6">Type the letter that appears on the screen as fast as you can!</p>
            <div className="flex justify-around items-center mb-6 text-4xl font-bold">
                <div className="text-[var(--dl-yellow-shadow)]">Time: {timeLeft}</div>
                <div className="text-[var(--dl-green-dark)]">Score: {score}</div>
            </div>
            <div className="relative w-full h-64 bg-white rounded-lg border-4 border-[var(--dl-text)] overflow-hidden">
                {timeLeft > 0 && (
                     <div 
                        key={targetChar + position.top}
                        className="absolute text-6xl font-bold text-[var(--dl-text)] p-4 rounded-full bg-[var(--dl-panel-bg)] animate-scaleIn border-2 border-[var(--dl-text)]"
                        style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}
                    >
                        {targetChar}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingFlying;