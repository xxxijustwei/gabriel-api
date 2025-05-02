import { xai } from "@ai-sdk/xai";
import { type DataStreamWriter, smoothStream, streamText } from "ai";
import dayjs from "dayjs";
import { z } from "zod";
import { analyzeFundingFlow } from "../binance/analyze-funding-flow";
import { type AnalysisRundingFlowResult, Interval } from "../binance/types";
import { getFundingFlowAnalyzePrompt } from "../prompt/funding-flow-analyze";

const description = "分析现货和期货市场代币的资金流向数据";

export const getPrompt = (result: AnalysisRundingFlowResult) => {
    return getFundingFlowAnalyzePrompt({
        symbol: result.symbol,
        interval: result.interval,
        limit: result.limit,
        data: JSON.stringify(result, null, 2),
        datetime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
};

const parameters = z.object({
    symbol: z.string().describe("The symbol of the token"),
    interval: z
        .enum(Interval)
        .optional()
        .describe("The interval of the data (optional)"),
    klinesLimit: z
        .number()
        .optional()
        .describe("Limit on the number of K lines (optional)"),
});

export const getFundingFlowAnalyze = ({
    dataStream,
}: { dataStream: DataStreamWriter }) => {
    return {
        description,
        parameters,
        execute: async ({
            symbol = "BTC",
            interval = "15m",
            klinesLimit = 48,
        }: z.infer<typeof parameters>) => {
            const result = await analyzeFundingFlow({
                symbol: symbol.endsWith("USDT") ? symbol : `${symbol}USDT`,
                interval,
                limit: klinesLimit,
            });

            if (!result) {
                return "没有找到数据,无法进行分析";
            }

            let streamResult = "";
            const { fullStream } = streamText({
                model: xai("grok-3-fast"),
                system: "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据，并给出交易建议。",
                prompt: getPrompt(result),
                experimental_transform: smoothStream({
                    chunking: /[\u4E00-\u9FFF]|\S+\s+/,
                }),
            });

            dataStream.writeData({
                type: "clear",
                content: "",
            });

            for await (const chunk of fullStream) {
                const { type } = chunk;
                if (type !== "text-delta") continue;

                const { textDelta } = chunk;
                streamResult += textDelta;
                dataStream.writeData({
                    type: "text-delta",
                    content: textDelta,
                });
            }

            dataStream.writeData({
                type: "finish",
                content: "",
            });

            return streamResult;
        },
    };
};
