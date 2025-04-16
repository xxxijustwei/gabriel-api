import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import type { TaskConfigDto } from "./dto";
import { TaskConfigService } from "./task-config.service";

@Controller("/api/task-config")
export class TaskConfigController {
    constructor(private readonly taskConfigService: TaskConfigService) {}

    @Get()
    async getConfig() {
        return this.taskConfigService.getConfig();
    }

    @Post()
    async updateConfig(@Body() config: TaskConfigDto) {
        return this.taskConfigService.updateConfig(config);
    }
}
