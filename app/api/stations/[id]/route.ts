import { getStationBoard } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const board = getStationBoard(id);
  if (!board) {
    return Response.json({ error: "Station not found" }, { status: 404 });
  }
  return Response.json(board);
}
