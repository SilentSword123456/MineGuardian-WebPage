import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import manager from "@/utils/manager.js";
import { clearStoredAuthUser, readStoredAuthUser, storeAuthUser } from "@/lib/auth-user.js";

export function useAuthSession() {
    const queryClient = useQueryClient();
    const { backendUp, baseUrl } = useBackend();
    const [currentUser, setCurrentUser] = useState(() => readStoredAuthUser(baseUrl));

    const authQuery = useQuery({
        queryKey: ["auth-session", baseUrl],
        queryFn: () => manager.checkAuthSession(),
        enabled: backendUp === true,
        retry: false,
        staleTime: 30 * 1000,
    });

    const loginMutation = useMutation({
        mutationFn: ({ username, password }) => manager.login(username, password),
        onSuccess: async (_, variables) => {
            const storedUser = storeAuthUser(baseUrl, variables?.username);
            setCurrentUser(storedUser);
            await queryClient.invalidateQueries({ queryKey: ["auth-session", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["servers", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["global-resources", baseUrl] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: ({ username, password }) => manager.register(username, password),
    });

    useEffect(() => {
        setCurrentUser(readStoredAuthUser(baseUrl));
    }, [baseUrl]);

    useEffect(() => {
        if (backendUp === true && authQuery.data === false) {
            clearStoredAuthUser(baseUrl);
            setCurrentUser(null);
        }
    }, [authQuery.data, backendUp, baseUrl]);

    return {
        authenticated: authQuery.data === true,
        authError: authQuery.error,
        authLoading: backendUp === true && authQuery.isLoading,
        loginError: loginMutation.error,
        loginPending: loginMutation.isPending,
        login: loginMutation.mutateAsync,
        registerError: registerMutation.error,
        registerPending: registerMutation.isPending,
        register: registerMutation.mutateAsync,
        refetchAuthSession: authQuery.refetch,
        currentUser: authQuery.data === true ? currentUser : null,
    };
}
