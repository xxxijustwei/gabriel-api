import { Injectable } from "@nestjs/common";
import { getAnalysisReportStorage } from "../../db/provider";
import type { AnalysisReportSchema } from "../../db/schema";

@Injectable()
export class AnalysisReportService {
    private readonly db = getAnalysisReportStorage();

    async getAll() {
        const result = await this.db.findAll();

        return result.map(({ data, ...rest }) => rest);
    }

    async getLatest() {
        const result = await this.db.findLatest();

        return result;
    }

    async addNew(report: Omit<AnalysisReportSchema, "id">) {
        await this.db.insert(report);
    }
}
