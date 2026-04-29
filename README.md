# MineGuardian
A web-based dashboard for managing and monitoring Minecraft servers — no command line required.

Whether you just want to run a server without touching a terminal, or you're a developer looking to self-host the full stack, MineGuardian has you covered.

---

## What it does

### Install and run servers
Pick a Minecraft version from a live-fetched list, give your server a name, and click Install. EULA acceptance is built into the dialog — no manual file editing. Once installed, start or stop the server with a single button click.

### Watch everything in real time
The server dashboard streams live data over WebSockets. CPU and RAM gauges update continuously with color-coded indicators, the console streams every log line the moment it's printed, and the player viewer keeps an up-to-date avatar grid of everyone currently online. The server list refreshes status every 10 seconds.

### Multi-server support
Every server you install gets its own entry in the sidebar with its own console, resource gauges, and player list.

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
Click **Create an account** and fill in your email, name, username, and password. You'll receive a verification email — click the link inside to verify. If the link doesn't work, go back to the login page, click **Verify email**, and enter your email along with the code from the email manually.

### 3. Log in
Use your username and password to log in.

### 4. Install a Minecraft server
Head to the **Servers** tab and click the green button at the bottom to open the install dialog. Give your server a name, select **Vanilla** as the software (Spigot is not yet available), and pick any Minecraft version from the list. Click **Install** and wait for it to complete.

### 5. Start your server
Click your server in the server list, then hit **Start**.

---

## Server Dashboard
The Overview tab shows live CPU and RAM gauges, the player panel, and the console. The Quick Controls panel in the bottom-left keeps Start and Stop always accessible.

The top navigation also has a Permissions tab for granting other users access to your server (still in progress), and an Advanced tab where you can uninstall a server through a confirmation dialog.

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
