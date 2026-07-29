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
