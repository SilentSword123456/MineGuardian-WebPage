import ServersBar from "./components/ServersBar.jsx";
import ServerPage from "./components/ServerPage.jsx";
import HomePage from "./components/HomePage.jsx";
import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Server from "./types/server.jsx";
import { BackendProvider } from "./context/BackendContext.jsx";


const queryClient = new QueryClient();

function App() {

    /** @type {Server} */
    const server = new Server(null, null, false);
    const [loadedServer, setLoadedServer] = useState(server);
    const [view, setView] = useState("home"); // "home" | "server"

    function handleLoadServer(server) {
        setLoadedServer(server);
        setView("server");
    }

  return (
        <QueryClientProvider client={queryClient}>
          <BackendProvider>
            <div className="app-container">
              <ServersBar loadServer={handleLoadServer}/>
              {view === "home" ? (
                  <HomePage onSelectServer={handleLoadServer} />
              ) : (
                  <ServerPage key={loadedServer.id} loadedServer={loadedServer} onUninstall={() => setView("home")} />
              )}
            </div>
          </BackendProvider>
      </QueryClientProvider>

  )
}

export default App
