import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE_MOTTO } from "@/lib/seo/constants";

export function HeroOpening() {
  return (
    <section
      id="home-hero"
      data-nav-theme="dark"
      className="bg-[var(--bg-primary)] pb-12 pt-32 md:pb-20 md:pt-40"
      aria-label="Studio opening"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h1 className="font-display text-[clamp(3.25rem,7.5vw,6rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-[var(--text-primary)]">
              Kamiyon <span className="block text-sakura">Studio</span>
            </h1>
            <p className="mt-6 font-display text-lg font-medium text-[var(--text-primary)] md:text-xl">
              {SITE_MOTTO}
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              Games, digital products, and design from an independent Philippine
              studio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/portfolio">View our work</Button>
              <Button href="/contact" variant="secondary">
                Discuss a project
              </Button>
            </div>
          </div>
          <div
            data-testid="hero-artwork"
            className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] lg:aspect-[4/5]"
          >
            <Image
              src="/assets/background.avif"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
