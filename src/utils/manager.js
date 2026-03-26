import { BASE_URL } from "@/lib/config.js";

class Manager{
    baseUrl = BASE_URL;

    async getServers() {
        try {
            const response = await fetch(`${this.baseUrl}/servers`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result?.servers ?? [];
        } catch (error) {
            console.error('Error fetching servers:', error);
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
                body: JSON.stringify({ serverName: Name, serverSoftware: Software, serverVersion: Version, acceptEula:  acceptEula})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
                method: 'GET'
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
            const servers = await this.getServers();
            let statsCount = 0;

            const resources = {
                cpu_usage_percent: 0,
                memory_usage_mb: 0,
                online_players_count: 0,
                max_memory_mb: 0,
            };

            for (const server of servers) {
                if (server?.isRunning === false) {
                    continue;
                }

                const response = await fetch(`${this.baseUrl}/servers/${encodeURIComponent(server.name)}/stats`, {
                    method: 'GET'
                });

                console.log(`Fetched: ${this.baseUrl}/servers/${encodeURIComponent(server.name)}/stats`);

                if (response.status === 404) {
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const stats = await response.json();
                statsCount += 1;

                resources.cpu_usage_percent += Number(stats?.cpu_usage_percent ?? 0);
                resources.memory_usage_mb += Number(stats?.memory_usage_mb ?? 0);
                resources.online_players_count += Number(stats?.online_players?.online ?? 0);
                resources.max_memory_mb += Number(stats?.max_memory_mb ?? 0);
            }

            if (statsCount > 0) {
                resources.cpu_usage_percent = Math.min(resources.cpu_usage_percent / statsCount, 100);
            }

            if (resources.max_memory_mb <= 0) {
                resources.max_memory_mb = Math.max(resources.memory_usage_mb, 1);
            }

            return resources;
        } catch (error) {
            console.error(`Error fetching used resources:`, error);
            throw error;
        }
    }
}

export default new Manager();