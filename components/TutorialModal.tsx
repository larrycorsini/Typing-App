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
            content: "Type the paragraph that appears on screen as quickly and accurately as possible to win races and progress on your adventure!",
        },
        {
            title: "The Adventure Map",
            content: "This is your main hub! Click on the flashing icon on the map to start your next race. Winning races unlocks new challenges, training areas, and powerful bosses.",
        },
        {
            title: "Meet Your Duck!",
            content: "This is your racer! Racing costs energy, which replenishes over time. Your duck also has stats like Running, Swimming, and Flying that help you overcome special hazards on the racetrack during races."
        },
        {
            title: "Training & Shopping",
            content: (
                <ul className="list-disc list-inside space-y-2 text-left">
                    <li><strong className="text-[var(--dl-blue-shadow)]">Training Ground:</strong> Unlock this on the map to play minigames that improve your duck's stats. Higher stats make you more competitive!</li>
                    <li><strong className="text-[var(--dl-green-dark)]">Shop:</strong> Unlock the shop to spend coins earned from winning on food to replenish energy and get back to racing faster.</li>
                </ul>
            )
        },
        {
            title: "Championship Bosses",
            content: "At the end of each region, you'll find a powerful Boss racer. You'll need to train your stats to meet their requirements. Defeating them unlocks unique rewards and the next part of the map!"
        },
        {
            title: "Unlock & Customize",
            content: "As you play, you'll level up and unlock achievements that reward you with cool cosmetic items like hats for your duck. Click the pencil icon on your duck in the header to customize its look!",
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="modal-backdrop animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div ref={trapRef} className="dl-modal max-w-lg animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h2 id="tutorial-title" className="text-3xl font-bold mb-4">{currentStep.title}</h2>
                    <div className="text-lg mb-8 min-h-[10rem] flex items-center justify-center opacity-80">
                        {typeof currentStep.content === 'string' ? <p>{currentStep.content}</p> : currentStep.content}
                    </div>
                </div>

                 <div className="flex items-center justify-between mt-4">
                    <div className="flex-1 text-left">
                        <button onClick={handleClose} className="opacity-70 hover:opacity-100 font-semibold py-2 px-4 rounded-lg transition-colors">
                            Skip Tutorial
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                         {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary">
                                Previous
                            </button>
                        )}
                        {step < steps.length - 1 ? (
                             <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleClose} className="btn btn-success">
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