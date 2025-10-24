
import { CustomizationSoundPack } from "../types";

let audioContext: AudioContext | null = null;
let isInitialized = false;
let isMutedState = false;
let activeSoundPackId: CustomizationSoundPack['id'] = 'classic';

interface SoundProfile {
  type: OscillatorType;
  freq: number;
  duration: number;
  volume: number;
}

const soundPacks: Record<CustomizationSoundPack['id'], { correct: SoundProfile, error: SoundProfile }> = {
    classic: {
        correct: { type: 'sine', freq: 880, duration: 0.1, volume: 0.15 },
        error: { type: 'square', freq: 120, duration: 0.15, volume: 0.1 },
    },
    scifi: {
        correct: { type: 'triangle', freq: 1200, duration: 0.08, volume: 0.12 },
        error: { type: 'sawtooth', freq: 100, duration: 0.2, volume: 0.15 },
    },
    mechanical: {
        correct: { type: 'square', freq: 1500, duration: 0.05, volume: 0.08 },
        error: { type: 'square', freq: 200, duration: 0.1, volume: 0.12 },
    }
};


const init = () => {
  if (isInitialized) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
  } catch (e) {
    console.error("Web Audio API is not supported in this browser");
  }
};

const playSound = (profile: SoundProfile) => {
  if (!audioContext || isMutedState) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = profile.type;
  oscillator.frequency.setValueAtTime(profile.freq, audioContext.currentTime);
  gainNode.gain.setValueAtTime(profile.volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + profile.duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + profile.duration);
};

const playSimpleSound = (type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number, volume: number) => {
    if (!audioContext || isMutedState) return;
    playSound({ type, freq: frequency, duration, volume });
};

export const soundService = {
  init,
  setSoundPack: (packId: CustomizationSoundPack['id']) => {
      activeSoundPackId = packId;
  },
  playKeyStroke: (isError = false) => {
    const pack = soundPacks[activeSoundPackId] || soundPacks.classic;
    playSound(isError ? pack.error : pack.correct);
  },
  playCountdownTick: () => playSimpleSound('sine', 440, 0.1, 0.2),
  playRaceStart: () => playSimpleSound('sine', 660, 0.2, 0.2),
  playRaceFinish: (isWinner: boolean) => {
    if (isWinner) {
      playSimpleSound('sine', 523.25, 0.1, 0.2); // C5
      setTimeout(() => playSimpleSound('sine', 659.25, 0.1, 0.2), 100); // E5
      setTimeout(() => playSimpleSound('sine', 783.99, 0.1, 0.2), 200); // G5
      setTimeout(() => playSimpleSound('sine', 1046.50, 0.2, 0.2), 300); // C6
    } else {
      playSimpleSound('sawtooth', 330, 0.1, 0.15);
      setTimeout(() => playSimpleSound('sawtooth', 220, 0.2, 0.15), 150);
    }
  },
  toggleMute: () => {
    isMutedState = !isMutedState;
    return isMutedState;
  },
  isMuted: () => isMutedState,
};
