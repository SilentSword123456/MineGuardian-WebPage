import { useQuery } from "@tanstack/react-query";
import Server from "../types/server.jsx";
import { Router } from "@/components/animate-ui/icons/router";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import InstallServerDialog from "../utils/installServerDialog.jsx";
import manager from "../utils/manager.js";

/**
 * @param {Object} props
 * @param {function(Server): void} props.loadServer
 * @param {function(): void} props.onSelectServer - called after loadServer to switch view
 */
function HomePage({ loadServer, onSelectServer }) {
    async function fetchServers() {
        const result = await fetch("http://localhost:5000/servers").then((r) =>
            r.json()
        );
        return result.servers;
    }

    const {
        data: backendUp,
        isLoading: isCheckingBackend,
    } = useQuery({
        queryFn: () => manager.isBackendUp(),
        queryKey: ["backendHealth"],
        refetchInterval: 5000,
    });

    const { data: servers = [], isLoading } = useQuery({
        queryFn: fetchServers,
        queryKey: ["servers"],
        enabled: backendUp === true,
    });

    function handleSelect(server) {
        loadServer(new Server(server.id, server.name, server.isRunning));
        onSelectServer();
    }

    const backendStatus = isCheckingBackend
        ? { label: "Checking connection…", cls: "checking" }
        : backendUp
        ? { label: "Backend connected", cls: "online" }
        : { label: "Backend offline — actions unavailable", cls: "offline" };

    return (
        <div className="home-page">
            <div className="home-header">
                <h1 className="home-title">MineGuardian</h1>
                <p className="home-subtitle">Select a server to manage, or install a new one.</p>
            </div>

            <div className={`home-backend-status ${backendStatus.cls}`}>
                <span className="home-backend-dot" />
                <span className="home-backend-label">{backendStatus.label}</span>
            </div>

            <div className="home-servers-section">
                <h2 className="home-section-title">Your Servers</h2>

                {!isCheckingBackend && !backendUp ? (
                    <p className="home-empty">Cannot reach backend. Please make sure MineGuardian is running.</p>
                ) : isLoading ? (
                    <p className="home-loading">Loading servers…</p>
                ) : servers.length === 0 ? (
                    <p className="home-empty">No servers found. Install one below!</p>
                ) : (
                    <div className="home-server-grid">
                        {servers.map((server) => (
                            <button
                                key={server.id}
                                className="home-server-card"
                                onClick={() => handleSelect(server)}
                            >
                                <div className="home-server-card-icon">
                                    <AnimateIcon animateOnHover>
                                        <Router color={server.isRunning ? "green" : "red"} size={28} />
                                    </AnimateIcon>
                                </div>
                                <div className="home-server-card-info">
                                    <span className="home-server-name">{server.name}</span>
                                    <span className={`home-server-status ${server.isRunning ? "running" : "stopped"}`}>
                                        {server.isRunning ? "Running" : "Stopped"}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="home-install-section">
                <InstallServerDialog from="homepage" showCloseButton disabled={!backendUp} />
            </div>
        </div>
    );
}

export default HomePage;


