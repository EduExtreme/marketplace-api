import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { GoogleMapsPlaceItem } from "@/lib/leads/types";

export const purchaseStatus = pgEnum("purchase_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "canceled",
]);

export const userRole = pgEnum("user_role", ["customer", "admin"]);
export type UserRole = (typeof userRole.enumValues)[number];

export const apiCategoryId = pgEnum("api_category_id", [
  "dados",
  "financeiro",
  "geolocalizacao",
  "comunicacao",
  "utilidades",
]);

export const httpMethod = pgEnum("http_method", ["GET", "POST", "PUT", "PATCH", "DELETE"]);

export const creditTransactionType = pgEnum("credit_transaction_type", [
  "subscription_grant",
  "purchase",
  "search_debit",
  "refund",
]);

export const leadSearchStatus = pgEnum("lead_search_status", ["pending", "completed", "failed"]);

export const leadQualificationStatus = pgEnum("lead_qualification_status", [
  "new",
  "contacted",
  "qualified",
  "discarded",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("customer"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  apiProviderId: text("api_provider_id").notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  amountTotal: integer("amount_total").notNull(),
  currency: text("currency").notNull().default("brl"),
  status: purchaseStatus("status").notNull().default("pending"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const unlockedApiKeys = pgTable(
  "unlocked_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    apiProviderId: text("api_provider_id").notNull(),
    apiKey: text("api_key").notNull().unique(),
    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.apiProviderId)],
);

export const apiProviders = pgTable("api_providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description").notNull(),
  baseUrl: text("base_url"),
  categoryId: apiCategoryId("category_id").notNull(),
  unlockPriceCents: integer("unlock_price_cents").notNull(),
  stripePriceId: text("stripe_price_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiEndpoints = pgTable("api_endpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiProviderId: text("api_provider_id")
    .notNull()
    .references(() => apiProviders.id, { onDelete: "cascade" }),
  method: httpMethod("method").notNull(),
  path: text("path").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const providerCredentials = pgTable("provider_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiProviderId: text("api_provider_id").notNull().unique(),
  ciphertext: text("ciphertext").notNull(),
  secretPreview: text("secret_preview").notNull(),
  tokenCiphertext: text("token_ciphertext"),
  tokenPreview: text("token_preview"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Geração de Leads: busca no Google Maps via Apify, paga com créditos (ledger).
export const leadSearches = pgTable("lead_searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  location: text("location").notNull(),
  maxResults: integer("max_results").notNull().default(50),
  status: leadSearchStatus("status").notNull().default("pending"),
  apifyRunId: text("apify_run_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  searchId: uuid("search_id")
    .notNull()
    .references(() => leadSearches.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  category: text("category"),
  rawData: jsonb("raw_data").$type<GoogleMapsPlaceItem>(),
  qualificationStatus: leadQualificationStatus("qualification_status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Ledger de créditos: o saldo é sempre a SOMA desta tabela, nunca um campo solto.
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: creditTransactionType("type").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  searchId: uuid("search_id").references(() => leadSearches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type UnlockedApiKey = typeof unlockedApiKeys.$inferSelect;
export type NewUnlockedApiKey = typeof unlockedApiKeys.$inferInsert;
export type ProviderCredential = typeof providerCredentials.$inferSelect;
export type NewProviderCredential = typeof providerCredentials.$inferInsert;
export type ApiProviderRecord = typeof apiProviders.$inferSelect;
export type NewApiProviderRecord = typeof apiProviders.$inferInsert;
export type ApiEndpointRecord = typeof apiEndpoints.$inferSelect;
export type NewApiEndpointRecord = typeof apiEndpoints.$inferInsert;
export type LeadSearch = typeof leadSearches.$inferSelect;
export type NewLeadSearch = typeof leadSearches.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
