import { StationList } from "@/components/StationList";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          Network
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide">Stations</h1>
      </div>
      <StationList />
    </div>
  );
}
