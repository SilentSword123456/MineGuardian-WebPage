import { useState, useEffect, useRef } from "react";
import manager from "@/utils/manager.js";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayersAvatarPanel from "./PlayersAvatarPanel.jsx";
import ServerStats from "./ServerStats.jsx";
import { SocketProvider, useSocket } from "@/hooks/useSocket";
import DeleteConfirmation from "@/utils/deleteConfirmation.jsx";
import { useBackend } from "@/context/BackendContext.jsx";
import ServerLiveData from "@/types/serverLiveData.jsx";
import { WifiOff } from "lucide-react";
import { useNotification } from "@/hooks/use-notification.js";
import {
    Tabs,
    TabsContent,
    TabsContents,
    TabsList,
    TabsTrigger
} from "@/components/animate-ui/components/radix/tabs.jsx";
import ServerLink from "@/components/ServerLink.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPageContent({ loadedServer, onUninstall, backendUp }) {
    const { showNotification } = useNotification();
    const { socket, isConnected, setMessages } = useSocket();
    const [data, setData] = useState(() => new ServerLiveData().toObject());
    const [isRunning, setIsRunning] = useState(loadedServer.isRunning);
    const isRunningRef = useRef(loadedServer.isRunning);
    const [isInstalled, setIsInstalled] = useState(loadedServer.isInstalled);
    const [userId, setUserId] = useState("");
    const [permId, setPermId] = useState("");
    const [availablePermissions, setAvailablePermissions] = useState({});
    const [userPermissions, setUserPermissions] = useState({});
    const [serverPort, setServerPort] = useState(Number);

    const fetchUserPermissions = async () => {
        if (!backendUp || !loadedServer?.id) return;
        try {
            console.log("Fetching user permissions");
            const perms = await manager.getServerPermissions(loadedServer.id);
            console.log("Fetched permissions:", perms);
            setUserPermissions(perms);
        } catch (err) {
            console.error("Failed to fetch server permissions", err);
        }
    };

    useEffect(() => {
        if (backendUp && loadedServer?.id) {
            manager.getDefaultServersPermissions()
                .then(perms => {
                    setAvailablePermissions(perms);
                    // Set default permId if not set and perms exist
                    const firstPermId = Object.values(perms)[0];
                    if (firstPermId !== undefined) {
                        setPermId(firstPermId.toString());
                    }
                })
                .catch(err => console.error("Failed to fetch default permissions", err));
            fetchUserPermissions();
        }
    }, [backendUp, loadedServer?.id]);

    const handleGivePerm = async () => {
        try {
            await manager.giveUserPermissionToServer(parseInt(userId), loadedServer.id, parseInt(permId));
            showNotification("Permission given successfully", "success");
            fetchUserPermissions();
        } catch (error) {
            showNotification("Error giving permission: " + error.message, "error");
        }
    };

    const handleRemovePerm = async (targetUserId, targetPermId) => {
        const uId = targetUserId !== undefined ? targetUserId : parseInt(userId);
        const pId = targetPermId !== undefined ? targetPermId : parseInt(permId);
        try {
            await manager.removeUserPermissionFromServer(uId, loadedServer.id, pId);
            showNotification("Permission removed successfully", "success");
            fetchUserPermissions();
        } catch (error) {
            showNotification("Error removing permission: " + error.message, "error");
        }
    };

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
                setServerPort(serverInfo?.server_port);
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

        const handleResources = (statsData) => {
            if (isRunningRef.current) {
                setData((prev) => new ServerLiveData(prev).set(statsData).toObject());
            }
        };

        const handleStatus = (eventData) => {
            setIsRunning(eventData.running);
            isRunningRef.current = eventData.running;
        };

        socket.on("resources", handleResources);
        socket.on("status", handleStatus);

        return () => {
            socket.off("resources", handleResources);
            socket.off("status", handleStatus);
        };
    }, [socket, backendUp, setMessages]);

    const getPermName = (id) => {
        return Object.keys(availablePermissions).find(key => availablePermissions[key] === id) || id;
    };

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
                                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
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
                                        <ServerLink serverPort={serverPort} isRunning={isRunning} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="permissions">
                                    <div className="permissions-container">
                                        <h3 className="permissions-title">Manage User Permissions</h3>
                                        <div className="permissions-form">
                                            <div className="permissions-field">
                                                <label>User ID</label>
                                                <input
                                                    type="number"
                                                    placeholder="Enter User ID"
                                                    value={userId}
                                                    onChange={(e) => setUserId(e.target.value)}
                                                    className="permissions-input"
                                                />
                                            </div>
                                            <div className="permissions-field">
                                                <label>Permission</label>
                                                <select
                                                    value={permId}
                                                    onChange={(e) => setPermId(e.target.value)}
                                                    className="permissions-input permissions-select"
                                                >
                                                    {Object.entries(availablePermissions).map(([name, id]) => (
                                                        <option key={id} value={id}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="permissions-actions">
                                                <button
                                                    onClick={handleGivePerm}
                                                    className="btn-permission btn-give"
                                                >
                                                    Give Perm
                                                </button>
                                                <button
                                                    onClick={() => handleRemovePerm()}
                                                    className="btn-permission btn-remove"
                                                >
                                                    Remove Perm
                                                </button>
                                            </div>
                                        </div>

                                        <div className="permissions-list-section">
                                            <h4 className="permissions-subtitle">Authorized Users</h4>
                                            {Object.keys(userPermissions).length === 0 ? (
                                                <p className="no-permissions-msg">No permissions assigned yet.</p>
                                            ) : (
                                                <div className="permissions-table">
                                                    <div className="table-header">
                                                        <span>User ID</span>
                                                        <span>Permissions</span>
                                                    </div>
                                                    {Object.entries(userPermissions).map(([uId, perms]) => (
                                                        <div key={uId} className="table-row">
                                                            <div className="user-info">
                                                                <span className="user-id">#{uId}</span>
                                                                <button
                                                                    className="btn-add-for-user"
                                                                    onClick={() => setUserId(uId)}
                                                                    title="Set this user in the form above"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                            <div className="perms-badges">
                                                                {perms.map(pId => (
                                                                    <div key={pId} className="perm-badge">
                                                                        <span>{getPermName(pId)}</span>
                                                                        <button
                                                                            onClick={() => handleRemovePerm(parseInt(uId), pId)}
                                                                            className="btn-mini-remove"
                                                                            title="Remove this permission"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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