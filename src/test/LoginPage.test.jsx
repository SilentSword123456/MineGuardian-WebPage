import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '@/components/LoginPage.jsx';

describe('LoginPage', () => {
    it('validates empty credentials before submitting', async () => {
        const onLogin = vi.fn();
        render(<LoginPage onLogin={onLogin} loading={false} error={null} />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
        expect(onLogin).not.toHaveBeenCalled();
    });

    it('submits username and password', async () => {
        const onLogin = vi.fn().mockResolvedValue(undefined);
        render(<LoginPage onLogin={onLogin} loading={false} error={null} />);

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(onLogin).toHaveBeenCalledWith('admin', 'secret');
    });

    it('shows backend login errors', () => {
        render(<LoginPage onLogin={vi.fn()} loading={false} error={new Error('bad credentials')} />);

        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
});

