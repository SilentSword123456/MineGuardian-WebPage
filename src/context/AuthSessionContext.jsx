import { useAuthSession } from "@/hooks/use-auth-session.jsx";
import { AuthSessionContext } from "@/context/auth-session-context.js";

export function AuthSessionProvider({ children }) {
    const authSession = useAuthSession();

    return (
        <AuthSessionContext.Provider value={authSession}>
            {children}
        </AuthSessionContext.Provider>
    );
}
