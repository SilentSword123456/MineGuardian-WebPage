import Server from "../types/Server";

/**
 * @param {Object} props
 * @param {Server} props.server - The server instance
 */
function QuickCommands({server}) {

    return (
        <div className="quick-commands">
            <h3>Quick Commands</h3>
            <button
                onClick={() => server.start()}
                disabled={server.isRunning}>
                start
            </button>
            <button
                onClick={() => server.stop()}
                disabled={!server.isRunning}>
                stop
            </button>
            <button>/restart</button>
        </div>
    )
}

export default QuickCommands;