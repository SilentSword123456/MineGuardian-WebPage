class ServerLiveData {
    constructor(data = null) {
        this.reset();
        if (data) {
            this.set(data);
        }
    }

    reset(keepMax=false) {
        this.cpu_usage_percent = 0;
        this.max_memory_mb = 0;
        this.memory_usage_mb = 0;
        this.online_players = {
            max: (keepMax ? this.online_players.max : 0),
            online: 0,
            players: [],
        };

        return this;
    }

    set(data = {}) {
        this.cpu_usage_percent = Number(data?.cpu_usage_percent ?? 0);
        this.max_memory_mb = Number(data?.max_memory_mb ?? 0);
        this.memory_usage_mb = Number(data?.memory_usage_mb ?? 0);
        this.online_players = {
            max: Number(data?.online_players?.max ?? 0),
            online: Number(data?.online_players?.online ?? 0),
            players: Array.isArray(data?.online_players?.players)
                ? [...data.online_players.players]
                : [],
        };

        return this;
    }

    toObject() {
        return {
            cpu_usage_percent: this.cpu_usage_percent,
            max_memory_mb: this.max_memory_mb,
            memory_usage_mb: this.memory_usage_mb,
            online_players: {
                max: this.online_players.max,
                online: this.online_players.online,
                players: [...this.online_players.players],
            },
        };
    }
}

export default ServerLiveData;

