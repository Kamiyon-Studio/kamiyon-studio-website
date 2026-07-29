import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  InteractiveAccordion,
  type InteractiveAccordionItem,
} from "./InteractiveAccordion";

const items: InteractiveAccordionItem[] = [
  { id: "a", number: "01", title: "Alpha question", content: "Alpha body copy." },
  { id: "b", number: "02", title: "Beta question", content: "Beta body copy." },
];

describe("InteractiveAccordion", () => {
  it("opens the first item by default and keeps the second collapsed", () => {
    render(<InteractiveAccordion items={items} />);

    expect(screen.getByRole("button", { name: "Alpha question" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: "Beta question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText("Alpha body copy.")).toBeInTheDocument();
    expect(screen.queryByText("Beta body copy.")).toBeNull();
  });

  it("starts every item collapsed when defaultOpenId is null", () => {
    render(<InteractiveAccordion items={items} defaultOpenId={null} />);

    expect(screen.getByRole("button", { name: "Alpha question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: "Beta question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("opens the matching item when defaultOpenId is set", () => {
    render(<InteractiveAccordion items={items} defaultOpenId="b" />);

    expect(screen.getByRole("button", { name: "Alpha question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: "Beta question" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("opens a closed item and collapses the previously open one on click", async () => {
    const user = userEvent.setup();
    render(<InteractiveAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: "Beta question" }));

    expect(screen.getByRole("button", { name: "Beta question" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: "Alpha question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("collapses the open item when clicked again", async () => {
    const user = userEvent.setup();
    render(<InteractiveAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: "Alpha question" }));

    expect(screen.getByRole("button", { name: "Alpha question" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("wires aria-controls to a region labelled by the trigger", () => {
    render(<InteractiveAccordion items={items} />);

    const trigger = screen.getByRole("button", { name: "Alpha question" });
    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("uses the title alone as the accessible name", () => {
    render(<InteractiveAccordion items={items} />);

    expect(screen.getByRole("button", { name: "Alpha question" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /01/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /\+/ })).toBeNull();
  });

  it("removes panel body content from the DOM after collapse", async () => {
    const user = userEvent.setup();
    render(<InteractiveAccordion items={items} />);

    expect(screen.getByText("Alpha body copy.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Alpha question" }));

    await waitFor(() => {
      expect(screen.queryByText("Alpha body copy.")).toBeNull();
    });
  });

  it("namespaces DOM ids so two instances never collide", () => {
    render(
      <>
        <InteractiveAccordion items={items} />
        <InteractiveAccordion items={items} />
      </>
    );

    const triggers = screen.getAllByRole("button", { name: "Alpha question" });
    expect(triggers).toHaveLength(2);

    const ids = [
      triggers[0].id,
      triggers[0].getAttribute("aria-controls"),
      triggers[1].id,
      triggers[1].getAttribute("aria-controls"),
    ];

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(4);

    for (const trigger of triggers) {
      const panel = document.getElementById(trigger.getAttribute("aria-controls")!);
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    }
  });
});
