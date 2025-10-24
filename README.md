
# Gemini Type Racer

Welcome to Gemini Type Racer, a modern, feature-rich typing game where you can test your speed and accuracy against dynamic AI opponents, race against your own best performance, and track your progress with persistent stats and achievements. The typing passages are generated on-the-fly by Google's Gemini API, providing a unique challenge every time.

![Gemini Type Racer Gameplay](https://storage.googleapis.com/aistudio-hosting/generative-ai-studio/assets/gemini-type-racer-screenshot.png)

---

## ✨ Features

- **Dynamic Content via Gemini API**: Never type the same thing twice! Choose from various themes, and the Gemini API will generate a unique paragraph for you to race with.
- **Multiple Game Modes**:
    - **Solo Race**: Compete against two AI bots with Easy, Medium, or Hard difficulty settings.
    - **Public Race**: Simulate a race against a larger lobby of 4 AI opponents with a wide range of skills.
    - **Ghost Race**: Race against a recording of your own personal best performance to visualize your improvement.
- **Themed Content Packs**: Select your favorite theme for a customized typing experience:
    - Harry Potter
    - Famous Movie Quotes
    - Popular Song Lyrics
    - JavaScript Code Snippets
- **Persistent Player Stats**: Your performance is saved locally. Track your total races, wins, win rate, best WPM, and average WPM/accuracy over time.
- **Post-Race WPM Chart**: Visualize your typing speed throughout the race with a clean, SVG-based line graph.
- **Achievements & Milestones**: Unlock achievements for reaching milestones like your first win, achieving 100 WPM, or finishing a race with perfect accuracy.
- **Local Leaderboard**: See how your best races stack up against your other top scores.
- **Procedural Sound Effects**: Immersive, lightweight audio feedback for keystrokes and game events, generated with the Web Audio API.
- **Fully Accessible**: Designed with accessibility in mind, featuring full keyboard navigation, ARIA attributes for screen readers, and focus trapping in all modal dialogs.

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Core API**: Google Gemini API (`@google/genai`)
- **Audio**: Web Audio API (for procedural sound effects)

---

## 🚀 Architectural Overview

This project is built with a modern frontend architecture focused on scalability, maintainability, and separation of concerns.

### Project Structure

The codebase is organized into logical directories:

-   `components/`: Contains reusable React components that make up the UI.
-   `services/`: Houses modules that handle external interactions and business logic (e.g., `geminiService`, `achievementService`, `soundService`).
-   `hooks/`: Includes custom React hooks for managing complex, reusable component logic (e.g., `useTypingGame`, `useFocusTrap`).
-   `store.ts`: The central Zustand store, acting as the single source of truth for all global application state.
-   `types.ts`: A centralized file for all TypeScript type definitions and interfaces.

### Core Concepts

#### State Management with Zustand

The application's state is managed by a centralized **Zustand store** (`store.ts`). This approach was chosen over component-level state (`useState`) to handle the app's growing complexity and avoid prop-drilling.

-   **Single Source of Truth**: All critical game state, UI state, and player data reside in the store.
-   **Actions**: State mutations are handled by clearly defined actions within the store, making state changes predictable.
-   **`AppStateSync` Component**: A unique bridge component that synchronizes the state from the `useTypingGame` hook (which contains the core typing logic) with the global Zustand store. It also manages the main game loop (`setInterval`).

#### Accessibility (a11y)

Accessibility was a primary consideration during development.
-   **Focus Trapping**: The `useFocusTrap` custom hook ensures that when a modal is open, keyboard focus is trapped within it, preventing users from accidentally tabbing to elements in the background. It also allows closing modals with the `Escape` key.
-   **Semantic HTML & ARIA**: Proper HTML5 elements and ARIA attributes (e.g., `role`, `aria-modal`, `aria-label`) are used to provide context to screen readers and other assistive technologies.
-   **Keyboard Navigation**: All interactive elements are fully navigable and operable using only a keyboard.

#### Dynamic Content Generation

The `geminiService.ts` is responsible for all interactions with the **Google Gemini API**. It dynamically constructs prompts based on the user's selected theme and difficulty, ensuring a fresh and relevant typing challenge for every race. It includes robust error handling with a fallback paragraph to maintain a seamless user experience.
