import {useEffect, useRef, useState} from "react";
import createSocket from "../utils/webSocket.js";
import { Terminal, ChevronUp, ChevronDown, Trash2, Send } from "lucide-react";
import Button from "./ui/Button.jsx";

function Console({server, onStats}){
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (autoScroll && textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    useEffect(() => {
        if (isExpanded && textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            setAutoScroll(true);
        }
    }, [isExpanded]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setAutoScroll(atBottom);
    };

    useEffect(() => {
        if(!server || !server.name)
            return;

        console.log(`Creating socket for server: ${server.name}`);

        const newSocket = createSocket(server.name)
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

        newSocket.on('stats', (data) => {
            console.log('Received stats from console:', data);
            onStats?.(data);
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
            setAutoScroll(true);
        }
    };

    const clearConsole = () => {
        setMessages([]);
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
                    onScroll={handleScroll}
                />
                <div className="console-input-group">
                    <input
                        className={"terminalInput"}
                        type="text"
                        value={inputValue}
                        placeholder="Type a command..."
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendCommand();
                            }
                        }}
                    />

                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={clearConsole} 
                        title="Clear Console"
                        icon={Trash2}
                    />

                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={sendCommand} 
                        disabled={!inputValue.trim()}
                        icon={Send}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={`console-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="console-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="console-title">
                    <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                    <Terminal size={18} style={{ marginRight: '8px' }} />
                    Server Console
                </div>
                <button className="console-toggle-btn">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>
            {isExpanded && getTypeBarAndDisplay()}
        </div>
    )
}

export default Console;