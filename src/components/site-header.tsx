import { getCurrentUser } from "@/lib/auth/dal";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return <SiteHeaderClient user={user ? { email: user.email, role: user.role } : null} />;
}
