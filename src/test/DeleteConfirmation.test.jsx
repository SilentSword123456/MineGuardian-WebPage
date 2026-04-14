import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmation from '../utils/deleteConfirmation.jsx';

describe('DeleteConfirmation', () => {
    it('renders the "Uninstall server" trigger button', () => {
        render(<DeleteConfirmation onConfirm={vi.fn()} />);
        expect(screen.getByText(/uninstall server/i)).toBeInTheDocument();
    });

    it('does not show the dialog content before the trigger is clicked', () => {
        render(<DeleteConfirmation onConfirm={vi.fn()} />);
        expect(screen.queryByText(/are you sure/i)).toBeNull();
    });

    it('opens the dialog when the trigger is clicked', () => {
        render(<DeleteConfirmation onConfirm={vi.fn()} />);
        fireEvent.click(screen.getByText(/uninstall server/i));
        expect(screen.getByText(/are you sure\?/i)).toBeInTheDocument();
        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });

    it('shows Cancel and Uninstall buttons inside the dialog', () => {
        render(<DeleteConfirmation onConfirm={vi.fn()} />);
        fireEvent.click(screen.getByText(/uninstall server/i));
        expect(screen.getByText(/^cancel$/i)).toBeInTheDocument();
        expect(screen.getByText(/^uninstall$/i)).toBeInTheDocument();
    });

    it('calls onConfirm when the Uninstall action button is clicked', () => {
        const onConfirm = vi.fn();
        render(<DeleteConfirmation onConfirm={onConfirm} />);
        fireEvent.click(screen.getByText(/uninstall server/i));
        fireEvent.click(screen.getByText(/^uninstall$/i));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirm when Cancel is clicked', () => {
        const onConfirm = vi.fn();
        render(<DeleteConfirmation onConfirm={onConfirm} />);
        fireEvent.click(screen.getByText(/uninstall server/i));
        fireEvent.click(screen.getByText(/^cancel$/i));
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
