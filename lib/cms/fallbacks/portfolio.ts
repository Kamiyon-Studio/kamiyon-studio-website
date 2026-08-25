import type { CmsImage, PortableTextBlock, Portfolio } from "../types";

const PORTFOLIO_MEDIA_BASE = "https://media.kamiyonstudio.com";

function portfolioMedia(key: string, alt: string): CmsImage {
  return {
    key,
    url: `${PORTFOLIO_MEDIA_BASE}/${key}`,
    alt,
  };
}

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

const vocabuItem: Portfolio = {
  _type: "portfolio",
  title: "VOCABU: Wildlife Edition",
  slug: { current: "vocabu-wildlife-edition" },
  projectType: "original-ip",
  clientName: "Kamiyon Studio",
  industry: "Games / Educational Technology",
  serviceType: "game-development",
  status: "prototype",
  developmentPeriod: "2025 → 2026",
  positioning:
    "A card-based educational word puzzle combining vocabulary with animal classification.",
  shortDescription:
    "VOCABU: Wildlife Edition is a challenging card-based word puzzle that tests players' vocabulary and knowledge of the animal kingdom. Players complete animal names using missing letters, then classify each animal as a herbivore, carnivore, or omnivore.",
  challenge:
    "Design a word puzzle that goes beyond simple spelling by combining multiple learning interactions into a single fast-paced gameplay loop.",
  solution:
    "The game uses a two-stage puzzle system. Players first drag the correct letter into an incomplete animal word. Once completed, the card becomes draggable and must be placed into the correct feeding-type chest: Herbivore, Carnivore, or Omnivore.",
  impact:
    "Top 8 finalist at Game On! Game Jam Manila 2025. Continental finalist and Best Game Philippines at GameJamPlus 2025/26.",
  lessonsLearned:
    "Educational pacing still needs arcade urgency — each stage must read instantly. State changes after word completion need unmistakable visual feedback. Layering vocabulary and classification works when both stages stay short and repeatable.",
  narrative: [
    paragraph(
      "Wildlife-themed puzzle environment centered around animals and their feeding classifications.",
    ),
  ],
  creativeDirection: [
    paragraph(
      "A unique combination of osu!-style letter targeting and Typing Shark-style word completion, reframed as drag-and-drop card play with a wildlife classroom feel.",
    ),
  ],
  process: [
    paragraph(
      "Built for Game On! Game Jam Manila 2025. We prototyped drag-and-drop letter placement first, then classification chests and scoring once the two-stage loop felt readable under jam pressure.",
    ),
  ],
  technicalDevelopment: {
    engine: "Unity",
    platforms: "PC",
    input: "Mouse + Keyboard",
    origin: "Game On! Game Jam Manila 2025",
    systems: [
      "Incomplete-word card system",
      "Alphabet letter selection",
      "Drag-and-drop letter placement",
      "Word completion validation",
      "Card state changes after word completion",
      "Animal feeding-type classification",
      "Drag-and-drop chest placement",
      "Correct/incorrect classification validation",
      "Score reward and deduction system",
    ],
  },
  gameplay: {
    dualStateTable: {
      leftLabel: "Word completion",
      rightLabel: "Classification",
      rows: [
        { aspect: "Goal", left: "Complete animal names", right: "Sort by feeding type" },
        { aspect: "Input", left: "Drag letters onto cards", right: "Drag cards into chests" },
        {
          aspect: "Feedback",
          left: "Word validation unlocks the card",
          right: "Score reward or deduction",
        },
      ],
    },
    controls: [
      { input: "Drag", action: "Place letters into incomplete words" },
      { input: "Drag", action: "Move completed cards into classification chests" },
    ],
  },
  credits: [
    {
      name: "Sherwin Limosnero",
      role: "Game Producer / Designer",
      person: { id: "teamMember-sherwin-limosnero", name: "Sherwin Limosnero" },
    },
    {
      name: "Christian Jude Villaber",
      role: "Lead Developer",
      person: { id: "teamMember-christian-jude-villaber", name: "Christian Jude Villaber" },
    },
    {
      name: "Luis Cabrido III",
      role: "UI/UX Designer",
      person: { id: "teamMember-luis-cabrido-iii", name: "Luis Cabrido III" },
    },
    { name: "Sean Matthew Narvaez", role: "Documentation" },
  ],
  recognition: [
    {
      title: "Top 8 Finalist",
      organization: "Game On! Game Jam Manila",
      year: "2025",
    },
    {
      title: "Continental Finalist",
      organization: "GameJamPlus",
      year: "2025",
      note: "2025/26 season",
    },
    {
      title: "Best Game Philippines",
      organization: "GameJamPlus",
      year: "2025",
      note: "2025/26 season",
    },
  ],
  videos: [],
  externalLinks: [],
  coverImage: portfolioMedia(
    "portfolio/vocabu-wildlife-edition/cover.jpg",
    "VOCABU: Wildlife Edition title screen",
  ),
  gallery: [
    portfolioMedia(
      "portfolio/vocabu-wildlife-edition/gallery-01-level-select.jpg",
      "Level select with regional wildlife maps",
    ),
    portfolioMedia(
      "portfolio/vocabu-wildlife-edition/gallery-02-word-completion.jpg",
      "Word completion gameplay with animal cards",
    ),
    portfolioMedia(
      "portfolio/vocabu-wildlife-edition/gallery-03-classification.jpg",
      "Animal classification gameplay phase",
    ),
  ],
  featured: true,
  isPlaceholder: false,
  seo: {
    title: "VOCABU: Wildlife Edition — Card-Based Educational Word Puzzle",
    description:
      "VOCABU: Wildlife Edition is a card-based word puzzle game where players complete animal names and classify them as herbivores, carnivores, or omnivores through fast-paced drag-and-drop gameplay.",
  },
};

