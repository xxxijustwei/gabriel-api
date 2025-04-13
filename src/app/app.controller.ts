import { deepseek } from "@ai-sdk/deepseek";
import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { convertToCoreMessages, streamText } from "ai";
import type { Response } from "express";
import { getFundingFlowAnalyze } from "src/tools/get-funding-flow-analyze";
import { getFundingRate } from "src/tools/get-futures-token";
import { getTaskConfig } from "src/tools/get-task-config";
import { setTaskConfig } from "src/tools/set-task-config";
import { AppService } from "./app.service";
import type { ChatBody } from "./types";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post("api/chat")
    async chat(@Res() res: Response, @Body() { messages }: ChatBody) {
        const result = streamText({
            model: deepseek("deepseek-chat"),
            system: "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据，并给出交易建议。",
            tools: {
                getFundingRate,
                getFundingFlowAnalyze,
                getTaskConfig,
                setTaskConfig,
            },
            maxSteps: 5,
            messages: convertToCoreMessages(messages),
            onError: ({ error }: { error: Error }) => {
                console.error(error.message);
            },
        });

        result.pipeDataStreamToResponse(res);
    }

    @Get("api/execute-task")
    async executeTask() {
        const ok = await this.appService.executeTask();

        return {
            ok: ok ?? false,
        };
    }
}
