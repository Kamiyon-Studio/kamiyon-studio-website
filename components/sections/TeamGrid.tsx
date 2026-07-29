import { Container } from "@/components/ui/Container";
import { HoverExpand } from "@/components/ui/expand-on-hover";
import type { TeamMember } from "@/lib/cms/types";

type TeamGridProps = {
  teamIntro?: string;
  teamMembers: TeamMember[];
};

export function TeamGrid({ teamIntro, teamMembers }: TeamGridProps) {
  return (
    <section id="team" className="bg-[var(--bg-secondary)] py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-[680px] text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Meet the team
          </h2>
          {teamIntro ? (
            <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
              {teamIntro}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex justify-center">
          <HoverExpand members={teamMembers} />
        </div>
      </Container>
    </section>
  );
}
