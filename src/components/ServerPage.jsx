import { useState, useEffect } from "react";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";
import ServerStats from "./ServerStats.jsx";
import createSocket from "../utils/webSocket.js";
import DeleteConfirmation from "@/utils/deleteConfirmation.jsx";
import { useBackend } from "@/context/BackendContext.jsx";
import { WifiOff } from "lucide-react";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer, onUninstall}) {
    const { backendUp } = useBackend();
    const [data, setData] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isRunning, setIsRunning] = useState(loadedServer.isRunning);
    const [isInstalled, setIsInstalled] = useState(loadedServer.isInstalled);
    const [generalInfo, setGeneralInfo] = useState(null);

    useEffect(() => {
        setData(null);
        setMessages([]);
        setGeneralInfo(null);
        setIsInstalled(loadedServer.isInstalled);

        if(!loadedServer || !loadedServer.name)
            return;

        if (backendUp) {
            loadedServer.getGeneralInfo().then(setGeneralInfo).catch(console.error);

            console.log(`Creating socket for server: ${loadedServer.name}`);

            const newSocket = createSocket(loadedServer.name)
            setSocket(newSocket);

            newSocket.on('connect', () => setIsConnected(true));
            newSocket.on('disconnect', () => setIsConnected(false));
            newSocket.on('message', (data) => setMessages(prev => [...prev, {type:"", text: data.data }]));
            newSocket.on('console', (data) => setMessages(prev => [...prev, {type:"", text: data.data }]));
            newSocket.on('resources', (data) => setData(data));
            newSocket.on('status', (data) => {
                loadedServer.isConnected = data.running;
                setIsRunning(data.running);
            });

            return () => {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('message');
                newSocket.off('console');
                newSocket.off('resources');
                newSocket.off('status');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Backend is down — clean up any existing socket
            setSocket(null);
            setIsConnected(false);
        }
    }, [loadedServer.name, loadedServer.isInstalled, backendUp]);

    return (
        <div className="server-page">
            {!backendUp && (
                <div className="server-offline-banner">
                    <WifiOff size={15} />
                    <span>Backend is offline — live data and controls unavailable</span>
                </div>
            )}

            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>{isInstalled===false ? (
                        <div className="not-installed">
                            <h1>{loadedServer.name} is not installed</h1>
                        </div>

                         ) : (

                        <>
                            <h1>{loadedServer.name}</h1>
                            <div className="stats-row">
                                <PlayerAvatar isList serverData={data} />
                                <ServerStats
                                    cpuUsagePercent={data?.cpu_usage_percent}
                                    memoryUsageMb={data?.memory_usage_mb}
                                    MAX_MEMORY_MB={generalInfo?.max_memory_mb}
                                />
                            </div>
                            <Console
                                server={loadedServer}
                                socket={socket}
                                isConnected={isConnected}
                                messages={messages}
                                setMessages={setMessages}
                            />
                            <QuickCommands
                                server={loadedServer}
                                isRunning={isRunning}
                                isConnected={isConnected}
                            />
                            <DeleteConfirmation onConfirm={async () => {
                                const result = await loadedServer.uninstall();
                                if (result === true) {
                                    setIsInstalled(false);
                                    onUninstall?.();
                                }
                            }} />

                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default ServerPage;