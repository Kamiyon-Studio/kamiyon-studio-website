import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders name, email, and message fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("submits to /api/contact and shows success", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { sent: true },
        error: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^name$/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(
      screen.getByLabelText(/^message$/i),
      "Hello from the Analytical Engine.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/your message is on its way/i),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("shows an error when the API fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          data: null,
          error: "Contact form is not configured",
        }),
      }),
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^name$/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(
      screen.getByLabelText(/^message$/i),
      "Hello from the Analytical Engine.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/contact form is not configured/i),
      ).toBeInTheDocument();
    });
  });
});
