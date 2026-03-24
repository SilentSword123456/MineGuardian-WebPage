import { House, ServerIcon } from "lucide-react";
import {
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import ServersBar from "./ServersBar.jsx";

function AppSidebar({
    sidebarSection,
    onSidebarSectionChange,
    onGoHome,
    onLoadServer,
}) {
    const { isMobile, setOpen, setOpenMobile } = useSidebar();

    function collapseSidebar() {
        if (isMobile) {
            setOpenMobile(false);
            return;
        }
        setOpen(false);
    }

    function handleHomeClick() {
        onGoHome();
        onSidebarSectionChange("home");
        collapseSidebar();
    }

    function handleServersClick() {
        onSidebarSectionChange("servers");
        collapseSidebar();
    }

    function handleLoadServer(server) {
        onLoadServer(server);
    }

    return (
        <>
            <SidebarHeader className="app-sidebar-nav">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={sidebarSection === "home"}
                            onClick={handleHomeClick}
                        >
                            <House />
                            <span>Home</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={sidebarSection === "servers"}
                            onClick={handleServersClick}
                        >
                            <ServerIcon />
                            <span>Servers</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="app-sidebar-panel">
                {sidebarSection === "servers" ? (
                    <ServersBar loadServer={handleLoadServer} />
                ) : (
                    <div className="app-sidebar-home-hint">
                        Select <strong>Servers</strong> to open the server list.
                    </div>
                )}
            </SidebarContent>
        </>
    );
}

export default AppSidebar;

