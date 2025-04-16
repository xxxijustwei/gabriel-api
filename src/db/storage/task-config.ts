import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { TaskConfigSchema } from "../schema";
import * as schema from "../schema";

const mockUUID = "37fb8bbc-b575-4ee7-bd5e-86c17b07b2f5";

export class TaskConfigStorage {
    private readonly db: NodePgDatabase<typeof schema>;

    constructor(db: NodePgDatabase<typeof schema>) {
        this.db = db;
    }

    async find() {
        const result = await this.db
            .select()
            .from(schema.taskConfig)
            .where(eq(schema.taskConfig.id, mockUUID));

        return result.length > 0 ? result[0] : null;
    }

    async update(config: Omit<TaskConfigSchema, "id">) {
        const data = {
            id: mockUUID,
            ...config,
        };

        const [taskConfig] = await this.db
            .insert(schema.taskConfig)
            .values(data)
            .onConflictDoUpdate({
                target: schema.taskConfig.id,
                set: data,
            })
            .returning();

        return taskConfig;
    }
}
