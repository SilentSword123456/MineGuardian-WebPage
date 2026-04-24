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
        mutationFn: async ({ username, password }) => {
            await manager.login(username, password);
            const sessionEstablished = await manager.checkAuthSession();
            if (!sessionEstablished) {
                throw new Error("Login did not establish a session. In preview builds this is usually caused by blocked cross-site cookies. Use Backend Settings with a same-site frontend/backend domain pair.");
            }
            return { username };
        },
        onSuccess: async ({ username }) => {
            const storedUser = storeAuthUser(baseUrl, username);
            setCurrentUser(storedUser);
            queryClient.setQueryData(["auth-session", baseUrl], true);
            await queryClient.invalidateQueries({ queryKey: ["auth-session", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["servers", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["global-resources", baseUrl] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: ({ email, username, password, firstName }) => manager.register(email, username, password, firstName),
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
        authenticated: authQuery.data === true || (!!currentUser && authQuery.data !== false),
        authError: authQuery.error,
        authLoading: backendUp === true && authQuery.isLoading && !currentUser,
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
