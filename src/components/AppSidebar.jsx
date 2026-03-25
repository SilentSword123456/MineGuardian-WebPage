import { House, ServerIcon } from "lucide-react";
import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Users } from "@/components/animate-ui/icons/users.jsx";

const NAVIGATION_SECTIONS = [
    {
        id: "home",
        label: "Home",
        icon: House,
        path: "/",
    },
    {
        id: "servers",
        label: "Servers",
        icon: ServerIcon,
        path: "/servers",
    },
    {
        id: "players",
        label: "Players",
        icon: Users,
        path: "/players",
    },
];

function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    function isActive(section) {
        if (section.id === "servers") {
            // Highlight for both the server list and individual server pages
            return (
                location.pathname === "/servers" ||
                location.pathname.startsWith("/server/")
            );
        }
        if (section.id === "players") {
            // Highlight for both the player list and individual player pages
            return (
                location.pathname === "/players" ||
                location.pathname.startsWith("/player/")
            );
        }
        return location.pathname === section.path;
    }

    return (
        <SidebarHeader className="app-sidebar-nav">
            <SidebarMenu>
                {NAVIGATION_SECTIONS.map((section) => (
                    <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                            isActive={isActive(section)}
                            onClick={() => navigate(section.path)}
                        >
                            <section.icon />
                            <span>{section.label}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarHeader>
    );
}

export default AppSidebar;