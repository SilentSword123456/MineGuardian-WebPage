import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../components/HomePage.jsx';

vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

// Mock the context hooks
vi.mock('@/context/BackendContext.jsx', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useBackend: vi.fn() };
});
vi.mock('@/hooks/use-servers.jsx', () => ({ useServers: vi.fn() }));

import { useBackend } from '@/context/BackendContext.jsx';
import { useServers } from '@/hooks/use-servers.jsx';

function renderHomePage() {
    return render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );
}

describe('HomePage', () => {
    it('shows "Checking connection…" while checking backend', () => {
        useBackend.mockReturnValue({ backendUp: null, isCheckingBackend: true });
        useServers.mockReturnValue({ data: [], isLoading: false });
        renderHomePage();
        // The text appears in both the status bar and the loading paragraph
        const els = screen.getAllByText(/checking connection/i);
        expect(els.length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Backend offline" message when backend is down', () => {
        useBackend.mockReturnValue({ backendUp: false, isCheckingBackend: false });
        useServers.mockReturnValue({ data: [], isLoading: false });
        renderHomePage();
        expect(screen.getByText(/backend offline/i)).toBeInTheDocument();
    });

    it('shows "Backend connected" when backend is up', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({ data: [], isLoading: false });
        renderHomePage();
        expect(screen.getByText(/backend connected/i)).toBeInTheDocument();
    });

    it('shows loading state while servers are being fetched', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({ data: [], isLoading: true });
        renderHomePage();
        expect(screen.getByText(/loading servers/i)).toBeInTheDocument();
    });

    it('shows "No servers found" when the server list is empty', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({ data: [], isLoading: false });
        renderHomePage();
        expect(screen.getByText(/no servers found/i)).toBeInTheDocument();
    });

    it('renders server cards when servers are available', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({
            data: [
                { id: 1, name: 'Alpha', isRunning: true },
                { id: 2, name: 'Beta', isRunning: false },
            ],
            isLoading: false,
        });
        renderHomePage();
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('shows "Running" status for running servers and "Stopped" for stopped servers', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({
            data: [
                { id: 1, name: 'Alpha', isRunning: true },
                { id: 2, name: 'Beta', isRunning: false },
            ],
            isLoading: false,
        });
        renderHomePage();
        expect(screen.getByText('Running')).toBeInTheDocument();
        expect(screen.getByText('Stopped')).toBeInTheDocument();
    });

    it('renders the MineGuardian title', () => {
        useBackend.mockReturnValue({ backendUp: true, isCheckingBackend: false });
        useServers.mockReturnValue({ data: [], isLoading: false });
        renderHomePage();
        expect(screen.getByText('MineGuardian')).toBeInTheDocument();
    });
});
