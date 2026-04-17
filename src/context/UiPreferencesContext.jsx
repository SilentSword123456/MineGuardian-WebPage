import { useCallback, useEffect, useMemo, useState } from "react";
import { UiPreferencesContext } from "@/context/ui-preferences-context.js";
import useSound from "use-sound";

const THEME_STORAGE_KEY = "mg_theme";
const SOUND_STORAGE_KEY = "mg_sound_enabled";

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    if (saved) localStorage.removeItem(THEME_STORAGE_KEY);
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function getInitialSoundEnabled() {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved === "false") return false;
    return true;
}

export function UiPreferencesProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled);
    const [playNavigation] = useSound("/sounds/navigation.wav", { volume: 0.18, interrupt: true });
    const [playAction] = useSound("/sounds/action.wav", { volume: 0.22, interrupt: true });
    const [playSuccess] = useSound("/sounds/success.wav", { volume: 0.24, interrupt: true });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "true" : "false");
    }, [soundEnabled]);

    const playUiSound = useCallback((soundType = "navigation") => {
        if (!soundEnabled) return;

        if (soundType === "action") {
            playAction();
            return;
        }

        if (soundType === "success") {
            playSuccess();
            return;
        }

        playNavigation();
    }, [soundEnabled, playAction, playNavigation, playSuccess]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
        soundEnabled,
        setSoundEnabled,
        toggleSound: () => setSoundEnabled((enabled) => !enabled),
        playUiSound,
    }), [theme, soundEnabled, playUiSound]);

    return (
        <UiPreferencesContext.Provider value={value}>
            {children}
        </UiPreferencesContext.Provider>
    );
}
