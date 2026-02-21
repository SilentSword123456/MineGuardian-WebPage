# MineGuardian Web Page

MineGuardian is a modern web-based dashboard designed to manage and monitor Minecraft servers. It provides a real-time interface for server administrators to view logs, send commands, and control server states through a clean, responsive UI.

## How it Works (System Architecture)

The system operates as a decoupled frontend-backend architecture. This repository contains the **Frontend**, built with React and Vite.

### 1. Data Flow & Communication
To replicate the full functionality, the frontend expects a backend server (by default at `http://localhost:5000`) that supports both RESTful APIs and WebSockets.

*   **Server Discovery (Polling)**: The application uses **TanStack Query** to fetch the list of servers from the backend (`GET /servers`). It automatically refreshes this list every 10 seconds to show live status (Online/Offline) in the sidebar.
*   **Real-time Console (WebSockets)**: When a server is selected, a **Socket.io** connection is established. 
    *   The client sends a `serverName` query parameter to the backend during the handshake.
    *   The backend emits `console` or `message` events containing new log lines from the Minecraft server.
    *   The client emits a `console` event back to the backend when the user types a command in the terminal.
*   **State Management (Action Requests)**: Commands like "Start" or "Stop" are sent as `POST` requests to `/start_server` and `/stop_server`. The frontend uses a dedicated `Server` class model to encapsulate these API calls.

### 2. UI Components
*   **Sidebar (`ServersBar`)**: Lists all managed servers. Displays a green/red indicator for `isRunning` status.
*   **Main Dashboard (`ServerPage`)**: The central area that populates when a server is selected.
*   **Terminal (`Console`)**: An expandable/collapsible terminal emulator at the bottom of the screen. It maintains a local buffer of messages received via WebSockets.
*   **Quick Actions (`QuickCommands`)**: A floating panel providing one-click access to critical server functions (Start/Stop).

## Tech Stack

*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Real-time**: [Socket.io-client](https://socket.io/docs/v4/client-api/)
*   **Data Fetching**: [@tanstack/react-query](https://tanstack.com/query/latest)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Styling**: Custom CSS with CSS Variables for theme consistency.

## Replication Guide

To replicate this program, you need to implement a backend that satisfies the following contract:

### Backend API Contract
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/servers` | `GET` | N/A | Returns `{ "servers": [{ "id": string, "name": string, "isRunning": boolean }] }` |
| `/start_server` | `POST` | `{ "serverName": string }` | Initiates the Minecraft server startup sequence. |
| `/stop_server` | `POST` | `{ "serverName": string }` | Sends a stop command/kills the server process. |

### WebSocket Contract (Socket.io)
*   **Connection Query**: `?serverName=xyz`
*   **Server -> Client Events**:
    *   `console`: `{ "data": "log message text" }`
    *   `message`: `{ "data": "log message text" }` (fallback)
*   **Client -> Server Events**:
    *   `console`: `{ "message": "command_to_run" }` (sends command to server stdin)

### Local Setup
1.  **Install Node.js** (v18+ recommended).
2.  **Clone the project** and navigate to the directory.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Launch Development Server**:
    ```bash
    npm run dev
    ```
5.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure
```text
src/
├── components/          # UI Components
│   ├── ui/              # Generic UI elements (Buttons, etc.)
│   ├── Console.jsx      # WebSocket-powered terminal
│   ├── QuickCommands.jsx# Action buttons (Start/Stop)
│   ├── ServerPage.jsx   # Main layout for a selected server
│   └── ServersBar.jsx   # Sidebar server listing
├── types/
│   └── server.jsx       # Server class model & API logic
├── utils/
│   └── webSocket.js     # Socket.io configuration
├── App.jsx              # Root component & State coordinator
└── index.css            # Global styles and layout
```
