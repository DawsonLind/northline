import type { Arrival, LineId, Station } from "./types";

export const LINES: Record<
  LineId,
  { id: LineId; name: string; color: string }
> = {
  NL: { id: "NL", name: "Northline", color: "#f5a623" },
  CX: { id: "CX", name: "Crossline", color: "#2ec4b6" },
  RL: { id: "RL", name: "Riverline", color: "#4c8dff" },
};

export const STATIONS: Station[] = [
  { id: "harborfront", name: "Harborfront", zone: 1, interchange: true },
  { id: "civic-center", name: "Civic Center", zone: 1, interchange: false },
  { id: "midtown", name: "Midtown", zone: 1, interchange: true },
  { id: "university", name: "University", zone: 2, interchange: false },
  { id: "riverside", name: "Riverside", zone: 2, interchange: false },
  { id: "westgate", name: "Westgate", zone: 2, interchange: true },
  { id: "oakridge", name: "Oakridge", zone: 3, interchange: false },
  { id: "north-terminal", name: "North Terminal", zone: 3, interchange: true },
];

export type ArrivalTemplate = {
  line: LineId;
  destination: string;
  platform: string;
  offsetMinutes: number;
};

export const ARRIVAL_TEMPLATES: Record<string, ArrivalTemplate[]> = {
  harborfront: [
    { line: "NL", destination: "North Terminal", platform: "2", offsetMinutes: 2 },
    { line: "CX", destination: "Westgate", platform: "1", offsetMinutes: 5 },
    { line: "NL", destination: "Oakridge", platform: "2", offsetMinutes: 8 },
    { line: "RL", destination: "Riverside", platform: "3", offsetMinutes: 11 },
    { line: "NL", destination: "North Terminal", platform: "1", offsetMinutes: 16 },
    { line: "CX", destination: "Midtown", platform: "1", offsetMinutes: 19 },
  ],
  "civic-center": [
    { line: "NL", destination: "North Terminal", platform: "2", offsetMinutes: 1 },
    { line: "NL", destination: "Harborfront", platform: "1", offsetMinutes: 4 },
    { line: "CX", destination: "Westgate", platform: "3", offsetMinutes: 7 },
    { line: "NL", destination: "Oakridge", platform: "2", offsetMinutes: 12 },
    { line: "RL", destination: "Riverside", platform: "4", offsetMinutes: 15 },
  ],
  midtown: [
    { line: "NL", destination: "North Terminal", platform: "3", offsetMinutes: 3 },
    { line: "CX", destination: "Harborfront", platform: "1", offsetMinutes: 6 },
    { line: "NL", destination: "Harborfront", platform: "2", offsetMinutes: 9 },
    { line: "CX", destination: "Westgate", platform: "4", offsetMinutes: 13 },
    { line: "RL", destination: "Riverside", platform: "1", offsetMinutes: 18 },
  ],
  university: [
    { line: "NL", destination: "North Terminal", platform: "2", offsetMinutes: 2 },
    { line: "NL", destination: "Harborfront", platform: "1", offsetMinutes: 6 },
    { line: "CX", destination: "Westgate", platform: "3", offsetMinutes: 10 },
    { line: "NL", destination: "Oakridge", platform: "2", offsetMinutes: 14 },
    { line: "CX", destination: "Midtown", platform: "3", offsetMinutes: 20 },
  ],
  riverside: [
    { line: "RL", destination: "Harborfront", platform: "1", offsetMinutes: 3 },
    { line: "NL", destination: "North Terminal", platform: "2", offsetMinutes: 6 },
    { line: "RL", destination: "Westgate", platform: "3", offsetMinutes: 9 },
    { line: "NL", destination: "Harborfront", platform: "1", offsetMinutes: 13 },
    { line: "CX", destination: "Midtown", platform: "4", offsetMinutes: 17 },
  ],
  westgate: [
    { line: "CX", destination: "Harborfront", platform: "1", offsetMinutes: 1 },
    { line: "NL", destination: "North Terminal", platform: "3", offsetMinutes: 4 },
    { line: "NL", destination: "Harborfront", platform: "2", offsetMinutes: 8 },
    { line: "CX", destination: "Midtown", platform: "1", offsetMinutes: 12 },
    { line: "RL", destination: "Riverside", platform: "4", offsetMinutes: 16 },
  ],
  oakridge: [
    { line: "NL", destination: "North Terminal", platform: "2", offsetMinutes: 2 },
    { line: "NL", destination: "Harborfront", platform: "1", offsetMinutes: 7 },
    { line: "CX", destination: "Westgate", platform: "3", offsetMinutes: 11 },
    { line: "NL", destination: "Midtown", platform: "1", offsetMinutes: 15 },
  ],
  "north-terminal": [
    { line: "NL", destination: "Harborfront", platform: "1", offsetMinutes: 3 },
    { line: "NL", destination: "Civic Center", platform: "2", offsetMinutes: 7 },
    { line: "CX", destination: "Westgate", platform: "4", offsetMinutes: 10 },
    { line: "NL", destination: "Midtown", platform: "1", offsetMinutes: 14 },
    { line: "RL", destination: "Riverside", platform: "3", offsetMinutes: 18 },
  ],
};

export const OFFLINE_STATIONS = ["midtown", "university"] as const;

export const WRONG_PLATFORMS: Record<string, string> = {
  "1": "4",
  "2": "1",
  "3": "2",
  "4": "3",
};

const CYCLE_MINUTES = 14;

export function createArrivals(now: number): Arrival[] {
  const arrivals: Arrival[] = [];
  for (const station of STATIONS) {
    const templates = ARRIVAL_TEMPLATES[station.id] ?? [];
    templates.forEach((template, index) => {
      arrivals.push({
        id: `${station.id}-${index}`,
        stationId: station.id,
        line: template.line,
        destination: template.destination,
        platform: template.platform,
        dueAt: now + template.offsetMinutes * 60_000,
      });
    });
  }
  return arrivals;
}

export function nextArrivalFromTemplate(
  stationId: string,
  existing: Arrival[],
  now: number,
): Arrival {
  const templates = ARRIVAL_TEMPLATES[stationId] ?? [];
  const nextIndex = existing.length;
  const template = templates[nextIndex % templates.length];
  const lastDue = existing.reduce(
    (max, arrival) => Math.max(max, arrival.dueAt),
    now,
  );
  return {
    id: `${stationId}-${now}-${nextIndex}`,
    stationId,
    line: template.line,
    destination: template.destination,
    platform: template.platform,
    dueAt: lastDue + CYCLE_MINUTES * 60_000,
  };
}

export function findStation(id: string): Station | undefined {
  return STATIONS.find((station) => station.id === id);
}
