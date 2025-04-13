import { deepseek } from "@ai-sdk/deepseek";
import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import { getTaskConfigStorage, getTaskResultStorage } from "src/db/provider";
import { analyzeFundingFlow } from "src/lib/binance/analyze-funding-flow";
import type { IntervalType } from "src/lib/binance/types";
import { getPrompt } from "src/tools/get-funding-flow-analyze";

@Injectable()
export class AppService {
    async executeTask() {
        const config = await getTaskConfigStorage().find();

        if (!config) {
            return null;
        }

        const result = await analyzeFundingFlow({
            symbol: config.symbol,
            interval: config.interval as IntervalType,
            limit: config.limit,
        });

        if (!result) {
            return null;
        }

        const { text } = await generateText({
            model: deepseek("deepseek-chat"),
            system: "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据，并给出交易建议。",
            prompt: `帮我分析 ${config.symbol} 代币 ${config.limit} 根 ${config.interval} K线数据的资金流向

${getPrompt(result)}`,
        });

        await getTaskResultStorage().insert({
            symbol: config.symbol,
            interval: config.interval,
            limit: config.limit,
            content: text,
        });

        return true;
    }
}
