import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

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
  name: text("name").notNull(),           // e.g. "M4-D2 Mobility Kit"
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
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
    totalUsd: integer("totalUsd").notNull(), // in cents
    shippingName: text("shippingName"),
    shippingAddress: text("shippingAddress"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("order_user").on(t.userId)]
);

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
