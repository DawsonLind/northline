import {
  createArrivals,
  findStation,
  LINES,
  nextArrivalFromTemplate,
  OFFLINE_STATIONS,
  STATIONS,
  WRONG_PLATFORMS,
} from "./seed";
import type {
  Arrival,
  Banner,
  DemoStatus,
  NetworkSnapshot,
  PublicArrival,
  ServiceMode,
  StationBoard,
  StationSummary,
} from "./types";

type State = {
  broken: boolean;
  mode: ServiceMode;
  frozenAt: number | null;
  stations: typeof STATIONS;
  arrivals: Arrival[];
};

const globalForStore = globalThis as typeof globalThis & {
  __northlineStore?: State;
};

function createHealthyState(now = Date.now()): State {
  return {
    broken: false,
    mode: "normal",
    frozenAt: null,
    stations: STATIONS,
    arrivals: createArrivals(now),
  };
}

function getState(): State {
  if (!globalForStore.__northlineStore) {
    globalForStore.__northlineStore = createHealthyState();
  }
  return globalForStore.__northlineStore;
}

function setState(next: State): State {
  globalForStore.__northlineStore = next;
  return next;
}

function bannerFor(mode: ServiceMode): Banner {
  if (mode === "disruption") {
    return {
      level: "disruption",
      message:
        "Disruption — signal failure on the Northline. Arrivals may be frozen, incorrect, or unavailable.",
    };
  }
  return {
    level: "normal",
    message: "Normal service on all Northline, Crossline, and Riverline routes.",
  };
}

function clockFor(state: State): number {
  return state.broken && state.frozenAt ? state.frozenAt : Date.now();
}

function replenishHealthy(state: State, now: number): void {
  const kept = state.arrivals.filter((arrival) => arrival.dueAt > now - 20_000);
  const byStation = new Map<string, Arrival[]>();
  for (const arrival of kept) {
    const list = byStation.get(arrival.stationId) ?? [];
    list.push(arrival);
    byStation.set(arrival.stationId, list);
  }

  const next: Arrival[] = [];
  for (const station of state.stations) {
    const current = (byStation.get(station.id) ?? []).sort(
      (a, b) => a.dueAt - b.dueAt,
    );
    while (current.length < 4) {
      current.push(nextArrivalFromTemplate(station.id, current, now));
    }
    next.push(...current);
  }
  state.arrivals = next;
}

function minutesUntil(dueAt: number, now: number): number {
  return Math.max(0, Math.round((dueAt - now) / 60_000));
}

function toPublicArrival(
  arrival: Arrival,
  now: number,
  broken: boolean,
  index: number,
): PublicArrival {
  const minutes = minutesUntil(arrival.dueAt, now);
  if (broken) {
    const lost = index % 3 === 0;
    return {
      id: arrival.id,
      line: arrival.line,
      lineName: LINES[arrival.line].name,
      destination: lost ? "SIGNAL LOST" : arrival.destination,
      platform: WRONG_PLATFORMS[arrival.platform] ?? "??",
      minutes: lost ? null : minutes,
      display: lost ? "—" : minutes === 0 ? "DUE" : `${minutes} min`,
      status: lost ? "error" : "delayed",
    };
  }

  return {
    id: arrival.id,
    line: arrival.line,
    lineName: LINES[arrival.line].name,
    destination: arrival.destination,
    platform: arrival.platform,
    minutes,
    display: minutes === 0 ? "Due" : `${minutes} min`,
    status: minutes === 0 ? "due" : "on-time",
  };
}

function arrivalsForStation(
  state: State,
  stationId: string,
  now: number,
): PublicArrival[] {
  if (state.broken && OFFLINE_STATIONS.includes(stationId as (typeof OFFLINE_STATIONS)[number])) {
    return [];
  }

  return state.arrivals
    .filter((arrival) => arrival.stationId === stationId)
    .sort((a, b) => a.dueAt - b.dueAt)
    .map((arrival, index) => toPublicArrival(arrival, now, state.broken, index));
}

function boardErrorFor(state: State, stationId: string): string | undefined {
  if (!state.broken) return undefined;
  if (stationId === "midtown") return "Board offline — signal failure";
  if (stationId === "university") return "No data — feed interrupted";
  return undefined;
}

export function getStatus(): DemoStatus {
  const state = getState();
  return { broken: state.broken, mode: state.mode };
}

export function injectBreak(): DemoStatus {
  const state = getState();
  if (state.broken) {
    return getStatus();
  }
  state.broken = true;
  state.mode = "disruption";
  state.frozenAt = Date.now();
  return getStatus();
}

export function resetService(): DemoStatus {
  setState(createHealthyState());
  return getStatus();
}

export function getNetwork(): NetworkSnapshot {
  const state = getState();
  const now = clockFor(state);
  if (!state.broken) {
    replenishHealthy(state, now);
  }

  const stations: StationSummary[] = state.stations.map((station) => {
    const arrivals = arrivalsForStation(state, station.id, now);
    const error = boardErrorFor(state, station.id);
    return {
      ...station,
      nextDueMinutes: arrivals[0]?.minutes ?? null,
      arrivalCount: arrivals.length,
      boardError: error,
    };
  });

  return {
    broken: state.broken,
    mode: state.mode,
    banner: bannerFor(state.mode),
    clock: now,
    stations,
  };
}

export function getStationBoard(id: string): StationBoard | null {
  const station = findStation(id);
  if (!station) return null;

  const state = getState();
  const now = clockFor(state);
  if (!state.broken) {
    replenishHealthy(state, now);
  }

  const error = boardErrorFor(state, id);
  return {
    broken: state.broken,
    mode: state.mode,
    banner: bannerFor(state.mode),
    clock: now,
    station,
    arrivals: arrivalsForStation(state, id, now),
    boardError: error,
  };
}
