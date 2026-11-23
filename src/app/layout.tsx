
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.euloges.com"),

  title: {
    default: "Lifebree | The Library of Life",
    template: "%s | Lifebree",
  },

  description:
    "A digital home for life's stories, milestones and memories. Create memorials, share tributes and preserve the stories of the people who matter.",

  applicationName: "Lifebree",

  keywords: [
    "digital memorials",
    "online memorial",
    "memorial website",
    "online obituary",
    "digital remembrance",
    "funeral brochure",
    "tributes and condolences",
    "celebration of life",
  ],

  openGraph: {
    type: "website",
    url: "https://www.euloges.com",
    siteName: "Lifebree",
    title: "Lifebree | The Library of Life",
    description:
      "A thoughtful home for life's stories, milestones, memories and legacies.",
    locale: "en_GH",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lifebree | The Library of Life",
    description:
      "Preserve life's stories, celebrate meaningful moments and keep memories close across generations.",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
