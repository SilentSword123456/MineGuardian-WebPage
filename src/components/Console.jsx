import {useEffect, useState} from "react";
import socket from "../utils/webSocket.js";

function Console(){
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        socket.on('message', (data) => {
            console.log('Received message:', data);
            setMessages(prev => [...prev, { type: 'server', text: data.data }]);
        });

        socket.on('response', (data) => {
            console.log('Received response:', data);
            setMessages(prev => [...prev, { type: 'server', text: data.data }]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('message');
            socket.off('response');
        };
    }, []);

    const sendMessage = () => {
        if (inputValue.trim()) {
            setMessages(prev => [...prev, { type: 'user', text: inputValue }]);

            // Send to server
            socket.emit('custom_event', { message: inputValue });

            // Clear input
            setInputValue('');
        }
    };

    function getTypeBar(){
        if(!isConnected)
            return "Not connected";

        return(
            <div>

            </div>
        )
    }

    return (
        <div>
            Console Component
        </div>
    )
}

export default Console;