import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '@/components/LoginPage.jsx';

const defaultProps = {
    onLogin: vi.fn(),
    loading: false,
    error: null,
    backendUp: true,
    isCheckingBackend: false,
    backendUrl: 'http://localhost:5000',
    onBackendUrlChange: vi.fn(),
};

describe('LoginPage', () => {
    it('validates empty credentials before submitting', async () => {
        const onLogin = vi.fn();
        render(<LoginPage {...defaultProps} onLogin={onLogin} />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
        expect(onLogin).not.toHaveBeenCalled();
    });

    it('submits username and password', async () => {
        const onLogin = vi.fn().mockResolvedValue(undefined);
        render(<LoginPage {...defaultProps} onLogin={onLogin} />);

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(onLogin).toHaveBeenCalledWith('admin', 'secret');
    });

    it('shows backend login errors', () => {
        render(<LoginPage {...defaultProps} error={new Error('Invalid credentials.')} />);

        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('shows backend connected status', () => {
        render(<LoginPage {...defaultProps} backendUp={true} isCheckingBackend={false} />);

        expect(screen.getByText(/backend connected/i)).toBeInTheDocument();
    });

    it('shows backend unreachable status', () => {
        render(<LoginPage {...defaultProps} backendUp={false} isCheckingBackend={false} />);

        expect(screen.getByText(/backend unreachable/i)).toBeInTheDocument();
    });

    it('disables sign in when backend is down', () => {
        render(<LoginPage {...defaultProps} backendUp={false} isCheckingBackend={false} />);

        expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });

    it('shows backend URL settings when toggled', () => {
        const onBackendUrlChange = vi.fn();
        render(<LoginPage {...defaultProps} onBackendUrlChange={onBackendUrlChange} />);

        fireEvent.click(screen.getByText(/backend settings/i));

        expect(screen.getByLabelText(/backend url/i)).toBeInTheDocument();
    });
});

