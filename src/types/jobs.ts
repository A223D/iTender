export type FilterableValue = string | number | boolean;

export type Campaign = {
  id: string;
  title: string;
  description: string;
  content_types: string[];      // e.g. ["Instagram Reel", "TikTok"]
  occasion: string;             // e.g. "New menu", "Grand opening"
  compensation_type: string;    // "paid" | "product" | "paid_product" | "affiliate" | "negotiable" | "free_meal"
  compensation_details: string; // free-text, e.g. "Free dinner for 2 + $100"
  creators_needed: number;
  deadline: string;             // ISO date "YYYY-MM-DD"
  interested_count: number;
  brand_name: string;
  brand_categories: string[];
  days_left: number;            // computed from deadline
  [key: string]: FilterableValue | FilterableValue[] | undefined;
};

export type FilterDefinition = {
  key: keyof Campaign;
  label: string;
};
