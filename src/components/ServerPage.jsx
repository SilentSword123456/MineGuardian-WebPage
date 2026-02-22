import { useQuery } from "@tanstack/react-query";
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
    async function fetchServerInfo() {
        var result = await fetch(`http://localhost:5000/servers/${loadedServer.name}`)
            .then(res => res.json());

        console.log("Fetched server info");

        return result;
    }

    const {data} = useQuery({
        queryFn: fetchServerInfo,
        queryKey: ['serverStatus', loadedServer.name],
        refetchInterval: 5 * 1000, // Refetch every 5 seconds
        enabled: !!loadedServer.name
    });

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
                    <Console server={loadedServer}/>
                    <QuickCommands server={loadedServer} />
                </>
            )}
        </div>
    )
}

export default ServerPage;