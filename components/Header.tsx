"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const id = setInterval(onStoreChange, 1000);
  return () => clearInterval(id);
}

function formatClock(now: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

export function Header() {
  const now = useSyncExternalStore(subscribe, Date.now, () => 0);

  return (
    <header className="border-b border-[var(--line)] bg-[rgba(7,9,12,0.86)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-[var(--amber)] font-mono text-sm font-bold text-[#1a1406]">
            NL
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[0.22em]">
              NORTHLINE
            </span>
            <span className="block text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              City rail
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <p className="led hidden text-xl sm:block">
            {now ? formatClock(now) : "--:--:--"}
          </p>
          <Link
            href="/operator"
            className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--amber)]"
          >
            Operator
          </Link>
        </div>
      </div>
    </header>
  );
}
