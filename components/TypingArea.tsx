
import React from 'react';

interface TypingAreaProps {
  textToType: string;
  typed: string;
  errors: Set<number>;
}

const TypingArea: React.FC<TypingAreaProps> = ({ textToType, typed, errors }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-2xl md:text-3xl leading-relaxed tracking-wider select-none font-medium">
      {textToType.split('').map((char, index) => {
        let charClass = 'text-slate-500';
        let isCursor = index === typed.length;
        
        if (index < typed.length) {
          charClass = errors.has(index) ? 'text-red-500' : 'text-cyan-400';
        }

        return (
          <span key={index} className={`${charClass} relative`}>
            {isCursor && (
              <span className="absolute left-0 top-0 bottom-0 w-full bg-cyan-400 opacity-20 rounded-sm animate-pulse" />
            )}
            {char === ' ' && typed[index] !== ' ' && errors.has(index) ? (
              <span className="bg-red-500 rounded-sm">_</span>
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
