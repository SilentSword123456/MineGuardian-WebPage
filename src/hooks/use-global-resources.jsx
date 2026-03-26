import { useQuery } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import manager from "@/utils/manager.js";

export const DEFAULT_GLOBAL_RESOURCES = {
    cpu_usage_percent: 0,
    memory_usage_mb: 0,
    online_players: {
        max: 0,
        online: 0,
        players: [],
    },
    max_memory_mb: 1,
};

export function useGlobalResources() {
    const { backendUp } = useBackend();

    const query = useQuery({
        queryKey: ["global-resources"],
        queryFn: () => manager.getGlobalUsedResources(),
        enabled: backendUp === true,
        refetchInterval: 10 * 1000,
    });

    const displayedGlobalResources = backendUp
        ? (query.data ?? DEFAULT_GLOBAL_RESOURCES)
        : DEFAULT_GLOBAL_RESOURCES;

    return {
        ...query,
        displayedGlobalResources,
        refetchGlobalResources: query.refetch,
    };
}

