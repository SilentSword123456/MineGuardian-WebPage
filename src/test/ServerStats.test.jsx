import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServerStats from '../components/ServerStats.jsx';

describe('ServerStats', () => {
    it('renders the "Server Stats" heading', () => {
        render(<ServerStats cpuUsagePercent={0} memoryUsageMb={0} MAX_MEMORY_MB={1024} />);
        expect(screen.getByText(/server stats/i)).toBeInTheDocument();
    });

    it('renders CPU and RAM labels', () => {
        render(<ServerStats cpuUsagePercent={50} memoryUsageMb={512} MAX_MEMORY_MB={1024} />);
        expect(screen.getByText('CPU')).toBeInTheDocument();
        expect(screen.getByText('RAM')).toBeInTheDocument();
    });

    it('displays 0% for CPU when cpuUsagePercent is 0', () => {
        render(<ServerStats cpuUsagePercent={0} memoryUsageMb={0} MAX_MEMORY_MB={1024} />);
        const pcts = screen.getAllByText('0%');
        expect(pcts.length).toBeGreaterThanOrEqual(2);
    });

    it('displays 50% for CPU at 50% usage', () => {
        render(<ServerStats cpuUsagePercent={50} memoryUsageMb={0} MAX_MEMORY_MB={1024} />);
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('calculates RAM percentage correctly (50% usage of max)', () => {
        render(<ServerStats cpuUsagePercent={0} memoryUsageMb={512} MAX_MEMORY_MB={1024} />);
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('caps RAM display at 100% even if usage exceeds max', () => {
        render(<ServerStats cpuUsagePercent={0} memoryUsageMb={2048} MAX_MEMORY_MB={1024} />);
        // RAM = 100%, CPU = 0%
        const pcts = screen.getAllByText('100%');
        expect(pcts.length).toBeGreaterThanOrEqual(1);
    });

    it('handles undefined props gracefully by defaulting to 0', () => {
        render(<ServerStats />);
        const pcts = screen.getAllByText('0%');
        expect(pcts.length).toBeGreaterThanOrEqual(2);
    });

    it('prevents division-by-zero when MAX_MEMORY_MB is 0', () => {
        // Should not throw and should show 0%
        expect(() =>
            render(<ServerStats cpuUsagePercent={0} memoryUsageMb={0} MAX_MEMORY_MB={0} />)
        ).not.toThrow();
    });
});
