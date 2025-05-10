import { Injectable } from "@nestjs/common";
import { getAnalysisReportStorage } from "../../db/provider";
import type { AnalysisReportData } from "../../db/storage/anlysis-report";
import type { AnalysisReportListQuery } from "./types";

@Injectable()
export class AnalysisReportService {
    private readonly db = getAnalysisReportStorage();

    async addNew(report: AnalysisReportData) {
        await this.db.insert(report);
    }

    async getReports({
        category,
        page_no = 0,
        page_size = 8,
    }: AnalysisReportListQuery) {
        const [result, total] = await Promise.all([
            this.db.getReports(category, page_no, page_size),
            this.db.getReportsCount(category),
        ]);

        return {
            list: result.map(({ category, data, ...rest }) => rest),
            total,
        };
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

        if (!result) return null;

        const { category: _, data, ...rest } = result;

        return rest;
    }
}
