export type PricingPlan = {
  id: string;
  name: string;
  priceGhs: number;
  storageGb: number;
  audience: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "personal",
    name: "Personal",
    priceGhs: 49.99,
    storageGb: 10,
    audience: "For your own memories and milestones",
    description: "A personal space to collect the moments and stories that matter to you.",
    features: ["10 GB personal storage", "Personal memory collection", "Photos, videos and written stories", "Control over what you share"],
  },
  {
    id: "personal-plus",
    name: "Personal Plus",
    priceGhs: 99.99,
    storageGb: 50,
    audience: "For a richer personal archive",
    description: "More room to preserve the experiences, people and chapters of your life.",
    features: ["50 GB personal storage", "Everything in Personal", "More room for photos and videos", "A growing personal archive"],
    highlighted: true,
  },
  {
    id: "family",
    name: "Family",
    priceGhs: 124.99,
    storageGb: 100,
    audience: "For families preserving stories together",
    description: "A shared family space for memories, milestones and stories across generations.",
    features: ["100 GB shared family storage", "Shared family collection", "Invite family members to contribute", "Members keep their own private spaces"],
  },
  {
    id: "family-legacy",
    name: "Family Legacy",
    priceGhs: 249.99,
    storageGb: 250,
    audience: "For a deeper family history",
    description: "More shared capacity for a growing collection of family stories and memories.",
    features: ["250 GB shared family storage", "Everything in Family", "More room for family photos and videos", "A larger shared family archive"],
  },
];

export const formatGhs = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
