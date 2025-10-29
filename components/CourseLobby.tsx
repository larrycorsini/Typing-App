import React from 'react';
import { useStore } from '../store';
import { courseService } from '../services/courseService';
import { GameState, CourseLesson } from '../types';

const CourseLobby: React.FC = () => {
    const { courseProgress, startCourseLesson, setGameState } = useStore();
    const courseStructure = courseService.getCourseStructure();

    const handleLessonClick = (lesson: CourseLesson) => {
        if (lesson.id <= courseProgress) {
            startCourseLesson(lesson);
        }
    };

    return (
        <div className="card w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold">Typing Course</h2>
                <button onClick={() => setGameState(GameState.ADVENTURE_MAP)} className="btn btn-secondary">
                    Back to Map
                </button>
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                {courseStructure.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <h3 className="text-2xl font-bold border-b-2 border-[var(--dl-dirt)] pb-2 mb-4">
                            {section.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.lessons.map(lesson => {
                                const isUnlocked = lesson.id <= courseProgress;
                                const isNext = lesson.id === courseProgress;
                                const isCompleted = lesson.id < courseProgress;
                                
                                let statusClasses = 'bg-[#e9ddb8] border-[var(--dl-dirt)]';
                                if (isCompleted) {
                                    statusClasses = 'bg-[#d1e7dd] border-[var(--dl-green-dark)]';
                                } else if (isUnlocked) {
                                    statusClasses = 'bg-[#d1ecf1] border-[var(--dl-blue)] hover:bg-[#bce8f1]';
                                }

                                return (
                                    <button 
                                        key={lesson.id}
                                        onClick={() => handleLessonClick(lesson)}
                                        disabled={!isUnlocked}
                                        className={`p-4 rounded-lg border-4 text-left transition-all relative ${statusClasses} ${isNext ? 'animate-pulse' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs opacity-70">Lesson {lesson.id}</p>
                                                <h4 className="font-bold text-lg">{lesson.title}</h4>
                                            </div>
                                            <div className="text-2xl">
                                                {isCompleted ? '✅' : isUnlocked ? '▶️' : '🔒'}
                                            </div>
                                        </div>
                                        <div className="text-xs opacity-70 mt-3 pt-2 border-t border-[var(--dl-dirt)]">
                                            Goal: {lesson.goals.wpm} WPM, {lesson.goals.accuracy}% Acc
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseLobby;