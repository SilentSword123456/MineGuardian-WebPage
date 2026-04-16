import { useContext } from "react";
import { UiPreferencesContext } from "@/context/ui-preferences-context.js";

export function useUiPreferencesContext() {
    const context = useContext(UiPreferencesContext);
    if (!context) {
        throw new Error("useUiPreferencesContext must be used within an UiPreferencesProvider");
    }
    return context;
}
