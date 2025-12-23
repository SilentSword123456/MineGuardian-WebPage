import Console from "./Console.jsx";

/**
 * @typedef {import('../types/server.js').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {


    return (
        <div>
            Current loaded server: {loadedServer.name} with id {loadedServer.id}
            <Console/>
        </div>
    )
}

export default ServerPage;