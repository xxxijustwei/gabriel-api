import { google } from "@ai-sdk/google";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { convertToCoreMessages, streamText } from "ai";
import type { Response } from "express";
import { getFundingFlowAnalyze } from "src/tools/get-funding-flow-analyze";
import { getFundingRate } from "src/tools/get-futures-token";
import { getTaskConfig } from "src/tools/get-task-config";
import { setTaskConfig } from "src/tools/set-task-config";
import type { ChatBody } from "./types";

const system =
    "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据，并给出交易建议。";

@Controller()
export class AppController {
    @Post("api/chat")
    async chat(@Res() res: Response, @Body() { id, messages }: ChatBody) {
        const result = streamText({
            model: google("gemini-2.0-flash-exp"),
            system,
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
}
