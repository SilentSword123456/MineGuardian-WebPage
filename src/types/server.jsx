class Server {
    constructor(id, name, isRunning, baseUrl="http://localhost:5000") {
        this.baseUrl = baseUrl;
        this.id = id;
        this.name = name;
        this.isRunning = isRunning;
    }

    async start() {
        try {
            const response = await fetch(`${this.baseUrl}/start_server`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ serverName: this.name })
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
            const response = await fetch(`${this.baseUrl}/stop_server`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ serverName: this.name })
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

    restart() {
        if(this.isRunning) {
            this.stop();
        }
        this.start();
    }

    getStatus() {
        return this.isRunning ? 'Online' : 'Offline';
    }

}

export default Server;

