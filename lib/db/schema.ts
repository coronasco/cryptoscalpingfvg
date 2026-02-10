import {
  boolean,
  bigint,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "premium"]);
export const timeframeEnum = pgEnum("timeframe", ["1m", "5m", "15m", "1h"]);
export const directionEnum = pgEnum("direction", ["LONG", "SHORT", "NEUTRAL"]);
export const setupStatusEnum = pgEnum("setup_status", [
  "WAITING",
  "TRIGGERED",
  "FILLED",
  "TP1",
  "TP2",
  "SL",
  "EXPIRED",
  "INVALIDATED",
]);
export const alertTypeEnum = pgEnum("alert_type", ["ENTRY_TRIGGERED", "INVALIDATED", "TP1_HIT"]);
export const alertChannelEnum = pgEnum("alert_channel", ["WEBPUSH", "EMAIL"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email"),
  plan: planEnum("plan").default("free").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pairs = pgTable("pairs", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // e.g., BTCUSDT
  displaySymbol: text("display_symbol").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const candles = pgTable(
  "candles",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol").notNull(),
    timeframe: timeframeEnum("timeframe").notNull(),
    ts: bigint("ts", { mode: "number" }).notNull(),
    open: doublePrecision("open").notNull(),
    high: doublePrecision("high").notNull(),
    low: doublePrecision("low").notNull(),
    close: doublePrecision("close").notNull(),
    volume: doublePrecision("volume").notNull(),
    confirmed: boolean("confirmed").default(true).notNull(),
  },
  (table) => ({
    uniq: { columns: [table.symbol, table.timeframe, table.ts], isUnique: true },
  }),
);

export const setups = pgTable("setups", {
  id: uuid("id").defaultRandom().primaryKey(),
  symbol: text("symbol").notNull(),
  timeframe: timeframeEnum("timeframe").default("15m").notNull(),
  direction: directionEnum("direction").notNull(),
  status: setupStatusEnum("status").default("WAITING").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  fvgLow: doublePrecision("fvg_low").notNull(),
  fvgHigh: doublePrecision("fvg_high").notNull(),
  sweepLevel: doublePrecision("sweep_level"),
  entryPrice: doublePrecision("entry_price").notNull(),
  stopLoss: doublePrecision("stop_loss").notNull(),
  tp1: doublePrecision("tp1").notNull(),
  tp2: doublePrecision("tp2"),
  tp3: doublePrecision("tp3"),
  rrToTp1: doublePrecision("rr_to_tp1").notNull(),
  invalidationText: text("invalidation_text").notNull(),
  meta: jsonb("meta"),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  setupId: uuid("setup_id").references(() => setups.id),
  type: alertTypeEnum("type").notNull(),
  channel: alertChannelEnum("channel").notNull(),
  destination: jsonb("destination"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  setupId: uuid("setup_id").references(() => setups.id),
  type: text("type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
