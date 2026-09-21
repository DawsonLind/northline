"use client";

import Link from "next/link";
import { StatusBanner } from "@/components/StatusBanner";
import { useJson } from "@/lib/use-json";
import type { NetworkSnapshot } from "@/lib/types";

export function StationList() {
  const { data, error, loading } = useJson<NetworkSnapshot>("/api/stations");

  if (loading && !data) {
    return <p className="text-[var(--muted)]">Loading stations…</p>;
  }

  if (error || !data) {
    return <p className="text-[var(--red)]">{error ?? "No station data"}</p>;
  }

  return (
    <div className="space-y-6">
      <StatusBanner banner={data.banner} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.stations.map((station) => (
          <li key={station.id}>
            <Link
              href={`/stations/${station.id}`}
              className="block rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--amber-dim)] hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-wide">
                    {station.name}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    Zone {station.zone}
                    {station.interchange ? " · Interchange" : ""}
                  </p>
                </div>
                {station.boardError ? (
                  <span className="font-mono text-xs font-bold tracking-[0.14em] text-[var(--red)]">
                    OFFLINE
                  </span>
                ) : (
                  <span className="led text-right text-sm">
                    {station.nextDueMinutes === 0
                      ? "Due"
                      : station.nextDueMinutes == null
                        ? "—"
                        : `${station.nextDueMinutes} min`}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                {station.boardError
                  ? station.boardError
                  : `${station.arrivalCount} upcoming`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
