import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion } from "./Accordion";

const items = [
  { question: "What does Kamiyon do?", answer: "We build games and interactive experiences." },
  { question: "Where is Kamiyon based?", answer: "Biñan City, Laguna, Philippines." },
];

describe("Accordion", () => {
  it("starts with the first item expanded", () => {
    render(<Accordion items={items} />);

    expect(screen.getByRole("button", { name: items[0].question })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText(items[0].answer)).toBeVisible();
  });

  it("starts subsequent items collapsed", () => {
    render(<Accordion items={items} />);

    expect(screen.getByRole("button", { name: items[1].question })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText(items[1].answer)).not.toBeVisible();
  });

  it("expands a closed item and collapses the previously open one on click", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByRole("button", { name: items[1].question }));

    expect(screen.getByRole("button", { name: items[1].question })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: items[0].question })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("collapses the open item when clicked again", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByRole("button", { name: items[0].question }));

    expect(screen.getByRole("button", { name: items[0].question })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("exposes accordion triggers with aria-controls pointing at panels", () => {
    render(<Accordion items={items} />);

    const trigger = screen.getByRole("button", { name: items[0].question });
    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveAttribute("role", "region");
  });
});
