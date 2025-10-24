
import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingStats, WpmDataPoint, RaceMode } from '../types';
import { soundService } from '../services/soundService';

const ENDURANCE_DURATION_SECONDS = 60;

// The textToType is now passed directly as a prop, not as `initialText`.
// This breaks the feedback loop.
export const useTypingGame = (textToType: string, raceMode: RaceMode | null, isGameActive: boolean) => {
  const [typed, setTyped] = useState<string>('');
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 0, progress: 0, mistypedChars: {} });
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const correctCharsRef = useRef<number>(0);
  const lastHistoryPushTimeRef = useRef<number>(0);
  const mistypedCharsRef = useRef<Record<string, number>>({});
  const enduranceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // The reset function no longer manages text. The store will provide new text.
  const reset = useCallback(() => {
    setTyped('');
    setErrors(new Set());
    setStats({ wpm: 0, accuracy: 0, progress: 0, mistypedChars: {} });
    setIsFinished(false);
    setWpmHistory([]);
    startTimeRef.current = null;
    correctCharsRef.current = 0;
    lastHistoryPushTimeRef.current = 0;
    mistypedCharsRef.current = {};
    if (enduranceTimerRef.current) clearTimeout(enduranceTimerRef.current);
  }, []);
  
  useEffect(() => {
    if (!isGameActive) {
      startTimeRef.current = null;
      if (enduranceTimerRef.current) clearTimeout(enduranceTimerRef.current);
    }
  }, [isGameActive]);

  useEffect(() => {
    // The finish condition now correctly depends on the prop `textToType`.
    if (raceMode !== RaceMode.ENDURANCE && typed.length === textToType.length && errors.size === 0 && textToType.length > 0) {
      setIsFinished(true);
    }
  }, [typed, textToType, errors, raceMode]);

  const calculateStats = useCallback(() => {
    if (!startTimeRef.current) return;

    const now = Date.now();
    const elapsedTime = (now - startTimeRef.current) / 1000 / 60; // in minutes
    if (elapsedTime === 0) return;
    
    const wpm = (correctCharsRef.current / 5) / elapsedTime;
    const typedChars = typed.length;
    const totalChars = typedChars + errors.size;
    const accuracy = totalChars > 0 ? (typedChars / totalChars) * 100 : 100;
    // The progress calculation now correctly depends on the prop `textToType`.
    const progress = (correctCharsRef.current / textToType.length) * 100;

    const newStats: TypingStats = {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      progress: progress,
      mistypedChars: mistypedCharsRef.current
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
        if (raceMode === RaceMode.ENDURANCE) {
            enduranceTimerRef.current = setTimeout(() => {
                setIsFinished(true);
            }, ENDURANCE_DURATION_SECONDS * 1000);
        }
    }

    if (key === 'Backspace') {
      e.preventDefault();
      soundService.playKeyStroke(true); // Treat backspace as a "correction" sound
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
      // Logic correctly depends on the prop `textToType`.
      if (typed.length < textToType.length) {
        if (key === textToType[typed.length]) {
          soundService.playKeyStroke(false);
          if (errors.size === 0) {
            correctCharsRef.current += 1;
          }
        } else {
          soundService.playKeyStroke(true);
          const wrongChar = textToType[typed.length];
          mistypedCharsRef.current[wrongChar] = (mistypedCharsRef.current[wrongChar] || 0) + 1;
          setErrors((prev) => new Set(prev).add(typed.length));
        }
        setTyped((prev) => prev + key);
      }
    }
    calculateStats();
  }, [isGameActive, isFinished, typed.length, textToType, errors, calculateStats, raceMode]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { typed, errors, stats, isFinished, reset, wpmHistory };
};
