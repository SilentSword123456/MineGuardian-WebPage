import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from '@/components/animate-ui/components/radix/dialog';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox.jsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CloudDownload, MessageCircleWarning, WifiOff } from "lucide-react";
import manager from "@/utils/manager.js";
import { useBackend } from "@/context/BackendContext.jsx";
import { MG_VOID, MG_MIST, MG_SLATE, MG_SNOW, MG_GHOST, MG_CRIMSON, MG_EMERALD } from '@/lib/colors';

const MC_SOFTWARE = ["Vanilla", "Spigot"];

function AutocompleteInput({ id, name, value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);

    const safeOptions = Array.isArray(options) ? options : [];

    const filtered = value.trim() === ""
        ? safeOptions
        : safeOptions.filter(o => o.toLowerCase().includes(value.trim().toLowerCase()));

    const isValid = safeOptions.includes(value);

    return (
        <div style={{ position: "relative" }}>
            <input
                id={id}
                name={name}
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder={placeholder}
                className="install-dialog-input"
                style={{ borderColor: value && !isValid ? MG_CRIMSON : undefined }}
            />
            {value && !isValid && (
                <span style={{ color: MG_CRIMSON, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <MessageCircleWarning size={13} /> Not a valid option
                </span>
            )}
            {open && filtered.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: MG_VOID,
                    border: `1px solid ${MG_MIST}`,
                    borderRadius: 6,
                    maxHeight: 180,
                    overflowY: "auto",
                    zIndex: 9999,
                }}>
                    {filtered.map(o => (
                        <div
                            key={o}
                            onMouseDown={() => { onChange(o); setOpen(false); }}
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                color: MG_SNOW,
                                fontSize: 14,
                                backgroundColor: o === value ? MG_SLATE : "transparent",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = MG_SLATE}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = o === value ? MG_SLATE : "transparent"}
                        >
                            {o}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function InstallServerDialog({ from, showCloseButton, triggerClassName = "" }) {
    const { backendUp } = useBackend();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("My Server");
    const [software, setSoftware] = useState("");
    const [version, setVersion] = useState("");
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [availableVersions, setAvailableVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [error, setError] = useState(null);
    const [installing, setInstalling] = useState(false);

    function resetForm() {
        setName("My Server");
        setSoftware("");
        setVersion("");
        setEulaAccepted(false);
        setAvailableVersions([]);
        setError(null);
    }

    useEffect(() => {
        setVersion("");
        setAvailableVersions([]);
        setLoadingVersions(true);
        manager.getAvailableVersions(software)
            .then(versions => setAvailableVersions(versions.versions))
            .catch(() => setAvailableVersions([]))
            .finally(() => setLoadingVersions(false));
    }, [software]);

    async function handleInstall(e) {
        e.preventDefault();
        if (!eulaAccepted) {
            alert("You must accept the EULA to install a server.");
            return;
        }
        setError(null);
        setInstalling(true);
        try {
            const result = await manager.installServer(name, software, version, eulaAccepted);
            if (result?.status === true) {
                setOpen(false);
                resetForm();
            } else {
                setError(result?.error ?? "An unknown error occurred.");
            }
        } catch (err) {
            setError(err?.message || "Failed to connect to the server.");
        } finally {
            setInstalling(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
                <button
                    className={`install-server-button ${triggerClassName}`.trim()}
                    disabled={!backendUp}
                    title={!backendUp ? "Backend offline" : "Install server"}
                    style={open ? { visibility: 'hidden' } : undefined}
                >
                    <CloudDownload size={22} />
                </button>
            </DialogTrigger>
            <DialogContent
                from={from}
                showCloseButton={showCloseButton}
                className="install-dialog-content sm:max-w-[425px]"
            >
                <form onSubmit={handleInstall}>
                    <DialogHeader>
                        <DialogTitle className="install-dialog-title">Install Server</DialogTitle>
                        <DialogDescription className="install-dialog-description">
                            Configure your new server here. Click install when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4" style={{ marginTop: 16 }}>
                    {!backendUp && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: MG_CRIMSON, fontSize: 13 }}>
                                <WifiOff size={15} />
                                <span>Backend is offline. Cannot install servers right now.</span>
                            </div>
                        )}
                        <div className="grid gap-3">
                            <Label htmlFor="server-name" className="install-dialog-label">Server Name</Label>
                            <Input
                                id="server-name"
                                name="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="install-dialog-input"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="server-software" className="install-dialog-label">Server Software</Label>
                            <AutocompleteInput
                                id="server-software"
                                name="software"
                                value={software}
                                onChange={setSoftware}
                                options={MC_SOFTWARE}
                                placeholder="e.g. Vanilla"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="server-version" className="install-dialog-label">
                                Version {loadingVersions && <span style={{ color: MG_GHOST, fontSize: 12 }}>(loading...)</span>}
                            </Label>
                            <AutocompleteInput
                                id="server-version"
                                name="version"
                                value={version}
                                onChange={setVersion}
                                options={availableVersions}
                                placeholder={loadingVersions ? "Loading versions..." : "e.g. 1.21.4"}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Checkbox
                                id="accept-eula"
                                checked={eulaAccepted}
                                onCheckedChange={setEulaAccepted}
                            />
                            <Label htmlFor="accept-eula" className="install-dialog-label" style={{ margin: 0 }}>
                                I accept the <a href="https://aka.ms/MinecraftEULA" target="_blank" rel="noreferrer" style={{ color: MG_EMERALD }}>Minecraft EULA</a>
                            </Label>
                        </div>
                    </div>
                    {error && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: MG_CRIMSON, fontSize: 13, marginTop: 12 }}>
                            <MessageCircleWarning size={15} />
                            <span>{error}</span>
                        </div>
                    )}
                    <DialogFooter style={{ marginTop: 16 }}>
                        <DialogClose asChild>
                            <Button variant="outline" className="install-dialog-cancel">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="install-dialog-submit" disabled={installing || !backendUp}>
                            {installing ? "Installing..." : "Install"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}