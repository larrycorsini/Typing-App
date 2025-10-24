
import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingStats, WpmDataPoint } from '../types';
import { soundService } from '../services/soundService';

export const useTypingGame = (textToType: string, isGameActive: boolean) => {
  const [typed, setTyped] = useState<string>('');
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 0, progress: 0 });
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const correctCharsRef = useRef<number>(0);
  const lastHistoryPushTimeRef = useRef<number>(0);

  const reset = useCallback(() => {
    setTyped('');
    setErrors(new Set());
    setStats({ wpm: 0, accuracy: 0, progress: 0 });
    setIsFinished(false);
    setWpmHistory([]);
    startTimeRef.current = null;
    correctCharsRef.current = 0;
    lastHistoryPushTimeRef.current = 0;
  }, []);
  
  useEffect(() => {
    if (!isGameActive) {
      startTimeRef.current = null;
    }
  }, [isGameActive]);

  useEffect(() => {
    if (typed.length === textToType.length && errors.size === 0 && textToType.length > 0) {
      setIsFinished(true);
    }
  }, [typed, textToType, errors]);

  const calculateStats = useCallback(() => {
    if (!startTimeRef.current) return;

    const now = Date.now();
    const elapsedTime = (now - startTimeRef.current) / 1000 / 60; // in minutes
    if (elapsedTime === 0) return;
    
    const wpm = (correctCharsRef.current / 5) / elapsedTime;
    const accuracy = typed.length > 0 ? ((typed.length - errors.size) / typed.length) * 100 : 100;
    const progress = (correctCharsRef.current / textToType.length) * 100;

    const newStats = {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      progress: progress,
    };
    setStats(newStats);
    
    if (now - lastHistoryPushTimeRef.current > 2000) {
      setWpmHistory(prev => [...prev, { time: (now - startTimeRef.current!) / 1000, wpm: newStats.wpm, progress: newStats.progress }]);
      lastHistoryPushTimeRef.current = now;
    }

  }, [typed.length, errors.size, textToType.length]);

  useEffect(() => {
    if (isGameActive && typed.length > 0) {
      const interval = setInterval(calculateStats, 500);
      return () => clearInterval(interval);
    }
  }, [isGameActive, typed, calculateStats]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isGameActive || isFinished) return;

    const { key } = e;

    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        setWpmHistory([{ time: 0, wpm: 0, progress: 0 }]);
    }

    if (key === 'Backspace') {
      e.preventDefault();
      soundService.playKeyStroke(true);
      const newErrors = new Set(errors);
      if (newErrors.has(typed.length - 1)) {
        newErrors.delete(typed.length - 1);
      } else {
        correctCharsRef.current = Math.max(0, correctCharsRef.current -1);
      }
      setErrors(newErrors);
      setTyped((prev) => prev.slice(0, -1));
    } else if (key.length === 1) { 
      e.preventDefault();
      if (typed.length < textToType.length) {
        if (key === textToType[typed.length]) {
          soundService.playKeyStroke(false);
          if (errors.size === 0) {
            correctCharsRef.current += 1;
          }
        } else {
          soundService.playKeyStroke(true);
          setErrors((prev) => new Set(prev).add(typed.length));
        }
        setTyped((prev) => prev + key);
      }
    }
    calculateStats();
  }, [isGameActive, isFinished, typed.length, textToType, errors, calculateStats]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { typed, errors, stats, isFinished, reset, wpmHistory };
};
