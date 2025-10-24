
# Gemini Type Racer

Welcome to Gemini Type Racer, a modern, feature-rich typing game where you can test your speed and accuracy against dynamic AI opponents, race against your own best performance, and compete in simulated live multiplayer lobbies. The typing passages are generated on-the-fly by Google's Gemini API, providing a unique challenge every time.

![Gemini Type Racer Gameplay](https://storage.googleapis.com/aistudio-hosting/generative-ai-studio/assets/gemini-type-racer-screenshot.png)

---

## ✨ Features

- **Dynamic Content via Gemini API**: Never type the same thing twice! Choose from various themes, and the Gemini API will generate a unique paragraph for you to race with.
- **Multiple Game Modes**:
    - **Solo Race**: Compete against AI bots with Easy, Medium, or Hard difficulty settings.
    - **Public Race**: Simulate a race against a larger lobby of AI opponents with a wide range of skills.
    - **Ghost Race**: Race against a recording of your own personal best performance to visualize your improvement.
    - **Live Race**: Join a simulated real-time lobby where players join before a synchronized race begins, mimicking a true online multiplayer experience.
- **Player Customization**: Unlock cosmetic UI themes by earning achievements and equip them in the settings panel to personalize your game.
- **Themed Content Packs**: Select your favorite theme for a customized typing experience, including Harry Potter, Famous Movie Quotes, Song Lyrics, and JavaScript Code Snippets.
- **Persistent Player Stats**: Your performance is saved locally. Track your total races, wins, win rate, best WPM, and average WPM/accuracy over time.
- **Post-Race WPM Chart**: Visualize your typing speed throughout the race with a clean, SVG-based line graph.
- **Achievements & Milestones**: Unlock achievements for reaching milestones like your first win, achieving 100 WPM, or finishing with perfect accuracy. Unlocking certain achievements grants cosmetic rewards.
- **Local & Global Leaderboards**: See how your best races stack up against your personal top scores or compare them against a simulated global leaderboard of elite typists.
- **Immersive Audio**: Procedural sound effects, generated with the Web Audio API, provide lightweight, satisfying feedback for keystrokes and game events.
- **Fully Accessible**: Designed with accessibility in mind, featuring full keyboard navigation, ARIA attributes for screen readers, and focus trapping in all modal dialogs.

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS (via CDN) & CSS Variables for theming
- **Core API**: Google Gemini API (`@google/genai`)
- **Testing**: Jest (via `@jest/globals`) for unit test structure
- **Audio**: Web Audio API (for procedural sound effects)

---

## 🚀 Architectural Overview

This project is built with a modern frontend architecture focused on scalability, maintainability, and separation of concerns.

### Project Structure

-   `components/`: Reusable React components that make up the UI.
-   `services/`: Modules handling external interactions and business logic (e.g., `geminiService`, `achievementService`, `customizationService`).
-   `hooks/`: Custom React hooks for managing complex, reusable component logic (e.g., `useTypingGame`, `useFocusTrap`).
-   `store.ts`: The central Zustand store, acting as the single source of truth for all global application state.
-   `types.ts`: A centralized file for all TypeScript type definitions and interfaces.
-   `services.test.ts`: An example file demonstrating the unit testing pattern for the application's services.

### Core Concepts

#### State Management with Zustand

The application's state is managed by a centralized **Zustand store** (`store.ts`). This avoids prop-drilling and provides a single, predictable source of truth.

-   **Actions**: State mutations are handled by clearly defined actions within the store, making state changes predictable.
-   **`AppStateSync` Component**: This bridge component synchronizes the state from the `useTypingGame` hook (which contains the core typing logic) with the global Zustand store and manages the main game loop (`setInterval`).

#### Accessibility (a11y)

-   **Focus Trapping**: The `useFocusTrap` hook ensures that when a modal is open, keyboard focus is trapped within it. It also allows closing modals with the `Escape` key.
-   **Semantic HTML & ARIA**: Proper HTML5 elements and ARIA attributes (e.g., `role`, `aria-modal`, `aria-label`) provide context to assistive technologies.
-   **Keyboard Navigation**: All interactive elements are fully navigable and operable using only a keyboard.

#### Unit Testing

The project includes a `services.test.ts` file that establishes a foundation for unit testing using a Jest-like syntax. It includes a mock for `localStorage` to ensure tests are isolated and repeatable, demonstrating a commitment to code quality and reliability.
