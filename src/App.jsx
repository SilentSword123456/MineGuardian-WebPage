import ServerPage from "./components/ServerPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ServersPage from "./components/ServersPage.jsx";
import Toolbar from "./components/Toolbar.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Server from "./types/server.jsx";
import { BackendProvider } from "./context/BackendContext.jsx";
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import {Navigate, Route, Routes, useNavigate, useParams, useSearchParams} from "react-router-dom";
import { useServers } from "@/hooks/use-servers.jsx";
import PlayerManager from "@/components/PlayerManager.jsx";
import Settings from "@/components/Settings.jsx";
import { useBackend } from "@/context/BackendContext.jsx";
import { AuthSessionProvider } from "@/context/AuthSessionContext.jsx";
import { useAuthSessionContext } from "@/hooks/use-auth-session-context.jsx";
import LoginPage from "@/components/LoginPage.jsx";
import { UiPreferencesProvider } from "@/context/UiPreferencesContext.jsx";
import { NotificationProvider } from "@/context/NotificationContext.jsx";
import {useEffect, useState} from "react";
import manager from "@/utils/manager.js";
import RegisterPage from "@/components/RegisterPage.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import { SpeedInsights } from "@vercel/speed-insights/react"

const queryClient = new QueryClient();

function AppContent() {
    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas">
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <Toolbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/servers" element={<ServersPage />} />
                    <Route path="/server/:serverName" element={<ServerRouteView />} />
                    <Route path="/players" element={<PlayerManager />} />
                    <Route path="/player/:playerName" element={<PlayerManager />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </SidebarInset>
        </SidebarProvider>
    );
}

function ServerRouteView() {
    const { serverName = "" } = useParams();
    const navigate = useNavigate();
    const { data: servers = [], isLoading } = useServers();

    const resolvedName = (() => {
        try { return decodeURIComponent(serverName); }
        catch { return serverName; }
    })();

    const selectedServer = servers.find((s) => s.name === resolvedName);

    if (isLoading) return <div className="server-page"><h1>Loading server...</h1></div>;
    if (!selectedServer) return <div className="server-page"><h1>Server not found</h1></div>;

    const loadedServer = new Server(
        selectedServer.id,
        selectedServer.name,
        selectedServer.isRunning
    );

    return (
        <ServerPage
            key={loadedServer.id}
            loadedServer={loadedServer}
            onUninstall={() => navigate("/servers")}
        />
    );
}

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const shortCode = searchParams.get("shortCode");
    const userEmail = searchParams.get("userEmail");
    const navigate = useNavigate();

    const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error" | "manual"
    const [manualCode, setManualCode] = useState("");
    const [manualUserEmail, setManualUserEmail] = useState(userEmail || "");
    const [manualError, setManualError] = useState("");

    useEffect(() => {
        if (token) {
            manager.verifyEmail({ token })
                .then(() => { setStatus("success"); setTimeout(() => navigate("/login"), 2000); })
                .catch(() => setStatus("error"));
        } else if (shortCode && userEmail) {
            manager.verifyEmail({ shortCode, userEmail })
                .then(() => { setStatus("success"); setTimeout(() => navigate("/login"), 2000); })
                .catch(() => setStatus("error"));
        } else {
            setStatus("manual");
        }
    }, []);

    async function handleManualSubmit() {
        setManualError("");
        try {
            await manager.verifyEmail({ shortCode: manualCode.trim().toLocaleUpperCase(), userEmail: manualUserEmail.trim()});
            setStatus("success");
            setTimeout(() => navigate("/login"), 2000);
        } catch {
            setManualError("Invalid or expired code.");
        }
    }

    if (status === "verifying") return <div className="p-4">Verifying...</div>;
    if (status === "success") return <div className="p-4">Email verified! Redirecting...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-sm flex flex-col gap-4">
                {status === "error" && (
                    <p className="text-red-500 text-sm">The link didn't work. Enter the code from your email instead.</p>
                )}
                <Input placeholder="Your email" value={manualUserEmail} onChange={e => setManualUserEmail(e.target.value)} />
                <Input placeholder="Verification code (e.g. A3F9K2TQ)" value={manualCode} onChange={e => setManualCode(e.target.value)} />
                {manualError && <p className="text-red-500 text-sm">{manualError}</p>}
                <Button onClick={handleManualSubmit}>Verify</Button>
            </div>
        </div>
    );
}

function App() {
    const { backendUp, isCheckingBackend, baseUrl, setBaseUrl } = useBackend();
    const { authenticated, authLoading, login, loginPending, loginError, register, registerPending, registerError } = useAuthSessionContext();

    async function handleLogin(username, password) {
        await login({ username, password });
    }

    async function handleRegister(email, username, password, firstName) {
        await register({ email, username, password, firstName });
    }

    const isLoading = loginPending || registerPending;
    const currentError = loginError || registerError;

    if (backendUp === true && authLoading) {
        return <div className="p-4">Checking authentication...</div>;
    }

    const loginPage = (
        <LoginPage
            onLogin={handleLogin}
            loading={isLoading}
            error={currentError}
            backendUp={backendUp}
            isCheckingBackend={isCheckingBackend}
            backendUrl={baseUrl}
            onBackendUrlChange={setBaseUrl}
        />
    );

    return (
        <Routes>
            <Route
                path="/verifyEmail"
                element={authenticated ? <Navigate to="/" replace /> : <VerifyEmail />}
            />
            <Route
                path="/login"
                element={authenticated ? <Navigate to="/" replace /> : loginPage}
            />

            <Route
                path="/register"
                element={authenticated ? <Navigate to="/" replace /> : <RegisterPage onRegister={handleRegister} loading={registerPending} error={registerError} />}
            />

            <Route
                path="/*"
                element={authenticated ? <AppContent /> : <Navigate to="/login" replace />}
            />
        </Routes>

    );
}

function AppWithProviders() {
    return (
        <QueryClientProvider client={queryClient}>
            <UiPreferencesProvider>
                <NotificationProvider>
                    <BackendProvider>
                        <AuthSessionProvider>
                            <App />
                        </AuthSessionProvider>
                    </BackendProvider>
                </NotificationProvider>
            </UiPreferencesProvider>
            <SpeedInsights />
        </QueryClientProvider>
    );
}

export default AppWithProviders;
