import { useQuery } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import manager from "@/utils/manager.js";
import ServerLiveData from "@/types/serverLiveData.jsx";

export const DEFAULT_GLOBAL_RESOURCES = {
    ...new ServerLiveData().toObject(),
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

