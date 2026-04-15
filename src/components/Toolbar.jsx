import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar.jsx";
import { useServers } from "@/hooks/use-servers.jsx";
import { MG_EMERALD, MG_CRIMSON } from "@/lib/colors.js";
import { Router } from "@/components/animate-ui/icons/router";
import { ChevronRight, ChevronDown } from "lucide-react";


function useBreadcrumbs() {
    const { pathname } = useLocation();

    if (pathname.startsWith("/server/")) {
        const raw = pathname.slice("/server/".length);
        const name = (() => { try { return decodeURIComponent(raw); } catch { return raw; } })();
        return [
            { label: "Servers", path: "/servers" },
            { label: name, path: null, switcher: "servers" },
        ];
    }
    if (pathname === "/servers") {
        return [{ label: "Servers", path: null }];
    }
    if (pathname.startsWith("/player/")) {
        const raw = pathname.slice("/player/".length);
        const name = (() => { try { return decodeURIComponent(raw); } catch { return raw; } })();
        return [
            { label: "Players", path: "/players" },
            { label: name, path: null, switcher: "players" },
        ];
    }
    if (pathname === "/players") {
        return [{ label: "Players", path: null }];
    }

    if(pathname === "/settings") {
        return [{ label: "Settings", path: null }];
    }

    return [];
}

function ServerSwitcherDropdown({ currentServerName, onClose }) {
    const navigate = useNavigate();
    const { data: servers = [], isLoading } = useServers();

    function handleSelect(name) {
        onClose();
        navigate(`/server/${encodeURIComponent(name)}`);
    }

    if (isLoading) return <div className="toolbar-dropdown-empty">Loading…</div>;
    if (!servers.length) return <div className="toolbar-dropdown-empty">No servers found</div>;

    return servers.map((server) => (
        <button
            key={server.id}
            className={`toolbar-dropdown-item${server.name === currentServerName ? " toolbar-dropdown-item--active" : ""}`}
            onClick={() => handleSelect(server.name)}
        >
            <Router size={14} color={server.isRunning ? MG_EMERALD : MG_CRIMSON} />
            <span>{server.name}</span>
        </button>
    ));
}

function BreadcrumbSegment({ segment }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        function handle(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    function handleClick() {
        if (segment.path) navigate(segment.path);
        else if (segment.switcher) setOpen((v) => !v);
    }

    const isClickable = !!(segment.path || segment.switcher);

    return (
        <div className="toolbar-breadcrumb-segment" ref={ref}>
            <button
                className={`toolbar-breadcrumb-label${isClickable ? " toolbar-breadcrumb-label--clickable" : ""}`}
                onClick={isClickable ? handleClick : undefined}
            >
                {segment.label}
                {segment.switcher && (
                    <ChevronDown
                        size={13}
                        className="toolbar-breadcrumb-chevron"
                        style={{
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s ease",
                        }}
                    />
                )}
            </button>

            {open && segment.switcher === "servers" && (
                <div className="toolbar-dropdown">
                    <ServerSwitcherDropdown
                        currentServerName={segment.label}
                        onClose={() => setOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}

function Toolbar() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <div className="app-content-toolbar">
            <SidebarTrigger className="app-sidebar-trigger" />

            {breadcrumbs.length > 0 && (
                <nav className="toolbar-breadcrumb">
                    {breadcrumbs.map((segment, i) => (
                        <div key={segment.label} className="toolbar-breadcrumb-item">
                            {i > 0 && <ChevronRight size={13} className="toolbar-breadcrumb-separator" />}
                            <BreadcrumbSegment segment={segment} />
                        </div>
                    ))}
                </nav>
            )}
        </div>
    );
}

export default Toolbar;