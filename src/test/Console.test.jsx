import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Console from '../components/Console.jsx';

function makeSocket(overrides = {}) {
    return {
        emit: vi.fn(),
        ...overrides,
    };
}

const baseProps = {
    server: { name: 'TestServer' },
    socket: null,
    isConnected: false,
    messages: [],
    setMessages: vi.fn(),
};

describe('Console', () => {
    describe('collapsed state (default)', () => {
        it('renders the "Server Console" header', () => {
            render(<Console {...baseProps} />);
            expect(screen.getByText(/server console/i)).toBeInTheDocument();
        });

        it('does not render the textarea when collapsed', () => {
            render(<Console {...baseProps} />);
            expect(screen.queryByRole('textbox')).toBeNull();
        });

        it('shows a ChevronUp toggle button to expand', () => {
            render(<Console {...baseProps} />);
            // header click should expand
            const header = screen.getByText(/server console/i).closest('.console-header');
            expect(header).toBeInTheDocument();
        });
    });

    describe('expanded state', () => {
        function renderExpanded(props = {}) {
            const merged = { ...baseProps, ...props };
            render(<Console {...merged} />);
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
                    { type: 'server', text: 'Server started' },
                    { type: 'system', text: 'Player joined' },
                ],
            });
            const textarea = document.querySelector('textarea.terminalConnection');
            expect(textarea.value).toContain('server: Server started');
            expect(textarea.value).toContain('system: Player joined');
        });

        it('emits a console event on the socket when Enter is pressed in the input', () => {
            const socket = makeSocket();
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, socket, setMessages });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.change(input, { target: { value: 'say hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(socket.emit).toHaveBeenCalledWith('console', { message: 'say hello' });
        });

        it('does not emit when the input is empty and Enter is pressed', () => {
            const socket = makeSocket();
            renderExpanded({ isConnected: true, socket });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(socket.emit).not.toHaveBeenCalled();
        });

        it('calls setMessages to add the sent command to the history', () => {
            const socket = makeSocket();
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, socket, setMessages });
            const input = screen.getByPlaceholderText(/type a command/i);
            fireEvent.change(input, { target: { value: 'tp Alice Bob' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            // setMessages is called with a function (functional update)
            expect(setMessages).toHaveBeenCalled();
        });

        it('clears messages when the clear button is clicked', () => {
            const setMessages = vi.fn();
            renderExpanded({ isConnected: true, setMessages });
            // Find the clear button (Trash2 icon button)
            const buttons = screen.getAllByRole('button');
            // The clear button is the secondary button (Trash2)
            const clearBtn = buttons.find(b => b.title === 'Clear Console');
            expect(clearBtn).toBeTruthy();
            fireEvent.click(clearBtn);
            expect(setMessages).toHaveBeenCalledWith([]);
        });
    });

    describe('toggling', () => {
        it('toggles expanded/collapsed state on header click', () => {
            render(<Console {...baseProps} />);
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
