import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config so it doesn't reference window.location
vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

import Server from '../types/server.jsx';

function mockFetchOk(json) {
    return vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(json),
    });
}

function mockFetchFail(status = 500) {
    return vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: () => Promise.resolve({}),
    });
}

function mockFetchNetworkError() {
    return vi.fn().mockRejectedValue(new Error('Network error'));
}

describe('Server', () => {
    let server;

    beforeEach(() => {
        server = new Server(1, 'TestServer', false, 'http://localhost:5000');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('stores id, name, isRunning and sets isInstalled to true', () => {
            expect(server.id).toBe(1);
            expect(server.name).toBe('TestServer');
            expect(server.isRunning).toBe(false);
            expect(server.isInstalled).toBe(true);
        });

        it('uses the BASE_URL default when no baseUrl is provided', () => {
            const s = new Server(2, 'AnotherServer', true);
            expect(s.baseUrl).toBe('http://localhost:5000');
        });
    });

    describe('start()', () => {
        it('POSTs to /servers/{name}/start and returns the JSON result', async () => {
            global.fetch = mockFetchOk({ started: true });
            const result = await server.start();
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/servers/TestServer/start',
                expect.objectContaining({ method: 'POST' })
            );
            expect(result).toEqual({ started: true });
        });

        it('throws when the response is not ok', async () => {
            global.fetch = mockFetchFail(500);
            await expect(server.start()).rejects.toThrow();
        });

        it('throws on network error', async () => {
            global.fetch = mockFetchNetworkError();
            await expect(server.start()).rejects.toThrow('Network error');
        });
    });

    describe('stop()', () => {
        it('POSTs to /servers/{name}/stop and returns the JSON result', async () => {
            global.fetch = mockFetchOk({ stopped: true });
            const result = await server.stop();
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/servers/TestServer/stop',
                expect.objectContaining({ method: 'POST' })
            );
            expect(result).toEqual({ stopped: true });
        });

        it('throws when the response is not ok', async () => {
            global.fetch = mockFetchFail(503);
            await expect(server.stop()).rejects.toThrow();
        });

        it('throws on network error', async () => {
            global.fetch = mockFetchNetworkError();
            await expect(server.stop()).rejects.toThrow();
        });
    });

    describe('uninstall()', () => {
        it('sends DELETE to /servers/{name}/uninstall', async () => {
            global.fetch = mockFetchOk(true);
            await server.uninstall();
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/servers/TestServer/uninstall',
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('sets isInstalled=false when the response is true', async () => {
            global.fetch = mockFetchOk(true);
            await server.uninstall();
            expect(server.isInstalled).toBe(false);
        });

        it('does not change isInstalled when the response is not true', async () => {
            global.fetch = mockFetchOk({ error: 'cannot delete running server' });
            await server.uninstall();
            expect(server.isInstalled).toBe(true);
        });

        it('throws on HTTP error', async () => {
            global.fetch = mockFetchFail(400);
            await expect(server.uninstall()).rejects.toThrow();
        });

        it('throws on network error', async () => {
            global.fetch = mockFetchNetworkError();
            await expect(server.uninstall()).rejects.toThrow();
        });
    });

    describe('getGeneralInfo()', () => {
        it('GETs /servers/{name} and returns parsed JSON', async () => {
            const info = { max_memory_mb: 4096, online_players: { max: 20 } };
            global.fetch = mockFetchOk(info);
            const result = await server.getGeneralInfo();
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/servers/TestServer',
                expect.objectContaining({ method: 'GET' })
            );
            expect(result).toEqual(info);
        });

        it('throws on HTTP error', async () => {
            global.fetch = mockFetchFail(404);
            await expect(server.getGeneralInfo()).rejects.toThrow();
        });

        it('throws on network error', async () => {
            global.fetch = mockFetchNetworkError();
            await expect(server.getGeneralInfo()).rejects.toThrow();
        });
    });
});
