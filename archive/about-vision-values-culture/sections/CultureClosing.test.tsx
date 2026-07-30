import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { INTERIM_CONTACT_FORM_URL } from "@/lib/contact/channels";

import { CultureClosing } from "./CultureClosing";

describe("CultureClosing", () => {
  it("renders the culture summary and a contact CTA", () => {
    render(<CultureClosing cultureSummary="We build with curiosity and care." />);

    expect(screen.getByText("We build with curiosity and care.")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Get in touch" });
    expect(cta).toHaveAttribute("href", INTERIM_CONTACT_FORM_URL);
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
