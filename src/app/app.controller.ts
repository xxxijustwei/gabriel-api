import { xai } from "@ai-sdk/xai";
import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import {
    convertToCoreMessages,
    pipeDataStreamToResponse,
    smoothStream,
    streamText,
} from "ai";
import type { Response } from "express";
import { OnlyCronJobGuard } from "../guards/only-corn-job";
import { systemPrompt } from "../lib/prompt/system";
import { getFundingFlowAnalyze } from "../lib/tools/get-funding-flow-analyze";
import { getFundingRateWithLimitAndSort } from "../lib/tools/get-funding-rate-with-las";
import { getTaskConfig } from "../lib/tools/get-task-config";
import { getTokenFundingRate } from "../lib/tools/get-token-funding-rate";
import { setTaskConfig } from "../lib/tools/set-task-config";
import { AppService } from "./app.service";
import type { ChatBody } from "./types";

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

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
        pipeDataStreamToResponse(res, {
            execute: async (dataStream) => {
                const result = streamText({
                    model: xai("grok-3-fast"),
                    system: systemPrompt,
                    messages: convertToCoreMessages(messages),
                    tools: {
                        getTokenFundingRate,
                        getFundingRateWithLimitAndSort,
                        getFundingFlowAnalyze: getFundingFlowAnalyze({
                            dataStream,
                        }),
                        getTaskConfig,
                        setTaskConfig,
                    },
                    experimental_transform: smoothStream({
                        chunking: /[\u4E00-\u9FFF]|\S+\s+/,
                    }),
                });

                result.mergeIntoDataStream(dataStream);
            },
            onError: (error) => {
                const mesage = handleError(error);
                return mesage;
            },
        });
    }

    @Get("api/task")
    @UseGuards(OnlyCronJobGuard)
    async executeTask() {
        const ok = await this.appService.executeTask();

        return {
            ok: ok ?? false,
        };
    }
}

const handleError = (error: unknown) => {
    if (error == null) {
        return "unknown error";
    }

    if (typeof error === "string") {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return JSON.stringify(error);
};
