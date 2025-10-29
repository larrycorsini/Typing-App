
# Gemini Type Racer

Welcome to Gemini Type Racer, a modern, feature-rich typing game where you can test your speed and accuracy against dynamic AI opponents, race against your own best performance, compete in **real-time online multiplayer**, or challenge friends in local "hotseat" mode. The typing passages are generated on-the-fly by Google's Gemini API, providing a unique challenge every time.

![Gemini Type Racer Gameplay](typeracer.jpg)

---

## ✨ Features

- **Adventure Map Progression**: No more static lobbies! Progress through a visual world map, completing races and challenges to unlock new areas and face off against powerful bosses in a true adventure.
- **Charming "Duck Life" Visuals**: A complete visual overhaul inspired by the classic Duck Life games, featuring a bright, cartoony art style, bubbly fonts, and a cheerful, playful interface.
- **Duck Evolutions**: Choose your specialty! Select an Athletic, Stamina, or Intellect duck at the start, each with unique stats and abilities that affect your racing style.
- **Real-Time Online Multiplayer**: Join a public lobby, create a room, and race against players from around the world. Your progress is updated character-by-character for a thrilling, competitive experience.
- **Dynamic Content via Gemini API**: Never type the same thing twice! Race passages are generated on the fly by the Gemini API, ensuring a unique challenge every time.
- **Multiple Game & Practice Modes**:
    - **Adventure Mode**: The core single-player experience.
    - **Typing Course**: A structured set of lessons to build your typing skills from the ground up, now with dynamic text generation so you're not just memorizing patterns.
    - **Party Race**: A local "hotseat" multiplayer mode! Add up to 4 players to take turns typing the same passage on the same device.
    - **Endurance Mode**: Test your stamina. Type as many words as you can in 60 seconds from an endless stream.
    - **Custom Text Mode**: Paste in your own text to practice with anything you want.
    - **Daily Challenge**: Compete on a unique, daily paragraph that is the same for everyone.
- **Player Customization & Upgrades**:
    - **Train Your Duck**: Use XP from races in the Training Ground to level up your duck's Running, Swimming, and Flying stats to overcome track hazards.
    - **Shop for Items**: Spend coins earned from victories at the shop to replenish energy or buy helpful gear.
    - **Cosmetic Items**: Unlock and equip fun cosmetic items like hats and accessories for your duck by leveling up and earning achievements.
- **Advanced Race Analysis**: Get actionable feedback after each race with an analysis of your most frequently mistyped characters.
- **Persistent Player Stats**: Your performance is saved locally. Track your total races, wins, win rate, best WPM, and average WPM/accuracy over time.
- **Achievements & Leaderboards**: Unlock achievements for reaching milestones. See how your best races stack up against your personal top scores or a simulated global leaderboard.

---

## 🚀 How to Run the App (From GitHub)

This project consists of a frontend (a build-less React app) and a backend (a Node.js server for online features). You need to run both for all features to work.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended) and npm
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 1: Running the Backend Server

The backend server powers the Online Multiplayer and Daily Challenge modes.

1.  **Create `package.json`**: In the project's root directory, create a file named `package.json` with this content:
    ```json
    {
      "name": "gemini-type-racer-server",
      "version": "1.0.0",
      "description": "Backend for Gemini Type Racer",
      "main": "server.js",
      "scripts": {
        "start": "node server.js"
      },
      "dependencies": {
        "ws": "^8.17.0"
      }
    }
    ```

2.  **Install Dependencies**: Open a terminal in the project directory and run:
    ```bash
    npm install
    ```

3.  **Start the Server**:
    ```bash
    npm start
    ```
    You should see the message `Gemini Type Racer WebSocket server started on port 8080...`. Keep this terminal window open.

### Step 2: Running the Frontend

The frontend is a modern, build-less application. To run it locally, you need to configure your API key and use a simple local web server.

1.  **Configure the Gemini API Key**:
    -   Open the file `services/geminiService.ts`.
    -   Find this line at the top: `const API_KEY = process.env.API_KEY;`
    -   For local development, you'll need to replace it with your actual key, like this:
        ```javascript
        const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
        ```
    -   **IMPORTANT**: Be careful not to commit this change to a public Git repository.

2.  **Serve the Frontend Files**:
    -   Open a **new** terminal window in the same project directory.
    -   Run the following command to start a simple web server:
        ```bash
        npx serve
        ```
    -   This command will give you a local URL, typically `http://localhost:3000`. Open this URL in your web browser.

You should now have the backend running in one terminal and the frontend being served from another. The application will be fully functional.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Zustand
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
2.  Follow the instructions in **Step 1: Running the Backend Server**.
3.  Keep the backend terminal open and refresh the application.