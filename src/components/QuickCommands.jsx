import Server from "../types/server.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import {Play, Square} from "lucide-react";

/**
 * @param {Object} props
 * @param {Server} props.server - The server instance
 * @param {boolean} props.isRunning
 * @param {boolean} props.isConnected
 */
function QuickCommands({server, isRunning, isConnected}) {

    return (
        <div className="quick-commands">
            <h3>Quick Commands</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <CustomButton
                    onClick={() => server.start()}
                    disabled={isRunning || !isConnected}
                    icon={Play}
                    variant="primary"
                >
                    Start Server
                </CustomButton>
                <CustomButton
                    onClick={() => server.stop()}
                    disabled={!isRunning || !isConnected}
                    icon={Square}
                    variant="danger"
                >
                    Stop Server
                </CustomButton>
            </div>
        </div>
    )
}

export default QuickCommands;