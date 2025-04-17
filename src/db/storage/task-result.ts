import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { AnalysisRundingFlowResult } from "../../lib/binance/types";
import * as schema from "../schema";
import type { TaskResultSchema } from "../schema";

interface TaskResult {
    symbol: string;
    interval: string;
    limit: number;
    data: AnalysisRundingFlowResult;
    content: string;
}

export class TaskResultStorage {
    private readonly db: NodePgDatabase<typeof schema>;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async insert(result: Omit<TaskResultSchema, "id">) {
        const [taskResult] = await this.db
            .insert(schema.taskResult)
            .values(result)
            .returning();

        return taskResult;
    }

    async findAll() {
        return await this.db
            .select()
            .from(schema.taskResult)
            .orderBy(desc(schema.taskResult.createdAt));
    }

    async findLatest() {
        const result = await this.db
            .select()
            .from(schema.taskResult)
            .orderBy(desc(schema.taskResult.createdAt))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }
}
