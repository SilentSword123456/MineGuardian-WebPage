import Server from "../types/server.jsx";
import Button from "./ui/Button.jsx";
import {Play, Square} from "lucide-react";

/**
 * @param {Object} props
 * @param {Server} props.server - The server instance
 */
function QuickCommands({server}) {

    return (
        <div className="quick-commands">
            <h3>Quick Commands</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                    onClick={() => server.start()}
                    disabled={server.isRunning}
                    icon={Play}
                    variant="primary"
                >
                    Start Server
                </Button>
                <Button
                    onClick={() => server.stop()}
                    disabled={!server.isRunning}
                    icon={Square}
                    variant="danger"
                >
                    Stop Server
                </Button>
            </div>
        </div>
    )
}

export default QuickCommands;