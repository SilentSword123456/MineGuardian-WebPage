import { useBackend } from "../context/BackendContext.jsx";
import { Input } from "./ui/input.jsx";
import { useUiPreferencesContext } from "@/hooks/use-ui-preferences-context.jsx";

function Settings() {
    const { baseUrl, setBaseUrl } = useBackend();
    const { theme, setTheme, soundEnabled, setSoundEnabled } = useUiPreferencesContext();

    return (
        <div className="settings-page">
            <h2 className="settings-title">Settings</h2>

            <div className="settings-card">
                <h3 className="settings-card-title">Appearance</h3>
                <div className="settings-row">
                    <span className="settings-label">Theme</span>
                    <div className="settings-toggle-group" role="group" aria-label="Theme selection">
                        <button
                            type="button"
                            className={`settings-toggle${theme === "light" ? " settings-toggle--active" : ""}`}
                            onClick={() => setTheme("light")}
                            aria-pressed={theme === "light"}
                        >
                            Light
                        </button>
                        <button
                            type="button"
                            className={`settings-toggle${theme === "dark" ? " settings-toggle--active" : ""}`}
                            onClick={() => setTheme("dark")}
                            aria-pressed={theme === "dark"}
                        >
                            Dark
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <h3 className="settings-card-title">Audio</h3>
                <div className="settings-row">
                    <span className="settings-label">Subtle UI sound effects</span>
                    <button
                        type="button"
                        className={`settings-toggle${soundEnabled ? " settings-toggle--active" : ""}`}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        aria-pressed={soundEnabled}
                    >
                        {soundEnabled ? "On" : "Off"}
                    </button>
                </div>
            </div>

            <div className="settings-card">
                <h3 className="settings-card-title">Backend</h3>
                <div className="settings-field">
                    <label className="settings-label">Backend IP/URL</label>
                    <Input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="http://localhost:5000"
                    />
                    <p className="settings-help">
                        Changes take effect immediately across the dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Settings;
