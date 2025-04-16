import { Module } from "@nestjs/common";
import { TaskConfigController } from "./task-config.controller";
import { TaskConfigService } from "./task-config.service";

@Module({
    imports: [],
    controllers: [TaskConfigController],
    providers: [TaskConfigService],
})
export class TaskConfigModule {}
