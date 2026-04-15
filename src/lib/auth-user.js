const AUTH_USER_STORAGE_PREFIX = "mineguardian.auth.user";

function getStorageKey(baseUrl) {
    const normalizedBaseUrl = (baseUrl || "").trim().replace(/\/+$/, "");
    return `${AUTH_USER_STORAGE_PREFIX}:${normalizedBaseUrl || "default"}`;
}

export function readStoredAuthUser(baseUrl) {
    if (typeof window === "undefined") return null;

    try {
        const rawValue = window.localStorage.getItem(getStorageKey(baseUrl));
        if (!rawValue) return null;

        const parsed = JSON.parse(rawValue);
        const username = typeof parsed?.username === "string" ? parsed.username.trim() : "";

        if (!username) return null;

        return {
            username,
            loggedInAt: parsed?.loggedInAt || null,
        };
    } catch {
        return null;
    }
}

export function storeAuthUser(baseUrl, username) {
    if (typeof window === "undefined") return null;

    const normalizedUsername = (username || "").trim();
    if (!normalizedUsername) return null;

    const authUser = {
        username: normalizedUsername,
        loggedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(getStorageKey(baseUrl), JSON.stringify(authUser));
    return authUser;
}

export function clearStoredAuthUser(baseUrl) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(getStorageKey(baseUrl));
}
