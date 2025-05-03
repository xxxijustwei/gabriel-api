import { Injectable } from "@nestjs/common";
import { getAnalysisReportStorage } from "../../db/provider";
import type { AnalysisReportData } from "../../db/storage/anlysis-report";

@Injectable()
export class AnalysisReportService {
    private readonly db = getAnalysisReportStorage();

    async addNew(report: AnalysisReportData) {
        await this.db.insert(report);
    }

    async getAllTaskReports() {
        const result = await this.db.getAllTaskReports();

        return result.map(({ data, ...rest }) => rest);
    }

    async getLatestTaskReport() {
        const result = await this.db.getLatestTaskReport();

        return result;
    }

    async getAnalysisReport(
        id: string,
        category: AnalysisReportData["category"],
    ) {
        const result = await this.db.getAnalysisReport(id, category);

        return result;
    }
}
