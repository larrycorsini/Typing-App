import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import TypingArea from './TypingArea';

const TRAINING_DURATION = 20; // seconds
const WORD_POOL = "the and a to of is in it you that he was for on are as with I at his they be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part".split(" ");

const generateText = () => {
    let words = [];
    for (let i = 0; i < 50; i++) {
        words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
    }
    return words.join(" ");
};

const TrainingRunning: React.FC = () => {
    const { finishTraining, lastMistakeTime } = useStore(state => ({ 
        finishTraining: state.finishTraining,
        lastMistakeTime: state.lastMistakeTime
    }));
    const [timeLeft, setTimeLeft] = useState(TRAINING_DURATION);
    const [text, setText] = useState(generateText());
    const [typed, setTyped] = useState('');
    const [errors, setErrors] = useState(new Set<number>());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // The score is the number of correctly typed characters
                    const score = typed.length - errors.size;
                    finishTraining('running', Math.max(0, score));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [typed, errors, finishTraining]);
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (timeLeft <= 0) return;
        const { key } = e;

        if (key === 'Backspace') {
            e.preventDefault();
            setTyped(prev => prev.slice(0, -1));
            const newErrors = new Set(errors);
            newErrors.delete(typed.length - 1);
            setErrors(newErrors);
        } else if (key.length === 1) {
            e.preventDefault();
            if (typed.length >= text.length) {
                // Generate more text if needed
                setText(prev => prev + ' ' + generateText());
            }
            if (key !== text[typed.length]) {
                setErrors(prev => new Set(prev).add(typed.length));
            }
            setTyped(prev => prev + key);
        }
    }, [timeLeft, typed, text, errors]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="card w-full max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-2">Running Training: Keyboard Dash</h1>
            <p className="opacity-80 mb-6">Type as many words as you can before the timer runs out!</p>
            <div className="text-6xl font-bold text-[var(--dl-yellow-shadow)] mb-6">{timeLeft}</div>
            {/* FIX: Add the missing focusWordsCount prop, which is required by TypingArea. */}
            <TypingArea textToType={text} typed={typed} errors={errors} lastMistakeTime={lastMistakeTime} focusWordsCount={0} />
        </div>
    );
};

export default TrainingRunning;