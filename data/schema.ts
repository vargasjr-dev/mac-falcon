import { pgTable, text, timestamp, boolean, integer, index, json, jsonb } from "drizzle-orm/pg-core";
import type { BomItem, ProductSpecs } from "./types";

// better-auth required tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ---- Mac Falcon store ----

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),            // e.g. "M4-D2 Mobility Kit"
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),                // short punchy line for cards + hero
  description: text("description").notNull(),
  highlights: json("highlights").$type<string[]>(),   // bullet points for the detail page
  specs: json("specs").$type<ProductSpecs>(),         // key/value spec grid
  bom: json("bom").$type<BomItem[]>(),                // full bill of materials
  priceUsd: integer("priceUsd").notNull(), // in cents
  stripePriceId: text("stripePriceId"),
  inStock: boolean("inStock").notNull().default(true),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    stripeSessionId: text("stripeSessionId").notNull().unique(),
    stripePaymentIntentId: text("stripePaymentIntentId"),
    status: text("status").notNull().default("pending"), // 'pending' | 'paid' | 'shipped' | 'cancelled'
    isTest: boolean("isTest").notNull().default(false),
    totalUsd: integer("totalUsd").notNull(), // in cents
    shippingName: text("shippingName"),
    shippingAddress: text("shippingAddress"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("order_user").on(t.userId)]
);

export const supplyPurchase = pgTable("supply_purchase", {
  id: text("id").primaryKey(),
  partName: text("partName").notNull(),        // matches BOM part names loosely
  supplier: text("supplier"),
  quantity: integer("quantity").notNull(),
  totalPaidUsd: integer("totalPaidUsd").notNull(), // in cents — total for the whole batch
  url: text("url"),
  notes: text("notes"),
  purchasedAt: timestamp("purchasedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const falconApiKey = pgTable("falcon_api_key", {
  id: text("id").primaryKey(),                          // nanoid
  name: text("name").notNull(),                         // human label, e.g. "VargasJR prod"
  keyHash: text("keyHash").notNull().unique(),          // SHA-256 of the raw key — never store plaintext
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]), // e.g. ["product:write","order:read"]
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  revokedAt: timestamp("revokedAt"),                    // null = active
});

export const orderItem = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("orderId")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  productId: text("productId")
    .notNull()
    .references(() => product.id),
  quantity: integer("quantity").notNull().default(1),
  unitPriceUsd: integer("unitPriceUsd").notNull(), // snapshot at purchase
});
