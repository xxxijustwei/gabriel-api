import { Controller, Get, Query } from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiOperation,
} from "@nestjs/swagger/dist/decorators";
import { AnalysisReportService } from "./report.service";
import {
    AnalysisReportListQuery,
    AnalysisReportListResponse,
    AnalysisReportQuery,
    AnalysisReportResponse,
} from "./types";

@Controller("api/analysis-report")
export class AnalysisReportController {
    constructor(private readonly reportService: AnalysisReportService) {}

    @Get("list")
    @ApiOperation({
        summary: "Get Analysis Report(s)",
        operationId: "getAnalysisReportList",
        description: "Get the list of analysis reports",
    })
    @ApiCreatedResponse({
        type: AnalysisReportListResponse,
    })
    async getReports(@Query() query: AnalysisReportListQuery) {
        console.log(query.category);
        return this.reportService.getReports(query);
    }

    @Get()
    @ApiOperation({
        summary: "Get Analysis Report",
        operationId: "getAnalysisReport",
        description: "Get the analysis report data",
    })
    @ApiCreatedResponse({
        type: AnalysisReportResponse,
    })
    async getReport(@Query() { id, category }: AnalysisReportQuery) {
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
