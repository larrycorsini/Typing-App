
import React, { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';

interface CountdownProps {
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      soundService.playCountdownTick();
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      soundService.playRaceStart();
      const timer = setTimeout(() => onComplete(), 500); // Give "Go!" a moment to display
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  const displayText = count > 0 ? count : 'Go!';

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div key={count} className="text-9xl font-bold dl-title-text animate-countdownZoom">
        {displayText}
      </div>
    </div>
  );
};

export default Countdown;