import {
    integer,
    json,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const taskConfigTable = pgTable("task_config", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    symbol: text("symbol").notNull(),
    interval: text("interval").notNull(),
    limit: integer("limit").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type TaskConfigSchema = Omit<
    typeof taskConfigTable.$inferSelect,
    "createdAt" | "updatedAt"
>;

export const analysisReportTable = pgTable("analysis_report", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    symbol: text("symbol").notNull(),
    interval: text("interval").notNull(),
    limit: integer("limit").notNull(),
    data: json("data").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type AnalysisReportSchema = Omit<
    typeof analysisReportTable.$inferSelect,
    "createdAt"
>;
