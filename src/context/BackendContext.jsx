import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import manager from "@/utils/manager.js";
import { BASE_URL } from "@/lib/config.js";

const BackendContext = createContext({
    backendUp: null,
    isCheckingBackend: true,
    baseUrl: BASE_URL,
    setBaseUrl: () => {}
});

export function BackendProvider({ children }) {
    const queryClient = useQueryClient();
    const [baseUrl, _setBaseUrl] = useState(() => {
        return localStorage.getItem("backend_url") || BASE_URL;
    });

    const setBaseUrl = (newUrl) => {
        _setBaseUrl(newUrl);
        localStorage.setItem("backend_url", newUrl);
        manager.setBaseUrl(newUrl);
        queryClient.invalidateQueries();
    };

    useEffect(() => {
        manager.setBaseUrl(baseUrl);
    }, [baseUrl]);

    const { data: backendUp = null, isLoading: isCheckingBackend } = useQuery({
        queryFn: () => manager.isBackendUp(),
        queryKey: ["backendHealth", baseUrl],
        refetchInterval: 5000,
    });

    return (
        <BackendContext.Provider value={{ backendUp, isCheckingBackend, baseUrl, setBaseUrl }}>
            {children}
        </BackendContext.Provider>
    );
}

export function useBackend() {
    return useContext(BackendContext);
}
