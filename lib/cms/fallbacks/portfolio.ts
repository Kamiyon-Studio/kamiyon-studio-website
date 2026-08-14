import type { PortableTextBlock, Portfolio } from "../types";

function paragraph(text: string): PortableTextBlock {
  return {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
    markDefs: [],
  };
}

const placeholderItem: Portfolio = {
  _type: "portfolio",
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  projectType: "client-work",
  clientName: "Client name coming soon",
  industry: "Interactive Experience",
  serviceType: "game-development",
  shortDescription:
    "This placeholder portfolio item reserves the structure for future approved client work.",
  challenge:
    "This placeholder portfolio item reserves the structure for future approved client work.",
  solution:
    "Published portfolio items will describe Kamiyon Studio's actual approach once client-approved content is available.",
  impact:
    "Impact details will be added only when real outcomes are documented and approved for publication.",
  lessonsLearned:
    "Lessons learned will be replaced with project-specific insights when a real portfolio item is published.",
  credits: [],
  recognition: [],
  videos: [],
  externalLinks: [],
  gallery: [],
  featured: true,
  isPlaceholder: true,
  seo: {
    title: "Sample Client Project — Placeholder",
    description:
      "A placeholder portfolio structure for future Kamiyon Studio client work.",
  },
};

const eclipseItem: Portfolio = {
  _type: "portfolio",
  title: "Eclipse",
  slug: { current: "eclipse" },
  projectType: "original-ip",
  clientName: "Kamiyon Studio",
  industry: "Games / Interactive Entertainment",
  serviceType: "game-development",
  status: "in-development",
  developmentPeriod: "Global Game Jam 2026 → Present",
  positioning:
    "A movement-platformer where changing realities changes the rules of physics.",
  shortDescription:
    "A high-speed 2D movement-platformer built around a dual-state world-swapping mechanic, where players alternate between the grounded physics of The Fragment and the weightless Resonance to traverse spectrum-locked environments, fight enemies, and survive a collapsing reality.",
  challenge:
    "Global Game Jam 2026 was a hard timebox: prove that a dual-state world could change traversal, combat, and geometry without feeling like a gimmick, and ship a playable vertical slice with a visual identity that could continue after the jam.",
  solution:
    "We treated state as the interaction model, not a visual filter. Visage switches the player between The Fragment and Resonance: Fragment is grounded melee against solid debris; Resonance is weightless movement across luminous terrain with sonic pulses. Contrast tells you which rules are in effect. Momentum stays in the player's hands rather than interrupting it. Complexity has to stay readable, because visual clarity is how the dual-state world teaches itself.",
  impact:
    "Eclipse is a playable original IP. It was submitted to Global Game Jam 2026, won the Most Fun Award at CIIT College of Innovation and Integrated Technology for that entry, and continues in development as a Kamiyon Studio original.",
  lessonsLearned:
    "A dual-state mechanic has to change the whole game, not sit on top of it. Validate movement early. Visual clarity is gameplay clarity. Game jams are a legitimate way to prove high-risk concepts.",
  narrative: [
    paragraph(
      "The world has been bleached of color and meaning, harvested by the Veiled. The player is the Fragmented One. Using Visage, they reveal Resonance — the other state of a collapsing reality — and fight to survive it.",
    ),
  ],
  technicalDevelopment: {
    platforms: "PC",
    input: "Keyboard + Mouse",
    origin: "Global Game Jam 2026",
    systems: [
      "Dual-state world",
      "Movement",
      "Double-jump",
      "State-dependent physics and environment",
      "Visage switch",
      "Melee",
      "Sonic pulses",
      "Spectrum-locked platforms",
    ],
  },
  gameplay: {
    dualStateTable: {
      leftLabel: "Fragment",
      rightLabel: "Resonance",
      rows: [
        { aspect: "Movement", left: "Grounded physics", right: "Weightless movement" },
        { aspect: "Environment", left: "Solid debris", right: "Luminous terrain" },
        { aspect: "Combat", left: "Melee", right: "Sonic pulses" },
      ],
    },
    controls: [
      { input: "WASD", action: "Move" },
      { input: "Space + Space", action: "Double jump" },
      { input: "Left Click", action: "Attack" },
      { input: "Right Click", action: "Toggle Visage" },
    ],
  },
  credits: [
    { name: "Kien Serapio", role: "Game Designer" },
    { name: "Xandrew Liquigan", role: "Lead Game Artist" },
    {
      name: "Sherwin Limosnero",
      role: "Sound Designer",
      person: { id: "teamMember-sherwin-limosnero", name: "Sherwin Limosnero" },
    },
    { name: "Clifford Torion", role: "Game Developer" },
    { name: "Nicholas Alcantara", role: "Game Developer" },
    { name: "Sharmaine Valenzuela", role: "Level Designer" },
  ],
  recognition: [
    {
      title: "Most Fun Award",
      organization: "CIIT College of Innovation and Integrated Technology",
      year: "2026",
      note: "Global Game Jam 2026 entry",
    },
  ],
  videos: [],
  externalLinks: [],
  gallery: [],
  featured: true,
  isPlaceholder: false,
  seo: {
    title: "Eclipse — High-Speed 2D Movement Platformer | Kamiyon Studio",
    description:
      "Eclipse is Kamiyon Studio's high-speed 2D movement-platformer built around a dual-state world-swapping mechanic, combining momentum-based traversal, combat, and reality-shifting puzzles.",
  },
};

/** Eclipse first so home bento large slots prefer the real original IP. */
export const portfolioItemsFallback: Portfolio[] = [eclipseItem, placeholderItem];

/** @deprecated Use portfolioItemsFallback. */
export const caseStudiesFallback = portfolioItemsFallback;
