import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ContactChannel } from "@/lib/cms/types";
import { ContactMethods } from "./ContactMethods";

const channels: ContactChannel[] = [
  {
    type: "facebook",
    label: "Facebook",
    value: "https://www.facebook.com/kamiyonstudio",
    isPlaceholder: false,
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    value: "https://www.linkedin.com/company/105066188/",
    isPlaceholder: false,
  },
  {
    type: "email",
    label: "Email",
    value: "kamiyonstudio@gmail.com",
    isPlaceholder: false,
  },
];

describe("ContactMethods", () => {
  it("renders one ContactCard per channel and points to channels or the form", () => {
    render(<ContactMethods channels={channels} />);

    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText(/message form on this page/i)).toBeInTheDocument();
  });

  it("renders the ctaNote only when provided", () => {
    const { rerender } = render(<ContactMethods channels={channels} />);
    expect(screen.queryByText("We usually reply within 2 business days.")).not.toBeInTheDocument();

    rerender(
      <ContactMethods
        channels={channels}
        ctaNote="We usually reply within 2 business days."
      />
    );
    expect(screen.getByText("We usually reply within 2 business days.")).toBeInTheDocument();
  });
});
