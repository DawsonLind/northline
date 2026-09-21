import { getNetwork } from "@/lib/store";

export async function GET() {
  return Response.json(getNetwork());
}
