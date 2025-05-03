import { Module } from "@nestjs/common";
import { AnalysisReportModule } from "./anlysis-report/report.module";
import { AnalysisReportService } from "./anlysis-report/report.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TaskConfigModule } from "./task-config/task-config.module";
import { TaskConfigService } from "./task-config/task-config.service";

@Module({
    imports: [AnalysisReportModule, TaskConfigModule],
    controllers: [AppController],
    providers: [AppService, AnalysisReportService, TaskConfigService],
})
export class AppModule {}
