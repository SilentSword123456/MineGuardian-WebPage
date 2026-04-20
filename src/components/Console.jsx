import { useEffect, useRef, useState } from "react";
import { Terminal, ChevronUp, ChevronDown, Trash2, Send } from "lucide-react";
import CustomButton from "./ui/CustomButton.jsx";
import { useSocket } from "@/hooks/useSocket.jsx";
import { useAuthSessionContext } from "@/hooks/use-auth-session-context.jsx";

function Console({ server }) {
    const { isConnected, messages, setMessages, sendCommand } = useSocket();
    const { currentUser } = useAuthSessionContext();
    const senderLabel = currentUser?.username?.trim() || "You";
    const [inputValue, setInputValue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [autoScroll, setAutoScroll]  = useState(true);
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
        setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages((prev) => [...prev, { type: senderLabel, data: inputValue }]);
        sendCommand(inputValue);
        setInputValue("");
        setAutoScroll(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    function renderBody() {
        if (!isConnected) {
            return <div className="console-not-connected">Not connected</div>;
        }

        return (
            <div className="console-content">
                <textarea
                    ref={textareaRef}
                    className="terminalConnection"
                    value={messages
                        .map((m) => (m.type ? `${m.type}: ${m.data}` : m.data))
                        .join("\n")}
                    readOnly
                    onScroll={handleScroll}
                />
                <div className="console-input-group">
                    <input
                        className="terminalInput"
                        type="text"
                        value={inputValue}
                        placeholder="Type a command..."
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <CustomButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setMessages([])}
                        title="Clear console"
                        icon={Trash2}
                    />
                    <CustomButton
                        variant="primary"
                        size="sm"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        icon={Send}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`console-container ${isExpanded ? "expanded" : "collapsed"}`}>
            <div className="console-header" onClick={() => setIsExpanded((v) => !v)}>
                <div className="console-title">
                    <div className={`status-dot ${isConnected ? "online" : "offline"}`} />
                    <Terminal size={18} style={{ marginRight: "8px" }} />
                    Server Console
                </div>
                <button className="console-toggle-btn">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>
            {isExpanded && renderBody()}
        </div>
    );
}

export default Console;