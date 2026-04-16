import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Settings from "@/components/Settings.jsx";

const setBaseUrl = vi.fn();
const setTheme = vi.fn();
const setSoundEnabled = vi.fn();
const setMinecraftMetersEnabled = vi.fn();
const setWebsocketPipeEnabled = vi.fn();
const setStartAnimationsEnabled = vi.fn();

vi.mock("@/context/BackendContext.jsx", () => ({
    useBackend: () => ({
        baseUrl: "http://localhost:5000",
        setBaseUrl,
    }),
}));

vi.mock("@/hooks/use-ui-preferences-context.jsx", () => ({
    useUiPreferencesContext: () => ({
        theme: "dark",
        setTheme,
        soundEnabled: true,
        setSoundEnabled,
        minecraftMetersEnabled: true,
        setMinecraftMetersEnabled,
        websocketPipeEnabled: true,
        setWebsocketPipeEnabled,
        startAnimationsEnabled: true,
        setStartAnimationsEnabled,
    }),
}));

describe("Settings", () => {
    it("renders Minecraft HUD toggle labels", () => {
        render(<Settings />);
        expect(screen.getByText(/minecraft heart\/hunger meters/i)).toBeInTheDocument();
        expect(screen.getByText(/websocket pipe \+ bubbles/i)).toBeInTheDocument();
        expect(screen.getByText(/start entrance animations/i)).toBeInTheDocument();
    });

    it("calls the proper setter when Minecraft meter toggle is clicked", () => {
        render(<Settings />);
        const button = screen.getByText(/minecraft heart\/hunger meters/i).closest(".settings-row")?.querySelector("button");
        fireEvent.click(button);
        expect(setMinecraftMetersEnabled).toHaveBeenCalledWith(false);
    });

    it("updates backend URL immediately", () => {
        render(<Settings />);
        fireEvent.change(screen.getByPlaceholderText("http://localhost:5000"), { target: { value: "http://127.0.0.1:5001" } });
        expect(setBaseUrl).toHaveBeenCalledWith("http://127.0.0.1:5001");
    });
});
