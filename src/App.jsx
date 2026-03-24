import ServerPage from "./components/ServerPage.jsx";
import HomePage from "./components/HomePage.jsx";
import {useState} from "react";
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


const queryClient = new QueryClient();

function App() {

    /** @type {Server} */
    const server = new Server(null, null, false);
    const [loadedServer, setLoadedServer] = useState(server);
    const [view, setView] = useState("home"); // "home" | "server"
    const [sidebarSection, setSidebarSection] = useState("home"); // "home" | "servers"

    function handleLoadServer(server) {
        setLoadedServer(server);
        setView("server");
        setSidebarSection("servers");
    }

    function handleGoHome() {
        setView("home");
    }

  return (
        <QueryClientProvider client={queryClient}>
          <BackendProvider>
              <SidebarProvider>
                  <Sidebar collapsible="offcanvas">
                      <AppSidebar
                          sidebarSection={sidebarSection}
                          onSidebarSectionChange={setSidebarSection}
                          onGoHome={handleGoHome}
                          onLoadServer={handleLoadServer}
                      />
                  </Sidebar>
                  <SidebarInset>
                      <div className="app-content-toolbar">
                          <SidebarTrigger className="app-sidebar-trigger" />
                      </div>
                      {view === "home" ? (
                          <HomePage onSelectServer={handleLoadServer} />
                      ) : (
                          <ServerPage
                              key={loadedServer.id}
                              loadedServer={loadedServer}
                              onUninstall={() => setView("home")}
                          />
                      )}
                  </SidebarInset>
              </SidebarProvider>
          </BackendProvider>
      </QueryClientProvider>

  )
}

export default App
