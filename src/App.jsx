import ServersBar from "./components/ServersBar.jsx";
import ServerPage from "./components/ServerPage.jsx";
import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


const queryClient = new QueryClient();

/**
 * @typedef {import('../types/server.js').Server} Server
 */
function App() {

    /** @type {Server} */
    const server = {id: null, name: null};
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
