import { Module } from "@nestjs/common";
import { AnalysisReportController } from "./report.controller";
import { AnalysisReportService } from "./report.service";

@Module({
    imports: [],
    controllers: [AnalysisReportController],
    providers: [AnalysisReportService],
})
export class AnalysisReportModule {}
