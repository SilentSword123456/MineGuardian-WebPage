class Manager{
    baseUrl = "http://localhost:5000";
    async installServer(Name, Software="Vanilla", Version="latest", acceptEula=false) {
        try {
            await fetch(`${this.baseUrl}/manage/addServer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ serverName: Name, serverSoftware: Software, serverVersion: Version, acceptEula:  acceptEula})
            });

        } catch (error) {
            console.error(`Error installing server ${Name}:`, error);
            throw error;
        }
    }
}

export default new Manager();