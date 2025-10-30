import { CourseSection, CourseLesson } from '../types';

const COURSE_PROGRESS_KEY = 'gemini-type-racer-course-progress';

const courseStructure: CourseSection[] = [
    {
        title: "The Home Row",
        lessons: [
            { id: 1, title: "F and J", text: "", characterPool: "fj", goals: { wpm: 10, accuracy: 90 } },
            { id: 2, title: "D and K", text: "", characterPool: "dkfj", goals: { wpm: 12, accuracy: 92 } },
            { id: 3, title: "S and L", text: "", characterPool: "sladkfj", goals: { wpm: 14, accuracy: 93 } },
            { id: 4, title: "A and ;", text: "", characterPool: "asdfjkl;", goals: { wpm: 15, accuracy: 94 } },
            { id: 5, title: "Home Row Words", text: "", wordPool: ["a", "sad", "lad", "asks", "a", "flask;", "a", "fad;", "add", "all", "fall", "jalk"], goals: { wpm: 18, accuracy: 95 } },
        ]
    },
    {
        title: "The Top Row",
        lessons: [
            { id: 6, title: "R and U", text: "", characterPool: "ruasdfjkl;", goals: { wpm: 20, accuracy: 92 } },
            { id: 7, title: "E and I", text: "", characterPool: "eiru", goals: { wpm: 22, accuracy: 93 } },
            { id: 8, title: "W and O", text: "", characterPool: "wouier", goals: { wpm: 23, accuracy: 94 } },
            { id: 9, title: "Q and P", text: "", characterPool: "qpeiruw", goals: { wpm: 24, accuracy: 94 } },
            { id: 10, title: "Top Row Words", text: "", wordPool: ["we", "were", "quiet", "you", "quit", "your", "post", "a", "true", "poet", "are", "ask", "see", "sad", "dad"], goals: { wpm: 25, accuracy: 95 } },
        ]
    },
    {
        title: "The Bottom Row",
        lessons: [
            { id: 11, title: "M and V", text: "", characterPool: "mv", goals: { wpm: 26, accuracy: 92 } },
            { id: 12, title: "C and ,", text: "", characterPool: "c,vm", goals: { wpm: 27, accuracy: 93 } },
            { id: 13, title: "X and .", text: "", characterPool: "x.c,vm", goals: { wpm: 28, accuracy: 94 } },
            { id: 14, title: "Z and /", text: "", characterPool: "z/x.c,vm", goals: { wpm: 28, accuracy: 94 } },
            { id: 15, title: "Bottom Row Words", text: "", wordPool: ["a", "brave", "bold", "man", "fix", "the", "vexing", "problem.", "zoo", "extra", "comma"], goals: { wpm: 30, accuracy: 95 } },
        ]
    }
];

// Rewritten to avoid consecutive spaces
const generateTextFromChars = (pool: string, wordCount: number, minWordLen: number, maxWordLen: number): string => {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
        const wordLen = Math.floor(Math.random() * (maxWordLen - minWordLen + 1)) + minWordLen;
        let word = '';
        for (let j = 0; j < wordLen; j++) {
            word += pool.charAt(Math.floor(Math.random() * pool.length));
        }
        words.push(word);
    }
    return words.join(' ');
};

const generateTextFromWords = (pool: string[], wordCount: number): string => {
    let words = [];
    for (let i = 0; i < wordCount; i++) {
        words.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return words.join(' ');
}

export const courseService = {
    getCourseStructure: (): CourseSection[] => {
        return courseStructure;
    },

    getCourseProgress: (): number => {
        try {
            const progress = localStorage.getItem(COURSE_PROGRESS_KEY);
            return progress ? parseInt(progress, 10) : 1;
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
    },
    
    generateTextForLesson: (lesson: CourseLesson): string => {
        if (lesson.wordPool) {
            return generateTextFromWords(lesson.wordPool, 10);
        }
        if (lesson.characterPool) {
            // Generate 8 "words" of 2-5 chars each to prevent double spaces
            return generateTextFromChars(lesson.characterPool, 8, 2, 5);
        }
        return lesson.text;
    }
};