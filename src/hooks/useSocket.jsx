import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "@/lib/config.js";

const SocketContext = createContext(null);

export function SocketProvider({ serverId, children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages]       = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!serverId) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
            transports: ["websocket"],
            auth: { serverId },
            reconnection:         true,
            reconnectionAttempts: 5,
            reconnectionDelay:    1_000,
            reconnectionDelayMax: 10_000,
        });

        socketRef.current = socket;

        socket.on("connect",() => setIsConnected(true));
        socket.on("disconnect",() => setIsConnected(false));
        socket.on("connect_error", (err) => console.error("[socket] connection error", err.message));

        socket.on("console", (msg) =>
            setMessages((prev) => [...prev, { type: msg.source, data: msg.line }])
        );
        socket.on("system", (msg) =>
            setMessages((prev) => [...prev, { type: msg.source, data: msg.line }])
        );

        return () => {
            socket.off();
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setMessages([]);
        };
    }, [serverId]);

    const sendCommand = (message) => {
        if (!socketRef.current?.connected || !message.trim()) return;
        socketRef.current.emit("console", { message });
    };

    return (
        <SocketContext.Provider
            value={{ socket: socketRef.current, isConnected, messages, setMessages, sendCommand }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
    return ctx;
}