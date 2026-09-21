import { getStatus } from "@/lib/store";

export async function GET() {
  return Response.json(getStatus());
}
