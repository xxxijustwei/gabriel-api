import { Body, Controller, Get, Put } from "@nestjs/common";
import type { TaskConfigDto } from "./dto";
import { TaskConfigService } from "./task-config.service";

@Controller("/api/task-config")
export class TaskConfigController {
    constructor(private readonly taskConfigService: TaskConfigService) {}

    @Get()
    async getConfig() {
        const result = await this.taskConfigService.getConfig();

        if (!result) {
            return {
                symbol: "BTC",
                interval: "15m",
                limit: 32,
            };
        }

        return {
            symbol: result.symbol,
            interval: result.interval,
            limit: result.limit,
        };
    }

    @Put()
    async updateConfig(@Body() config: TaskConfigDto) {
        return this.taskConfigService.updateConfig(config);
    }
}
