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
        <div className="w-full max-w-4xl bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold text-cyan-400">Typing Course</h2>
                <button onClick={() => setGameState(GameState.LOBBY)} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Back to Lobby
                </button>
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                {courseStructure.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <h3 className="text-2xl font-bold text-slate-300 border-b-2 border-slate-700 pb-2 mb-4">
                            {section.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.lessons.map(lesson => {
                                const isUnlocked = lesson.id <= courseProgress;
                                const isNext = lesson.id === courseProgress;
                                const isCompleted = lesson.id < courseProgress;
                                
                                let statusClasses = 'bg-slate-700/50 border-slate-600';
                                if (isCompleted) {
                                    statusClasses = 'bg-green-900/40 border-green-700';
                                } else if (isUnlocked) {
                                    statusClasses = 'bg-cyan-900/40 border-cyan-700 hover:bg-cyan-900/60';
                                }

                                return (
                                    <button 
                                        key={lesson.id}
                                        onClick={() => handleLessonClick(lesson)}
                                        disabled={!isUnlocked}
                                        className={`p-4 rounded-lg border-2 text-left transition-all relative ${statusClasses} ${isNext ? 'animate-pulse' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400">Lesson {lesson.id}</p>
                                                <h4 className="font-bold text-lg text-slate-200">{lesson.title}</h4>
                                            </div>
                                            <div className="text-2xl">
                                                {isCompleted ? '✅' : isUnlocked ? '▶️' : '🔒'}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-600/50">
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
