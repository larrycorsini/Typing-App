
let audioContext: AudioContext | null = null;
let isInitialized = false;
let isMutedState = false;

const init = () => {
  if (isInitialized) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
  } catch (e) {
    console.error("Web Audio API is not supported in this browser");
  }
};

const playSound = (type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number, volume: number) => {
  if (!audioContext || isMutedState) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const soundService = {
  init,
  playKeyStroke: (isError = false) => {
    if (isError) {
      playSound('square', 120, 0.15, 0.1);
    } else {
      playSound('sine', 880, 0.1, 0.15);
    }
  },
  playCountdownTick: () => playSound('sine', 440, 0.1, 0.2),
  playRaceStart: () => playSound('sine', 660, 0.2, 0.2),
  playRaceFinish: (isWinner: boolean) => {
    if (isWinner) {
      playSound('sine', 523.25, 0.1, 0.2); // C5
      setTimeout(() => playSound('sine', 659.25, 0.1, 0.2), 100); // E5
      setTimeout(() => playSound('sine', 783.99, 0.1, 0.2), 200); // G5
      setTimeout(() => playSound('sine', 1046.50, 0.2, 0.2), 300); // C6
    } else {
      playSound('sawtooth', 330, 0.1, 0.15);
      setTimeout(() => playSound('sawtooth', 220, 0.2, 0.15), 150);
    }
  },
  toggleMute: () => {
    isMutedState = !isMutedState;
    return isMutedState;
  },
  isMuted: () => isMutedState,
};
