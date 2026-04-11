import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {RefreshCcw, LayoutGrid, WifiOff, Play, Square} from "lucide-react";
import CustomButton from "./ui/CustomButton.jsx";
import InstallServerDialog from "../utils/installServerDialog.jsx";
import { Router } from "@/components/animate-ui/icons/router";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { useBackend } from "@/context/BackendContext.jsx";
import { useGlobalResources } from "@/hooks/use-global-resources.jsx";
import { useServers } from "@/hooks/use-servers.jsx";
import {MG_EMERALD, MG_CRIMSON, MG_CYAN} from "@/lib/colors";
import PlayersAvatarPanel from "@/components/PlayersAvatarPanel.jsx";
import ServerStats from "@/components/ServerStats.jsx";
import server from "@/types/server.jsx";

const MIN_SPIN_MS = 600;

function ServersPage() {
    const navigate = useNavigate();
    const { backendUp, isCheckingBackend } = useBackend();
    const { data: servers = [], isLoading, refetch } = useServers();
    const { displayedGlobalResources, refetchGlobalResources } = useGlobalResources();
    const [isSpinning, setIsSpinning] = useState(false);

    const handleLoadServer = useCallback(
        (serverName) => {
            navigate(`/server/${encodeURIComponent(serverName)}`);
        },
        [navigate]
    );

    const handleRefresh = useCallback(async () => {
        if (isSpinning) return;
        setIsSpinning(true);

        const [,] = await Promise.all([
            refetch(),
            refetchGlobalResources(),
            new Promise((r) => setTimeout(r, MIN_SPIN_MS)),
        ]);

        setIsSpinning(false);
    }, [isSpinning, refetch, refetchGlobalResources]);

    function getServerList() {
        if (isCheckingBackend) {
            return <div className="loading-state">Checking connection...</div>;
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
            return <div className="loading-state">Loading...</div>;
        }
        if (!servers || servers.length === 0) {
            return <div className="loading-state">No servers found</div>;
        }


        const icon = (server) => (server.isRunning ? Square : Play);
        const type = (server) => (server.isRunning ? "danger" : "primary");
        const action = (server) => (server.isRunning ? () => server.stop() : () => server.start());
        return servers.map((server) => (
            <AnimateIcon key={server.id} animateOnHover asChild>
                <div
                    className="server-item"
                    onClick={() => handleLoadServer(server.name)}>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                        <Router color={server.isRunning ? MG_EMERALD : MG_CRIMSON} />
                        {server.name}

                        <CustomButton
                            className={"server-action-button"}
                            onClick={async (e) => {
                                e.stopPropagation();
                                await action(server)();
                                refetch()
                            }}
                            icon={icon(server)}
                            variant={type(server)}
                            size={"sm"}
                            rounded={true}>
                        </CustomButton>
                    </div>
                </div>
            </AnimateIcon>
        ));
    }

    return (
        <div className="servers-page">
            <div className="servers-layout">

                {/* Left column: list */}
                <div className="servers-list-col">
                    <div className="sidebar-header-shell">
                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <LayoutGrid size={20} />
                            Servers
                        </h3>
                        <CustomButton
                            className={`refreshButton${isSpinning ? " refreshButton-spinning" : ""}`}
                            style={{ backgroundColor: MG_CYAN}}
                            onClick={handleRefresh}
                            icon={RefreshCcw}
                            loading={isSpinning}
                            circle={true}
                            size={"sm"}
                            disabled={!backendUp || isSpinning}
                        />
                    </div>
                    <div className="sidebar-content-shell">
                        {getServerList()}
                    </div>
                    <div className="sidebar-footer-shell">
                        <InstallServerDialog triggerClassName="install-server-button-sidebar" />
                    </div>
                </div>

                {/* Right column: stats */}
                <div className="servers-stats-col">
                    <div className="stats-row">
                        <PlayersAvatarPanel online_players={displayedGlobalResources.online_players} />
                        <ServerStats
                            cpuUsagePercent={displayedGlobalResources.cpu_usage_percent}
                            memoryUsageMb={displayedGlobalResources.memory_usage_mb}
                            MAX_MEMORY_MB={Math.max(displayedGlobalResources.max_memory_mb ?? 1, 1)}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ServersPage;