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
import {Users} from "@/components/animate-ui/icons/users.jsx";
import PlayerManager from "@/components/PlayerManager.jsx";

/**
 * - id: unique identifier
 * - label: display name
 * - icon: lucide-react icon component
 * - content: React component to render in the panel (optional if using onNavigate)
 * - onNavigate: optional callback when section is clicked
 */
const NAVIGATION_SECTIONS = [
    {
        id: "home",
        label: "Home",
        icon: House,
        onNavigate: (navigate) => navigate("/"),
    },
    {
        id: "servers",
        label: "Servers",
        icon: ServerIcon,
        content: ServersBar,
    },
    {
        id: "players",
        label: "Players",
        icon: Users,
        onNavigate: (navigate) => navigate("/players"),
    }
];

function AppSidebar() {
    const [activeSection, setActiveSection] = useState("home");
    const [previousSection, setPreviousSection] = useState(null);
    const { isMobile, setOpen, setOpenMobile } = useSidebar();
    const navigate = useNavigate();

    function collapseSidebar() {
        if (isMobile) {
            setOpenMobile(false);
            return;
        }
        setOpen(false);
    }

    function handleSectionClick(section) {
        if (section.onNavigate) {
            section.onNavigate(navigate);
            setActiveSection(section.id);
            collapseSidebar();
            return;
        }

        setPreviousSection(activeSection);
        setActiveSection(section.id);
    }

    function handleBack() {
        setActiveSection(previousSection || "home");
    }

    function handleLoadServer(serverName) {
        navigate(`/server/${encodeURIComponent(serverName)}`);
    }

    const activeSectionData = NAVIGATION_SECTIONS.find((s) => s.id === activeSection);
    const isMainView = previousSection === null;

    return (
        <>
            <SidebarHeader className="app-sidebar-nav">
                {!isMainView ? (
                    <SidebarMenu key="sidebar-back-menu">
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleBack}>
                                <ArrowLeft />
                                <span>Back</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : (
                    <SidebarMenu key="sidebar-main-menu">
                        {NAVIGATION_SECTIONS.map((section) => (
                            <SidebarMenuItem key={section.id}>
                                <SidebarMenuButton
                                    isActive={activeSection === section.id}
                                    onClick={() => handleSectionClick(section)}
                                >
                                    <section.icon />
                                    <span>{section.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                )}
            </SidebarHeader>
            <SidebarSeparator />
            {isMainView ? (
                <div className="app-sidebar-home-hint">
                    Select a section from above to get started.
                </div>
            ) : activeSectionData?.content ? (
                <SidebarContent className="app-sidebar-panel">
                    {activeSectionData.content === ServersBar && (
                        <ServersBar loadServer={handleLoadServer} />
                    )}
                </SidebarContent>
            ) : null}
        </>
    );
}

export default AppSidebar;

