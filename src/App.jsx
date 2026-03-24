import ServerPage from "./components/ServerPage.jsx";
import HomePage from "./components/HomePage.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Server from "./types/server.jsx";
import { BackendProvider } from "./context/BackendContext.jsx";
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useServers } from "@/hooks/use-servers.jsx";


const queryClient = new QueryClient();

function ServerRouteView() {
    const { serverName = "" } = useParams();
    const navigate = useNavigate();
    const { data: servers = [], isLoading } = useServers();

    const resolvedName = (() => {
        try {
            return decodeURIComponent(serverName);
        } catch {
            return serverName;
        }
    })();

    const selectedServer = servers.find((server) => server.name === resolvedName);

    if (isLoading) {
        return <div className="server-page"><h1>Loading server...</h1></div>;
    }

    if (!selectedServer) {
        return <div className="server-page"><h1>Server not found</h1></div>;
    }

    const loadedServer = new Server(selectedServer.id, selectedServer.name, selectedServer.isRunning);

    return (
        <ServerPage
            key={loadedServer.id}
            loadedServer={loadedServer}
            onUninstall={() => navigate("/")}
        />
    );
}

function App() {
    const navigate = useNavigate();

    function handleSelectServer(serverName) {
        navigate(`/server/${encodeURIComponent(serverName)}`);
    }

  return (
        <QueryClientProvider client={queryClient}>
          <BackendProvider>
              <SidebarProvider>
                  <Sidebar collapsible="offcanvas">
                      <AppSidebar />
                  </Sidebar>
                  <SidebarInset>
                      <div className="app-content-toolbar">
                          <SidebarTrigger className="app-sidebar-trigger" />
                      </div>
                      <Routes>
                          <Route path="/" element={<HomePage onSelectServer={handleSelectServer} />} />
                          <Route path="/server/:serverName" element={<ServerRouteView />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                  </SidebarInset>
              </SidebarProvider>
          </BackendProvider>
      </QueryClientProvider>

  )
}

export default App
