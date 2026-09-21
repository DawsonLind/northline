import { ArrivalBoard } from "@/components/ArrivalBoard";
import { STATIONS } from "@/lib/seed";

export function generateStaticParams() {
  return STATIONS.map((station) => ({ id: station.id }));
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArrivalBoard stationId={id} />;
}
