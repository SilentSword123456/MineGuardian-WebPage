import '@testing-library/jest-dom';

// jsdom does not implement IntersectionObserver; mock it globally so
// components using framer-motion's in-view hooks don't throw.
class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock;

// jsdom does not implement ResizeObserver; mock it globally for
// components that rely on it (e.g. Radix UI Dialog, floating-ui).
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
