import { io } from 'socket.io-client';
import { BASE_URL } from "@/lib/config.js";

const createSocket = (serverId) => {
    const socket = io(BASE_URL, {
        query: { serverId: String(serverId) },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    return socket;
}
export default createSocket;
