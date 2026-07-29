import type { Metadata } from "next";
import { Geologica, Montserrat } from "next/font/google";
import { CloudflareWebAnalytics } from "@/components/analytics/CloudflareWebAnalytics";
import { PageShell } from "@/components/layout/PageShell";
import { AnimationProviders } from "@/components/providers/AnimationProviders";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo/constants";
import { getOrganizationJsonLd } from "@/lib/seo/organization-jsonld";
import { SITE_URL } from "@/lib/seo/site-url";
import "../globals.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = getOrganizationJsonLd();

  return (
    <html
      lang="en"
      data-theme="kamiyon"
      className={`${geologica.variable} ${montserrat.variable} scheme-dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <AnimationProviders>
          <PageShell>{children}</PageShell>
        </AnimationProviders>
        <CloudflareWebAnalytics />
      </body>
    </html>
  );
}
