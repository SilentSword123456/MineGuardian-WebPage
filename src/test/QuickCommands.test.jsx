import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickCommands from '../components/QuickCommands.jsx';

vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

function makeServer(overrides = {}) {
    return {
        start: vi.fn().mockResolvedValue({}),
        stop: vi.fn().mockResolvedValue({}),
        ...overrides,
    };
}

describe('QuickCommands', () => {
    it('renders Start Server and Stop Server buttons', () => {
        render(<QuickCommands server={makeServer()} isRunning={false} isConnected={true} />);
        expect(screen.getByText(/start server/i)).toBeInTheDocument();
        expect(screen.getByText(/stop server/i)).toBeInTheDocument();
    });

    it('disables Start button when server is already running', () => {
        render(<QuickCommands server={makeServer()} isRunning={true} isConnected={true} />);
        expect(screen.getByText(/start server/i).closest('button')).toBeDisabled();
    });

    it('enables Start button when server is stopped and connected', () => {
        render(<QuickCommands server={makeServer()} isRunning={false} isConnected={true} />);
        expect(screen.getByText(/start server/i).closest('button')).not.toBeDisabled();
    });

    it('disables Stop button when server is stopped', () => {
        render(<QuickCommands server={makeServer()} isRunning={false} isConnected={true} />);
        expect(screen.getByText(/stop server/i).closest('button')).toBeDisabled();
    });

    it('enables Stop button when server is running and connected', () => {
        render(<QuickCommands server={makeServer()} isRunning={true} isConnected={true} />);
        expect(screen.getByText(/stop server/i).closest('button')).not.toBeDisabled();
    });

    it('disables Start button when not connected', () => {
        render(<QuickCommands server={makeServer()} isRunning={false} isConnected={false} />);
        expect(screen.getByText(/start server/i).closest('button')).toBeDisabled();
    });

    it('disables Stop button when not connected', () => {
        render(<QuickCommands server={makeServer()} isRunning={true} isConnected={false} />);
        expect(screen.getByText(/stop server/i).closest('button')).toBeDisabled();
    });

    it('calls server.start() when Start button is clicked', () => {
        const server = makeServer();
        render(<QuickCommands server={server} isRunning={false} isConnected={true} />);
        fireEvent.click(screen.getByText(/start server/i).closest('button'));
        expect(server.start).toHaveBeenCalled();
    });

    it('calls server.stop() when Stop button is clicked', () => {
        const server = makeServer();
        render(<QuickCommands server={server} isRunning={true} isConnected={true} />);
        fireEvent.click(screen.getByText(/stop server/i).closest('button'));
        expect(server.stop).toHaveBeenCalled();
    });
});
