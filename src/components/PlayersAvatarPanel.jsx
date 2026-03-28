import { MG_VOID, MG_MIST } from '@/lib/colors';
import PlayerAvatar from "@/components/PlayerAvatar.jsx";

/**
 * PlayerAvatarItem - renders a single player avatar with a tooltip
 */
function PlayerAvatarItem({ playerName }) {
    return (
        <div className="player-avatar-wrapper">
            <PlayerAvatar playerName={playerName} />
            <span className="player-avatar-tooltip">{playerName}</span>
        </div>
    );
}

/**
 * PlayersAvatarPanel - renders a grid of online player avatars
 * @param {Object} online_players - object with .max (max players) and .players (array of player names)
 */
function PlayersAvatarPanel({ online_players }) {
    const n = online_players?.max || 1;
    const cols = Math.max(1, Math.floor(Math.sqrt(n)));
    const rows = Math.ceil(n / cols);
    const playersNameList = online_players?.players || [];

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
                        <PlayerAvatarItem key={name} playerName={name} />
                    ))}
                </div>
            )}
        </div>
    );
}

export { PlayerAvatarItem };
export default PlayersAvatarPanel;