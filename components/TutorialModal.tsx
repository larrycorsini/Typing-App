import React, { useState } from 'react';
import { useStore } from '../store';
import { useFocusTrap } from '../hooks/useFocusTrap';

const TutorialModal: React.FC = () => {
    const setShowTutorialModal = useStore(state => state.setShowTutorialModal);
    const [step, setStep] = useState(0);
    const trapRef = useFocusTrap<HTMLDivElement>(() => setShowTutorialModal(false));

    const handleClose = () => {
        setShowTutorialModal(false);
    };

    const steps = [
        {
            title: "Welcome to Gemini Type Racer!",
            content: "This quick guide will get you up to speed on the basics of the game. Ready to become a typing champion?",
        },
        {
            title: "The Goal is Simple",
            content: "Type the paragraph that appears on screen as quickly and accurately as possible. Your Words Per Minute (WPM) and accuracy are tracked in real-time. Don't worry about mistakes, just correct them with backspace and keep going!",
        },
        {
            title: "Choose Your Challenge",
            content: (
                <ul className="list-disc list-inside space-y-2 text-left">
                    <li><strong className="text-cyan-300">Solo Modes:</strong> Race against AI bots of varying difficulty.</li>
                    <li><strong className="text-cyan-300">Online Race:</strong> Compete in real-time against players from around the world.</li>
                    <li><strong className="text-cyan-300">Party Race:</strong> A local 'hot-seat' mode to challenge friends on the same device.</li>
                    <li><strong className="text-cyan-300">Practice & Challenges:</strong> Test your stamina in Endurance mode or race with your own text.</li>
                </ul>
            )
        },
        {
            title: "Unlock & Customize",
            content: "As you play, you'll unlock achievements. These can reward you with new UI themes and typing sound packs! Check your progress and customize your experience from the main lobby.",
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-40 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div ref={trapRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h2 id="tutorial-title" className="text-3xl font-bold text-cyan-400 mb-4">{currentStep.title}</h2>
                    <div className="text-slate-300 text-lg mb-8 min-h-[10rem] flex items-center justify-center">
                        {typeof currentStep.content === 'string' ? <p>{currentStep.content}</p> : currentStep.content}
                    </div>
                </div>

                 <div className="flex items-center justify-between mt-4">
                    <div className="flex-1 text-left">
                        <button onClick={handleClose} className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Skip Tutorial
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                         {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 transition-colors">
                                Previous
                            </button>
                        )}
                        {step < steps.length - 1 ? (
                             <button onClick={() => setStep(s => s + 1)} className="bg-cyan-500 text-slate-900 font-bold py-2 px-6 rounded-lg hover:bg-cyan-400 transition-colors">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleClose} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition-colors">
                                Start Racing!
                            </button>
                        )}
                    </div>
                     <div className="flex-1"></div>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
