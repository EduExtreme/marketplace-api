"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { apiProviders, providerCredentials } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { encryptSecret, previewSecret } from "@/lib/credentials/encryption";
import { CREDENTIAL_ERROR_CODES, type CredentialActionState } from "@/lib/credentials/errors";

const credentialSchema = z.object({
  apiProviderId: z.string().trim().min(1),
  secretValue: z.string().trim().min(8),
  tokenValue: z.union([z.string().trim().min(8), z.literal("")]).optional(),
});

export async function updateProviderCredential(
  _prevState: CredentialActionState | undefined,
  formData: FormData,
): Promise<CredentialActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { errorCode: CREDENTIAL_ERROR_CODES.forbidden };
  }

  const parsed = credentialSchema.safeParse({
    apiProviderId: formData.get("apiProviderId"),
    secretValue: formData.get("secretValue"),
    tokenValue: formData.get("tokenValue"),
  });

  if (!parsed.success) {
    return { errorCode: CREDENTIAL_ERROR_CODES.validationError };
  }

  const { apiProviderId, secretValue, tokenValue } = parsed.data;

  const [provider] = await db
    .select({ id: apiProviders.id })
    .from(apiProviders)
    .where(eq(apiProviders.id, apiProviderId))
    .limit(1);

  if (!provider) {
    return { errorCode: CREDENTIAL_ERROR_CODES.validationError };
  }

  const ciphertext = encryptSecret(secretValue);
  const secretPreview = previewSecret(secretValue);
  const tokenUpdate = tokenValue
    ? { tokenCiphertext: encryptSecret(tokenValue), tokenPreview: previewSecret(tokenValue) }
    : {};

  await db
    .insert(providerCredentials)
    .values({ apiProviderId, ciphertext, secretPreview, ...tokenUpdate })
    .onConflictDoUpdate({
      target: providerCredentials.apiProviderId,
      set: { ciphertext, secretPreview, updatedAt: new Date(), ...tokenUpdate },
    });

  revalidatePath("/account/admin");

  return { errorCode: null, successApiProviderId: apiProviderId };
}
