import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import manager from "@/utils/manager.js";

const BackendContext = createContext({ backendUp: null, isCheckingBackend: true });

export function BackendProvider({ children }) {
    const { data: backendUp = null, isLoading: isCheckingBackend } = useQuery({
        queryFn: () => manager.isBackendUp(),
        queryKey: ["backendHealth"],
        refetchInterval: 5000,
    });

    return (
        <BackendContext.Provider value={{ backendUp, isCheckingBackend }}>
            {children}
        </BackendContext.Provider>
    );
}

export function useBackend() {
    return useContext(BackendContext);
}

