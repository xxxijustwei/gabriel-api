import z from "zod";
import { getFuturesTokens } from "../binance/get-futures-token";
import type { FundingRate } from "../binance/types";

const description = "获取交易所USDT交易对永续合约交易对的资金费率数据";

const getPrompt = (
    result: FundingRate,
) => `${result.symbol}永续合约交易对的资金费率数据:

${JSON.stringify(result, null, 2)}`;

const parameters = z.object({
    symbol: z.string().describe("The symbol of the token"),
});

const execute = async ({ symbol }: z.infer<typeof parameters>) => {
    const result = await getFuturesTokens();
    const token = result.find((item) => item.symbol === `${symbol}/USDT`);
    if (!token) {
        return "未找到该交易对";
    }
    return getPrompt(token);
};

export const getTokenFundingRate = {
    description,
    parameters,
    execute,
};
