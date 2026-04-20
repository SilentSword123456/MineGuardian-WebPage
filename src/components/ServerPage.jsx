import { useState, useEffect, useRef } from "react";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayersAvatarPanel from "./PlayersAvatarPanel.jsx";
import ServerStats from "./ServerStats.jsx";
import { SocketProvider, useSocket } from "@/hooks/useSocket";
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

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPageContent({ loadedServer, onUninstall, backendUp }) {
    const { socket, isConnected, setMessages } = useSocket();
    const [data, setData] = useState(() => new ServerLiveData().toObject());
    const [isRunning, setIsRunning] = useState(loadedServer.isRunning);
    const isRunningRef = useRef(loadedServer.isRunning);
    const [isInstalled, setIsInstalled] = useState(loadedServer.isInstalled);

    useEffect(() => {
        if (isRunning === false) {
            setData((prev) => new ServerLiveData(prev).reset(true).toObject());
        }
    }, [isRunning]);

    useEffect(() => {
        setData(new ServerLiveData().toObject());
        setMessages([]);
        setIsInstalled(loadedServer.isInstalled);
        setIsRunning(loadedServer.isRunning);
        isRunningRef.current = loadedServer.isRunning;

        let isActive = false;

        if (!loadedServer || !loadedServer.name || backendUp !== true) {
            return () => {
                isActive = true;
            };
        }

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
                        max: Number(serverInfo?.online_players?.max ?? prev?.online_players?.max ?? 0),
                    },
                }).toObject());
            })
            .catch((error) => {
                console.error(`Error fetching general server info for ${loadedServer.name}:`, error);
            });

        return () => {
            isActive = true;
        };
    }, [loadedServer.name, loadedServer.isInstalled, loadedServer.isRunning, backendUp]);

    useEffect(() => {
        if (!socket || backendUp !== true) {
            return;
        }

        const handleSystem = (eventData) => {
            if (isRunningRef.current) {
                setMessages((prev) => [...prev, { type: eventData.source, data: eventData.line }]);
            }
        };

        const handleConsole = (eventData) => {
            if (isRunningRef.current) {
                setMessages((prev) => [...prev, { type: eventData.source, data: eventData.line }]);
            }
        };

        const handleResources = (statsData) => {
            if (isRunningRef.current) {
                setData((prev) => new ServerLiveData(prev).set(statsData).toObject());
            }
        };

        const handleStatus = (eventData) => {
            setIsRunning(eventData.running);
            isRunningRef.current = eventData.running;
        };

        socket.on("system", handleSystem);
        socket.on("console", handleConsole);
        socket.on("resources", handleResources);
        socket.on("status", handleStatus);

        return () => {
            socket.off("system", handleSystem);
            socket.off("console", handleConsole);
            socket.off("resources", handleResources);
            socket.off("status", handleStatus);
        };
    }, [socket, backendUp, setMessages]);

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
                                    <div className="stats-row">
                                        <PlayersAvatarPanel online_players={data?.online_players} />
                                        <ServerStats
                                            cpuUsagePercent={data?.cpu_usage_percent}
                                            memoryUsageMb={data?.memory_usage_mb}
                                            MAX_MEMORY_MB={data?.max_memory_mb}
                                        />
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
                        <Console
                            server={loadedServer}
                        />
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

/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({ loadedServer, onUninstall }) {
    const { backendUp } = useBackend();

    if (loadedServer?.id == null) {
        return (
            <div className="server-page">
                {!backendUp && (
                    <div className="server-offline-banner">
                        <WifiOff size={15} />
                        <span>Backend is offline - live data and controls unavailable</span>
                    </div>
                )}
                <h1>Please load a server</h1>
            </div>
        );
    }

    return (
        <SocketProvider serverId={backendUp === true ? loadedServer.id : null}>
            <ServerPageContent
                loadedServer={loadedServer}
                onUninstall={onUninstall}
                backendUp={backendUp}
            />
        </SocketProvider>
    );
}

export default ServerPage;