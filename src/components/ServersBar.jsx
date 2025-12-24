import {useQuery} from "@tanstack/react-query";
import Server from "../types/server.jsx";
/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
function ServersBar({loadServer}) {

    /**
     * @returns {Promise<Server[]>}
     */
    async function fetchServers() {
        const result = await fetch('http://localhost:5000/servers')
            .then(res => res.json());

        console.log("Fetched servers:", result.servers);

        return result.servers;
    }

    const {data: servers=[], isLoading, refetch} = useQuery({ /** @type {Server[]} servers */
        queryFn: fetchServers,
        queryKey: ['servers'],
        refetchInterval: 10 *1000 // Refetch every 10 seconds
    });

    function getServerList(){
        if(isLoading)
            return <div>Loading...</div>;

        return servers?.map((server) => (
            <button
                className="server-item"
                key={server.id}
                onClick={() => loadServer(new Server(server.id, server.name, server.isRunning))}>
                <span className={`status-indicator ${server.isRunning ? 'online' : 'offline'}`} />
                {server.name}
            </button>
        ));
    }

    return (
        <div className="sidebar">
            <h3>Servers</h3>
            <button className={"refreshButton"} onClick={() => refetch()}>Refresh</button>
            {getServerList()}
        </div>
    );
}

export default ServersBar;