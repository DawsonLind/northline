"use client";

import Link from "next/link";
import { LineBadge } from "@/components/LineBadge";
import { StatusBanner } from "@/components/StatusBanner";
import { useJson } from "@/lib/use-json";
import type { StationBoard } from "@/lib/types";

export function ArrivalBoard({ stationId }: { stationId: string }) {
  const { data, error, loading } = useJson<StationBoard>(
    `/api/stations/${stationId}`,
    3000,
  );

  if (loading && !data) {
    return <p className="text-[var(--muted)]">Loading board…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-[var(--red)]">{error ?? "Station not found"}</p>
        <Link href="/" className="text-sm text-[var(--amber)]">
          ← All stations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--amber)]"
          >
            ← All stations
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.08em] uppercase">
            {data.station.name}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Zone {data.station.zone}
            {data.station.interchange ? " · Interchange" : ""}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Departures
        </p>
      </div>

      <StatusBanner banner={data.banner} />

      {data.boardError ? (
        <div className="rounded-sm border border-[var(--red)] bg-[rgba(255,90,79,0.08)] px-4 py-10 text-center">
          <p className="font-mono text-xs tracking-[0.22em] text-[var(--red)] uppercase">
            Board error
          </p>
          <p className="mt-3 text-lg">{data.boardError}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <thead className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Line</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Plat</th>
                <th className="px-4 py-3 text-right font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {data.arrivals.map((arrival) => (
                <tr
                  key={arrival.id}
                  className="border-b border-[var(--line)] last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <LineBadge line={arrival.line} />
                  </td>
                  <td
                    className={`px-4 py-3 text-base ${
                      arrival.status === "error"
                        ? "text-[var(--red)]"
                        : "text-[var(--fg)]"
                    }`}
                  >
                    {arrival.destination}
                  </td>
                  <td className="led px-4 py-3">{arrival.platform}</td>
                  <td
                    className={`led px-4 py-3 text-right ${
                      arrival.status === "error"
                        ? "text-[var(--red)]"
                        : arrival.status === "due"
                          ? "text-[var(--green)]"
                          : ""
                    }`}
                  >
                    {arrival.display}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
