import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PUBLIC_EMAIL } from "@/lib/contact/channels";
import PageError from "./error";

it("provides retry and an independent email path without exposing errors", () => {
  const reset = vi.fn();
  render(<PageError reset={reset} />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledOnce();
  expect(screen.getByRole("link", { name: "Email the studio" })).toHaveAttribute("href", `mailto:${PUBLIC_EMAIL}`);
  expect(screen.queryByRole("main")).not.toBeInTheDocument();
});
