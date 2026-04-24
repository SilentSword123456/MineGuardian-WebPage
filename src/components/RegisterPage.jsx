import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

function RegisterPage({ onRegister, loading, error }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        if (!email.trim() || !username.trim() || !name.trim() || !password) {
            setValidationError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }
        setValidationError("");
        try {
            await onRegister(email.trim(), username.trim(), password, name.trim());
            navigate("/login", { state: { registered: true } });
        } catch {
            // error handled via error prop
        }
    }

    const errorMessage = validationError || (error?.message) || (error ? "Registration failed." : "");

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">MineGuardian</h1>
                    <p className="text-sm text-muted-foreground">Create a new account.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full rounded-xl border border-border bg-card p-6 shadow-lg flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-email" className="text-sm font-medium text-foreground">Email</label>
                        <Input id="reg-email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={loading} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-firstName" className="text-sm font-medium text-foreground">Name</label>
                        <Input id="reg-firstName" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={loading} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-username" className="text-sm font-medium text-foreground">Username</label>
                        <Input id="reg-username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" disabled={loading} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-password" className="text-sm font-medium text-foreground">Password</label>
                        <Input id="reg-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" disabled={loading} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="reg-confirm-password" className="text-sm font-medium text-foreground">Confirm Password</label>
                        <Input id="reg-confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" disabled={loading} />
                    </div>

                    {errorMessage && <p className="text-sm text-red-500" role="alert">{errorMessage}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : "Create account"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <button type="button" onClick={() => navigate("/login")} className="text-primary hover:underline cursor-pointer font-medium">
                            Sign in
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;