import Image from "next/image";
import { PortableText } from "@/components/ui/PortableText";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { getCmsImageUrl } from "@/lib/cms/image";
import type {
  CaseStudy as CaseStudyType,
  PortfolioGameplay,
  PortfolioTechnicalDevelopment,
} from "@/lib/cms/types";
import {
  getPortfolioCardDescription,
  hasGameplay,
  hasPortableText,
  hasTechnicalDevelopment,
} from "@/lib/portfolio/case-study";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectSidebar } from "./ProjectSidebar";

function ProseSection({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
        {heading}
      </h2>
      <p className="mt-3 text-base text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

function GameplaySection({ gameplay }: { gameplay: PortfolioGameplay }) {
  const table = gameplay.dualStateTable;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
        Gameplay
      </h2>
      {hasPortableText(gameplay.mechanics) ? (
        <div className="mt-3">
          <PortableText blocks={gameplay.mechanics!} />
        </div>
      ) : null}
      {table && table.rows.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm text-[var(--text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="py-2 pr-4 font-medium text-[var(--text-muted)]"> </th>
                <th className="py-2 pr-4 font-medium text-[var(--text-primary)]">
                  {table.leftLabel}
                </th>
                <th className="py-2 font-medium text-[var(--text-primary)]">
                  {table.rightLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr
                  key={row._key ?? `${row.aspect}-${index}`}
                  className="border-b border-[var(--border-default)]"
                >
                  <th className="py-2 pr-4 font-medium text-[var(--text-primary)]">
                    {row.aspect}
                  </th>
                  <td className="py-2 pr-4">{row.left}</td>
                  <td className="py-2">{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {gameplay.controls.length > 0 ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {gameplay.controls.map((control, index) => (
            <div key={control._key ?? `${control.input}-${index}`}>
              <dt className="font-medium text-[var(--text-primary)]">{control.input}</dt>
              <dd className="text-[var(--text-secondary)]">{control.action}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function TechnicalSection({
  technical,
}: {
  technical: PortfolioTechnicalDevelopment;
}) {
  const facts = [
    technical.platforms ? { label: "Platforms", value: technical.platforms } : null,
    technical.input ? { label: "Input", value: technical.input } : null,
    technical.origin ? { label: "Origin", value: technical.origin } : null,
    technical.engine ? { label: "Engine", value: technical.engine } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
        Technical
      </h2>
      {facts.length > 0 ? (
        <dl className="mt-3 space-y-2 text-sm">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-medium text-[var(--text-muted)]">{fact.label}</dt>
              <dd className="text-[var(--text-secondary)]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {technical.systems.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
          {technical.systems.map((system) => (
            <li key={system}>{system}</li>
          ))}
        </ul>
      ) : null}
      {hasPortableText(technical.body) ? (
        <div className="mt-4">
          <PortableText blocks={technical.body!} />
        </div>
      ) : null}
    </div>
  );
}

type CaseStudyProps = {
  caseStudy: CaseStudyType;
};

export function CaseStudy({ caseStudy }: CaseStudyProps) {
  const coverImageUrl = getCmsImageUrl(caseStudy.coverImage);
  const description = getPortfolioCardDescription(caseStudy);
  const showGameplay = hasGameplay(caseStudy.gameplay);
  const showTechnical = hasTechnicalDevelopment(caseStudy.technicalDevelopment);
  const showNarrative = hasPortableText(caseStudy.narrative);
  const showCreative = hasPortableText(caseStudy.creativeDirection);
  const showProcess = hasPortableText(caseStudy.process);
  const showCredits = caseStudy.credits.length > 0;
  const showRecognition = caseStudy.recognition.length > 0;
  const showVideos = caseStudy.videos.length > 0;
  const showLinks = caseStudy.externalLinks.length > 0;

  return (
    <>
      <div className="relative aspect-[16/7] w-full bg-[var(--bg-accent)]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={caseStudy.coverImage?.alt ?? caseStudy.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-6xl"
            aria-hidden="true"
          >
            🌸
          </div>
        )}
      </div>

      <Container className="py-12 md:py-16">
        {caseStudy.isPlaceholder ? (
          <Badge variant="placeholder" className="mb-4">
            Placeholder case study
          </Badge>
        ) : null}
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
          {caseStudy.title}
        </h1>
        {caseStudy.positioning ? (
          <p className="mt-3 text-lg text-[var(--text-primary)]">{caseStudy.positioning}</p>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-[68ch] text-base text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <ProseSection heading="Challenge" body={caseStudy.challenge} />
            <ProseSection heading="Solution" body={caseStudy.solution} />
            {showCreative ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Creative direction
                </h2>
                <div className="mt-3">
                  <PortableText blocks={caseStudy.creativeDirection!} />
                </div>
              </div>
            ) : null}
            {showGameplay && caseStudy.gameplay ? (
              <GameplaySection gameplay={caseStudy.gameplay} />
            ) : null}
            {showNarrative ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Narrative
                </h2>
                <div className="mt-3">
                  <PortableText blocks={caseStudy.narrative!} />
                </div>
              </div>
            ) : null}
            {showProcess ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Process
                </h2>
                <div className="mt-3">
                  <PortableText blocks={caseStudy.process!} />
                </div>
              </div>
            ) : null}
            {showTechnical && caseStudy.technicalDevelopment ? (
              <TechnicalSection technical={caseStudy.technicalDevelopment} />
            ) : null}
            <ProseSection heading="Impact" body={caseStudy.impact} />
            {caseStudy.lessonsLearned ? (
              <ProseSection heading="Lessons learned" body={caseStudy.lessonsLearned} />
            ) : null}
            {showCredits ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Credits
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  {caseStudy.credits.map((credit, index) => (
                    <li key={credit._key ?? `${credit.name}-${index}`}>
                      <span className="font-medium text-[var(--text-primary)]">
                        {credit.name}
                      </span>
                      {credit.role ? ` — ${credit.role}` : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {showRecognition ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Recognition
                </h2>
                <ul className="mt-3 space-y-3 text-sm text-[var(--text-secondary)]">
                  {caseStudy.recognition.map((entry, index) => (
                    <li key={entry._key ?? `${entry.title}-${index}`}>
                      <p className="font-medium text-[var(--text-primary)]">{entry.title}</p>
                      <p>
                        {[entry.organization, entry.year].filter(Boolean).join(" · ")}
                      </p>
                      {entry.note ? <p>{entry.note}</p> : null}
                      {entry.url ? (
                        <a
                          href={entry.url}
                          className="text-sakura-ink underline-offset-2 hover:underline"
                          rel="noreferrer"
                          target="_blank"
                        >
                          {entry.url}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {showVideos ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Videos
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {caseStudy.videos.map((video, index) => (
                    <li key={video._key ?? `${video.url}-${index}`}>
                      <a
                        href={video.url}
                        className="text-sakura-ink underline-offset-2 hover:underline"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {video.title || video.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {showLinks ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                  Links
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {caseStudy.externalLinks.map((link, index) => (
                    <li key={link._key ?? `${link.url}-${index}`}>
                      <a
                        href={link.url}
                        className="text-sakura-ink underline-offset-2 hover:underline"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Gallery
              </h2>
              <div className="mt-3">
                <ProjectGallery gallery={caseStudy.gallery} />
              </div>
            </div>
          </div>

          <ProjectSidebar caseStudy={caseStudy} />
        </div>
      </Container>
    </>
  );
}
