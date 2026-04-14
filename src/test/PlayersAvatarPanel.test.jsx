import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayersAvatarPanel from '../components/PlayersAvatarPanel.jsx';

const noPlayers = { max: 20, online: 0, players: [] };
const withPlayers = { max: 20, online: 3, players: ['Alice', 'Bob', 'Carol'] };
const manyPlayers = {
    max: 50,
    online: 25,
    players: Array.from({ length: 25 }, (_, i) => `Player${i + 1}`),
};

describe('PlayersAvatarPanel', () => {
    it('shows "No one\'s online" when the player list is empty', () => {
        render(<PlayersAvatarPanel online_players={noPlayers} />);
        expect(screen.getByText(/no one's online/i)).toBeInTheDocument();
    });

    it('renders an avatar for each online player', () => {
        render(<PlayersAvatarPanel online_players={withPlayers} />);
        expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    it('renders player names as alt text on the avatars', () => {
        render(<PlayersAvatarPanel online_players={withPlayers} />);
        expect(screen.getByAltText('Alice')).toBeInTheDocument();
        expect(screen.getByAltText('Bob')).toBeInTheDocument();
        expect(screen.getByAltText('Carol')).toBeInTheDocument();
    });

    it('caps displayed avatars at 20 and shows overflow count', () => {
        render(<PlayersAvatarPanel online_players={manyPlayers} />);
        // max 20 shown
        expect(screen.getAllByRole('img')).toHaveLength(20);
        // overflow: 25 - 20 = 5
        expect(screen.getByText(/\+5 more/i)).toBeInTheDocument();
    });

    it('renders the "Online Players" heading', () => {
        render(<PlayersAvatarPanel online_players={noPlayers} />);
        expect(screen.getByText(/online players/i)).toBeInTheDocument();
    });

    it('handles undefined online_players gracefully', () => {
        render(<PlayersAvatarPanel />);
        expect(screen.getByText(/no one's online/i)).toBeInTheDocument();
    });
});
