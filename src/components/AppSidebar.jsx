import { ArrowLeft, House, ServerIcon } from "lucide-react";
import { useState } from "react";
import {
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import { useNavigate } from "react-router-dom";
import ServersBar from "./ServersBar.jsx";

function AppSidebar() {
    const [sidebarView, setSidebarView] = useState("main"); // main | servers
    const { isMobile, setOpen, setOpenMobile } = useSidebar();
    const navigate = useNavigate();

    function collapseSidebar() {
        if (isMobile) {
            setOpenMobile(false);
            return;
        }
        setOpen(false);
    }

    function handleHomeClick() {
        setSidebarView("main");
        navigate("/");
        collapseSidebar();
    }

    function handleOpenServersFolder() {
        setSidebarView("servers");
    }

    function handleBackFromServers() {
        setSidebarView("main");
    }

    function handleLoadServer(serverName) {
        navigate(`/server/${encodeURIComponent(serverName)}`);
    }

    return (
        <>
            <SidebarHeader className="app-sidebar-nav">
                {sidebarView === "servers" ? (
                    <SidebarMenu key="sidebar-servers-folder">
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleBackFromServers}>
                                <ArrowLeft />
                                <span>Back</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : (
                    <SidebarMenu key="sidebar-main-menu">
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive onClick={handleHomeClick}>
                                <House />
                                <span>Home</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleOpenServersFolder}>
                                <ServerIcon />
                                <span>Servers</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarHeader>
            <SidebarSeparator />
            {sidebarView === "servers" ? (
                <SidebarContent className="app-sidebar-panel">
                    <ServersBar loadServer={handleLoadServer} />
                </SidebarContent>
            ) : (
                <div className="app-sidebar-home-hint">
                    Open <strong>Servers</strong> to browse and pick a server.
                </div>
            )}
        </>
    );
}

export default AppSidebar;

