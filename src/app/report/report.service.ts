import { Injectable } from "@nestjs/common";
import { getTaskResultStorage } from "../../db/provider";
import type { TaskResultSchema } from "../../db/schema";

@Injectable()
export class ReportService {
    private readonly db = getTaskResultStorage();

    async getAll() {
        const result = await this.db.findAll();

        return result.map(({ data, ...rest }) => rest);
    }

    async getLatest() {
        const result = await this.db.findLatest();

        return result;
    }

    async addNew(report: Omit<TaskResultSchema, "id">) {
        await this.db.insert(report);
    }
}
