import { House, ServerIcon } from "lucide-react";
import { useContext } from "react";
import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/animate-ui/components/radix/sidebar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Users } from "@/components/animate-ui/icons/users.jsx";
import {Settings} from "@/components/animate-ui/icons/settings.jsx";
import { UiPreferencesContext } from "@/context/ui-preferences-context.js";

const NAVIGATION_SECTIONS = [
    { id: "home",    label: "Home",    icon: House,      path: "/" },
    { id: "servers", label: "Servers", icon: ServerIcon, path: "/servers" },
    { id: "players", label: "Players", icon: Users,      path: "/players" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

function isSectionActive(section, pathname) {
    if (section.id === "servers") return pathname === "/servers" || pathname.startsWith("/server/");
    if (section.id === "players") return pathname === "/players" || pathname.startsWith("/player/");
    if (section.id === "settings") return pathname === "/settings";
    return pathname === section.path;
}

function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const uiPreferences = useContext(UiPreferencesContext);
    const playUiSound = uiPreferences?.playUiSound ?? (() => {});

    return (
        <SidebarHeader className="app-sidebar-nav">
            <SidebarMenu>
                {NAVIGATION_SECTIONS.map((section) => (
                    <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                            isActive={isSectionActive(section, location.pathname)}
                            onClick={() => {
                                playUiSound("navigation");
                                navigate(section.path);
                            }}
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
