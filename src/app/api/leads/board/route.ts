import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { listAllLeadsForUser, type BoardLeadItem } from "@/lib/leads/data";

export async function GET(): Promise<NextResponse<{ leads: BoardLeadItem[] } | { error: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const leads = await listAllLeadsForUser(user.id);
  return NextResponse.json({ leads });
}
