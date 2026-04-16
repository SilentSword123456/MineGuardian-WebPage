import { useState, useEffect, useRef } from "react";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayersAvatarPanel from "./PlayersAvatarPanel.jsx";
import ServerStats from "./ServerStats.jsx";
import createSocket from "../utils/webSocket.js";
import DeleteConfirmation from "@/utils/deleteConfirmation.jsx";
import { useBackend } from "@/context/BackendContext.jsx";
import ServerLiveData from "@/types/serverLiveData.jsx";
import { WifiOff } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsContents,
    TabsList,
    TabsTrigger
} from "@/components/animate-ui/components/radix/tabs.jsx";
import { useUiPreferencesContext } from "@/hooks/use-ui-preferences-context.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer, onUninstall}) {
    const { backendUp } = useBackend();
    const { minecraftMetersEnabled, websocketPipeEnabled, startAnimationsEnabled } = useUiPreferencesContext();
    const [data, setData] = useState(() => new ServerLiveData().toObject());
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isRunning, setIsRunning] = useState(loadedServer.isRunning);
    const [startAnimationTriggered, setStartAnimationTriggered] = useState(false);
    const isRunningRef = useRef(loadedServer.isRunning);
    const [isInstalled, setIsInstalled] = useState(loadedServer.isInstalled);

    useEffect(() => {
        if (isRunning === false) {
            setData((prev) => new ServerLiveData(prev).reset(true).toObject());
            setStartAnimationTriggered(false);
        } else if (startAnimationsEnabled) {
            setStartAnimationTriggered(true);
        }
    }, [isRunning, startAnimationsEnabled]);

    useEffect(() => {
        setData(new ServerLiveData().toObject());
        setMessages([]);
        setIsInstalled(loadedServer.isInstalled);
        setIsRunning(loadedServer.isRunning);
        isRunningRef.current = loadedServer.isRunning;

        let isActive = false;

        if(!loadedServer || loadedServer.id === null || loadedServer.id === undefined)
            return;

        if (backendUp) {
            loadedServer.getGeneralInfo()
                .then((serverInfo) => {
                    if (isActive) {
                        return;
                    }

                    setData((prev) => new ServerLiveData({
                        ...prev,
                    }).set({
                            max_memory_mb: Number(serverInfo?.max_memory_mb ?? prev?.max_memory_mb ?? 0),
                            online_players: {
                                max: Number(serverInfo?.max_players ?? serverInfo?.online_players?.max ?? prev?.online_players?.max ?? 0),
                            },
                        }).toObject());
                })
                .catch((error) => {
                    console.error(`Error fetching general server info for id ${loadedServer.id}:`, error);
                });

            console.log(`Creating socket for server id: ${loadedServer.id}`);

            const newSocket = createSocket(loadedServer.id)
            setSocket(newSocket);

            newSocket.on('connect', () => setIsConnected(true));
            newSocket.on('disconnect', () => setIsConnected(false));
            newSocket.on('system', (data) => {
                if (isRunningRef.current) {
                    setMessages(prev => [...prev, {type:"system", text: data.data }]);
                }
            });

            newSocket.on('console', (data) => {
                if (isRunningRef.current) {
                    setMessages(prev => [...prev, {type:"server", text: data.data }]);
                }
            });
            newSocket.on('resources', (statsData) => {
                if (isRunningRef.current) {
                    console.log("Received resources", statsData);
                    setData((prev) => new ServerLiveData(prev).set(statsData).toObject());
                }
            });
            newSocket.on('status', (data) => {
                console.log("Received status:", data);
                setIsRunning(data.running);
                isRunningRef.current = data.running;
            });

            return () => {
                isActive = true;
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('system');
                newSocket.off('console');
                newSocket.off('resources');
                newSocket.off('status');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            isActive = true;
            // Backend is down — clean up any existing socket
            setSocket(null);
            setIsConnected(false);
        }
    }, [loadedServer.id, loadedServer.isInstalled, loadedServer.isRunning, backendUp]);

    const memPct = Math.min(
        ((data?.memory_usage_mb ?? 0) / Math.max(data?.max_memory_mb ?? 1, 1)) * 100,
        100
    );
    const bubbleSeverity = Math.max(data?.cpu_usage_percent ?? 0, memPct);
    const bubbleColorClass = bubbleSeverity < 50 ? "ws-pipe-bubble--green" : (bubbleSeverity < 80 ? "ws-pipe-bubble--gold" : "ws-pipe-bubble--red");
    const bubbleDuration = `${Math.max(1.2, 4.8 - (bubbleSeverity / 30)).toFixed(2)}s`;

    const showLivePanels = isRunning;
    const playersPanelClass = startAnimationsEnabled && startAnimationTriggered ? "server-enter--top" : "";
    const statsPanelClass = startAnimationsEnabled && startAnimationTriggered ? "server-enter--right" : "";
    const consoleClass = startAnimationsEnabled && startAnimationTriggered ? "console-enter--drop" : "";

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
                        <Tabs defaultValue="overview">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>
                            <TabsContents>
                                <TabsContent value="overview">
                                    <div className="server-overview-stage">
                                        {showLivePanels ? (
                                            <div className="stats-row">
                                                <div className={playersPanelClass}>
                                                    <PlayersAvatarPanel online_players={data?.online_players} />
                                                </div>
                                                <div className={statsPanelClass}>
                                                    <ServerStats
                                                        cpuUsagePercent={data?.cpu_usage_percent}
                                                        memoryUsageMb={data?.memory_usage_mb}
                                                        MAX_MEMORY_MB={data?.max_memory_mb}
                                                        minecraftMetersEnabled={minecraftMetersEnabled}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="server-standby-card">
                                                <h3 className="player-avatar-section-title">Standby</h3>
                                                <p className="server-standby-copy">
                                                    Press <strong>Start Server</strong> to load live players, usage meters, and console output.
                                                </p>
                                                <div className="server-standby-connection">
                                                    <span className={`status-dot ${isConnected ? "online" : "offline"}`} />
                                                    {isConnected ? "WebSocket connected" : "Waiting for WebSocket"}
                                                </div>
                                            </div>
                                        )}
                                        {websocketPipeEnabled && (
                                            <div className="ws-pipe-shell" aria-hidden="true">
                                                <div className="ws-pipe-edge ws-pipe-edge--top">
                                                    {Array.from({ length: 10 }).map((_, index) => (
                                                        <span
                                                            key={`bubble-top-${index}`}
                                                            className={`ws-pipe-bubble ${bubbleColorClass}`}
                                                            style={{
                                                                animationDuration: bubbleDuration,
                                                                animationDelay: `${index * 0.28}s`
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="ws-pipe-edge ws-pipe-edge--right">
                                                    {Array.from({ length: 8 }).map((_, index) => (
                                                        <span
                                                            key={`bubble-right-${index}`}
                                                            className={`ws-pipe-bubble ${bubbleColorClass}`}
                                                            style={{
                                                                animationDuration: bubbleDuration,
                                                                animationDelay: `${index * 0.22}s`
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="advanced">
                                    <DeleteConfirmation onConfirm={async () => {
                                        const result = await loadedServer.uninstall();
                                        if (result === true) {
                                            setIsInstalled(false);
                                            onUninstall?.();
                                        }
                                    }}/>
                                </TabsContent>
                            </TabsContents>
                        </Tabs>
                        {showLivePanels && (
                            <Console
                                server={loadedServer}
                                socket={socket}
                                isConnected={isConnected}
                                messages={messages}
                                setMessages={setMessages}
                                launchClassName={consoleClass}
                            />
                        )}
                        <QuickCommands
                            server={loadedServer}
                            isRunning={isRunning}
                            isConnected={isConnected}
                        />


                    </>
                )}
                </>
            )}
        </div>
    )
}

export default ServerPage;
