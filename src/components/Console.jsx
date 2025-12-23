import {useEffect, useState} from "react";
import createSocket from "../utils/webSocket.js";

function Console({server}){
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if(!server || !server.id)
            return;

        console.log(`Creating socket for server: ${server.id}`);

        const newSocket = createSocket(server.id)
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('message', (data) => {
            console.log('Received message:', data);
            setMessages(prev => [...prev, { type: 'server', text: data.data }]);
        });

        return () => {
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('message');
            newSocket.off('response');
            newSocket.disconnect();
            setMessages([]);
        };
    }, [server.id]);

    const sendMessage = () => {
        if (inputValue.trim()) {
            setMessages(prev => [...prev, { type: 'user', text: inputValue }]);

            socket.emit('message', { message: inputValue });

            setInputValue('');
        }
    };

    function getTypeBarAndDisplay(){
        if(!isConnected)
            return "Not connected";

        return(
            <div>
                <textarea
                    className={"terminalConnection"}
                    value={messages.map(m => `${m.type}: ${m.text}`).join('\n')}
                    readOnly
                />
                <input
                    className={"terminalInput"}
                    type="text"
                    value={inputValue}
                    placeholder="Type something..."
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />
            </div>
        )
    }

    return (
        <div>
            {getTypeBarAndDisplay()}
        </div>
    )
}

export default Console;