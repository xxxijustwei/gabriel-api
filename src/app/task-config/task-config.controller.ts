import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger/dist/decorators";
import { ApiCreatedResponse } from "@nestjs/swagger/dist/decorators";
import { TaskConfigService } from "./task-config.service";
import {
    TaskConfigDataResponse,
    type TaskConfigUpdateBoday,
    TaskConfigUpdateResponse,
} from "./types";

@Controller("/api/task-config")
export class TaskConfigController {
    constructor(private readonly taskConfigService: TaskConfigService) {}

    @Get()
    @ApiOperation({
        summary: "Get Task Config",
        operationId: "getTaskConfig",
    })
    @ApiCreatedResponse({
        type: TaskConfigDataResponse,
    })
    async getConfig() {
        const result = await this.taskConfigService.getConfig();

        if (!result) {
            return {
                symbol: "BTC",
                interval: "15m",
                limit: 32,
                updatedAt: new Date().toISOString(),
            };
        }

        return {
            symbol: result.symbol,
            interval: result.interval,
            limit: result.limit,
            updatedAt: result.updatedAt.toISOString(),
        };
    }

    @Put()
    @ApiOperation({
        summary: "Update Task Config",
        operationId: "updateTaskConfig",
    })
    @ApiCreatedResponse({
        type: TaskConfigUpdateResponse,
    })
    async updateConfig(@Body() config: TaskConfigUpdateBoday) {
        const ok = await this.taskConfigService.updateConfig(config);

        return {
            success: ok,
        };
    }
}
