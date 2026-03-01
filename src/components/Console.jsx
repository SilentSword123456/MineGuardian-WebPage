import {useEffect, useRef, useState} from "react";
import { Terminal, ChevronUp, ChevronDown, Trash2, Send } from "lucide-react";
import CustomButton from "./ui/CustomButton.jsx";

function Console({server, socket, isConnected, messages, setMessages}){
    const [inputValue, setInputValue] = useState('');
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

    const sendCommand = () => {
        if (inputValue.trim() && socket) {
            setMessages(prev => [...prev, {type:'SilentSword', text: inputValue }]); ///TODO: PLACEHOLDER, CHANGE TO USER

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

                    <CustomButton
                        variant="secondary" 
                        size="sm" 
                        onClick={clearConsole} 
                        title="Clear Console"
                        icon={Trash2}
                    />

                    <CustomButton
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