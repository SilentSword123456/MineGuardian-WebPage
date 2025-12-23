import { io } from 'socket.io-client';

const createSocket = (serverId) => {
    const socket = io('http://localhost:5000', {
        query: { serverId: serverId }
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