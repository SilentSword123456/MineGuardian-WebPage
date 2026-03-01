import * as React from 'react';
import { useState } from 'react';
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

const MC_VERSIONS = [
    "latest",
    "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21",
    "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20",
    "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
    "1.18.2", "1.18.1", "1.18",
    "1.17.1", "1.17",
    "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16",
    "1.15.2", "1.15.1", "1.15",
    "1.14.4", "1.14.3", "1.14.2", "1.14.1", "1.14",
    "1.13.2", "1.13.1", "1.13",
    "1.12.2", "1.12.1", "1.12",
    "1.11.2", "1.11.1", "1.11",
    "1.10.2", "1.10.1", "1.10",
    "1.9.4", "1.9.3", "1.9.2", "1.9.1", "1.9",
    "1.8.9", "1.8.8", "1.8.7", "1.8.6", "1.8.5", "1.8.4", "1.8.3", "1.8.2", "1.8.1", "1.8",
    "1.7.10", "1.7.9", "1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.2",
];

const MC_SOFTWARE = ["Vanilla", "Paper"];

function AutocompleteInput({ id, name, value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);

    const filtered = value.trim() === ""
        ? options
        : options.filter(o => o.toLowerCase().includes(value.trim().toLowerCase()));

    const isValid = options.includes(value);

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
    const [version, setVersion] = useState("1.21.4");
    const [eulaAccepted, setEulaAccepted] = useState(false);

    function handleInstall() {
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
                <form onSubmit={e => { e.preventDefault(); handleInstall(); }}>
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
                            <Label htmlFor="server-version" className="install-dialog-label">Version</Label>
                            <AutocompleteInput
                                id="server-version"
                                name="version"
                                value={version}
                                onChange={setVersion}
                                options={MC_VERSIONS}
                                placeholder="e.g. 1.21.4"
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