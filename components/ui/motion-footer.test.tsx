import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { testShellProps } from "@/components/layout/test-shell-props";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("@/lib/motion/reduced-motion", () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

vi.mock("@/lib/gsap", () => {
  return {
    ensureGsapPlugins: vi.fn(),
    GSAP_ALLOW_MOTION: "(prefers-reduced-motion: no-preference)",
    GSAP_REDUCE_MOTION: "(prefers-reduced-motion: reduce)",
    gsap: {
      context: vi.fn((fn: () => void | (() => void)) => {
        const cleanup = fn();
        return {
          revert: vi.fn(() => {
            if (typeof cleanup === "function") cleanup();
          }),
        };
      }),
      fromTo: vi.fn(),
      to: vi.fn(),
      set: vi.fn(),
      matchMedia: vi.fn(() => ({
        add: vi.fn(
          (
            query: string,
            callback: () => void | (() => void),
          ) => {
            if (query.includes("no-preference")) {
              return callback();
            }
            return undefined;
          },
        ),
        revert: vi.fn(),
      })),
    },
    ScrollTrigger: {
      create: vi.fn(),
      update: vi.fn(),
      refresh: vi.fn(),
    },
  };
});

import { usePathname } from "next/navigation";

import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import { CinematicFooter } from "./motion-footer";

beforeEach(() => {
  vi.mocked(prefersReducedMotion).mockReturnValue(false);
  vi.mocked(usePathname).mockReturnValue("/");
});

describe("CinematicFooter", () => {
  it("renders a contentinfo landmark", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the primary nav links under a Footer nav landmark", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(nav).toBeInTheDocument();

    const services = screen.getByRole("link", { name: "Services" });
    const portfolio = screen.getByRole("link", { name: "Portfolio" });
    const blog = screen.getByRole("link", { name: "Blog" });

    expect(services).toHaveAttribute("href", "/services");
    expect(portfolio).toHaveAttribute("href", "/portfolio");
    expect(blog).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("link", { name: "Products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Community" })).not.toBeInTheDocument();

    for (const link of [services, portfolio, blog]) {
      expect(link).toHaveClass("footer-text-link");
      expect(link).not.toHaveClass("footer-glass-pill");
    }
  });

  it("does not render a Crafted with pill", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    expect(screen.queryByText(/Crafted with/i)).not.toBeInTheDocument();
  });

  it("renders all six social platforms as icon links with aria-labels", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    const expected = [
      {
        name: "Facebook",
        href: "https://www.facebook.com/kamiyonstudio",
      },
      {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/105066188/",
      },
      { name: "itch.io", href: "https://kamiyon-studio.itch.io/" },
      { name: "YouTube", href: "https://youtube.com/@kamiyonstudio" },
      { name: "X", href: "https://x.com/kamiyonstudio" },
      { name: "Email", href: "mailto:kamiyonstudio@gmail.com" },
    ] as const;

    for (const { name, href } of expected) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).not.toHaveClass("footer-glass-pill");
    }

    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
  });

  it("renders comingSoon socials as muted disabled icons without hrefs", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={[
          {
            label: "Facebook",
            href: "#",
            comingSoon: true,
            platform: "facebook",
          },
        ]}
        contactCta={testShellProps.contactCta}
      />,
    );

    expect(screen.queryByText("(Coming soon)")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Facebook/ }),
    ).not.toBeInTheDocument();

    const disabledIcon = screen.getByRole("img", {
      name: "Facebook (coming soon)",
    });
    expect(disabledIcon).toHaveAttribute("aria-disabled", "true");
    expect(disabledIcon).toHaveClass("opacity-40");
    expect(disabledIcon).not.toHaveAttribute("href");
  });

  it("renders the studio motto accessibly and location in credits", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    const motto = screen.getByText("Create. Play. Inspire.", {
      selector: "p",
    });
    expect(motto).toBeInTheDocument();
    expect(motto.closest("[aria-hidden='true']")).toBeNull();
    expect(
      screen.getByText(/Biñan City, Laguna, Philippines/),
    ).toBeInTheDocument();
  });

  it("renders the current year in the copyright line", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    expect(
      screen.getByText(
        new RegExp(`© ${new Date().getFullYear()} Kamiyon Studio`),
      ),
    ).toBeInTheDocument();
  });

  it("renders contact and portfolio primary CTAs as text links", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    const contact = screen.getByRole("link", {
      name: testShellProps.contactCta.label,
    });
    const portfolio = screen.getByRole("link", { name: "View portfolio" });

    expect(contact).toHaveAttribute("href", testShellProps.contactCta.href);
    expect(contact).toHaveAttribute("target", "_blank");
    expect(portfolio).toHaveAttribute("href", "/portfolio");
    expect(contact).toHaveClass("footer-text-link");
    expect(portfolio).toHaveClass("footer-text-link");
    expect(contact).not.toHaveClass("footer-glass-pill");
    expect(portfolio).not.toHaveClass("footer-glass-pill");
  });

  it("smooth-scrolls to top when a same-route footer nav link is clicked", async () => {
    vi.mocked(usePathname).mockReturnValue("/about");
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    await user.click(screen.getByRole("link", { name: "About" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls to top when the back-to-top control is activated", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("uses instant scroll when prefers-reduced-motion is set", async () => {
    vi.mocked(prefersReducedMotion).mockReturnValue(true);
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("exposes a Connect landmark for social links", () => {
    render(
      <CinematicFooter
        siteName={testShellProps.siteName}
        footerMotto={testShellProps.footerMotto}
        navItems={testShellProps.navItems}
        socialLinks={testShellProps.socialLinks}
        contactCta={testShellProps.contactCta}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Connect" }),
    ).toBeInTheDocument();
  });
});
