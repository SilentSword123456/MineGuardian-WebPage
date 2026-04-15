import { useQuery } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import manager from "@/utils/manager.js";

/**
 * Returns the list of servers, fetched only when the backend is up.
 * Automatically re-fetches every 10 seconds.
 */
export function useServers() {
    const { backendUp, baseUrl } = useBackend();

    return useQuery({
        queryFn: () => manager.getServers(),
        queryKey: ["servers", baseUrl],
        enabled: backendUp === true,
        refetchInterval: 10 * 1000,
    });
}
