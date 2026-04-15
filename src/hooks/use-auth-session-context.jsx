import { useContext } from "react";
import { AuthSessionContext } from "@/context/auth-session-context.js";

export function useAuthSessionContext() {
    const context = useContext(AuthSessionContext);
    if (!context) {
        throw new Error("useAuthSessionContext must be used within an AuthSessionProvider");
    }
    return context;
}
