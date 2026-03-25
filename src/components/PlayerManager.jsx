import PlayerAvatar from "@/components/PlayerAvatar.jsx";

function PlayerManager({playerName=""}) {

    return (
        <div className="PlayerManager">
            <h1>{playerName}</h1>
            <PlayerAvatar playerName={playerName} />
        </div>
    )
}

export default PlayerManager;