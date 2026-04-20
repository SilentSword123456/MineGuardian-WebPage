import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSocket } from '@/hooks/useSocket.jsx';
import { useAuthSessionContext } from '@/hooks/use-auth-session-context.jsx';
import Console from '../components/Console.jsx';

vi.mock('@/hooks/useSocket.jsx', () => ({
    useSocket: vi.fn(),
}));

vi.mock('@/hooks/use-auth-session-context.jsx', () => ({
    useAuthSessionContext: vi.fn(),
}));

function setupConsoleMocks({
    isConnected = false,
    messages = [],
    setMessages = vi.fn(),
    sendCommand = vi.fn(),
    currentUser = { username: 'TestUser' },
} = {}) {
    vi.mocked(useSocket).mockReturnValue({
        isConnected,
        messages,
        setMessages,
        sendCommand,
    });
    vi.mocked(useAuthSessionContext).mockReturnValue({ currentUser });

    return { setMessages, sendCommand };
}

function renderConsole(overrides = {}) {
    const spies = setupConsoleMocks(overrides);
    render(<Console server={{ name: 'TestServer' }} />);
    return spies;
}

describe('Console', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupConsoleMocks();
    });

    describe('collapsed state (default)', () => {
        it('renders the "Server Console" header', () => {
            renderConsole();
            expect(screen.getByText(/server console/i)).toBeInTheDocument();
        });

        it('does not render the textarea when collapsed', () => {
            renderConsole();
            expect(screen.queryByRole('textbox')).toBeNull();
        });

        it('shows a ChevronUp toggle button to expand', () => {
            renderConsole();
            // header click should expand
            const header = screen.getByText(/server console/i).closest('.console-header');
            expect(header).toBeInTheDocument();
        });
    });

    describe('expanded state', () => {
        function renderExpanded(overrides = {}) {
            renderConsole(overrides);
            // Click header to expand
            fireEvent.click(screen.getByText(/server console/i).closest('.console-header'));
        }

        it('shows "Not connected" when isConnected is false', () => {
            renderExpanded({ isConnected: false });
            expect(screen.getByText(/not connected/i)).toBeInTheDocument();
        });

        it('renders the textarea when connected', () => {
            renderExpanded({ isConnected: true });
            // document has both a textarea and a text input; query by class
            const textarea = document.querySelector('textarea.terminalConnection');
            expect(textarea).toBeTruthy();
        });

        it('renders the command input field when connected', () => {
            renderExpanded({ isConnected: true });
            expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
        });

        it('displays messages in the textarea', () => {
            renderExpanded({
                isConnected: true,
                messages: [
                    { type: 'server', data: 'Server started' },
                    { type: 'system', data: 'Player joined' },
                ],
            });
            const textarea = document.querySelector('textarea.terminalConnection');
            expect(textarea.value).toContain('server: Server started');
            expect(textarea.value).toContain('system: Player joined');
        });

        it('emits a console event on the socket when Enter is pressed in the input', () => {
            const sendCommand = vi.fn();
            renderExpanded({ isConnected: true, sendCommand });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.change(input, { target: { value: 'say hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(sendCommand).toHaveBeenCalledWith('say hello');
        });

        it('does not emit when the input is empty and Enter is pressed', () => {
            const sendCommand = vi.fn();
            renderExpanded({ isConnected: true, sendCommand });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(sendCommand).not.toHaveBeenCalled();
        });

        it('calls setMessages to add the sent command to the history', () => {
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, setMessages, currentUser: { username: 'Alex' } });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.change(input, { target: { value: 'tp Alice Bob' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(setMessages).toHaveBeenCalled();

            const updateFn = setMessages.mock.calls[0][0];
            expect(updateFn([])).toEqual([{ type: 'Alex', data: 'tp Alice Bob' }]);
        });

        it('falls back to "You" sender label when no username is available', () => {
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, setMessages, currentUser: null });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.change(input, { target: { value: 'list' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            const updateFn = setMessages.mock.calls[0][0];
            expect(updateFn([])).toEqual([{ type: 'You', data: 'list' }]);
        });

        it('clears messages when the clear button is clicked', () => {
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, setMessages });
            const clearBtn = screen.getByTitle(/clear console/i);
            fireEvent.click(clearBtn);
            expect(setMessages).toHaveBeenCalledWith([]);
        });
    });

    describe('toggling', () => {
        it('toggles expanded/collapsed state on header click', () => {
            renderConsole();
            const header = screen.getByText(/server console/i).closest('.console-header');
            // Initially collapsed — no textarea
            expect(screen.queryByPlaceholderText(/type a command/i)).toBeNull();
            // Expand
            fireEvent.click(header);
            // Now not-connected view should appear
            expect(screen.getByText(/not connected/i)).toBeInTheDocument();
            // Collapse again
            fireEvent.click(header);
            expect(screen.queryByText(/not connected/i)).toBeNull();
        });
    });
});
