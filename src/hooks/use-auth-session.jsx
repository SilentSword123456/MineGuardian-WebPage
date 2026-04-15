import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "@/context/BackendContext.jsx";
import manager from "@/utils/manager.js";

export function useAuthSession() {
    const queryClient = useQueryClient();
    const { backendUp, baseUrl } = useBackend();

    const authQuery = useQuery({
        queryKey: ["auth-session", baseUrl],
        queryFn: () => manager.checkAuthSession(),
        enabled: backendUp === true,
        retry: false,
        staleTime: 30 * 1000,
    });

    const loginMutation = useMutation({
        mutationFn: ({ username, password }) => manager.login(username, password),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["auth-session", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["servers", baseUrl] });
            await queryClient.invalidateQueries({ queryKey: ["global-resources", baseUrl] });
        },
    });

    return {
        authenticated: authQuery.data === true,
        authError: authQuery.error,
        authLoading: backendUp === true && authQuery.isLoading,
        loginError: loginMutation.error,
        loginPending: loginMutation.isPending,
        login: loginMutation.mutateAsync,
        refetchAuthSession: authQuery.refetch,
    };
}

