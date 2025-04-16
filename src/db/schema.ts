import {
    integer,
    json,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const taskConfig = pgTable("task_config", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    symbol: text("symbol").notNull(),
    interval: text("interval").notNull(),
    limit: integer("limit").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type TaskConfigSchema = Omit<
    typeof taskConfig.$inferSelect,
    "createdAt" | "updatedAt"
>;

export const taskResult = pgTable("task_result", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    symbol: text("symbol").notNull(),
    interval: text("interval").notNull(),
    limit: integer("limit").notNull(),
    data: json("data").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
