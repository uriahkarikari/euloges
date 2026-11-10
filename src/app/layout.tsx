
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.euloges.com"),

  title: {
    default: "Euloges | Digital Memorials & Online Remembrance",
    template: "%s | Euloges",
  },

  description:
    "Create beautiful digital memorials, preserve life stories and photographs, share tributes and condolences, and honour the people who matter.",

  applicationName: "Euloges",

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
    siteName: "Euloges",
    title: "Euloges | A Life Remembered. A Legacy Preserved.",
    description:
      "A meaningful place to preserve life stories, photographs and cherished memories.",
    locale: "en_GH",
  },

  twitter: {
    card: "summary_large_image",
    title: "Euloges | A Life Remembered. A Legacy Preserved.",
    description:
      "Create a digital memorial and preserve the stories and memories of those you love.",
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