const debugLogItem: Portfolio = {
  _type: "portfolio",
  title: "Debug.Log",
  slug: { current: "debug-log" },
  projectType: "original-ip",
  clientName: "Kamiyon Studio",
  industry: "Games / Interactive Entertainment",
  serviceType: "game-development",
  status: "prototype",
  developmentPeriod: "Game On! Game Jam Manila 2025",
  positioning: "A chaotic word-action arcade game where debugging becomes a fight for survival.",
  shortDescription:
    "Debug.Log is a frantic word-action arcade game where players take the role of a stressed programmer fighting endless loops of floating letters. Target, pop, and drag letters into incomplete words to trigger powerful rewrites while surviving increasingly chaotic rounds.",
  challenge:
    "Create a fast-paced arcade experience that turns typing and word completion into active gameplay while keeping each run unpredictable and progressively challenging.",
  solution:
    "Debug.Log combines keyboard targeting, letter popping, drag-and-drop word completion, survival mechanics, and an evolving rewrite system. Completing words activates rewrites that temporarily alter the rules of the game, such as freezing letters, shuffling patterns, or restoring health.",
  impact:
    "Top 8 finalist at Game On! Game Jam Manila 2025. Developed and showcased as an original Kamiyon Studio game.",
  lessonsLearned:
    "Rewrites must change the moment without obscuring the core loop. Mixing keyboard targeting with drag completion creates a distinct skill curve. Survival pressure keeps word puzzles from feeling static.",
  narrative: [
    paragraph(
      "You are a stressed programmer trapped in an endless cycle of bugs, loops, and broken words, using rewrites to keep the system — and yourself — alive.",
    ),
  ],
  creativeDirection: [
    paragraph(
      "Programming concepts and terminology are transformed into the game's visual identity and mechanics, with loops, debugging, and rewrites represented as parts of the arcade experience.",
    ),
  ],
  process: [
    paragraph(
      "Built for Game On! Game Jam Manila 2025. We validated floating-letter targeting first, then word completion, then rewrite effects that temporarily shift the rules of each run.",
    ),
  ],
  technicalDevelopment: {
    engine: "Unity",
    platforms: "Web",
    input: "Keyboard + Mouse",
    origin: "Game On! Game Jam Manila 2025",
    systems: [
      "Floating letter spawning and movement",
      "Keyboard-based letter targeting",
      "Letter popping",
      "Drag-and-drop word completion",
      "Word validation",
      "Rewrite system",
      "Rule-changing gameplay effects",
      "Freeze effects",
      "Pattern shuffling",
      "Health and restoration system",
      "Scoring",
      "Endless survival/progression loop",
    ],
  },
  gameplay: {
    mechanics: [
      paragraph(
        "Hold the matching keyboard key to target floating letters, pop them into your pool, and drag letters into incomplete words. Each completed word triggers a rewrite that temporarily changes the rules — freezing letters, shuffling patterns, or restoring health — while waves grow more chaotic and your score climbs.",
      ),
    ],
    controls: [
      { input: "Keyboard key", action: "Target matching floating letter" },
      { input: "Pop input", action: "Collect targeted letter" },
      { input: "Drag", action: "Place collected letter into incomplete word" },
    ],
  },
  credits: [
    {
      name: "Sherwin Limosnero",
      role: "Game Producer / Designer",
      person: { id: "teamMember-sherwin-limosnero", name: "Sherwin Limosnero" },
    },
    {
      name: "Christian Jude Villaber",
      role: "Lead Developer",
      person: { id: "teamMember-christian-jude-villaber", name: "Christian Jude Villaber" },
    },
    { name: "Andrew Velandrez", role: "2D Artist" },
    { name: "Michael Jornales", role: "2D Artist" },
  ],
  recognition: [
    {
      title: "Top 8 Finalist",
      organization: "Game On! Game Jam Manila",
      year: "2025",
    },
  ],
  videos: [],
  externalLinks: [],
  coverImage: portfolioMedia("portfolio/debug-log/cover.png", "Debug.Log title screen"),
  gallery: [
    portfolioMedia(
      "portfolio/debug-log/gallery-01-character-select.png",
      "Character selection with programming-themed abilities",
    ),
    portfolioMedia(
      "portfolio/debug-log/gallery-02-tutorial.png",
      "Tutorial explaining targeting, word completion, and power-ups",
    ),
    portfolioMedia(
      "portfolio/debug-log/gallery-03-gameplay-targeting.png",
      "Gameplay with floating letter targeting",
    ),
    portfolioMedia(
      "portfolio/debug-log/gallery-04-debug-card.png",
      "DEBUG rewrite card word completion",
    ),
    portfolioMedia(
      "portfolio/debug-log/gallery-05-coffee-powerup.png",
      "COFFEE power-up gameplay moment",
    ),
  ],
  featured: true,
  isPlaceholder: false,
  seo: {
    title: "Debug.Log — Chaotic Word-Action Arcade Game",
    description:
      "Debug.Log is a frantic word-action arcade game where players target floating letters, complete broken words, trigger game-changing rewrites, and fight to survive an endless programming-inspired loop.",
  },
};

