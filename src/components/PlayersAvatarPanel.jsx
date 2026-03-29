import { MG_VOID, MG_MIST } from '@/lib/colors';
import PlayerAvatar from "@/components/PlayerAvatar.jsx";

const MAX_SHOWN = 20;

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
 * PlayersAvatarPanel - renders a grid of online player avatars.
 * Dynamically sizes based on max players (capped at 20 for layout),
 * showing "+X more" for any beyond that.
 *
 * @param {{ online_players: { max: number, players: string[] } }} props
 */
function PlayersAvatarPanel({ online_players }) {
    const playersNameList = online_players?.players || [];
    const shown = playersNameList.slice(0, MAX_SHOWN);
    const overflow = playersNameList.length - shown.length;

    // Size grid based on actual shown count, not server max
    const n = Math.min(online_players?.max || 1, MAX_SHOWN);
    const cols = Math.max(1, Math.floor(Math.sqrt(n)));
    const rows = Math.ceil(n / cols);

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
                <>
                    <div className="player-avatar-row" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        flexDirection: 'column',
                        height: `${55 * rows}px`,
                        gap: '10px',
                        margin: 0,
                        alignContent: 'flex-start',
                        overflow: 'hidden',
                    }}>
                        {shown.map(name => (
                            <PlayerAvatarItem key={name} playerName={name} />
                        ))}
                    </div>
                    {overflow > 0 && (
                        <span className="player-avatar-overflow">+{overflow} more</span>
                    )}
                </>
            )}
        </div>
    );
}

export { PlayerAvatarItem };
export default PlayersAvatarPanel;