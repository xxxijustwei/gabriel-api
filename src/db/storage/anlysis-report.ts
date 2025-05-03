import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { AnalysisRundingFlowResult } from "../../lib/binance/types";
import * as schema from "../schema";
import type { AnalysisReportSchema } from "../schema";

interface AnalysisReport {
    symbol: string;
    interval: string;
    limit: number;
    data: AnalysisRundingFlowResult;
    content: string;
}

export class AnalysisReportStorage {
    private readonly db: NodePgDatabase<typeof schema>;
    private readonly table = schema.analysisReportTable;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async insert(result: Omit<AnalysisReportSchema, "id">) {
        const [analysisReport] = await this.db
            .insert(this.table)
            .values(result)
            .returning();

        return analysisReport;
    }

    async findAll() {
        return await this.db
            .select()
            .from(this.table)
            .orderBy(desc(this.table.createdAt));
    }

    async findLatest() {
        const result = await this.db
            .select()
            .from(this.table)
            .orderBy(desc(this.table.createdAt))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }
}
