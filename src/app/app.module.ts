import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ReportModule } from "./report/report.module";
import { TaskConfigModule } from "./task-config/task-config.module";

@Module({
    imports: [ReportModule, TaskConfigModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
