# MineGuardian

A web-based dashboard for managing and monitoring Minecraft servers — no command line required.

Whether you just want to run a server without touching a terminal, or you're a developer looking to self-host the full stack, MineGuardian has you covered.

---

## What it does

Running a Minecraft server usually means SSHing into a machine, editing config files, and tailing logs in a terminal. MineGuardian replaces all of that with a clean web UI you can open from any browser.

### Install and run servers in seconds
Pick a Minecraft version from a live-fetched list, give your server a name, and click Install. EULA acceptance is built into the dialog — no manual file editing. Once installed, start or stop the server with a single button click.

### Watch everything in real time
The server dashboard streams live data over WebSockets the moment you open it:
- **CPU & RAM gauges** update continuously with color-coded indicators — green when healthy, amber under load, red when critical
- **Server console** streams log output live; click to expand it and type commands directly into the terminal, sent to the server on Enter
- **Player viewer** shows an avatar grid of every player currently online, updated in real time
- **Status indicators** on the server list refresh every 10 seconds so you always know which servers are up

### Multi-server support
MineGuardian isn't built for a single server. Every server you install gets its own card in the sidebar. Switch between them instantly — each gets its own console, resource gauges, and player list.

### Resilient UI
If the backend goes offline, MineGuardian detects it automatically, disables all controls, and shows a clear offline banner instead of silently failing or showing stale data.

---

## Two ways to get started

### Option A — Use the hosted version *(recommended for most users)*

Just open the web app at **[frontend.silentlab.work](https://frontend.silentlab.work/)** — no installation needed. Skip straight to the [How to Use](#how-to-use) section below.

### Option B — Run it locally *(for developers)*

> **Prerequisite:** The backend must be running first. Follow the backend setup guide here: **[MineGuardian-Backend](https://github.com/SilentSword123456/MineGuardian-Backend)**

Once the backend is up:

```bash
git clone https://github.com/SilentSword123456/MineGuardian-WebPage
cd MineGuardian-WebPage
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser (or whatever port Vite prints).

> **Production build:** Run `npm run build` followed by `npm run preview` to serve the compiled output instead of the dev server.

---

## How to Use

### 1. Connect to the backend

**Hosted version:** The backend is already connected — skip this step.

**Self-hosted:** On your first visit, open the settings and set the backend URL to wherever your backend is running (e.g. `http://localhost:5000`). The app will remember this.

### 2. Create an account

Click **Create an account** and fill in your email, name, username, and password. You'll receive a verification email — click the link inside to verify.

If the link doesn't work, go back to the login page, click **Verify email**, and enter your email along with the code from the email manually.

### 3. Log in

Use your username and password to log in.

### 4. Install a Minecraft server

Head to the **Servers** tab and click the green button at the bottom to install a new server. Fill in:

- **Name** — whatever you want to call it
- **Software** — choose **Vanilla** (Spigot is not yet available)
- **Version** — any Minecraft release you want

Click **Install** and wait for it to complete.

### 5. Start your server

Click your server in the server list, then hit **Start**. That's it — your Minecraft server is running.

---

## Server Dashboard

Once inside a server, you get a full overview panel:

| Feature | What it does |
| :--- | :--- |
| **CPU & RAM gauges** | Live resource usage with color-coded indicators (green → amber → red) |
| **Player viewer** | Avatar grid of everyone currently online |
| **Server console** | Live log stream — click to expand, type commands directly |
| **Quick Controls** | Start / Stop buttons always visible in the bottom-left |

The top navigation has three tabs:

- **Overview** — the dashboard described above
- **Permissions** — grant other users access *(not fully implemented yet)*
- **Advanced** — uninstall the server (with a confirmation dialog to prevent accidents)

---

## Features at a glance

- Real-time console output with command input
- Live CPU and RAM monitoring
- Online player list with avatars
- One-click start / stop
- Install Vanilla servers from a live version list, EULA acceptance included
- Offline detection — the UI disables controls and shows a banner if the backend goes down

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React 19 + Vite 7 |
| Data Fetching | TanStack Query v5 |
| Real-time | Socket.io |
| UI | Radix UI + Lucide icons |
| Styling | Custom CSS with CSS variables |

Backend repo and API documentation: **[MineGuardian-Backend](https://github.com/SilentSword123456/MineGuardian-Backend)**
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
│   ├── PlayersAvatarPanel.jsx         # Online-player avatar grid
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
