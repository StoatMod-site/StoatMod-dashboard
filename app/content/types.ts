export type ContentStep = {
  title: string;
  text: string;
  command?: string;
};

export type ContentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: ContentStep[];
  commands?: { command: string; description: string }[];
  note?: string;
  links?: { href: string; label: string }[];
};

export type ContentPage = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  lede: string;
  updated: string;
  sections: ContentSection[];
  related: string[];
};
