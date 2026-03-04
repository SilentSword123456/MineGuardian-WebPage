import { MG_VOID, MG_MIST } from '@/lib/colors';


function PlayerAvatar({playerName, serverData, isList}) {
    if (isList) {
        const n = serverData?.online_players?.max || 1;
        const cols = Math.max(1, Math.floor(Math.sqrt(n)));
        const rows = Math.ceil(n / cols);
        const playersNameList = serverData?.online_players?.players || [];

        return (
            <div className="player-avatar-section" style={{
                width: `${55 * cols + 40}px`,
                height: `${55 * rows + 50}px`,
                display: 'flex',
                flexDirection: 'column',
                padding: '15px 20px',
                boxSizing: 'border-box',
                backgroundColor: MG_VOID,
                border: `2px solid ${MG_MIST}`,
                borderRadius: '10px',
                marginBottom: '20px'
            }}>
                <h3 className="player-avatar-section-title">Online Players</h3>
                {playersNameList.length === 0 ? (
                    <span className="player-avatar-empty">No one's online</span>
                ) : (
                    <div className="player-avatar-row" style={{
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        flexDirection: 'column', 
                        height: `${55 * rows}px`, 
                        gap: '10px',
                        margin: 0,
                        alignContent: 'flex-start'
                    }}>
                        {playersNameList.map(name => (
                            <PlayerAvatar key={name} playerName={name} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

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