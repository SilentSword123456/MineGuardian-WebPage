function PlayerAvatar({ playerName = "" }) {
    return (
        <img
            className="player-avatar"
            src={`https://minotar.net/avatar/${playerName}/64`}
            alt={playerName}
            style={{
                borderRadius: 6,
                imageRendering: "pixelated",
            }}
        />
    );
}

export default PlayerAvatar;

