import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { AnalysisReportStorage } from "./storage/anlysis-report";
import { TaskConfigStorage } from "./storage/task-config";

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

export const getAnalysisReportStorage = () => {
    return new AnalysisReportStorage(getDBProvider());
};
