import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MemorialClient from "./MemorialClient";

import {
  canIndexMemorial,
  getMemorialSeoRecord,
} from "@/lib/memorialSeo";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const SITE_URL = "https://www.euloges.com";

function formatMemorialDate(
  date: string | null,
): string | null {
  if (!date) return null;

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const memorial = await getMemorialSeoRecord(id);

  if (!memorial) {
    return {
      title: "Memorial Not Found | Euloges",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const eligibleForIndexing = canIndexMemorial(memorial);

  const title = memorial.name
  ? `Remembering ${memorial.name}`
  : "Memorial";

  const description =
    memorial.biography?.trim().slice(0, 155) ||
    `Remember and celebrate the life of ${memorial.name} on Euloges.`;

  return {
    title,
    description,

    alternates: {
      canonical: `${SITE_URL}/brochure/${id}`,
    },

    robots: {
      index: eligibleForIndexing,
      follow: eligibleForIndexing,
      googleBot: {
        index: eligibleForIndexing,
        follow: eligibleForIndexing,
      },
    },

    openGraph: {
      type: "website",
      url: `${SITE_URL}/brochure/${id}`,
      siteName: "Euloges",
      title,
      description,
      images: memorial.portrait_url
        ? [
            {
              url: memorial.portrait_url,
              alt: `Portrait of ${memorial.name}`,
            },
          ]
        : [],
    },
  };
}

export default async function MemorialPage({
  params,
}: PageProps) {
  const { id } = await params;

  const memorial = await getMemorialSeoRecord(id);

  if (!memorial) {
    notFound();
  }

  return <MemorialClient />;
}
