import React from 'react';

interface TypingAreaProps {
  textToType: string;
  typed: string;
  errors: Set<number>;
  lastMistakeTime: number;
  focusWordsCount: number;
}

const TypingArea: React.FC<TypingAreaProps> = ({ textToType, typed, errors, lastMistakeTime, focusWordsCount }) => {
  const safeTextToType = typeof textToType === 'string' ? textToType : '';
  
  const animationKey = `mistake-${lastMistakeTime}`;

  let focusHighlightEndIndex = -1;
  if (focusWordsCount > 0) {
    const remainingText = safeTextToType.substring(typed.length);
    const wordsToHighlight = remainingText.split(' ').slice(0, focusWordsCount);
    const charsToHighlight = wordsToHighlight.join(' ').length;
    focusHighlightEndIndex = typed.length + charsToHighlight;
  }

  return (
    <div className="card text-2xl md:text-3xl leading-relaxed tracking-wider select-none font-medium">
      {safeTextToType.split('').map((char, index) => {
        let charClass = 'text-[var(--dl-text)] opacity-50';
        let isCursor = index === typed.length;
        let isFocused = focusHighlightEndIndex !== -1 && index >= typed.length && index < focusHighlightEndIndex;
        
        if (index < typed.length) {
          charClass = errors.has(index) ? 'text-[var(--dl-red)]' : 'text-[var(--dl-text)]';
        }

        return (
          <span key={index} className={`${charClass} relative transition-colors duration-200`}>
            {isCursor && (
              <span 
                key={animationKey}
                className={`absolute left-0 top-0 bottom-0 w-full bg-[var(--dl-yellow)] opacity-40 rounded-sm 
                  ${lastMistakeTime > 0 ? 'animate-subtleGlow' : 'animate-pulse'}`} 
              />
            )}
            {isFocused && (
                 <span className="absolute left-0 top-0 bottom-0 w-full bg-yellow-300/30 rounded-sm" />
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