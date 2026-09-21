import type { Banner } from "@/lib/types";

export function StatusBanner({ banner }: { banner: Banner }) {
  const disruption = banner.level === "disruption";

  return (
    <div
      role="status"
      className={`rounded-sm border px-4 py-3 text-sm ${
        disruption
          ? "pulse-red border-[var(--red)] bg-[rgba(255,90,79,0.12)] text-[#ffd2ce]"
          : "border-[rgba(61,214,140,0.35)] bg-[rgba(61,214,140,0.08)] text-[#c8f5de]"
      }`}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className={`font-mono text-[11px] font-bold tracking-[0.2em] uppercase ${
            disruption ? "text-[var(--red)]" : "text-[var(--green)]"
          }`}
        >
          {disruption ? "Disruption" : "Normal"}
        </span>
        <span>{banner.message}</span>
      </p>
    </div>
  );
}
