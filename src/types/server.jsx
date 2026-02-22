class Server {
    constructor(id, name, isRunning, baseUrl="http://localhost:5000") {
        this.baseUrl = baseUrl;
        this.id = id;
        this.name = name;
        this.isRunning = isRunning;
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

    getStatus() {
        return this.isRunning ? 'Online' : 'Offline';
    }

    async getOnlinePlayers() {
        try {
            const response = await fetch(`${this.baseUrl}/servers/${this.name}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result["online_players"]["online"];
        } catch (error) {
            console.error(`Error stopping server ${this.name}:`, error);
            throw error;
        }
    }

}

export default Server;

