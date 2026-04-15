import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/lib/config.js', () => ({ BASE_URL: 'http://localhost:5000' }));

// Import the singleton after mocking config
import manager from '../utils/manager.js';

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

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Manager.isBackendUp()', () => {
    it('returns true when the health endpoint responds ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true });
        expect(await manager.isBackendUp()).toBe(true);
    });

    it('returns false when the health endpoint responds not-ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        expect(await manager.isBackendUp()).toBe(false);
    });

    it('returns false on network error', async () => {
        global.fetch = mockFetchNetworkError();
        expect(await manager.isBackendUp()).toBe(false);
    });
});

describe('Manager.getServers()', () => {
    it('returns an array of Server instances with the correct properties', async () => {
        global.fetch = mockFetchOk({
            servers: [
                { id: 1, name: 'Alpha', isRunning: true },
                { id: 2, name: 'Beta', isRunning: false },
            ],
        });
        const servers = await manager.getServers();
        expect(servers).toHaveLength(2);
        expect(servers[0].id).toBe(1);
        expect(servers[0].name).toBe('Alpha');
        expect(servers[0].isRunning).toBe(true);
        expect(servers[1].id).toBe(2);
        expect(servers[1].name).toBe('Beta');
        expect(servers[1].isRunning).toBe(false);
    });

    it('throws when the response is not ok', async () => {
        global.fetch = mockFetchFail(500);
        await expect(manager.getServers()).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.getServers()).rejects.toThrow();
    });
});

describe('Manager.checkAuthSession()', () => {
    it('returns true when the auth probe endpoint responds ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true });
        await expect(manager.checkAuthSession()).resolves.toBe(true);
    });

    it('returns false on 401', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
        await expect(manager.checkAuthSession()).resolves.toBe(false);
    });

    it('returns false on 403', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
        await expect(manager.checkAuthSession()).resolves.toBe(false);
    });

    it('throws on non-auth HTTP errors', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
        await expect(manager.checkAuthSession()).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.checkAuthSession()).rejects.toThrow();
    });
});

describe('Manager.installServer()', () => {
    it('POSTs to /manage/addServer with the correct body and returns json', async () => {
        global.fetch = mockFetchOk(true);
        const result = await manager.installServer('MyServer', 'Vanilla', '1.21.4', true);
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5000/manage/addServer',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverName: 'MyServer',
                    serverSoftware: 'Vanilla',
                    serverVersion: '1.21.4',
                    acceptEula: true,
                }),
            })
        );
        expect(result).toBe(true);
    });

    it('uses "Vanilla" and "latest" as defaults', async () => {
        global.fetch = mockFetchOk(true);
        await manager.installServer('DefaultServer');
        const body = JSON.parse(fetch.mock.calls[0][1].body);
        expect(body.serverSoftware).toBe('Vanilla');
        expect(body.serverVersion).toBe('latest');
        expect(body.acceptEula).toBe(false);
    });

    it('throws when the response is not ok', async () => {
        global.fetch = mockFetchFail(400);
        await expect(manager.installServer('X')).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.installServer('X')).rejects.toThrow();
    });
});

describe('Manager.getAvailableVersions()', () => {
    it('GETs the correct endpoint and returns the json', async () => {
        global.fetch = mockFetchOk({ versions: ['1.21.4', '1.20.6'] });
        const result = await manager.getAvailableVersions('Spigot');
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5000/manage/Spigot/getAvailableVersions',
            expect.objectContaining({ method: 'GET' })
        );
        expect(result).toEqual({ versions: ['1.21.4', '1.20.6'] });
    });

    it('defaults to "Vanilla" when no software is provided', async () => {
        global.fetch = mockFetchOk({ versions: [] });
        await manager.getAvailableVersions();
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5000/manage/Vanilla/getAvailableVersions',
            expect.anything()
        );
    });

    it('throws when the response is not ok', async () => {
        global.fetch = mockFetchFail(404);
        await expect(manager.getAvailableVersions()).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.getAvailableVersions()).rejects.toThrow();
    });
});

describe('Manager.register()', () => {
    it('POSTs to /user with username and password and returns true on success', async () => {
        global.fetch = mockFetchOk({ status: true });
        const result = await manager.register('newuser', 'pass123');
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5000/user',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'newuser', password: 'pass123' }),
            })
        );
        expect(result).toBe(true);
    });

    it('throws when username already exists (status: false)', async () => {
        global.fetch = mockFetchOk({ status: false });
        await expect(manager.register('existing', 'pass')).rejects.toThrow(/username already exists/i);
    });

    it('throws when the response is not ok', async () => {
        global.fetch = mockFetchFail(400);
        await expect(manager.register('u', 'p')).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.register('u', 'p')).rejects.toThrow();
    });
});

describe('Manager.getGlobalUsedResources()', () => {
    it('returns a stats object with cpu capped at 100', async () => {
        global.fetch = mockFetchOk({
            cpu_usage_percent: 150,
            max_memory_mb: 8192,
            memory_usage_mb: 2048,
            online_players: { max: 20, online: 2, players: [] },
        });
        const result = await manager.getGlobalUsedResources();
        expect(result.cpu_usage_percent).toBe(100);
        expect(result.max_memory_mb).toBe(8192);
        expect(result.memory_usage_mb).toBe(2048);
    });

    it('returns cpu below 100 unchanged', async () => {
        global.fetch = mockFetchOk({
            cpu_usage_percent: 45,
            max_memory_mb: 4096,
            memory_usage_mb: 1024,
            online_players: { max: 10, online: 1, players: [] },
        });
        const result = await manager.getGlobalUsedResources();
        expect(result.cpu_usage_percent).toBe(45);
    });

    it('sets max_memory_mb to memory_usage_mb when max_memory_mb is 0', async () => {
        global.fetch = mockFetchOk({
            cpu_usage_percent: 10,
            max_memory_mb: 0,
            memory_usage_mb: 512,
            online_players: { max: 0, online: 0, players: [] },
        });
        const result = await manager.getGlobalUsedResources();
        expect(result.max_memory_mb).toBe(512);
    });

    it('sets max_memory_mb to 1 when both max and usage are 0', async () => {
        global.fetch = mockFetchOk({
            cpu_usage_percent: 0,
            max_memory_mb: 0,
            memory_usage_mb: 0,
            online_players: { max: 0, online: 0, players: [] },
        });
        const result = await manager.getGlobalUsedResources();
        expect(result.max_memory_mb).toBe(1);
    });

    it('throws when the response is not ok', async () => {
        global.fetch = mockFetchFail(503);
        await expect(manager.getGlobalUsedResources()).rejects.toThrow();
    });

    it('throws on network error', async () => {
        global.fetch = mockFetchNetworkError();
        await expect(manager.getGlobalUsedResources()).rejects.toThrow();
    });
});
