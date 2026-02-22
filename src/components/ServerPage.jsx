import { useState, useEffect } from "react";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";
import ServerStats from "./ServerStats.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(null);
    }, [loadedServer.name]);

    return (
        <div className="server-page">
            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>
                    <h1>{loadedServer.name}</h1>
                    <div className="stats-row">
                        <PlayerAvatar isList serverData={data} />
                        <ServerStats
                            cpuUsagePercent={data?.cpu_usage_percent}
                            memoryUsageMb={data?.memory_usage_mb}
                        />
                    </div>
                    <Console server={loadedServer} onStats={setData} />
                    <QuickCommands server={loadedServer} />
                </>
            )}
        </div>
    )
}

export default ServerPage;