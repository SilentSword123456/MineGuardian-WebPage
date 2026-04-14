import { Router } from "@/components/animate-ui/icons/router";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { useBackend } from "@/context/BackendContext.jsx";
import { useServers } from "@/hooks/use-servers.jsx";
import { MG_EMERALD, MG_CRIMSON } from '@/lib/colors';
import {useCallback} from "react";
import {useNavigate} from "react-router-dom";

/**
 * @param {Object} props
 * @param {function(string): void} props.onSelectServer - receives the selected server name
 */
function HomePage() {
    const navigate = useNavigate();
    const { backendUp, isCheckingBackend } = useBackend();
    const { data: servers = [], isLoading } = useServers();

    const handleLoadServer = useCallback(
        (server) => {
            navigate(`/server/${encodeURIComponent(server.name)}`);
        },
        [navigate]
    );

    const backendStatus = isCheckingBackend
        ? { label: "Checking connection…", cls: "checking" }
        : backendUp
        ? { label: "Backend connected", cls: "online" }
        : { label: "Backend offline — actions unavailable", cls: "offline" };

    return (
        <div className="home-page">
            <div className="home-header">
                <h1 className="home-title">MineGuardian</h1>
                <p className="home-subtitle">Select a server to manage, or install a new one.HITESTING</p>
            </div>

            <div className={`home-backend-status ${backendStatus.cls}`}>
                <span className="home-backend-dot" />
                <span className="home-backend-label">{backendStatus.label}</span>
            </div>

            <div className="home-servers-section">
                <h2 className="home-section-title">Your Servers</h2>

                {isCheckingBackend ? (
                    <p className="home-loading">Checking connection…</p>
                ) : !backendUp ? (
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
                                onClick={() => handleLoadServer(server)}
                            >
                                <div className="home-server-card-icon">
                                    <AnimateIcon animateOnHover>
                                        <Router color={server.isRunning ? MG_EMERALD : MG_CRIMSON} size={28} />
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

        </div>
    );
}

export default HomePage;
