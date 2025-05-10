import { and, count, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import type { AnalysisReportSchema } from "../schema";

export type AnalysisReportData = Omit<AnalysisReportSchema, "id"> & {
    id?: string;
};

export class AnalysisReportStorage {
    private readonly db: NodePgDatabase<typeof schema>;
    private readonly table = schema.analysisReportTable;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async insert(result: AnalysisReportData) {
        const [analysisReport] = await this.db
            .insert(this.table)
            .values(result)
            .returning();

        return analysisReport;
    }

    async getReportsCount(category: AnalysisReportData["category"]) {
        const [{ amount }] = await this.db
            .select({ amount: count() })
            .from(this.table)
            .where(eq(this.table.category, category));

        return amount;
    }

    async getReports(
        category: AnalysisReportData["category"],
        pageNo: number,
        pageSize: number,
    ) {
        return await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.category, category))
            .orderBy(desc(this.table.createdAt))
            .offset(pageNo * pageSize)
            .limit(pageSize);
    }

    async getAllTaskReports() {
        return await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.category, "task"))
            .orderBy(desc(this.table.createdAt));
    }

    async getLatestTaskReport() {
        const result = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.category, "task"))
            .orderBy(desc(this.table.createdAt))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async getAnalysisReport(
        id: string,
        category: AnalysisReportData["category"],
    ) {
        const result = await this.db
            .select()
            .from(this.table)
            .where(
                and(eq(this.table.category, category), eq(this.table.id, id)),
            )
            .orderBy(desc(this.table.createdAt))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async findAll() {
        return await this.db
            .select()
            .from(this.table)
            .orderBy(desc(this.table.createdAt));
    }
}
