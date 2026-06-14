// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import App from "./App.jsx";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("App (smoke)", () => {
  it("mounts and renders the shell without crashing", () => {
    render(<App />);
    expect(screen.getByText(/FARMING ROUTE OPTIMIZER/i)).toBeTruthy();
    expect(screen.getByText(/Select Patch Types/i)).toBeTruthy();
    // Blank profile -> setup prompt + disabled generate button.
    expect(screen.getByText(/Set Up Your Account Profile/i)).toBeTruthy();
  });

  it("opens the profile editor with the new Farming Level control", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/Farming Level/i)).toBeTruthy();
  });

  it("recovers gracefully from a corrupt saved profile", () => {
    localStorage.setItem("osrs_fp_v5", "{ this is not valid json");
    // Should fall back to a default profile instead of throwing.
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText(/Select Patch Types/i)).toBeTruthy();
  });
});
