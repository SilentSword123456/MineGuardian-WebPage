import Console from "./Console.jsx";
import QuickCommands from "./QuickCommands.jsx";
import {useQuery} from "@tanstack/react-query";
import {JSX} from "react";
import PlayerAvatar from "./PlayerAvatar.jsx";

/**
 * @typedef {import('../types/server.jsx').Server} Server
 */
/**
 * @param {Object} props
 * @param {Server} props.loadedServer
 */
function ServerPage({loadedServer}) {
    async function fetchServerInfo() {
        var result = await fetch(`http://localhost:5000/servers/${loadedServer.name}`)
            .then(res => res.json());

        console.log("Fetched server info");

        return result;
    }

    const {data, refetch} = useQuery({
        queryFn: fetchServerInfo,
        queryKey: ['serverStatus', loadedServer.name],
        refetchInterval: 5 * 1000 // Refetch every 10 seconds
    });

    function getPlayersImageList(playersNameList){
        if (playersNameList.length === 0) {
            return <span className="player-avatar-empty">No one's online, yet.</span>;
        }
        return playersNameList.map(playerName => (
            <PlayerAvatar key={playerName} playerName={playerName} />
        ));
    }

    return (
        <div className="server-page">
            {loadedServer.id === null ? (
                <h1>Please load a server</h1>
            ) : (
                <>
                    <h1>{loadedServer.name}</h1>
                    <div className="player-avatar-section">
                        <h3 className="player-avatar-section-title">Online Players</h3>
                        <div className="player-avatar-row">
                            {getPlayersImageList(data?.online_players.players || [])}
                        </div>
                    </div>
                    <Console server={loadedServer}/>
                    <QuickCommands server={loadedServer} />
                </>
            )}
        </div>
    )
}

export default ServerPage;