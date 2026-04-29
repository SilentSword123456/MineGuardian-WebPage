# MineGuardian

A web-based dashboard for managing and monitoring Minecraft servers — no command line required.

Whether you just want to run a server without touching a terminal, or you're a developer looking to self-host the full stack, MineGuardian has you covered.

---

## Two ways to get started

### Option A — Use the hosted version *(recommended for most users)*

Just open the web app at **[your-deployment-url]** — no installation needed. Skip straight to the [How to Use](#how-to-use) section below.

### Option B — Run it locally *(for developers)*

> **Prerequisite:** The backend must be running first. Follow the backend setup guide here: **[backend repo link]**

Once the backend is up:

```bash
git clone [repository-url]
cd [folder-name]
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser (or whatever port Vite prints).

> **Production build:** Run `npm run build` followed by `npm run preview` to serve the compiled output instead of the dev server.

---

## How to Use

### 1. Connect to the backend

On your first visit, set the backend URL to wherever your backend is running (e.g. `http://localhost:5000` for local, or a remote address if it's deployed). The app will remember this.

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

Backend repo and API documentation: **https://github.com/SilentSword123456/MineGuardian-Backend**
 
