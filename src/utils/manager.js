import {BASE_URL} from "@/lib/config.js";
import ServerLiveData from "@/types/serverLiveData.jsx";
import Server from "@/types/server.jsx";

class Manager{
    baseUrl = BASE_URL;

    setBaseUrl(newUrl) {
        this.baseUrl = newUrl;
    }

    async request(path, options = {}) {
        return fetch(`${this.baseUrl}${path}`, options);
    }

    async requestJson(path, options = {}) {
        const response = await this.request(path, options);
        const payload = await response.json().catch(() => ({}));
        return { response, payload };
    }

    async register(username, password) {
        try {
            const { response, payload } = await this.requestJson("/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error(payload.error || `HTTP error! status: ${response.status}`);
            }

            if (payload.status === false) {
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
            const { response, payload } = await this.requestJson("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ user_id: username, password })
            });

            if (response.status === 400) {
                throw new Error(payload.message || "Missing username or password.");
            }

            if (response.status === 401) {
                throw new Error(payload.message || "Invalid credentials.");
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
            const { response, payload } = await this.requestJson("/servers", {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const servers = payload?.servers?.map((server) => (new Server(server?.server_id, server?.name, server?.isRunning, this.baseUrl)));
            return servers;
        } catch (error) {
            console.error('Error fetching servers:', error);
            throw error;
        }
    }

    async checkAuthSession() {
        try {
            const response = await this.request("/isSessionValid", {
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
            const response = await this.request("/health", {
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
            const { response, payload } = await this.requestJson("/manage/addServer", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({ serverName: Name, serverSoftware: Software, serverVersion: Version, acceptEula:  acceptEula})
            });

            if (!response.ok) {
                throw new Error(payload.message || `HTTP error! status: ${response.status}`);
            }

            return payload;

        } catch (error) {
            console.error(`Error installing server ${Name}:`, error);
            throw error;
        }
    }

    async getAvailableVersions(Software = "Vanilla") {
        try {
            const { response, payload } = await this.requestJson(`/manage/${Software}/getAvailableVersions`, {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return payload;
        } catch (error) {
            console.error(`Error fetching versions for ${Software}:`, error);
            throw error;
        }
    }

    async getGlobalUsedResources(){
        try{
            const { response, payload } = await this.requestJson("/servers/globalStats", {
                method: 'GET',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resources = new ServerLiveData().set(payload);

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
