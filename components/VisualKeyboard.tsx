import React, { useMemo } from 'react';

interface VisualKeyboardProps {
    textToType: string;
    typed: string;
    lastMistakeTime: number;
}

const keyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const fingerMap: Record<string, { finger: string, className: string }> = {
    'q': { finger: 'L Pinky', className: 'finger-guide--L-pinky' },
    'a': { finger: 'L Pinky', className: 'finger-guide--L-pinky' },
    'z': { finger: 'L Pinky', className: 'finger-guide--L-pinky' },
    'w': { finger: 'L Ring', className: 'finger-guide--L-ring' },
    's': { finger: 'L Ring', className: 'finger-guide--L-ring' },
    'x': { finger: 'L Ring', className: 'finger-guide--L-ring' },
    'e': { finger: 'L Middle', className: 'finger-guide--L-middle' },
    'd': { finger: 'L Middle', className: 'finger-guide--L-middle' },
    'c': { finger: 'L Middle', className: 'finger-guide--L-middle' },
    'r': { finger: 'L Index', className: 'finger-guide--L-index' },
    'f': { finger: 'L Index', className: 'finger-guide--L-index' },
    'v': { finger: 'L Index', className: 'finger-guide--L-index' },
    't': { finger: 'L Index', className: 'finger-guide--L-index' },
    'g': { finger: 'L Index', className: 'finger-guide--L-index' },
    'b': { finger: 'L Index', className: 'finger-guide--L-index' },
    'y': { finger: 'R Index', className: 'finger-guide--R-index' },
    'h': { finger: 'R Index', className: 'finger-guide--R-index' },
    'n': { finger: 'R Index', className: 'finger-guide--R-index' },
    'u': { finger: 'R Index', className: 'finger-guide--R-index' },
    'j': { finger: 'R Index', className: 'finger-guide--R-index' },
    'm': { finger: 'R Index', className: 'finger-guide--R-index' },
    'i': { finger: 'R Middle', className: 'finger-guide--R-middle' },
    'k': { finger: 'R Middle', className: 'finger-guide--R-middle' },
    ',': { finger: 'R Middle', className: 'finger-guide--R-middle' },
    'o': { finger: 'R Ring', className: 'finger-guide--R-ring' },
    'l': { finger: 'R Ring', className: 'finger-guide--R-ring' },
    '.': { finger: 'R Ring', className: 'finger-guide--R-ring' },
    'p': { finger: 'R Pinky', className: 'finger-guide--R-pinky' },
    ';': { finger: 'R Pinky', className: 'finger-guide--R-pinky' },
    '/': { finger: 'R Pinky', className: 'finger-guide--R-pinky' },
    ' ': { finger: 'Thumb', className: 'finger-guide--thumb' },
};

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ textToType, typed, lastMistakeTime }) => {
    const nextChar = textToType[typed.length];
    const mistypedChar = useMemo(() => {
        // This logic makes the red flash appear on the key that was pressed, not the one that was expected
        if (lastMistakeTime > 0) {
            return typed[typed.length - 1];
        }
        return null;
    }, [lastMistakeTime, typed]);

    return (
        <div className="visual-keyboard">
            {keyLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map(key => {
                        const isNext = key === nextChar;
                        const isMistake = key === mistypedChar;
                        const fingerInfo = fingerMap[key];
                        
                        return (
                            <div
                                key={key}
                                className={`keyboard-key ${isNext ? 'keyboard-key--next' : ''} ${isMistake ? 'keyboard-key--mistake' : ''}`}
                            >
                                {isNext && fingerInfo && (
                                    <div className={`finger-guide ${fingerInfo.className}`}>
                                        {fingerInfo.finger}
                                    </div>
                                )}
                                {key}
                            </div>
                        );
                    })}
                </div>
            ))}
            <div className="keyboard-row">
                 <div className={`keyboard-key ${' ' === nextChar ? 'keyboard-key--next' : ''} ${' ' === mistypedChar ? 'keyboard-key--mistake' : ''}`} style={{minWidth: '250px'}}>
                     {' ' === nextChar && fingerMap[' '] && (
                         <div className={`finger-guide ${fingerMap[' '].className}`}>
                             {fingerMap[' '].finger}
                         </div>
                     )}
                     Space
                 </div>
            </div>
        </div>
    );
};

export default VisualKeyboard;