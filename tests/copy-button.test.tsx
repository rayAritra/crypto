import { CopyButton } from "@/components/shared/CopyButton";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { notify } = vi.hoisted(() => ({ notify: vi.fn() }));

vi.mock("@/components/shared/ToastViewport", () => ({ notify }));

describe("CopyButton", () => {
  beforeEach(() => {
    notify.mockReset();
  });

  it("copies the address and exposes the completed state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<CopyButton value="0x1234" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy contract address" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("0x1234"));
    expect(
      screen.getByRole("button", { name: "Contract address copied" }),
    ).toBeTruthy();
    expect(notify).toHaveBeenCalledWith("Contract copied to clipboard");
  });

  it("shows feedback when clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    render(<CopyButton value="0x1234" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy contract address" }));

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        "Unable to copy contract address",
        "info",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Copy contract address" }),
    ).toBeTruthy();
  });
});
