import { BASE_URL } from "@/lib/config.js";
import DecryptedText from "@/components/ui/DecryptedText.jsx";
import { Copy } from "@/components/animate-ui/icons/copy";

function ServerLink({ serverPort, isRunning }) {
    const cleanBase = BASE_URL.replace(/^https?:\/\//, '');
    return (
        <div className="server-address-card" onClick={() => {
            if (serverPort) {
                navigator.clipboard.writeText(`${cleanBase}:${serverPort}`);
            }
        }}>
            <span className="server-address-label">Server Address</span>
            <div className="server-address-value">
                {serverPort ? (
                    <DecryptedText
                        key={isRunning ? `on-${serverPort}` : `off-${serverPort}`}
                        text={isRunning ? `${cleanBase}:${serverPort}` : "??.??.??.??:?????"}
                        speed={50}
                        maxIterations={8}
                        sequential={true}
                        revealDirection="start"
                        animateOn="view"
                        enableHoverEffect={false}
                        characters="abcdefghijklmnopqrstuvwxyz"
                        className="revealed"
                        parentClassName="all-letters"
                        encryptedClassName="encrypted"
                    />
                ) : (
                    <span className="server-address-pending">fetching...</span>
                )}
                <Copy className="server-address-copy-icon" animateOnHover size={14}/>
            </div>
        </div>
    );
}

export default ServerLink;