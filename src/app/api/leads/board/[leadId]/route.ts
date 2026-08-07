import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/dal";
import { updateLeadQualificationStatus } from "@/lib/leads/data";

const bodySchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "discarded"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { leadId } = await params;
  const updated = await updateLeadQualificationStatus(user.id, leadId, parsed.data.status);
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
