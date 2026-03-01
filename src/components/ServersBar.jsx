import {useQuery} from "@tanstack/react-query";
import Server from "../types/server.jsx";
import { Plus, RefreshCcw, Server as ServerIcon, LayoutGrid } from "lucide-react";
import Button from "./ui/Button.jsx";
import manager from "../utils/manager.js";
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
        refetchInterval: 10 * 1000 // Refetch every 10 seconds
    });

    function getServerList(){
        if(isLoading)
            return <div className="loading-state">Loading...</div>;

        return servers?.map((server) => (
            <button
                className="server-item"
                key={server.id}
                onClick={() => loadServer(new Server(server.id, server.name, server.isRunning))}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ServerIcon size={18} color={server.isRunning ? '#22c55e' : '#ef4444'} />
                    {server.name}
                </div>
            </button>
        ));
    }

    return (
        <div className="sidebar">
            <header className="header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutGrid size={20} />
                    Servers
                </h3>
                <Button
                    className={"refreshButton"}
                    onClick={() => refetch()}
                    //style={{ marginBottom: '15px' }}
                    icon={RefreshCcw}
                    loading={isLoading}
                    circle={true}
                    size={'sm'}
                ></Button>
            </header>
            {getServerList()}
            <Button
                className={"install-server-button"}
                onClick={() => manager.installServer("Test","Vanilla", "latest", true)}
                icon={Plus}
                circle={true}
                size={'md'}
            ></Button>
        </div>
    );
}

export default ServersBar;