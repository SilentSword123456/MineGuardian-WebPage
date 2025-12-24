import { io } from 'socket.io-client';

const createSocket = (serverName) => {
    const socket = io('http://localhost:5000', {
        query: { serverName: serverName }
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