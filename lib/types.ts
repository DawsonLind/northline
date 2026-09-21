export type ServiceMode = "normal" | "disruption";

export type LineId = "NL" | "CX" | "RL";

export type Station = {
  id: string;
  name: string;
  zone: number;
  interchange: boolean;
};

export type Arrival = {
  id: string;
  stationId: string;
  line: LineId;
  destination: string;
  platform: string;
  dueAt: number;
};

export type DemoStatus = {
  broken: boolean;
  mode: ServiceMode;
};

export type Banner = {
  level: ServiceMode;
  message: string;
};

export type PublicArrival = {
  id: string;
  line: LineId;
  lineName: string;
  destination: string;
  platform: string;
  minutes: number | null;
  display: string;
  status: "on-time" | "due" | "delayed" | "error";
};

export type StationSummary = Station & {
  nextDueMinutes: number | null;
  arrivalCount: number;
  boardError?: string;
};

export type NetworkSnapshot = {
  broken: boolean;
  mode: ServiceMode;
  banner: Banner;
  clock: number;
  stations: StationSummary[];
};

export type StationBoard = {
  broken: boolean;
  mode: ServiceMode;
  banner: Banner;
  clock: number;
  station: Station;
  arrivals: PublicArrival[];
  boardError?: string;
};
