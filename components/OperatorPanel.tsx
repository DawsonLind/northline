"use client";

import { useState } from "react";
import { ArrivalBoard } from "@/components/ArrivalBoard";
import { useJson } from "@/lib/use-json";
import type { DemoStatus } from "@/lib/types";

const PREVIEW_STATION = "harborfront";

type ActionName = "break" | "reset";

type ActionResult = {
  action: ActionName;
  ok: boolean;
  detail: string;
};

function label(action: ActionName) {
  return action === "break" ? "Break" : "Reset";
}

export function OperatorPanel() {
  const {
    data: status,
    error: statusError,
    loading: statusLoading,
    reload: reloadStatus,
  } = useJson<DemoStatus>("/api/demo/status", 2000);
  const [pending, setPending] = useState<ActionName | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [previewToken, setPreviewToken] = useState(0);

  async function post(path: "/api/demo/break" | "/api/demo/reset") {
    const action: ActionName = path.endsWith("break") ? "break" : "reset";
    const started = performance.now();
    setPending(action);
    setResult(null);
    try {
      const response = await fetch(path, { method: "POST" });
      if (!response.ok) {
        setResult({
          action,
          ok: false,
          detail: `${label(action)} failed (${response.status}).`,
        });
        return;
      }

      const json = (await response.json()) as DemoStatus;
      const applied =
        action === "break"
          ? json.broken && json.mode === "disruption"
          : !json.broken && json.mode === "normal";
      setResult({
        action,
        ok: applied,
        detail: applied
          ? action === "break"
            ? "Break succeeded. Status is disruption."
            : "Reset succeeded. Status is healthy."
          : `${label(action)} returned an unexpected status (${json.mode}).`,
      });
    } catch {
      setResult({
        action,
        ok: false,
        detail: `${label(action)} failed. The demo API did not respond.`,
      });
    } finally {
      // The in-memory demo API answers before the next paint, so hold the
      // pending label long enough for the operator to see the in-flight state.
      const remaining = 350 - (performance.now() - started);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setPending(null);
      setPreviewToken((token) => token + 1);
      await reloadStatus();
    }
  }

  const disrupted = status?.mode === "disruption";
  const feedback =
    pending === "break"
      ? "Break in progress…"
      : pending === "reset"
        ? "Reset in progress…"
        : (result?.detail ?? "");

  return (
    <div className="space-y-6">
      <div className="rounded-sm border-2 border-[var(--amber)] bg-[rgba(245,197,66,0.16)] px-4 py-4">
        <p className="font-mono text-sm font-bold tracking-[0.22em] text-[var(--amber)] uppercase">
          Demo mode — not live operations
        </p>
        <p className="mt-2 max-w-3xl text-sm text-[var(--fg)]">
          Break and Reset change this in-memory arrivals demo only. They are
          not railway controls and do not affect a live network.
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Control room
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide">Operator</h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Demo status
            </p>
            {statusLoading && !status ? (
              <p className="mt-2 text-[var(--muted)]">Reading demo status…</p>
            ) : statusError || !status ? (
              <p className="mt-2 text-[var(--red)]">
                {statusError ?? "No status"}
              </p>
            ) : (
              <>
                <p
                  className={`mt-2 text-2xl uppercase ${
                    disrupted
                      ? "font-mono text-[var(--red)]"
                      : "led"
                  }`}
                >
                  {status.mode}
                </p>
                <p className="mt-2 font-mono text-sm text-[var(--muted)]">
                  broken: {String(status.broken)}
                </p>
              </>
            )}
            <p className="mt-3 font-mono text-[11px] tracking-wide text-[var(--muted)]">
              GET /api/demo/status
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending !== null}
              aria-busy={pending === "break"}
              onClick={() => void post("/api/demo/break")}
              className="rounded-sm border border-[var(--red)] bg-[rgba(255,90,79,0.12)] px-4 py-2 text-sm uppercase tracking-[0.14em] text-[#ffd2ce] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amber)] disabled:opacity-50"
            >
              {pending === "break" ? "Breaking…" : "Break"}
            </button>
            <button
              type="button"
              disabled={pending !== null}
              aria-busy={pending === "reset"}
              onClick={() => void post("/api/demo/reset")}
              className="rounded-sm border border-[rgba(61,214,140,0.4)] bg-[rgba(61,214,140,0.1)] px-4 py-2 text-sm uppercase tracking-[0.14em] text-[#c8f5de] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amber)] disabled:opacity-50"
            >
              {pending === "reset" ? "Resetting…" : "Reset"}
            </button>
          </div>

          <p
            aria-live="polite"
            className={`min-h-6 text-sm ${
              pending
                ? "text-[var(--amber)]"
                : result
                  ? result.ok
                    ? "text-[var(--green)]"
                    : "text-[var(--red)]"
                  : "text-[var(--muted)]"
            }`}
          >
            {feedback}
          </p>

          <p className="text-xs text-[var(--muted)]">
            Same endpoints as the demo scripts:{" "}
            <code className="font-mono text-[var(--amber)]">
              POST /api/demo/break
            </code>{" "}
            and{" "}
            <code className="font-mono text-[var(--amber)]">
              POST /api/demo/reset
            </code>
            .
          </p>
        </div>

        <div className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Board preview
          </p>
          <div className="mt-4">
            <ArrivalBoard
              stationId={PREVIEW_STATION}
              embedded
              refreshToken={previewToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
