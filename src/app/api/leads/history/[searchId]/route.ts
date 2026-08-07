import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { getSearchLeads } from "@/lib/leads/data";
import type { LeadResultItem } from "@/lib/leads/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ searchId: string }> },
): Promise<NextResponse<{ leads: LeadResultItem[] } | { error: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { searchId } = await params;
  const leads = await getSearchLeads(user.id, searchId);
  return NextResponse.json({ leads });
}
