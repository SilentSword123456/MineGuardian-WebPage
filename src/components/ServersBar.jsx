import {useState} from "react";
/**
 * @typedef {Array} Server
 * @property {number} id
 * @property {string} name
 */
function ServersBar(){

    async function refreshServerList(){
        const data = await fetch('http://localhost:5000/servers').then(res => res.json());

        /** @type {Server[]} */
        const servers = data['servers'];
        setServers(servers);
    }

    /** @type {Server[]} */
    const [servers, setServers]= useState([]);

    return (
        <div className="sidebar">
            <h3>Servers</h3>
            <button className={"refreshButton"} onClick={() => refreshServerList()}>Refresh</button>
            {console.log(servers)}
            {servers.map((server) => (
                <div className="server-item" key={server.id}>
                    {server.name}
                </div>
            ))}
        </div>
    );
}

export default ServersBar;