import dayjs from "dayjs";
import { z } from "zod";
import { analyzeFundingFlow } from "../binance/analyze-funding-flow";
import { type AnalysisRundingFlowResult, Interval } from "../binance/types";
import { getFundingFlowAnalyzePrompt } from "../prompt";

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

const execute = async ({
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

    return getPrompt(result);
};

export const getFundingFlowAnalyze = {
    description,
    parameters,
    execute,
};
