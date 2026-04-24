import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, ChevronDown, ChevronUp, CircleCheck, CircleX, Loader2 } from "lucide-react";

function LoginPage({ onLogin, loading, error, backendUp, isCheckingBackend, backendUrl, onBackendUrlChange }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [urlDraft, setUrlDraft] = useState(backendUrl || "");

    async function handleSubmit(event) {
        event.preventDefault();
        if (!username.trim() || !password) {
            setValidationError("Username and password are required.");
            return;
        }
        setValidationError("");
        await onLogin(username.trim(), password);
    }

    function handleSaveUrl() {
        if (normalizedUrl && normalizedUrl !== backendUrl) {
            onBackendUrlChange(normalizedUrl);
        }
    }

    const trimmedUrl = urlDraft.trim();
    const normalizedUrl = trimmedUrl.replace(/\/+$/, "");
    const errorMessage = validationError || (error?.message) || (error ? "Invalid username or password." : "");

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">MineGuardian</h1>
                    <p className="text-sm text-muted-foreground">Sign in to manage your servers.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full rounded-xl border border-border bg-card p-6 shadow-lg flex flex-col gap-5">
                    <div className="flex items-center gap-2 text-sm">
                        {isCheckingBackend ? (
                            <><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Connecting to backend…</span></>
                        ) : backendUp === true ? (
                            <><CircleCheck className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">Backend connected</span></>
                        ) : (
                            <><CircleX className="w-4 h-4 text-red-500" /><span className="text-red-500">Backend unreachable</span></>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="login-username" className="text-sm font-medium text-foreground">Username</label>
                        <Input id="login-username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" disabled={loading} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
                        <Input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading} />
                    </div>

                    {errorMessage && <p className="text-sm text-red-500" role="alert">{errorMessage}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Don't have an account?{" "}
                        <button type="button" onClick={() => navigate("/register")} className="text-primary hover:underline cursor-pointer font-medium">
                            Create one
                        </button>
                    </p>
                </form>

                <div className="w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    <button type="button" onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <span>Backend Settings</span>
                        {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showSettings && (
                        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="backend-url" className="text-sm font-medium text-foreground">Backend URL</label>
                                <Input id="backend-url" placeholder="http://localhost:5000" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} />
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleSaveUrl} disabled={!trimmedUrl || normalizedUrl === backendUrl}>Save</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;