export type SourceCity =
  | "Bengaluru"
  | "Mumbai"
  | "Delhi"
  | "Chennai"
  | "Hyderabad"
  | "Kolkata"
  | "Pune"
  | "Ahmedabad"
  | "Kochi"
  | "Lucknow"
  | "Chandigarh"
  | "Guwahati"
  | "Bhubaneswar"
  | "Indore"
  | "Coimbatore";

export type DestinationSlug =
  | "goa"
  | "jaipur"
  | "udaipur"
  | "rishikesh"
  | "varanasi"
  | "andaman"
  | "darjeeling"
  | "leh"
  | "amritsar"
  | "kozhikode"
  | "chennai"
  | "hyderabad";

export type TripStyle =
  | "Relaxed"
  | "Adventure"
  | "Food"
  | "Nightlife"
  | "Family"
  | "Luxury";

export type FlightOption = {
  id: string;
  label: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  durationMinutes: number;
  price: number;
  tag: string;
  reason: string;
};

export type StayOption = {
  id: string;
  name: string;
  area: string;
  nightlyPrice: number;
  tag: string;
  reason: string;
  image?: string;
  bookingUrl?: string;
  rating?: number;
};

export type TransferOption = {
  id: string;
  label: string;
  duration: string;
  durationMinutes: number;
  cost: number;
  reason: string;
};

export type ActivityOption = {
  id: string;
  name: string;
  description: string;
  duration: string;
  durationMinutes: number;
  cost: number;
  tag: string;
  /** Open search / marketplace (e.g. Thrillophilia-style tours) — not scraped in-app. */
  exploreUrl?: string;
};

export type DestinationContent = {
  slug: DestinationSlug;
  name: string;
  summary: string;
  bestFor: string;
  image: string;
  imageCredit: string;
  famousPlaces: string[];
  activities: ActivityOption[];
  outboundFlights?: Record<string, FlightOption[]>;
  returnFlights?: Record<string, FlightOption[]>;
  stays?: StayOption[];
  transfers?: Record<string, TransferOption>;
};

export type TripBasics = {
  sourceCity: SourceCity;
  destination: DestinationSlug;
  startDate: string;
  days: number;
  budget: number;
  travelers: number;
  style: TripStyle;
};

export type PlannerSelections = {
  outboundFlightId?: string;
  stayId?: string;
  transferId?: string;
  activityIds: string[];
  returnFlightId?: string;
};

export type PlannerPlan = {
  basics: TripBasics;
  destination: DestinationContent;
  selections: PlannerSelections;
};

export type SummaryPlan = {
  basics: TripBasics;
  outbound?: FlightOption;
  stay?: StayOption;
  stayTotal: number;
  transfer?: TransferOption;
  activities: ActivityOption[];
  returnFlight?: FlightOption;
  total: number;
  perPerson: number;
  totalDurationMinutes: number;
};
