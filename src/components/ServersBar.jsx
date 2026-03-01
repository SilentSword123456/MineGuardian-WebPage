import {useQuery} from "@tanstack/react-query";
import Server from "../types/server.jsx";
import { RefreshCcw, LayoutGrid } from "lucide-react";
import CustomButton from "./ui/CustomButton.jsx";
import InstallServerDialog from "../utils/installServerDialog.jsx";
import { Router } from '@/components/animate-ui/icons/router';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
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
            <AnimateIcon key={server.id} animateOnHover asChild>
                <button
                    className="server-item"
                    onClick={() => loadServer(new Server(server.id, server.name, server.isRunning))}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Router color={server.isRunning ? 'green' : 'red'}/>
                        {server.name}
                    </div>
                </button>
            </AnimateIcon>
        ));
    }

    return (
        <div className="sidebar">
            <header className="header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutGrid size={20} />
                    Servers
                </h3>
                <CustomButton
                    className={"refreshButton"}
                    onClick={() => refetch()}
                    icon={RefreshCcw}
                    loading={isLoading}
                    circle={true}
                    size={'sm'}
                ></CustomButton>
            </header>
            {getServerList()}
            <InstallServerDialog />
        </div>
    );
}

export default ServersBar;