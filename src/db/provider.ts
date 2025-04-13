import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { TaskConfigStorage } from "./storage/task-config";
import { TaskResultStorage } from "./storage/task-result";

let instance: NodePgDatabase<typeof schema> | null = null;

export const getDBProvider = () => {
    if (!instance) {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        instance = drizzle(pool, { schema });
    }
    return instance;
};

export const getTaskConfigStorage = () => {
    return new TaskConfigStorage(getDBProvider());
};

export const getTaskResultStorage = () => {
    return new TaskResultStorage(getDBProvider());
};
