import { useEffect, useMemo, useRef, useState } from "react";
import { UiPreferencesContext } from "@/context/ui-preferences-context.js";

const THEME_STORAGE_KEY = "mg_theme";
const SOUND_STORAGE_KEY = "mg_sound_enabled";

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
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
    const audioContextRef = useRef(null);

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
        if (!soundEnabled) return;
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return;

        function playTick() {
            const context = audioContextRef.current ?? new AudioContextCtor();
            audioContextRef.current = context;

            if (context.state === "suspended") {
                context.resume().catch(() => {});
            }

            const now = context.currentTime;
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(620, now);
            oscillator.frequency.exponentialRampToValueAtTime(510, now + 0.05);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.012, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(now);
            oscillator.stop(now + 0.08);
        }

        function handlePointerDown(event) {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const interactive = target.closest("button, [role='button'], a, .server-item");
            if (!interactive || interactive.hasAttribute("disabled")) return;
            playTick();
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [soundEnabled]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
        soundEnabled,
        setSoundEnabled,
        toggleSound: () => setSoundEnabled((enabled) => !enabled),
    }), [theme, soundEnabled]);

    return (
        <UiPreferencesContext.Provider value={value}>
            {children}
        </UiPreferencesContext.Provider>
    );
}
