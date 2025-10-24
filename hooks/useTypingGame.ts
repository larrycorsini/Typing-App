
import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingStats, WpmDataPoint, RaceMode } from '../types';
import { soundService } from '../services/soundService';

const ENDURANCE_DURATION_SECONDS = 60;
const ENDURANCE_WORD_POOL = "the of to and a in is it you that he was for on are with as I his they be at one have this from or had by but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them write would like so these her long make thing see him two has look who may part come its now find than first water been called who am its now find day did get come made may part".split(" ");

const generateEnduranceText = () => {
    let words = [];
    for (let i = 0; i < 200; i++) {
        words.push(ENDURANCE_WORD_POOL[Math.floor(Math.random() * ENDURANCE_WORD_POOL.length)]);
    }
    return words.join(" ");
};

export const useTypingGame = (initialText: string, raceMode: RaceMode | null, isGameActive: boolean) => {
  const [textToType, setTextToType] = useState(initialText);
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

  useEffect(() => {
    if (raceMode === RaceMode.ENDURANCE) {
        setTextToType(generateEnduranceText());
    } else {
        setTextToType(initialText);
    }
  }, [initialText, raceMode]);

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
    if (raceMode === RaceMode.ENDURANCE) {
        setTextToType(generateEnduranceText());
    } else {
        setTextToType(initialText);
    }
  }, [raceMode, initialText]);
  
  useEffect(() => {
    if (!isGameActive) {
      startTimeRef.current = null;
      if (enduranceTimerRef.current) clearTimeout(enduranceTimerRef.current);
    }
  }, [isGameActive]);

  useEffect(() => {
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

  return { typed, errors, stats, isFinished, reset, wpmHistory, textToType };
};
