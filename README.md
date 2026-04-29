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
