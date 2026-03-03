import { useQuery } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import { BASE_URL } from "@/lib/config.js";

async function fetchServers() {
    const result = await fetch(`${BASE_URL}/servers`).then((r) => r.json());
    return result.servers;
}

/**
 * Returns the list of servers, fetched only when the backend is up.
 * Automatically re-fetches every 10 seconds.
 */
export function useServers() {
    const { backendUp } = useBackend();

    return useQuery({
        queryFn: fetchServers,
        queryKey: ["servers"],
        enabled: backendUp === true,
        refetchInterval: 10 * 1000,
    });
}

