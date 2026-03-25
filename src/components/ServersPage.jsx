import { useNavigate } from "react-router-dom";
import ServersBar from "./ServersBar.jsx";

function ServersPage() {
    const navigate = useNavigate();

    function handleLoadServer(serverName) {
        navigate(`/server/${encodeURIComponent(serverName)}`);
    }

    return (
        <div className="servers-page">
            <ServersBar loadServer={handleLoadServer} />
        </div>
    );
}

export default ServersPage;
