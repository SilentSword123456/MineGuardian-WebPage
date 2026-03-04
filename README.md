# MineGuardian Web Page

MineGuardian is a web-based dashboard for managing and monitoring Minecraft servers.

---

## Features

- **Live server list** — See all your servers at a glance with real-time online/offline status indicators, auto-refreshed every 10 seconds.
- **Real-time console** — Stream your server's console output live, type commands directly into the terminal, and send them to the server with Enter or a click.
- **Resource monitoring** — Watch CPU and RAM usage update in real time with color-coded block-bar gauges (green → amber → red).
- **Online player viewer** — See which players are currently online, displayed as a grid of avatars.
- **Start / Stop controls** — Start or stop any server with a single click from the Quick Commands panel.
- **Install servers** — Install new Minecraft servers (Vanilla, Spigot) directly from the UI, picking the software and version from a live-fetched list, with EULA acceptance built in.
- **Uninstall servers** — Remove a server permanently through a confirmation dialog that prevents accidental deletion.
- **Offline awareness** — When the backend is unreachable, the UI detects it automatically and disables controls, showing a clear offline banner instead of silently failing.

---

## Tech Stack

| Layer | Library | Version |
| :--- | :--- | :--- |
| Framework | [React](https://react.dev/) | ^19 |
| Build Tool | [Vite](https://vitejs.dev/) | ^7 |
| Data Fetching | [@tanstack/react-query](https://tanstack.com/query/latest) | ^5 |
| Real-time | [Socket.io-client](https://socket.io/docs/v4/client-api/) | — |
| UI Primitives | [Radix UI](https://www.radix-ui.com/) (via animate-ui wrappers) | — |
| Icons | [Lucide React](https://lucide.dev/) | — |
| Styling | Custom CSS + CSS Variables | — |

---

## Backend API Contract

This frontend expects a backend at `http://localhost:5000` (configurable in `src/lib/config.js`).

### REST Endpoints

| Endpoint | Method | Body | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | — | `200 OK` | Health check. |
| `/servers` | `GET` | — | `{ "servers": [{ "id": string, "name": string, "isRunning": boolean }] }` | Lists all servers. |
| `/servers/:name` | `GET` | — | `{ "max_memory_mb": number, ... }` | General info for a server. |
| `/servers/:name/start` | `POST` | — | JSON | Starts the server. |
| `/servers/:name/stop` | `POST` | — | JSON | Stops the server. |
| `/servers/:name/uninstall` | `DELETE` | — | `true` | Uninstalls the server. |
| `/manage/addServer` | `POST` | `{ "serverName": string, "serverSoftware": string, "serverVersion": string, "acceptEula": boolean }` | JSON | Installs a new server. |
| `/manage/:software/getAvailableVersions` | `GET` | — | `string[]` | Available versions for the given software. |

### WebSocket Contract (Socket.io)

**Connection**: `io("http://localhost:5000", { query: { serverName: "my-server" }, transports: ["websocket"] })`

| Direction | Event | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| Server → Client | `console` | `{ "data": "log line" }` | Console output |
| Server → Client | `message` | `{ "data": "log line" }` | Console output (fallback) |
| Server → Client | `resources` | `{ "cpu_usage_percent": number, "memory_usage_mb": number }` | Resource stats |
| Server → Client | `status` | `{ "running": boolean }` | Running-state updates |
| Client → Server | `console` | `{ "message": "command" }` | Send command to server stdin |

---

## Local Setup

1. **Install Node.js** (v18+ recommended).
2. **Clone the project** and navigate to the directory.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Build for production**:
   ```bash
   npm run build
   ```
6. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## Project Structure

```text
src/
├── App.jsx                      # Root component — view routing & global providers
├── index.css                    # Global styles and CSS variable theme
├── main.jsx                     # React DOM entry point
│
├── components/
│   ├── Console.jsx              # Terminal emulator
│   ├── HomePage.jsx             # Landing screen with server grid
│   ├── PlayerAvatar.jsx         # Online-player avatar grid
│   ├── QuickCommands.jsx        # Start / Stop buttons
│   ├── ServerPage.jsx           # Main layout for a selected server
│   ├── ServersBar.jsx           # Left sidebar — server listing
│   ├── ServerStats.jsx          # CPU & RAM gauges
│   ├── animate-ui/              # Animated Radix UI wrappers
│   └── ui/                      # Generic UI elements
│
├── context/
│   └── BackendContext.jsx       # Backend health state
│
├── hooks/
│   └── use-servers.jsx          # Server list query
│
├── lib/
│   ├── colors.js                # Color palette constants
│   └── config.js                # BASE_URL config
│
├── types/
│   └── server.jsx               # Server model (start / stop / uninstall / getGeneralInfo)
│
└── utils/
    ├── deleteConfirmation.jsx   # Uninstall confirmation dialog
    ├── installServerDialog.jsx  # Server installation dialog
    ├── manager.js               # Health check & installation API calls
    └── webSocket.js             # Socket.io factory
```
