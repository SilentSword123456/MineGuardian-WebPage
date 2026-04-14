import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils.js';

describe('cn()', () => {
    it('returns an empty string when called with no arguments', () => {
        expect(cn()).toBe('');
    });

    it('returns a single class name unchanged', () => {
        expect(cn('foo')).toBe('foo');
    });

    it('joins multiple class names', () => {
        expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('ignores falsy values', () => {
        expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
    });

    it('merges conflicting Tailwind classes (last wins)', () => {
        // twMerge should keep only the last p-* class
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('handles conditional class objects', () => {
        expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
    });

    it('handles arrays of classes', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });
});
