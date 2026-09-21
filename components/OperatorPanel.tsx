"use client";

import { useState } from "react";
import { StatusBanner } from "@/components/StatusBanner";
import { useJson } from "@/lib/use-json";
import type { DemoStatus, NetworkSnapshot } from "@/lib/types";

export function OperatorPanel() {
  const { data, error, loading } = useJson<NetworkSnapshot>("/api/stations", 2000);
  const [pending, setPending] = useState<"break" | "reset" | null>(null);
  const [last, setLast] = useState<DemoStatus | null>(null);

  async function post(path: "/api/demo/break" | "/api/demo/reset") {
    const action = path.endsWith("break") ? "break" : "reset";
    setPending(action);
    try {
      const response = await fetch(path, { method: "POST" });
      const json = (await response.json()) as DemoStatus;
      setLast(json);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Control room
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide">Operator</h1>
      </div>

      {loading && !data ? (
        <p className="text-[var(--muted)]">Reading network state…</p>
      ) : error || !data ? (
        <p className="text-[var(--red)]">{error ?? "No feed"}</p>
      ) : (
        <>
          <StatusBanner banner={data.banner} />
          <div className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Current mode
            </p>
            <p className="led mt-2 text-2xl uppercase">{data.mode}</p>
            <p className="mt-2 font-mono text-sm text-[var(--muted)]">
              broken: {String(data.broken)}
            </p>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void post("/api/demo/break")}
          className="rounded-sm border border-[var(--red)] bg-[rgba(255,90,79,0.12)] px-4 py-2 text-sm uppercase tracking-[0.14em] text-[#ffd2ce] disabled:opacity-50"
        >
          {pending === "break" ? "Injecting…" : "Inject disruption"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void post("/api/demo/reset")}
          className="rounded-sm border border-[rgba(61,214,140,0.4)] bg-[rgba(61,214,140,0.1)] px-4 py-2 text-sm uppercase tracking-[0.14em] text-[#c8f5de] disabled:opacity-50"
        >
          {pending === "reset" ? "Resetting…" : "Reset network"}
        </button>
      </div>

      {last ? (
        <pre className="overflow-x-auto rounded-sm border border-[var(--line)] bg-[var(--surface-2)] p-3 font-mono text-xs text-[var(--muted)]">
          {JSON.stringify(last, null, 2)}
        </pre>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        These buttons call the same HTTP endpoints Demo Director uses:{" "}
        <code className="font-mono text-[var(--amber)]">POST /api/demo/break</code>{" "}
        and{" "}
        <code className="font-mono text-[var(--amber)]">POST /api/demo/reset</code>.
      </p>
    </div>
  );
}
