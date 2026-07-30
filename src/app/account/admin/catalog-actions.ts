"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { apiEndpoints, apiProviders, httpMethod, providerCredentials, purchases } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { stripeAdmin } from "@/lib/stripe/admin-client";
import { slugify } from "@/lib/utils";
import { encryptSecret, previewSecret } from "@/lib/credentials/encryption";
import { CATALOG_ERROR_CODES, type CatalogActionState, type DeleteProviderActionState } from "@/lib/catalog/errors";
import type { ApiCategoryId } from "@/lib/types";

const DEFAULT_CATEGORY_ID: ApiCategoryId = "utilidades";

const methodValues = httpMethod.enumValues;

const endpointSchema = z.object({
  method: z.enum(methodValues),
  path: z.string().trim().min(1),
});

const createProviderSchema = z.object({
  name: z.string().trim().min(2),
  baseUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  apiKey: z.string().trim().min(8),
  token: z.union([z.string().trim().min(8), z.literal("")]).optional(),
  unlockPriceBRL: z.coerce.number().positive(),
  endpoints: z.array(endpointSchema).min(1),
});

export async function createApiProvider(
  _prevState: CatalogActionState | undefined,
  formData: FormData,
): Promise<CatalogActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { errorCode: CATALOG_ERROR_CODES.forbidden };
  }

  let endpointsInput: unknown;
  try {
    endpointsInput = JSON.parse(String(formData.get("endpoints") ?? "[]"));
  } catch {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const parsed = createProviderSchema.safeParse({
    name: formData.get("name"),
    baseUrl: formData.get("baseUrl"),
    apiKey: formData.get("apiKey"),
    token: formData.get("token"),
    unlockPriceBRL: formData.get("unlockPriceBRL"),
    endpoints: endpointsInput,
  });

  if (!parsed.success) {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const { name, baseUrl, apiKey, token, unlockPriceBRL, endpoints } = parsed.data;
  const id = slugify(name);

  if (!id) {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const [existing] = await db.select({ id: apiProviders.id }).from(apiProviders).where(eq(apiProviders.id, id)).limit(1);
  if (existing) {
    return { errorCode: CATALOG_ERROR_CODES.duplicateId };
  }

  const shortDescription = `Acesso à API ${name}.`;
  const longDescription = `Integração com a API ${name}, cadastrada pelo administrador.`;
  const unlockPriceCents = Math.round(unlockPriceBRL * 100);

  let stripePriceId: string;
  try {
    const product = await stripeAdmin.products.create({
      name,
      description: shortDescription,
      metadata: { apiProviderId: id },
    });
    const price = await stripeAdmin.prices.create({
      product: product.id,
      currency: "brl",
      unit_amount: unlockPriceCents,
      recurring: { interval: "month" },
      metadata: { apiProviderId: id },
    });
    stripePriceId = price.id;
  } catch {
    return { errorCode: CATALOG_ERROR_CODES.stripeError };
  }

  const ciphertext = encryptSecret(apiKey);
  const secretPreview = previewSecret(apiKey);
  const tokenCiphertext = token ? encryptSecret(token) : null;
  const tokenPreview = token ? previewSecret(token) : null;

  await db.batch([
    db.insert(apiProviders).values({
      id,
      name,
      shortDescription,
      longDescription,
      baseUrl: baseUrl || null,
      categoryId: DEFAULT_CATEGORY_ID,
      unlockPriceCents,
      stripePriceId,
    }),
    db.insert(apiEndpoints).values(
      endpoints.map((endpoint, index) => ({
        apiProviderId: id,
        method: endpoint.method,
        path: endpoint.path,
        description: "",
        sortOrder: index,
      })),
    ),
    db.insert(providerCredentials).values({ apiProviderId: id, ciphertext, secretPreview, tokenCiphertext, tokenPreview }),
  ]);

  revalidatePath("/account/admin");
  revalidatePath("/");

  return { errorCode: null, createdApiProviderId: id };
}

const updateProviderSchema = z.object({
  apiProviderId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  baseUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  apiKey: z.union([z.string().trim().min(8), z.literal("")]).optional(),
  token: z.union([z.string().trim().min(8), z.literal("")]).optional(),
  unlockPriceBRL: z.coerce.number().positive(),
  endpoints: z.array(endpointSchema).min(1),
});

export async function updateApiProvider(
  _prevState: CatalogActionState | undefined,
  formData: FormData,
): Promise<CatalogActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { errorCode: CATALOG_ERROR_CODES.forbidden };
  }

  let endpointsInput: unknown;
  try {
    endpointsInput = JSON.parse(String(formData.get("endpoints") ?? "[]"));
  } catch {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const parsed = updateProviderSchema.safeParse({
    apiProviderId: formData.get("apiProviderId"),
    name: formData.get("name"),
    baseUrl: formData.get("baseUrl"),
    apiKey: formData.get("apiKey"),
    token: formData.get("token"),
    unlockPriceBRL: formData.get("unlockPriceBRL"),
    endpoints: endpointsInput,
  });

  if (!parsed.success) {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const { apiProviderId, name, baseUrl, apiKey, token, unlockPriceBRL, endpoints } = parsed.data;

  const [provider] = await db.select().from(apiProviders).where(eq(apiProviders.id, apiProviderId)).limit(1);
  if (!provider) {
    return { errorCode: CATALOG_ERROR_CODES.notFound };
  }

  const shortDescription = `Acesso à API ${name}.`;
  const longDescription = `Integração com a API ${name}, cadastrada pelo administrador.`;
  const unlockPriceCents = Math.round(unlockPriceBRL * 100);

  let stripePriceId = provider.stripePriceId;
  try {
    const currentPrice = await stripeAdmin.prices.retrieve(provider.stripePriceId);
    const productId = typeof currentPrice.product === "string" ? currentPrice.product : currentPrice.product.id;

    await stripeAdmin.products.update(productId, { name, description: shortDescription });

    if (unlockPriceCents !== provider.unlockPriceCents) {
      const newPrice = await stripeAdmin.prices.create({
        product: productId,
        currency: "brl",
        unit_amount: unlockPriceCents,
        recurring: { interval: "month" },
        metadata: { apiProviderId },
      });
      // A price can't be archived while it's still the product's default_price, so the
      // new price must take over that role before the old one is archived.
      await stripeAdmin.products.update(productId, { default_price: newPrice.id });
      await stripeAdmin.prices.update(provider.stripePriceId, { active: false });
      stripePriceId = newPrice.id;
    }
  } catch {
    return { errorCode: CATALOG_ERROR_CODES.stripeError };
  }

  const credentialUpdate = {
    ...(apiKey ? { ciphertext: encryptSecret(apiKey), secretPreview: previewSecret(apiKey) } : {}),
    ...(token ? { tokenCiphertext: encryptSecret(token), tokenPreview: previewSecret(token) } : {}),
  };

  await db.batch([
    db
      .update(apiProviders)
      .set({
        name,
        baseUrl: baseUrl || null,
        shortDescription,
        longDescription,
        unlockPriceCents,
        stripePriceId,
        updatedAt: new Date(),
      })
      .where(eq(apiProviders.id, apiProviderId)),
    db.delete(apiEndpoints).where(eq(apiEndpoints.apiProviderId, apiProviderId)),
    db.insert(apiEndpoints).values(
      endpoints.map((endpoint, index) => ({
        apiProviderId,
        method: endpoint.method,
        path: endpoint.path,
        description: "",
        sortOrder: index,
      })),
    ),
  ]);

  if (Object.keys(credentialUpdate).length > 0) {
    await db
      .update(providerCredentials)
      .set({ ...credentialUpdate, updatedAt: new Date() })
      .where(eq(providerCredentials.apiProviderId, apiProviderId));
  }

  revalidatePath("/account/admin");
  revalidatePath("/");

  return { errorCode: null, updatedApiProviderId: apiProviderId };
}

const deleteProviderSchema = z.object({
  apiProviderId: z.string().trim().min(1),
});

export async function deleteApiProvider(
  _prevState: DeleteProviderActionState | undefined,
  formData: FormData,
): Promise<DeleteProviderActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { errorCode: CATALOG_ERROR_CODES.forbidden };
  }

  const parsed = deleteProviderSchema.safeParse({ apiProviderId: formData.get("apiProviderId") });
  if (!parsed.success) {
    return { errorCode: CATALOG_ERROR_CODES.validationError };
  }

  const { apiProviderId } = parsed.data;

  const [provider] = await db
    .select({ id: apiProviders.id, stripePriceId: apiProviders.stripePriceId })
    .from(apiProviders)
    .where(eq(apiProviders.id, apiProviderId))
    .limit(1);

  if (!provider) {
    return { errorCode: CATALOG_ERROR_CODES.notFound };
  }

  const [activeSubscription] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.apiProviderId, apiProviderId), eq(purchases.status, "paid")))
    .limit(1);

  if (activeSubscription) {
    return { errorCode: CATALOG_ERROR_CODES.hasActiveSubscriptions };
  }

  try {
    const price = await stripeAdmin.prices.retrieve(provider.stripePriceId);
    const productId = typeof price.product === "string" ? price.product : price.product.id;
    // The price can't be archived directly because it's still the product's default_price —
    // archiving the product itself is enough to pull it out of circulation.
    await stripeAdmin.products.update(productId, { active: false });
  } catch {
    return { errorCode: CATALOG_ERROR_CODES.stripeError };
  }

  await db.batch([
    db.delete(providerCredentials).where(eq(providerCredentials.apiProviderId, apiProviderId)),
    db.delete(apiProviders).where(eq(apiProviders.id, apiProviderId)),
  ]);

  revalidatePath("/account/admin");
  revalidatePath("/");

  return { errorCode: null, deletedApiProviderId: apiProviderId };
}
