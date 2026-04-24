import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationProvider } from '@/context/NotificationContext.jsx';
import ServersPage from '../components/ServersPage.jsx';

vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

vi.mock('@/context/BackendContext.jsx', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useBackend: vi.fn() };
});
vi.mock('@/hooks/use-servers.jsx', () => ({ useServers: vi.fn() }));
vi.mock('@/hooks/use-global-resources.jsx', () => ({
    useGlobalResources: vi.fn(),
    DEFAULT_GLOBAL_RESOURCES: {
        cpu_usage_percent: 0,
        max_memory_mb: 1,
        memory_usage_mb: 0,
        online_players: { max: 0, online: 0, players: [] },
    },
}));

import { useBackend } from '@/context/BackendContext.jsx';
import { useServers } from '@/hooks/use-servers.jsx';
import { useGlobalResources } from '@/hooks/use-global-resources.jsx';

const defaultGlobalResources = {
    cpu_usage_percent: 0,
    max_memory_mb: 1,
    memory_usage_mb: 0,
    online_players: { max: 0, online: 0, players: [] },
};

function setupMocks({ backendUp = true, isCheckingBackend = false, servers = [], isLoading = false } = {}) {
    useBackend.mockReturnValue({ backendUp, isCheckingBackend });
    useServers.mockReturnValue({ data: servers, isLoading, refetch: vi.fn() });
    useGlobalResources.mockReturnValue({
        displayedGlobalResources: defaultGlobalResources,
        refetchGlobalResources: vi.fn(),
    });
}

function renderServersPage() {
    return render(
        <MemoryRouter>
            <NotificationProvider>
                <ServersPage />
            </NotificationProvider>
        </MemoryRouter>
    );
}

describe('ServersPage', () => {
    it('shows "Checking connection…" while checking the backend', () => {
        setupMocks({ isCheckingBackend: true, backendUp: null });
        renderServersPage();
        expect(screen.getByText(/checking connection/i)).toBeInTheDocument();
    });

    it('shows an offline message when the backend is down', () => {
        setupMocks({ backendUp: false });
        renderServersPage();
        expect(screen.getByText(/can't connect to backend/i)).toBeInTheDocument();
    });

    it('shows "Loading…" while the server list is being fetched', () => {
        setupMocks({ isLoading: true });
        renderServersPage();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('shows "No servers found" when the list is empty', () => {
        setupMocks({ servers: [] });
        renderServersPage();
        expect(screen.getByText(/no servers found/i)).toBeInTheDocument();
    });

    it('renders server names in the list', () => {
        setupMocks({
            servers: [
                { id: 1, name: 'Alpha', isRunning: true, start: vi.fn(), stop: vi.fn() },
                { id: 2, name: 'Beta', isRunning: false, start: vi.fn(), stop: vi.fn() },
            ],
        });
        renderServersPage();
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('renders the "Servers" section heading', () => {
        setupMocks();
        renderServersPage();
        expect(screen.getByText('Servers')).toBeInTheDocument();
    });

    it('renders the global stats panel (Server Stats)', () => {
        setupMocks();
        renderServersPage();
        expect(screen.getByText(/server stats/i)).toBeInTheDocument();
    });

    it('renders the Online Players panel', () => {
        setupMocks();
        renderServersPage();
        expect(screen.getByText(/online players/i)).toBeInTheDocument();
    });
});
