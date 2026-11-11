import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProgressSlider, SliderContent, SliderWrapper, SliderBtn, useProgressSliderContext } from "./progressive-carousel";

function ActiveSlide() {
  const { active } = useProgressSliderContext();
  return <output aria-label="Active slide">{active}</output>;
}

afterEach(() => vi.restoreAllMocks());

it("does not resume an abandoned fast-forward after manual selection while paused", () => {
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(performance, "now").mockReturnValue(0);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { frames.push(callback); return frames.length; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  render(<ProgressSlider activeSlider="a"><SliderContent><SliderWrapper value="a">Slide A</SliderWrapper><SliderWrapper value="b">Slide B</SliderWrapper><SliderWrapper value="c">Slide C</SliderWrapper></SliderContent><SliderBtn value="b">Choose B</SliderBtn><SliderBtn value="c">Choose C</SliderBtn><ActiveSlide /></ProgressSlider>);
  fireEvent.click(screen.getByRole("button", { name: "Choose B" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
  fireEvent.click(screen.getByRole("button", { name: "Choose C" }));
  expect(screen.getByLabelText("Active slide")).toHaveTextContent("c");
  fireEvent.click(screen.getByRole("button", { name: "Resume slideshow" }));
  act(() => frames.at(-1)!(500));
  expect(screen.getByLabelText("Active slide")).toHaveTextContent("c");
});
