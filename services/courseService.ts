// FIX: Imported `CourseLesson` to resolve TypeScript error.
import { CourseSection, CourseLesson } from '../types';

const COURSE_PROGRESS_KEY = 'gemini-type-racer-course-progress';

const courseStructure: CourseSection[] = [
    {
        title: "The Home Row",
        lessons: [
            { id: 1, title: "F and J", text: "f j f j fj fj fj", goals: { wpm: 10, accuracy: 90 } },
            { id: 2, title: "D and K", text: "d k d k dk dk dk", goals: { wpm: 12, accuracy: 92 } },
            { id: 3, title: "S and L", text: "s l s l sl sl sl", goals: { wpm: 14, accuracy: 93 } },
            { id: 4, title: "A and ;", text: "a ; a ; a; a; a;", goals: { wpm: 15, accuracy: 94 } },
            { id: 5, title: "Home Row Words", text: "a sad lad asks a flask; a fad;", goals: { wpm: 18, accuracy: 95 } },
        ]
    },
    {
        title: "The Top Row",
        lessons: [
            { id: 6, title: "R and U", text: "r u r u ru ru ru", goals: { wpm: 20, accuracy: 92 } },
            { id: 7, title: "E and I", text: "e i e i ei ei ei", goals: { wpm: 22, accuracy: 93 } },
            { id: 8, title: "W and O", text: "w o w o wo wo wo", goals: { wpm: 23, accuracy: 94 } },
            { id: 9, title: "Q and P", text: "q p q p qp qp qp", goals: { wpm: 24, accuracy: 94 } },
            { id: 10, title: "Top Row Words", text: "we were quiet; you quit your post; a true poet", goals: { wpm: 25, accuracy: 95 } },
        ]
    },
    {
        title: "The Bottom Row",
        lessons: [
            { id: 11, title: "M and V", text: "m v m v mv mv mv", goals: { wpm: 26, accuracy: 92 } },
            { id: 12, title: "C and ,", text: "c , c , c, c, c,", goals: { wpm: 27, accuracy: 93 } },
            { id: 13, title: "X and .", text: "x . x . x. x. x.", goals: { wpm: 28, accuracy: 94 } },
            { id: 14, title: "Z and /", text: "z / z / z/ z/ z/", goals: { wpm: 28, accuracy: 94 } },
            { id: 15, title: "Bottom Row Words", text: "a brave, bold man; fix the vexing problem.", goals: { wpm: 30, accuracy: 95 } },
        ]
    }
];

export const courseService = {
    getCourseStructure: (): CourseSection[] => {
        return courseStructure;
    },

    getCourseProgress: (): number => {
        try {
            const progress = localStorage.getItem(COURSE_PROGRESS_KEY);
            return progress ? parseInt(progress, 10) : 1; // Default to lesson 1 unlocked
        } catch (e) {
            console.error("Failed to get course progress", e);
            return 1;
        }
    },

    saveCourseProgress: (highestUnlockedId: number) => {
        try {
            localStorage.setItem(COURSE_PROGRESS_KEY, highestUnlockedId.toString());
        } catch (e) {
            console.error("Failed to save course progress", e);
        }
    },

    getTotalLessons: (): number => {
        return courseStructure.reduce((total, section) => total + section.lessons.length, 0);
    },

    getLessonById: (id: number): CourseLesson | null => {
        for (const section of courseStructure) {
            const lesson = section.lessons.find(l => l.id === id);
            if (lesson) return lesson;
        }
        return null;
    }
};