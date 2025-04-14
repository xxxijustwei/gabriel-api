import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IntervalType } from "../../lib/binance/types";
import * as schema from "../schema";

interface TaskConfig {
    symbol: string;
    interval: IntervalType;
    limit: number;
}

const mockUUID = "37fb8bbc-b575-4ee7-bd5e-86c17b07b2f5";

export class TaskConfigStorage {
    private readonly db: NodePgDatabase<typeof schema>;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async find(id?: string) {
        const result = await this.db
            .select()
            .from(schema.taskConfig)
            .where(eq(schema.taskConfig.id, id ?? mockUUID));

        return result.length > 0 ? result[0] : null;
    }

    async update(config: TaskConfig, id?: string) {
        const [taskConfig] = await this.db
            .insert(schema.taskConfig)
            .values({
                id: id ?? mockUUID,
                ...config,
            })
            .onConflictDoUpdate({
                target: schema.taskConfig.id,
                set: config,
            })
            .returning();

        return taskConfig;
    }
}
