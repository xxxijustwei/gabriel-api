import { google } from "@ai-sdk/google";
import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
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
import { ChatBody, ChatStreamResponseDto, TaskCronJobResponse } from "./types";

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
    @ApiOperation({
        summary: "Chat with AI assistant",
        description:
            "Streams AI responses using Server-Sent Events format. Each chunk is a JSON object with data and done properties.",
    })
    @ApiBody({ type: ChatBody })
    @ApiResponse({
        status: 200,
        description: "Stream of AI responses using Server-Sent Events (SSE)",
        type: ChatStreamResponseDto,
        isArray: true,
    })
    async chat(@Res() res: Response, @Body() { messages }: ChatBody) {
        pipeDataStreamToResponse(res, {
            execute: async (dataStream) => {
                const result = streamText({
                    model: google("gemini-2.0-flash"),
                    system: systemPrompt,
                    messages: convertToCoreMessages(messages),
                    maxSteps: 5,
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
                this.logger.error(mesage);
                return mesage;
            },
        });
    }

    @Get("api/task")
    @UseGuards(OnlyCronJobGuard)
    @ApiOperation({
        summary: "Execute scheduled task",
        description: "Endpoint for cron job to trigger scheduled tasks",
    })
    @ApiResponse({
        status: 200,
        description: "Task execution result",
        type: TaskCronJobResponse,
    })
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
