import { xai } from "@ai-sdk/xai";
import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { convertToCoreMessages, streamText } from "ai";
import type { Response } from "express";
import { OnlyCronJobGuard } from "../guards/only-corn-job";
import { getFundingFlowAnalyze } from "../lib/tools/get-funding-flow-analyze";
import { getFundingRate } from "../lib/tools/get-futures-token";
import { getTaskConfig } from "../lib/tools/get-task-config";
import { setTaskConfig } from "../lib/tools/set-task-config";
import { AppService } from "./app.service";
import type { ChatBody } from "./types";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    root() {
        return {
            message: "Hi, I am Gabriel, your crypto trading assistant.",
        };
    }

    @Get("favicon.ico")
    async favicon(@Res() res: Response) {
        res.status(204).send();
    }

    @Post("api/chat")
    async chat(@Res() res: Response, @Body() { messages }: ChatBody) {
        const result = streamText({
            model: xai("grok-3-fast"),
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

    @Get("api/task")
    async executeTask() {
        const ok = await this.appService.executeTask();

        return {
            ok: ok ?? false,
        };
    }
}
