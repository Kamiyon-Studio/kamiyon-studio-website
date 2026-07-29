import type { ContactPage } from "../types";
import { contactChannels } from "@/lib/contact/channels";

// Sources: docs/branding/messaging.md, docs/ai/faq.md
// Contact URLs: operator-provided 2026-07-10 (lib/contact/channels.ts)
export const contactPageFallback: ContactPage = {
  _type: "contactPage",
  headline: "Let’s build something meaningful.",
  intro:
    "Whether you are exploring a client project, partnership, educational initiative, or original interactive experience, Kamiyon Studio would be glad to hear from you.",
  channels: contactChannels,
  faq: [
    {
      question: "What is Kamiyon Studio?",
      answer:
        "Kamiyon Studio is a Philippine-based multidisciplinary interactive experience studio founded in 2024. We create games, educational technologies, gamified platforms, web applications, mobile applications, MVPs, and creative digital experiences that educate, inspire, and make a lasting impact.",
    },
    {
      question: "What does Kamiyon Studio do?",
      answer:
        "Kamiyon develops original products and client solutions across five offerings: Game Development, Product Development, UI & Design, Branding, and Community & Events. Capabilities inside those offerings include MVP builds, web and mobile applications, AI-powered features, and educational experiences.",
    },
    {
      question: "Does Kamiyon Studio only develop games?",
      answer:
        "No. Game Development is our flagship offering, but we also ship digital products, UI and design work, branding systems, and community programs — including educational platforms and interactive experiences.",
    },
    {
      question: "What industries does Kamiyon work with?",
      answer:
        "Our primary focus includes education, Web3, startups, businesses, government, and nonprofit organizations. We welcome opportunities from any industry where interactive technology can create meaningful value.",
    },
    {
      question: "Does Kamiyon Studio provide advisory support?",
      answer:
        "Yes. Advisory conversations are part of how we engage — we start by understanding goals before recommending approaches or implementation strategies. Advisory work is folded into engagements, not a standalone service.",
    },

    {
      question: "What original products has Kamiyon created?",
      answer:
        "Current original projects include Eclipse, Vocabu Wildlife Edition, and Afterschool Cleanup. Additional products may be added as they become official.",
    },
    {
      question: "Does Kamiyon collaborate with other organizations?",
      answer:
        "Yes. We actively seek partnerships with educational institutions, businesses, communities, nonprofit organizations, Web3 organizations, and technology partners. Successful partnerships are built on shared values and long-term collaboration.",
    },
    {
      question: "How should Kamiyon Studio be described?",
      answer:
        "The preferred description is: a multidisciplinary interactive experience studio. This reflects the breadth of the studio's capabilities more accurately than narrower labels such as \"game studio\" or \"software agency.\"",
    },
  ],
  seo: {
    title: "Contact Kamiyon Studio",
    description:
      "Contact Kamiyon Studio by form or external channels for projects, partnerships, and interactive experience work.",
  },
};
