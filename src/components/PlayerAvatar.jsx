

function PlayerAvatar({playerName}) {
    return (
        <img
            className={"player-avatar"}
            key={playerName}
            src={`https://minotar.net/avatar/${playerName}/64`}
            alt={playerName}
            style={{
                borderRadius: 6,
                imageRendering: "pixelated",
            }}
        />
    )
}

export default PlayerAvatar;