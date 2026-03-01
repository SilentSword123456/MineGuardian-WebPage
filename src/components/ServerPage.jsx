import { useState, useEffect } from "react";
import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";
import ServerStats from "./ServerStats.jsx";
import createSocket from "../utils/webSocket.js";
import {Trash} from "lucide-react";
import Button from "./ui/Button.jsx";
import DeleteConfirmation from "@/utils/deleteConfirmation.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {
    const [data, setData] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isRunning, setIsRunning] = useState(loadedServer.isRunning);

    useEffect(() => {
        setData(null);
        setMessages([]);

        if(!loadedServer || !loadedServer.name)
            return;

        console.log(`Creating socket for server: ${loadedServer.name}`);

        const newSocket = createSocket(loadedServer.name)
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('message', (data) => {
            setMessages(prev => [...prev, {type:"", text: data.data }]);
        });

        newSocket.on('console', (data) => {
            setMessages(prev => [...prev, {type:"", text: data.data }]);
        });

        newSocket.on('resources', (data) => {
            setData(data);
        });

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
    }, [loadedServer.name]);

    return (
        <div className="server-page">
            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>
                    <h1>{loadedServer.name}</h1>
                    <div className="stats-row">
                        <PlayerAvatar isList serverData={data} />
                        <ServerStats
                            cpuUsagePercent={data?.cpu_usage_percent}
                            memoryUsageMb={data?.memory_usage_mb}
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
                    <DeleteConfirmation onConfirm={() => loadedServer.uninstall()} />

                </>
            )}
        </div>
    )
}

export default ServerPage;