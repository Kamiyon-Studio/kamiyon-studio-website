import type { AboutPage, TeamMember } from "../types";

// Sources: docs/company/overview.md, docs/company/mission-vision.md, docs/company/core-values.md
export const aboutPageFallback: AboutPage = {
  _type: "aboutPage",
  title: "About",
  storySections: [
    {
      title: "A Filipino creative technology studio",
      body: "Kamiyon Studio is a multidisciplinary creative technology studio founded in 2024 in Biñan City, Laguna, Philippines.",
    },
    {
      title: "Built around meaningful interactive experiences",
      body: "The studio operates as both a creative technology agency and an original IP studio, spanning game development, product development, UI and design, branding, and community programs — with capabilities that include MVP builds, AI-powered features, and educational experiences.",
    },
  ],
  timelineHeading: "Our journey",
  timelineSummary:
    "Milestones from founding through the work ahead — drawn from how the studio grew and where it is headed.",
  timelineEntries: [
    {
      key: "timeline-2024-01",
      year: "2024",
      dateLabel: "March 2024",
      date: "2024-03-01",
      title: "Learning through competition",
      body: "Sherwin Limosnero and Christian Jude Villaber begin building together through game jams, hackathons, and competitions — learning by shipping under pressure rather than waiting until they felt ready.",
      image: {
        url: "/assets/background.jpg",
        alt: "Early collaboration and competition work",
      },
    },
    {
      key: "timeline-2024-02",
      year: "2024",
      dateLabel: "November 2024",
      date: "2024-11-05",
      title: "The Kamiyon name is born",
      body: "From a school project, the name Kamiyon emerges — kami (“us”) and ’yon (“that”), meaning “that’s us.” The studio takes shape in Biñan City, Laguna, Philippines as a creative technology practice.",
      image: {
        url: "/assets/background.jpg",
        alt: "Kamiyon Studio founding moment",
      },
    },
    {
      key: "timeline-2025-01",
      year: "2025",
      dateLabel: "June 2025",
      date: "2025-06-01",
      title: "A multidisciplinary team takes shape",
      body: "What began as two game developers grows into a studio of designers, developers, artists, and creatives united by a shared belief: world-class interactive experiences can be built in the Philippines.",
      image: {
        url: "/assets/background.jpg",
        alt: "Kamiyon Studio multidisciplinary team",
      },
    },
    {
      key: "timeline-2025-02",
      year: "2025",
      dateLabel: "November 2025",
      date: "2025-11-01",
      title: "Agency craft fuels original IP",
      body: "Kamiyon settles into a dual-track model: client services fund the studio while revenue is reinvested into games, educational platforms, and original intellectual property.",
      image: {
        url: "/assets/background.jpg",
        alt: "Client craft and original IP work",
      },
    },
    {
      key: "timeline-2026-01",
      year: "2026",
      dateLabel: "March 2026",
      date: "2026-03-01",
      title: "Foundation phase in public",
      body: "Phase 1 priorities move into the open: a recognizable brand, clearer internal systems and documentation, and a growing portfolio across games, products, and interactive experiences.",
      image: {
        url: "/assets/background.jpg",
        alt: "Kamiyon brand and portfolio foundation",
      },
    },
    {
      key: "timeline-2026-02",
      year: "2026",
      dateLabel: "September 2026",
      date: "2026-09-01",
      title: "Education and community at the center",
      body: "Relationships with educational institutions and creator communities deepen, aligning the studio’s work with K–12 learning, Web3 education, and gamified platforms that make learning more engaging.",
      image: {
        url: "/assets/background.jpg",
        alt: "Educational and community programs",
      },
    },
    {
      key: "timeline-2027-01",
      year: "2027",
      dateLabel: "March 2027",
      date: "2027-03-01",
      title: "Growth phase begins",
      body: "Phase 2 focuses on scaling the agency: expanding the client base, tightening development workflows, strengthening the Kamiyon brand, and building recurring revenue alongside community presence.",
      image: {
        url: "/assets/background.jpg",
        alt: "Studio growth and workflow maturity",
      },
    },
    {
      key: "timeline-2027-02",
      year: "2027",
      dateLabel: "October 2027",
      date: "2027-10-01",
      title: "Original worlds take the lead",
      body: "Investment in original games and long-form IP intensifies — moving the studio closer to a future where Filipino-made worlds, characters, and educational products become the primary growth engine.",
      image: {
        url: "/assets/background.jpg",
        alt: "Original intellectual property development",
      },
    },
  ],
  mission:
    "We create games and interactive experiences that educate, inspire, and make a lasting impact.",
  vision:
    "Kamiyon Studio envisions a future where it is recognized as a world-class multimedia entertainment company that proudly represents Filipino creativity through globally respected games, educational experiences, and original intellectual properties.",
  motto: "Create. Play. Inspire.",
  values: [
    {
      name: "Curiosity",
      description: "Stay curious. Never stop exploring.",
    },
    {
      name: "Education",
      description: "Knowledge grows when it is shared.",
    },
    {
      name: "Innovation",
      description: "Innovation is meaningful only when it creates value.",
    },
    {
      name: "Accessibility",
      description: "Great experiences should welcome everyone.",
    },
    {
      name: "Long-Term Thinking",
      description: "Build for tomorrow, not just today.",
    },
  ],
  cultureSummary:
    "Kamiyon encourages exploration over specialization. Learning, collaboration, curiosity, and continuous improvement are fundamental to how the team works.",
  teamIntro:
    "Kamiyon Studio currently consists of six multidisciplinary members.",
  seo: {
    title: "About Kamiyon Studio",
    description:
      "Learn about Kamiyon Studio, a Filipino creative technology studio founded in 2024 in Biñan City, Laguna, Philippines.",
  },
};

// Source: docs/company/overview.md
export const teamMembersFallback: TeamMember[] = [
  {
    _type: "teamMember",
    name: "Sherwin Limosnero",
    role: "Chief Executive Officer (CEO)",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 1,
    isPlaceholder: true,
  },
  {
    _type: "teamMember",
    name: "Christian Jude Villaber",
    role: "Chief Technology Officer (CTO)",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 2,
    isPlaceholder: true,
  },
  {
    _type: "teamMember",
    name: "Ken Cabingas",
    role: "Chief Marketing Officer (CMO)",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 3,
    isPlaceholder: true,
  },
  {
    _type: "teamMember",
    name: "Luis Cabrido III",
    role: "Lead 3D Artist",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 4,
    isPlaceholder: true,
  },
  {
    _type: "teamMember",
    name: "Lucky Guevarra",
    role: "Community Growth Manager",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 5,
    isPlaceholder: true,
  },
  {
    _type: "teamMember",
    name: "Yushua Dapilaga",
    role: "Programmer",
    bio: "Bio coming soon.",
    socialLinks: [],
    order: 6,
    isPlaceholder: true,
  },
];
