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
    console.log("token:", token);
    const navigate = useNavigate();
    const [msg, setMsg] = useState("Verifying...");

    useEffect(() => {
        manager.verifyEmail(token)
            .then(() => { setMsg("Email verified!"); setTimeout(() => navigate("/login"), 2000); })
            .catch(() => setMsg("Invalid or expired token."));
    }, [navigate, token]);

    return <div className="p-4">{msg}</div>;
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
        </QueryClientProvider>
    );
}

export default AppWithProviders;
