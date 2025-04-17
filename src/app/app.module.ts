import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ReportModule } from "./report/report.module";
import { ReportService } from "./report/report.service";
import { TaskConfigModule } from "./task-config/task-config.module";
import { TaskConfigService } from "./task-config/task-config.service";

@Module({
    imports: [ReportModule, TaskConfigModule],
    controllers: [AppController],
    providers: [AppService, ReportService, TaskConfigService],
})
export class AppModule {}
