export type BrochureSection = {
  id: string;
  title: string;
  content: string;
};

export type BrochurePrivacy = "public" | "family";

export type BrochureStatus = "draft" | "published";

export type BrochureDraft = {
  id: string;
  name: string;
  dob: string;
  dod: string;
  bio: string;

  // Primary photograph used across the memorial,
  // preview and printed brochure.
  portraitUrl: string;

  sections: BrochureSection[];

  privacy: BrochurePrivacy;
  accessCode: string;

  // Publication lifecycle.
  status: BrochureStatus;
  publishedAt: string | null;

  updatedAt: string;
};
