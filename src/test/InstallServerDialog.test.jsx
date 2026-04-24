import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InstallServerDialog from '../utils/installServerDialog.jsx';
import { NotificationProvider } from '@/context/NotificationContext.jsx';

vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

vi.mock('@/utils/manager.js', () => ({
    default: {
        getAvailableVersions: vi.fn().mockResolvedValue({ versions: ['1.21.4', '1.20.6'] }),
        installServer: vi.fn().mockResolvedValue({ status: true }),
    },
}));

vi.mock('@/context/BackendContext.jsx', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useBackend: vi.fn() };
});

import { useBackend } from '@/context/BackendContext.jsx';
import manager from '@/utils/manager.js';

function setup(backendUp = true, props = {}) {
    useBackend.mockReturnValue({ backendUp, isCheckingBackend: false });
    return render(
        <NotificationProvider>
            <InstallServerDialog {...props} />
        </NotificationProvider>
    );
}

describe('InstallServerDialog', () => {
    beforeEach(() => {
        manager.getAvailableVersions.mockResolvedValue({ versions: ['1.21.4', '1.20.6'] });
        manager.installServer.mockResolvedValue({ status: true });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the trigger button', () => {
        setup();
        const btn = document.querySelector('.install-server-button');
        expect(btn).toBeTruthy();
    });

    it('disables the trigger button when the backend is down', () => {
        setup(false);
        const btn = document.querySelector('.install-server-button');
        expect(btn).toBeDisabled();
    });

    it('enables the trigger button when the backend is up', () => {
        setup(true);
        const btn = document.querySelector('.install-server-button');
        expect(btn).not.toBeDisabled();
    });

    it('opens the Install Server dialog when the trigger is clicked', async () => {
        setup();
        await act(async () => {
            fireEvent.click(document.querySelector('.install-server-button'));
        });
        await waitFor(() => expect(screen.getByText('Install Server')).toBeInTheDocument());
    });

    it('shows the EULA checkbox inside the dialog', async () => {
        setup();
        await act(async () => {
            fireEvent.click(document.querySelector('.install-server-button'));
        });
        await waitFor(() => expect(screen.getByText(/minecraft eula/i)).toBeInTheDocument());
    });

    it('calls manager.installServer with correct args on form submission', async () => {
        setup();
        await act(async () => {
            fireEvent.click(document.querySelector('.install-server-button'));
        });
        await waitFor(() => screen.getByText('Install Server'));

        // Change server name
        const nameInput = screen.getByDisplayValue('My Server');
        fireEvent.change(nameInput, { target: { value: 'TestServer' } });

        // Accept EULA
        const eulaCheckbox = document.querySelector('#accept-eula');
        fireEvent.click(eulaCheckbox);

        const submitBtn = screen.getByRole('button', { name: /^install$/i });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        expect(manager.installServer).toHaveBeenCalledWith(
            'TestServer',
            expect.any(String),
            expect.any(String),
            true
        );
    });

    it('shows an error message when the server returns an error object', async () => {
        manager.installServer.mockResolvedValue({ error: 'Server name already taken' });
        setup();
        await act(async () => {
            fireEvent.click(document.querySelector('.install-server-button'));
        });
        await waitFor(() => screen.getByText('Install Server'));

        const eulaCheckbox = document.querySelector('#accept-eula');
        fireEvent.click(eulaCheckbox);

        const submitBtn = screen.getByRole('button', { name: /^install$/i });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        await waitFor(() =>
            expect(screen.getByText(/server name already taken/i)).toBeInTheDocument()
        );
    });

    it('shows a generic error when manager.installServer throws', async () => {
        manager.installServer.mockRejectedValue(new Error('Network failure'));
        setup();
        await act(async () => {
            fireEvent.click(document.querySelector('.install-server-button'));
        });
        await waitFor(() => screen.getByText('Install Server'));

        const eulaCheckbox = document.querySelector('#accept-eula');
        fireEvent.click(eulaCheckbox);

        const submitBtn = screen.getByRole('button', { name: /^install$/i });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        await waitFor(() =>
            expect(screen.getByText(/Network failure/i)).toBeInTheDocument()
        );
    });
});
