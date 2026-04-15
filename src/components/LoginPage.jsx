import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginPage({ onLogin, loading, error }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!username.trim() || !password) {
            setValidationError("Username and password are required.");
            return;
        }

        setValidationError("");
        await onLogin(username.trim(), password);
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg border p-6 shadow-sm flex flex-col gap-4"
            >
                <h1 className="text-xl font-semibold">Login</h1>
                <p className="text-sm text-muted-foreground">Sign in to continue.</p>

                <div className="flex flex-col gap-2">
                    <label htmlFor="login-username" className="text-sm">Username</label>
                    <Input
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="login-password" className="text-sm">Password</label>
                    <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={loading}
                    />
                </div>

                {(validationError || error) && (
                    <p className="text-sm text-red-500">
                        {validationError || "Invalid username or password."}
                    </p>
                )}

                <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </Button>
            </form>
        </div>
    );
}

export default LoginPage;

