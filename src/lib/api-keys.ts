import "server-only";

import { randomBytes } from "node:crypto";

export function generateApiKey(): string {
  return `sk_live_${randomBytes(24).toString("hex")}`;
}
