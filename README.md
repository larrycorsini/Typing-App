
# Gemini Type Racer

Welcome to Gemini Type Racer, a modern, feature-rich typing game where you can test your speed and accuracy against dynamic AI opponents, race against your own best performance, compete in **real-time online multiplayer**, or challenge friends in local "hotseat" mode. The typing passages are generated on-the-fly by Google's Gemini API, providing a unique challenge every time.

![Gemini Type Racer Gameplay](https://storage.googleapis.com/aistudio-hosting/generative-ai-studio/assets/gemini-type-racer-screenshot.png)

---

## ✨ Features

- **Real-Time Online Multiplayer**: Join a public lobby, create a room, and race against players from around the world. Your progress is updated character-by-character for a thrilling, competitive experience.
- **Dynamic Content via Gemini API**: Never type the same thing twice! Choose from various themes, and the Gemini API will generate a unique paragraph for you.
- **Multiple Game & Practice Modes**:
    - **Solo Race**: Compete against AI bots with Easy, Medium, or Hard difficulty settings.
    - **Party Race**: A local "hotseat" multiplayer mode! Add up to 4 players to take turns typing the same passage on the same device.
    - **Ghost Race**: Race against a recording of your own personal best performance to visualize your improvement.
    - **Endurance Mode**: Test your stamina. Type as many words as you can in 60 seconds from an endless stream.
    - **Custom Text Mode**: Paste in your own text to practice with anything you want.
    - **Daily Challenge**: Compete on a unique, daily paragraph that is the same for everyone, with its own leaderboard.
- **Player Customization**:
    - **UI Themes**: Unlock cosmetic UI themes by earning achievements.
    - **Sound Packs**: Unlock and equip different typing sound profiles (Classic, Sci-Fi, Mechanical) for a personalized audio experience.
- **Advanced Race Analysis**: Get actionable feedback after each race with an analysis of your most frequently mistyped characters.
- **Persistent Player Stats**: Your performance is saved locally. Track your total races, wins, win rate, best WPM, and average WPM/accuracy over time.
- **Achievements & Leaderboards**: Unlock achievements for reaching milestones. See how your best races stack up against your personal top scores or a simulated global leaderboard.
- **Fully Accessible**: Designed with accessibility in mind, featuring full keyboard navigation, ARIA attributes, and focus trapping in all modal dialogs.

---

## 🚀 How to Run the App (Frontend & Backend)

This project consists of a frontend (the React app) and a backend (a Node.js server for online features). You need to run both for all features to work.

### 1. Running the Frontend

The frontend is set up in a build-free development environment. There are no command-line tools or installation steps required.

-   **Live Preview**: Simply interact with the live preview panel.
-   **Automatic Updates**: Any changes made to the code are automatically compiled and updated in the preview panel in real-time.

### 2. Running the Backend Server

The backend server powers the Online Multiplayer and Daily Challenge modes.

-   **Prerequisites**: You need to have [Node.js](https://nodejs.org/) installed on your system.
-   **Installation**:
    1.  Create a `package.json` file in the root directory with the following content:
        ```json
        {
          "name": "gemini-type-racer-server",
          "version": "1.0.0",
          "description": "",
          "main": "server.js",
          "scripts": {
            "start": "node server.js"
          },
          "keywords": [],
          "author": "",
          "license": "ISC",
          "dependencies": {
            "ws": "^8.17.0"
          }
        }
        ```
    2.  Open a terminal in the project directory and run:
        ```bash
        npm install
        ```
-   **Running the Server**:
    ```bash
    npm start
    ```
    You should see the message `Gemini Type Racer WebSocket server started on port 8080...` in your terminal. **Keep this terminal window open while you use the app.**

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Zustand, Tailwind CSS
-   **Backend**: Node.js
-   **Real-Time Communication**: WebSockets (`ws` library)
-   **Core API**: Google Gemini API (`@google/genai`)
-   **Audio**: Web Audio API

---

## 🏗️ Architectural Overview

The application is architected for scalability and maintainability, with a clear separation between the frontend and backend.

-   **Frontend**: A single-page application built with React. Global state is managed by a centralized **Zustand store** (`store.ts`), providing a single source of truth. Logic is cleanly separated into components, services (for business logic like API calls), and hooks.
-   **Backend (`server.js`)**: A lightweight Node.js server that uses the `ws` library to handle WebSocket connections. It is responsible for:
    -   Managing online race rooms and player states.
    -   Broadcasting player progress to everyone in a room in real-time.
    -   Serving the daily challenge text to ensure consistency for all players.
-   **Communication (`websocketService.ts`)**: A client-side service that acts as the bridge between the React app and the backend server, managing the WebSocket connection and message flow.

---

## 🐛 Troubleshooting

### WebSocket Connection Errors

If you see a "Connection to server failed" message or errors in the console related to WebSockets, it almost always means the backend server is not running.

**Solution:**
1.  Open a terminal in the project's root directory.
2.  Run the command `node server.js` (or `npm start` if you created the `package.json`).
3.  You should see the message `Gemini Type Racer WebSocket server started on port 8080...`.
4.  Keep this terminal open and refresh the application.
