import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { AnalysisReportService } from "./report.service";

@Controller("api/analysis-report")
export class AnalysisReportController {
    constructor(private readonly reportService: AnalysisReportService) {}

    @Get("list")
    async getAllReports() {
        return this.reportService.getAll();
    }
}
