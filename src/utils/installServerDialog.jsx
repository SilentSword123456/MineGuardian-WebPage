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
import { CloudDownload, MessageCircleWarning } from "lucide-react";
import manager from "@/utils/manager.js";

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
                style={{ borderColor: value && !isValid ? "#ef4444" : undefined }}
            />
            {value && !isValid && (
                <span style={{ color: "#ef4444", fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <MessageCircleWarning size={13} /> Not a valid option
                </span>
            )}
            {open && filtered.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#2c2f33",
                    border: "1px solid #202225",
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
                                color: "#dcddde",
                                fontSize: 14,
                                backgroundColor: o === value ? "#40444b" : "transparent",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#40444b"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = o === value ? "#40444b" : "transparent"}
                        >
                            {o}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function InstallServerDialog({ from, showCloseButton }) {
    const [name, setName] = useState("My Server");
    const [software, setSoftware] = useState("Vanilla");
    const [version, setVersion] = useState("");
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [availableVersions, setAvailableVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    // Re-fetch versions whenever software changes
    useEffect(() => {
        setVersion("");
        setAvailableVersions([]);
        setLoadingVersions(true);
        manager.getAvailableVersions(software)
            .then(versions => setAvailableVersions(versions.versions))
            .catch(() => setAvailableVersions([]))
            .finally(() => setLoadingVersions(false));
    }, [software]);

    function handleInstall(e) {
        e.preventDefault();
        if (!eulaAccepted) {
            alert("You must accept the EULA to install a server.");
            return;
        }
        manager.installServer(name, software, version, eulaAccepted);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="install-server-button">
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
                                Version {loadingVersions && <span style={{ color: "#b9bbbe", fontSize: 12 }}>(loading...)</span>}
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
                                I accept the <a href="https://aka.ms/MinecraftEULA" target="_blank" rel="noreferrer" style={{ color: "#7289da" }}>Minecraft EULA</a>
                            </Label>
                        </div>
                    </div>
                    <DialogFooter style={{ marginTop: 16 }}>
                        <DialogClose asChild>
                            <Button variant="outline" className="install-dialog-cancel">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="install-dialog-submit">Install</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}