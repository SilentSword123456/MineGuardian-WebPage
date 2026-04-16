import { useCallback, useEffect, useMemo, useState } from "react";
import { UiPreferencesContext } from "@/context/ui-preferences-context.js";
import useSound from "use-sound";

const THEME_STORAGE_KEY = "mg_theme";
const SOUND_STORAGE_KEY = "mg_sound_enabled";
const MC_METERS_STORAGE_KEY = "mg_minecraft_meters_enabled";
const WS_PIPE_STORAGE_KEY = "mg_websocket_pipe_enabled";
const START_ANIMATIONS_STORAGE_KEY = "mg_start_animations_enabled";

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

function getInitialBoolean(storageKey, fallback = true) {
    const saved = localStorage.getItem(storageKey);
    if (saved === "false") return false;
    if (saved === "true") return true;
    return fallback;
}

export function UiPreferencesProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled);
    const [minecraftMetersEnabled, setMinecraftMetersEnabled] = useState(() => getInitialBoolean(MC_METERS_STORAGE_KEY));
    const [websocketPipeEnabled, setWebsocketPipeEnabled] = useState(() => getInitialBoolean(WS_PIPE_STORAGE_KEY));
    const [startAnimationsEnabled, setStartAnimationsEnabled] = useState(() => getInitialBoolean(START_ANIMATIONS_STORAGE_KEY));
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

    useEffect(() => {
        localStorage.setItem(MC_METERS_STORAGE_KEY, minecraftMetersEnabled ? "true" : "false");
    }, [minecraftMetersEnabled]);

    useEffect(() => {
        localStorage.setItem(WS_PIPE_STORAGE_KEY, websocketPipeEnabled ? "true" : "false");
    }, [websocketPipeEnabled]);

    useEffect(() => {
        localStorage.setItem(START_ANIMATIONS_STORAGE_KEY, startAnimationsEnabled ? "true" : "false");
    }, [startAnimationsEnabled]);

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
        minecraftMetersEnabled,
        setMinecraftMetersEnabled,
        toggleMinecraftMeters: () => setMinecraftMetersEnabled((enabled) => !enabled),
        websocketPipeEnabled,
        setWebsocketPipeEnabled,
        toggleWebsocketPipe: () => setWebsocketPipeEnabled((enabled) => !enabled),
        startAnimationsEnabled,
        setStartAnimationsEnabled,
        toggleStartAnimations: () => setStartAnimationsEnabled((enabled) => !enabled),
        playUiSound,
    }), [
        theme,
        soundEnabled,
        minecraftMetersEnabled,
        websocketPipeEnabled,
        startAnimationsEnabled,
        playUiSound
    ]);

    return (
        <UiPreferencesContext.Provider value={value}>
            {children}
        </UiPreferencesContext.Provider>
    );
}
