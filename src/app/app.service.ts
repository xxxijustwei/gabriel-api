import { xai } from "@ai-sdk/xai";
import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import dayjs from "dayjs";
import { getTaskConfigStorage, getTaskResultStorage } from "../db/provider";
import { analyzeFundingFlow } from "../lib/binance/analyze-funding-flow";
import type {
    AnalysisRundingFlowResult,
    IntervalType,
} from "../lib/binance/types";
import { getPrompt } from "../lib/tools/get-funding-flow-analyze";

@Injectable()
export class AppService {
    async executeTask() {
        const config = await getTaskConfigStorage().find();

        if (!config) {
            return null;
        }

        const analysisResult = await analyzeFundingFlow({
            symbol: config.symbol,
            interval: config.interval as IntervalType,
            limit: config.limit,
        });

        if (!analysisResult) {
            return null;
        }

        const latest = await getTaskResultStorage().findLatest();
        const latestMessages = latest
            ? [
                  {
                      role: "user" as const,
                      content: getUserPrompt(
                          latest.symbol,
                          latest.interval as IntervalType,
                          latest.limit,
                          latest.data as AnalysisRundingFlowResult,
                      ),
                  },
                  {
                      role: "assistant" as const,
                      content: latest?.content ?? "",
                  },
              ]
            : [];

        const { text } = await generateText({
            model: xai("grok-3-fast"),
            system: "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据，并给出交易建议。",
            messages: [
                ...latestMessages,
                {
                    role: "user",
                    content: getUserPrompt(
                        config.symbol,
                        config.interval as IntervalType,
                        config.limit,
                        analysisResult,
                    ),
                },
            ],
        });

        await getTaskResultStorage().insert({
            symbol: config.symbol,
            interval: config.interval,
            limit: config.limit,
            data: analysisResult,
            content: text,
        });

        return true;
    }
}

const getUserPrompt = (
    symbol: string,
    interval: IntervalType,
    limit: number,
    result: AnalysisRundingFlowResult,
) => {
    return `现在是 ${dayjs().format("YYYY-MM-DD HH:mm:ss")}，请帮我分析 ${symbol} 代币 ${limit} 根 ${interval} K线数据的资金流向

${getPrompt(result)}`;
};
