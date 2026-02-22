

function PlayerAvatar({playerName}) {
    return (
        <div className="player-avatar-wrapper">
            <img
                className={"player-avatar"}
                src={`https://minotar.net/avatar/${playerName}/64`}
                alt={playerName}
                style={{
                    borderRadius: 6,
                    imageRendering: "pixelated",
                }}
            />
            <span className="player-avatar-tooltip">{playerName}</span>
        </div>
    )
}

export default PlayerAvatar;