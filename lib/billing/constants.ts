export const GENERATION_FEATURE = "site_generations";
export const TOP_UP_PLAN_ID = "generation_top_up";

export type TopUpPack = {
  id: string;
  generations: number;
  priceLabel: string;
  hint?: string;
};

export const TOP_UP_PACKS: TopUpPack[] = [
  {
    id: "pack_25",
    generations: 25,
    priceLabel: "$5",
    hint: "Quick boost",
  },
  {
    id: "pack_100",
    generations: 100,
    priceLabel: "$20",
    hint: "Most popular",
  },
  {
    id: "pack_250",
    generations: 250,
    priceLabel: "$50",
    hint: "Best value",
  },
];
