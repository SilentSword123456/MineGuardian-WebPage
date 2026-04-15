import { describe, it, expect, beforeEach } from "vitest";
import { clearStoredAuthUser, readStoredAuthUser, storeAuthUser } from "@/lib/auth-user.js";

describe("auth user storage", () => {
    const baseUrl = "http://localhost:5000";

    beforeEach(() => {
        window.localStorage.clear();
    });

    it("stores and reads the logged-in user for a backend URL", () => {
        const stored = storeAuthUser(baseUrl, "admin");
        const readBack = readStoredAuthUser(baseUrl);

        expect(stored?.username).toBe("admin");
        expect(readBack?.username).toBe("admin");
    });

    it("keeps auth user scoped per backend URL", () => {
        storeAuthUser("http://localhost:5000", "alice");
        storeAuthUser("http://127.0.0.1:5000", "bob");

        expect(readStoredAuthUser("http://localhost:5000")?.username).toBe("alice");
        expect(readStoredAuthUser("http://127.0.0.1:5000")?.username).toBe("bob");
    });

    it("clears the stored user", () => {
        storeAuthUser(baseUrl, "admin");
        clearStoredAuthUser(baseUrl);

        expect(readStoredAuthUser(baseUrl)).toBeNull();
    });
});
