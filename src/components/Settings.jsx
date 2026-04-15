import { useBackend } from "../context/BackendContext.jsx";
import { Input } from "./ui/input.jsx";

function Settings() {
    const { baseUrl, setBaseUrl } = useBackend();

    return(
        <div className="p-4 flex flex-col gap-4 max-w-sm">
            <h2 className="text-lg font-bold">Backend Settings</h2>
            <div className="flex flex-col gap-2">
                <label className="text-sm">Backend IP/URL</label>
                <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:5000"
                />
                <p className="text-xs text-muted-foreground">
                    Changes take effect immediately across the dashboard.
                </p>
            </div>
        </div>
    )
}

export default Settings;