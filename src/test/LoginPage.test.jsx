import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '@/components/LoginPage.jsx';

const defaultProps = {
    onLogin: vi.fn(),
    onRegister: vi.fn(),
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

    it('keeps sign in enabled when backend is down', () => {
        render(<LoginPage {...defaultProps} backendUp={false} isCheckingBackend={false} />);

        expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });

    it('shows backend URL settings when toggled', () => {
        const onBackendUrlChange = vi.fn();
        render(<LoginPage {...defaultProps} onBackendUrlChange={onBackendUrlChange} />);

        fireEvent.click(screen.getByText(/backend settings/i));

        expect(screen.getByLabelText(/backend url/i)).toBeInTheDocument();
    });

    it('toggles to registration mode when "Create one" is clicked', () => {
        render(<LoginPage {...defaultProps} />);

        fireEvent.click(screen.getByText(/create one/i));

        expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('toggles back to login mode from registration', () => {
        render(<LoginPage {...defaultProps} />);

        fireEvent.click(screen.getByText(/create one/i));
        fireEvent.click(screen.getByText(/sign in/i));

        expect(screen.getByText(/sign in to manage your servers/i)).toBeInTheDocument();
    });

    it('shows password mismatch error in registration mode', async () => {
        const onRegister = vi.fn();
        render(<LoginPage {...defaultProps} onRegister={onRegister} />);

        fireEvent.click(screen.getByText(/create one/i));
        fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass2' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(onRegister).not.toHaveBeenCalled();
    });

    it('calls onRegister with matching passwords in registration mode', async () => {
        const onRegister = vi.fn().mockResolvedValue(undefined);
        render(<LoginPage {...defaultProps} onRegister={onRegister} />);

        fireEvent.click(screen.getByText(/create one/i));
        fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(onRegister).toHaveBeenCalledWith('newuser', 'secret');
    });
});
