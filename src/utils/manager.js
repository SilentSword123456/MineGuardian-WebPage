import { BASE_URL } from "@/lib/config.js";

class Manager{
    baseUrl = BASE_URL;

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
}

export default new Manager();