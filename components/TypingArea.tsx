import React from 'react';

interface TypingAreaProps {
  textToType: string;
  typed: string;
  errors: Set<number>;
  lastMistakeTime: number; // Used to trigger animation
}

const TypingArea: React.FC<TypingAreaProps> = ({ textToType, typed, errors, lastMistakeTime }) => {
  const safeTextToType = typeof textToType === 'string' ? textToType : '';
  
  // A key that changes when a mistake is made to re-trigger the animation
  const animationKey = `mistake-${lastMistakeTime}`;

  return (
    <div className="card text-2xl md:text-3xl leading-relaxed tracking-wider select-none font-medium">
      {safeTextToType.split('').map((char, index) => {
        let charClass = 'text-[var(--dl-text)] opacity-50'; // Default un-typed text
        let isCursor = index === typed.length;
        
        if (index < typed.length) {
          charClass = errors.has(index) ? 'text-[var(--dl-red)]' : 'text-[var(--dl-text)]';
        }

        return (
          <span key={index} className={`${charClass} relative`}>
            {isCursor && (
              <span 
                key={animationKey}
                className={`absolute left-0 top-0 bottom-0 w-full bg-[var(--dl-yellow)] opacity-40 rounded-sm 
                  ${lastMistakeTime > 0 ? 'animate-subtleGlow' : 'animate-pulse'}`} 
              />
            )}
            {char === ' ' && typed[index] !== ' ' && errors.has(index) ? (
              <span className="bg-[var(--dl-red)] rounded-sm">_</span>
            ) : (
              char
            )}
          </span>
        );
      })}
    </div>
  );
};

export default TypingArea;