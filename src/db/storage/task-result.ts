import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

interface TaskResult {
    symbol: string;
    interval: string;
    limit: number;
    content: string;
}

export class TaskResultStorage {
    private readonly db: NodePgDatabase<typeof schema>;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async insert(result: TaskResult) {
        const [taskResult] = await this.db
            .insert(schema.taskResult)
            .values(result)
            .returning();

        return taskResult;
    }

    async findAll() {
        return await this.db.select().from(schema.taskResult);
    }
}
