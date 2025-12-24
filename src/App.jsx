import ServersBar from "./components/ServersBar.jsx";
import ServerPage from "./components/ServerPage.jsx";
import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Server from "./types/server.jsx";


const queryClient = new QueryClient();

function App() {

    /** @type {Server} */
    const server = new Server(null, null, false);
    const [loadedServer, setLoadedServer] = useState(server);

  return (
        <QueryClientProvider client={queryClient}>
          <div className="app-container">
            <ServersBar loadServer={setLoadedServer}/>
            <ServerPage loadedServer={loadedServer}/>
          </div>
      </QueryClientProvider>

  )
}

export default App
