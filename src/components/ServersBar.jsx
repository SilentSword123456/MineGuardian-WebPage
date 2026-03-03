import Server from "../types/server.jsx";
import { RefreshCcw, LayoutGrid, WifiOff } from "lucide-react";
import CustomButton from "./ui/CustomButton.jsx";
import InstallServerDialog from "../utils/installServerDialog.jsx";
import { Router } from '@/components/animate-ui/icons/router';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { useBackend } from "@/context/BackendContext.jsx";
import { useServers } from "@/hooks/use-servers.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
function ServersBar({loadServer}) {
    const { backendUp, isCheckingBackend } = useBackend();
    const { data: servers = [], isLoading, refetch } = useServers();

    function getServerList() {
        if (isCheckingBackend) {
            return <div className="loading-state">Checking connection…</div>;
        }
        if (!backendUp) {
            return (
                <div className="loading-state offline-state">
                    <WifiOff size={16} style={{ marginBottom: 4 }} />
                    <span>Can't connect to backend</span>
                </div>
            );
        }
        if (isLoading) {
            return <div className="loading-state">Loading…</div>;
        }
        if (!servers || servers.length === 0) {
            return <div className="loading-state">No servers found</div>;
        }

        return servers.map((server) => (
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
                    disabled={!backendUp}
                ></CustomButton>
            </header>
            {getServerList()}
            <InstallServerDialog />
        </div>
    );
}

export default ServersBar;