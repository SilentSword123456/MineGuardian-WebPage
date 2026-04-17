import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "@/lib/config.js";

// ─── Context ────────────────────────────────────────────────────────────────

const SocketContext = createContext(null);

/**
 * Provides a singleton socket scoped to a single serverId.
 * The socket is torn down and recreated whenever serverId changes.
 */
export function SocketProvider({ serverId, children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages]       = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!serverId) return;

        // Credentials (JWT cookie) are sent automatically by the browser
        // because withCredentials: true. No need to pass tokens manually.
        const socket = io(BASE_URL, {
            withCredentials: true,
            transports: ["websocket"],
            // serverId travels in the auth object on connect,
            // and we also pass it as a query param for the disconnect
            // handler which cannot access the auth payload.
            auth:  { serverId },
            query: { serverId },
            // Built-in reconnection: up to 5 attempts, exponential back-off
            reconnection:       true,
            reconnectionAttempts: 5,
            reconnectionDelay:  1_000,
            reconnectionDelayMax: 10_000,
        });

        socketRef.current = socket;

        socket.on("connect",    () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));
        socket.on("connect_error", (err) => {
            console.error("[socket] connection error", err.message);
        });


        // Clean up on unmount or when serverId changes
        return () => {
            socket.off();        // remove all listeners
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

/**
 * Consume the socket context anywhere inside <SocketProvider>.
 *
 * const { isConnected, messages, sendCommand } = useSocket();
 */
export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
    return ctx;
}
