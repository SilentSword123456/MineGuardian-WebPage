import { describe, it, expect } from 'vitest';
import ServerLiveData from '../types/serverLiveData.jsx';

describe('ServerLiveData', () => {
    describe('constructor', () => {
        it('initialises with default zeroed values when called with no args', () => {
            const d = new ServerLiveData();
            expect(d.cpu_usage_percent).toBe(0);
            expect(d.max_memory_mb).toBe(0);
            expect(d.memory_usage_mb).toBe(0);
            expect(d.online_players).toEqual({ max: 0, online: 0, players: [] });
        });

        it('populates fields from the data argument passed to the constructor', () => {
            const d = new ServerLiveData({
                cpu_usage_percent: 42,
                max_memory_mb: 4096,
                memory_usage_mb: 1024,
                online_players: { max: 20, online: 3, players: ['Alice', 'Bob', 'Carol'] },
            });
            expect(d.cpu_usage_percent).toBe(42);
            expect(d.max_memory_mb).toBe(4096);
            expect(d.memory_usage_mb).toBe(1024);
            expect(d.online_players).toEqual({ max: 20, online: 3, players: ['Alice', 'Bob', 'Carol'] });
        });
    });

    describe('reset()', () => {
        it('zeros all fields by default', () => {
            const d = new ServerLiveData({ cpu_usage_percent: 75, max_memory_mb: 8192, memory_usage_mb: 2048 });
            d.reset();
            expect(d.cpu_usage_percent).toBe(0);
            expect(d.max_memory_mb).toBe(0);
            expect(d.memory_usage_mb).toBe(0);
            expect(d.online_players.online).toBe(0);
            expect(d.online_players.players).toEqual([]);
        });

        it('preserves online_players.max when keepMax=true', () => {
            const d = new ServerLiveData({ online_players: { max: 20, online: 5, players: ['Alice'] } });
            d.reset(true);
            expect(d.online_players.max).toBe(20);
            expect(d.online_players.online).toBe(0);
            expect(d.online_players.players).toEqual([]);
        });

        it('zeros online_players.max when keepMax is false (default)', () => {
            const d = new ServerLiveData({ online_players: { max: 20, online: 5, players: ['Alice'] } });
            d.reset(false);
            expect(d.online_players.max).toBe(0);
        });

        it('returns the instance for chaining', () => {
            const d = new ServerLiveData();
            expect(d.reset()).toBe(d);
        });
    });

    describe('set()', () => {
        it('updates all numeric fields from the supplied object', () => {
            const d = new ServerLiveData();
            d.set({ cpu_usage_percent: 55, max_memory_mb: 2048, memory_usage_mb: 512 });
            expect(d.cpu_usage_percent).toBe(55);
            expect(d.max_memory_mb).toBe(2048);
            expect(d.memory_usage_mb).toBe(512);
        });

        it('updates online_players fields', () => {
            const d = new ServerLiveData();
            d.set({ online_players: { max: 10, online: 2, players: ['Dave'] } });
            expect(d.online_players.max).toBe(10);
            expect(d.online_players.online).toBe(2);
            expect(d.online_players.players).toEqual(['Dave']);
        });

        it('keeps existing values when the incoming object is empty', () => {
            const d = new ServerLiveData({ cpu_usage_percent: 30, max_memory_mb: 1024 });
            d.set({});
            expect(d.cpu_usage_percent).toBe(30);
            expect(d.max_memory_mb).toBe(1024);
        });

        it('coerces string numbers to numbers', () => {
            const d = new ServerLiveData();
            d.set({ cpu_usage_percent: '88', max_memory_mb: '4096', memory_usage_mb: '256' });
            expect(d.cpu_usage_percent).toBe(88);
            expect(d.max_memory_mb).toBe(4096);
            expect(d.memory_usage_mb).toBe(256);
        });

        it('falls back to an empty players array when online_players.players is not an array', () => {
            const d = new ServerLiveData({ online_players: { max: 5, online: 1, players: ['Alice'] } });
            d.set({ online_players: { max: 5, online: 0, players: null } });
            expect(d.online_players.players).toEqual(['Alice']);
        });

        it('returns the instance for chaining', () => {
            const d = new ServerLiveData();
            expect(d.set({})).toBe(d);
        });
    });

    describe('toObject()', () => {
        it('returns a plain object with all the expected keys', () => {
            const d = new ServerLiveData({ cpu_usage_percent: 10, max_memory_mb: 512, memory_usage_mb: 100 });
            const obj = d.toObject();
            expect(obj).toEqual({
                cpu_usage_percent: 10,
                max_memory_mb: 512,
                memory_usage_mb: 100,
                online_players: { max: 0, online: 0, players: [] },
            });
        });

        it('produces a copy — mutating the result does not affect the instance', () => {
            const d = new ServerLiveData({ online_players: { max: 5, online: 1, players: ['Alice'] } });
            const obj = d.toObject();
            obj.online_players.players.push('Bob');
            expect(d.online_players.players).toEqual(['Alice']);
        });
    });
});
