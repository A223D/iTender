export type FilterableValue = string | number | boolean;

export type JobRecord = {
  id: string;
  companyName: string;
  companyCategory: string;
  jobCategory: string;
  platform: string[];
  bidCount: number;
  auctionEndsInHours: number;
  maxBudget: number;
  brief: string;
  [key: string]: FilterableValue | FilterableValue[] | undefined;
};

export type FilterDefinition = {
  key: keyof JobRecord;
  label: string;
};
