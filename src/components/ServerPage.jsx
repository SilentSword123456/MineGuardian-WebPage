import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import {useQuery} from "@tanstack/react-query";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {
    async function fetchOnlinePlayers() {
        var result = await fetch(`http://localhost:5000/servers/${loadedServer.name}`)
            .then(res => res.json());

        result = result["online_players"]["online"];
        console.log("Fetched online players:", result);

        return result;
    }

    const {data, refetch} = useQuery({
        queryFn: fetchOnlinePlayers,
        queryKey: ['serverStatus', loadedServer.name],
        refetchInterval: 5 * 1000 // Refetch every 10 seconds
    });

    return (
        <div className="server-page">
            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>
                    <h1>{loadedServer.name}</h1>
                    <div>
                        {data !== undefined ? 'Online Players: ' + data : "Loading..."}
                    </div>
                    <Console server={loadedServer}/>
                    <QuickCommands server={loadedServer} />
                </>
            )}
        </div>
    )
}

export default ServerPage;