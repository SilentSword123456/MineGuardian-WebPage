import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {

    return (
        <div className="server-page">
            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>
                    <h1>{loadedServer.name}</h1>
                    <Console server={loadedServer}/>
                    <QuickCommands server={loadedServer} />
                </>
            )}
        </div>
    )
}

export default ServerPage;