import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuthSession } from "@/hooks/use-auth-session.jsx";

const { managerMock } = vi.hoisted(() => ({
    managerMock: {
        login: vi.fn(),
        register: vi.fn(),
        checkAuthSession: vi.fn(),
    },
}));

vi.mock("@/context/BackendContext.jsx", () => ({
    useBackend: () => ({ backendUp: true, baseUrl: "http://localhost:5000" }),
}));

vi.mock("@/utils/manager.js", () => ({
    default: managerMock,
}));

vi.mock("@/lib/auth-user.js", () => ({
    readStoredAuthUser: vi.fn(() => null),
    storeAuthUser: vi.fn((baseUrl, username) => ({ baseUrl, username })),
    clearStoredAuthUser: vi.fn(),
}));

function wrapperFactory() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe("useAuthSession", () => {
    beforeEach(() => {
        managerMock.login.mockReset();
        managerMock.register.mockReset();
        managerMock.checkAuthSession.mockReset();
    });

    it("fails login when session is not established after successful credentials", async () => {
        managerMock.login.mockResolvedValue(true);
        managerMock.checkAuthSession.mockResolvedValue(false);

        const { result } = renderHook(() => useAuthSession(), { wrapper: wrapperFactory() });

        await waitFor(() => {
            expect(result.current.authLoading).toBe(false);
        });

        await expect(result.current.login({ username: "test", password: "test" }))
            .rejects
            .toThrow(/did not establish a session/i);
    });
});
