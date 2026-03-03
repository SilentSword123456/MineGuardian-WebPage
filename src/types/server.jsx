import { BASE_URL } from "@/lib/config.js";

class Server {
    constructor(id, name, isRunning, baseUrl = BASE_URL) {
        this.baseUrl = baseUrl;
        this.id = id;
        this.name = name;
        this.isRunning = isRunning;
        this.isInstalled = true;
    }

    async start() {
        try {
            const response = await fetch(`${this.baseUrl}/servers/${this.name}/start`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error starting server ${this.name}:`, error);
            throw error;
        }
    }


    async stop() {
        try {
            const response = await fetch(`${this.baseUrl}/servers/${this.name}/stop`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error stopping server ${this.name}:`, error);
            throw error;
        }
    }

    async uninstall() {
        try {
            const response = await fetch(`${this.baseUrl}/servers/${this.name}/uninstall`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if(result===true)
                this.isInstalled = false;
            return result;
        } catch (error) {
            console.error(`Error uninstalling server ${this.name}:`, error);
            throw error;
        }
    }

    async getGeneralInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/servers/${this.name}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error uninstalling server ${this.name}:`, error);
            throw error;
        }
    }

}

export default Server;

