import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ContactFAQ } from "./ContactFAQ";

const threeFaqs = [
  { question: "First question?", answer: "First answer." },
  { question: "Second question?", answer: "Second answer." },
  { question: "Third question?", answer: "Third answer." },
];

const eightFaqs = Array.from({ length: 8 }, (_, i) => ({
  question: `Question ${i + 1}?`,
  answer: `Answer ${i + 1}.`,
}));

describe("ContactFAQ", () => {
  it("renders the FAQ heading and accordion items when FAQ content exists", () => {
    render(<ContactFAQ faq={[{ question: "Is Kamiyon a game studio?", answer: "Yes." }]} />);

    expect(
      screen.getByRole("heading", { name: "Frequently asked questions" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Is Kamiyon a game studio?" })).toBeInTheDocument();
  });

  it("renders nothing when there is no FAQ content", () => {
    const { container } = render(<ContactFAQ faq={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a section with id faq", () => {
    const { container } = render(<ContactFAQ faq={threeFaqs} />);

    expect(container.querySelector("section#faq")).toBeInTheDocument();
  });

  it("renders zero-padded numbers that are not part of trigger accessible names", () => {
    render(<ContactFAQ faq={threeFaqs} />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "First question?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Second question?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Third question?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /01/ })).toBeNull();
  });

  it("shows the first FAQ answer on mount and reveals the second after click", async () => {
    const user = userEvent.setup();
    render(<ContactFAQ faq={threeFaqs} />);

    expect(screen.getByText("First answer.")).toBeInTheDocument();
    expect(screen.queryByText("Second answer.")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Second question?" }));

    await waitFor(() => {
      expect(screen.getByText("Second answer.")).toBeInTheDocument();
    });
  });

  it("renders all eight FAQ triggers for a full list", () => {
    render(<ContactFAQ faq={eightFaqs} />);

    for (const item of eightFaqs) {
      expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument();
    }
  });
});
