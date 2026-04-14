import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerAvatar from '../components/PlayerAvatar.jsx';

describe('PlayerAvatar', () => {
    it('renders an <img> with the minotar URL containing the player name', () => {
        render(<PlayerAvatar playerName="Steve" />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', expect.stringContaining('Steve'));
        expect(img).toHaveAttribute('alt', 'Steve');
    });

    it('renders with an empty player name and falls back gracefully', () => {
        render(<PlayerAvatar />);
        // An img with empty alt text has the "presentation" role per accessibility spec
        const img = document.querySelector('img.player-avatar');
        expect(img).toBeTruthy();
        expect(img).toHaveAttribute('alt', '');
    });
});
