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

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer, onUninstall}) {
    const { backendUp } = useBackend();
    const [data, setData] = useState(() => new ServerLiveData().toObject());
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
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

        if(!loadedServer || !loadedServer.name)
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
                            max: Number(serverInfo?.online_players?.max ?? prev?.online_players?.max ?? 0),
                        },
                    }).toObject());
                })
                .catch((error) => {
                    console.error(`Error fetching general server info for ${loadedServer.name}:`, error);
                });

            console.log(`Creating socket for server: ${loadedServer.name}`);

            const newSocket = createSocket(loadedServer.name)
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
    }, [loadedServer.name, loadedServer.isInstalled, loadedServer.isRunning, backendUp]);

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


                    </>
                )}
                </>
            )}
        </div>
    )
}

export default ServerPage;