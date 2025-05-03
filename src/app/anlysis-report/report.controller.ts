import { Controller, Get, Query } from "@nestjs/common";
import type { AnalysisReportQueryDto } from "./dto";
import { AnalysisReportService } from "./report.service";

@Controller("api/analysis-report")
export class AnalysisReportController {
    constructor(private readonly reportService: AnalysisReportService) {}

    @Get("list")
    async getAllReports() {
        return this.reportService.getAllTaskReports();
    }

    @Get()
    async getReport(@Query() { id, category }: AnalysisReportQueryDto) {
        const result = await this.reportService.getAnalysisReport(id, category);

        return {
            id: result?.id ?? "",
            symbol: result?.symbol ?? "",
            interval: result?.interval ?? "",
            limit: result?.limit ?? 0,
            content: result?.content ?? "",
        };
    }
}
