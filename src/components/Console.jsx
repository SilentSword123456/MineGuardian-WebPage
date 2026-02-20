import {useEffect, useRef, useState} from "react";
import createSocket from "../utils/webSocket.js";

function Console({server}){
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [messages, isExpanded]);

    useEffect(() => {
        if(!server || !server.name)
            return;

        console.log(`Creating socket for server: ${server.name}`);

        const newSocket = createSocket(server.name)
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
            setMessages(prev => [...prev, {type:"", text: data.data }]);
        });

        newSocket.on('console', (data) => {
            console.log('Received message from console:', data);
            setMessages(prev => [...prev, {type:"", text: data.data }]);
        });

        return () => {
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('message');
            newSocket.off('response');
            newSocket.disconnect();
            setMessages([]);
        };
    }, [server.name]);

    const sendCommand = () => {
        if (inputValue.trim()) {
            setMessages(prev => [...prev, {type:'SilentSword', text: inputValue }]); ///PLACEHOLDER, CHANGE TO USER

            socket.emit('console', { message: inputValue });

            setInputValue('');
        }
    };

    function getTypeBarAndDisplay(){
        if(!isConnected)
            return <div className="console-not-connected">Not connected</div>;

        return(
            <div className="console-content">
                <textarea
                    ref={textareaRef}
                    className={"terminalConnection"}
                    value={messages.map(m => m.type ? `${m.type}: ${m.text}` : m.text).join('\n')}
                    readOnly
                />
                <div className="console-input-group">
                    <input
                        className={"terminalInput"}
                        type="text"
                        value={inputValue}
                        placeholder="Type something..."
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendCommand();
                            }
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={`console-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="console-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="console-title">
                    <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                    Server Console
                </div>
                <button className="console-toggle-btn">
                    {isExpanded ? '−' : '+'}
                </button>
            </div>
            {isExpanded && getTypeBarAndDisplay()}
        </div>
    )
}

export default Console;