const flappyAwieItem: Portfolio = {
  _type: "portfolio",
  title: "Flappy Awie",
  slug: { current: "flappy-awie" },
  projectType: "client-work",
  clientName: "AWS Student Builder Group - UPHSL",
  industry: "Games / Student Community",
  serviceType: "game-development",
  status: "prototype",
  developmentPeriod: "Client-scoped branded demo",
  positioning:
    "A familiar arcade classic reimagined as a playful interactive experience for AWS Student Builder Group - UPHSL.",
  shortDescription:
    "Flappy Awie is a branded Flappy Bird-inspired arcade game developed for AWS Student Builder Group - UPHSL. The project reimagines the familiar one-button gameplay with the organization's own visual identity and mascot-inspired presentation.",
  challenge:
    "Create a simple, recognizable, and immediately playable game that could represent the AWS Student Builder Group - UPHSL while remaining lightweight enough to function as a quick interactive demo.",
  solution:
    "We adapted the familiar Flappy Bird gameplay loop into a custom Godot project, replacing the original presentation with AWS Student Builder Group - UPHSL-themed visuals and branding. The result preserves the accessibility of the original mechanic while giving the experience its own community-focused identity.",
  impact:
    "Delivered as a functional branded game demo for AWS Student Builder Group - UPHSL, demonstrating how an established arcade mechanic can be quickly adapted into an interactive experience for a student organization.",
  lessonsLearned:
    "A small, familiar gameplay loop can be an effective foundation for rapidly producing branded interactive experiences. The project also provided practical experience adapting existing game conventions around a client's visual identity and use case.",
  creativeDirection: [
    paragraph(
      "The project intentionally retains the recognizable simplicity of Flappy Bird while shifting the visual presentation toward AWS Student Builder Group - UPHSL. The emphasis was on playful branding rather than reinventing the core mechanic.",
    ),
  ],
  process: [
    paragraph(
      "The project was scoped as a lightweight demo rather than a full original game. Development prioritized fast iteration, recognizable gameplay, responsive controls, and integration of the client's branding.",
    ),
  ],
  narrative: [
    paragraph(
      "A lighthearted, AWS-themed take on the classic endless flying arcade format.",
    ),
  ],
  technicalDevelopment: {
    engine: "Godot",
    platforms: "Desktop",
    input: "Keyboard and Mouse",
    origin: "Client brief / branded game demo",
    systems: [
      "Character movement and gravity",
      "Flap input system",
      "Procedural/repeating obstacles",
      "Collision detection",
      "Scoring",
      "Game-over state",
      "Restart loop",
      "Branded UI and game presentation",
    ],
  },
  gameplay: {
    controls: [
      { input: "Click / Key Press", action: "Flap upward" },
      { input: "No input", action: "Fall due to gravity" },
    ],
    mechanics: [
      paragraph(
        "One-button flight through repeating obstacles. Avoid collisions, accumulate points based on distance and obstacles cleared, then restart and chase a higher score.",
      ),
    ],
  },
  credits: [
    { name: "Kamiyon Studio", role: "Game Development" },
    { name: "AWS Student Builder Group - UPHSL", role: "Client / Brand Owner" },
  ],
  recognition: [],
  videos: [],
  externalLinks: [],
  coverImage: portfolioMedia(
    "portfolio/flappy-awie/cover.png",
    "Flappy Awie press space to start screen",
  ),
  gallery: [
    portfolioMedia(
      "portfolio/flappy-awie/gallery-01-game-over.jpg",
      "Game over screen with AWS-branded mascot",
    ),
    portfolioMedia(
      "portfolio/flappy-awie/gallery-02-gameplay.jpg",
      "Gameplay flying between obstacle pillars",
    ),
  ],
  featured: false,
  isPlaceholder: false,
  seo: {
    title: "Flappy Awie — Branded Arcade Game",
    description:
      "Flappy Awie is a Flappy Bird-inspired arcade game developed for AWS Student Builder Group - UPHSL, combining familiar one-button gameplay with a custom community-focused visual identity.",
  },
};

/** Eclipse first so home bento large slots prefer the real original IP. */
export const portfolioItemsFallback: Portfolio[] = [
  eclipseItem,
  vocabuItem,
  debugLogItem,
  flappyAwieItem,
  placeholderItem,
];

/** @deprecated Use portfolioItemsFallback. */
export const caseStudiesFallback = portfolioItemsFallback;
