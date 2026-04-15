import {BASE_URL} from "@/lib/config.js";
import ServerLiveData from "@/types/serverLiveData.jsx";
import Server from "@/types/server.jsx";

class Manager{
    baseUrl = BASE_URL;

    setBaseUrl(newUrl) {
        this.baseUrl = newUrl;
    }

    async register(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === false) {
                throw new Error("Username already exists.");
            }

            return true;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ user_id: username, password })
            });

            if (response.status === 400) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Missing username or password.");
            }

            if (response.status === 401) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Invalid credentials.");
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    async getServers() {
        try {
            const response = await fetch(`${this.baseUrl}/servers`, {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            const servers = result?.servers?.map((server) => (new Server(server?.id, server?.name, server?.isRunning, this.baseUrl)));
            return servers;
        } catch (error) {
            console.error('Error fetching servers:', error);
            throw error;
        }
    }

    async checkAuthSession() {
        try {
            const response = await fetch(`${this.baseUrl}/favoriteServers`, {
                method: 'GET',
                credentials: "include"
            });

            if (response.ok) {
                return true;
            }

            if (response.status === 401 || response.status === 403) {
                return false;
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error('Error checking auth session:', error);
            throw error;
        }
    }

    async isBackendUp() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET'
            });

            return response.ok;
        } catch (error) {
            console.error('Error checking backend health:', error);
            return false;
        }
    }

    async installServer(Name, Software="Vanilla", Version="latest", acceptEula=false) {
        try {
            const response = await fetch(`${this.baseUrl}/manage/addServer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({ serverName: Name, serverSoftware: Software, serverVersion: Version, acceptEula:  acceptEula})
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`Error installing server ${Name}:`, error);
            throw error;
        }
    }

    async getAvailableVersions(Software = "Vanilla") {
        try {
            const response = await fetch(`${this.baseUrl}/manage/${Software}/getAvailableVersions`, {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching versions for ${Software}:`, error);
            throw error;
        }
    }

    async getGlobalUsedResources(){
        try{
            const response = await fetch(`${this.baseUrl}/servers/globalStats`, {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stats = await response.json();
            const resources = new ServerLiveData().set(stats);

            resources.cpu_usage_percent = Math.min(resources.cpu_usage_percent, 100);

            if (resources.max_memory_mb <= 0) {
                resources.max_memory_mb = Math.max(resources.memory_usage_mb, 1);
            }

            return resources.toObject();
        } catch (error) {
            console.error(`Error fetching used resources:`, error);
            throw error;
        }
    }
}

export default new Manager();