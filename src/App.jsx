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
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useServers } from "@/hooks/use-servers.jsx";
import PlayerManager from "@/components/PlayerManager.jsx";
import Settings from "@/components/Settings.jsx";
import { useBackend } from "@/context/BackendContext.jsx";
import { useAuthSession } from "@/hooks/use-auth-session.jsx";
import LoginPage from "@/components/LoginPage.jsx";

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

function App() {
    const { backendUp, isCheckingBackend, baseUrl, setBaseUrl } = useBackend();
    const { authenticated, authLoading, login, loginPending, loginError, register, registerPending, registerError, refetchAuthSession } = useAuthSession();

    async function handleLogin(username, password) {
        await login({ username, password });
        await refetchAuthSession();
    }

    async function handleRegister(username, password) {
        await register({ username, password });
    }

    const isLoading = loginPending || registerPending;
    const currentError = loginError || registerError;

    if (backendUp === true && authLoading) {
        return <div className="p-4">Checking authentication...</div>;
    }

    if (!authenticated) {
        return (
            <LoginPage
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={isLoading}
                error={currentError}
                backendUp={backendUp}
                isCheckingBackend={isCheckingBackend}
                backendUrl={baseUrl}
                onBackendUrlChange={setBaseUrl}
            />
        );
    }

    return (
        <AppContent />
    );
}

function AppWithProviders() {
    return (
        <QueryClientProvider client={queryClient}>
            <BackendProvider>
                <App />
            </BackendProvider>
        </QueryClientProvider>
    );
}

export default AppWithProviders;
