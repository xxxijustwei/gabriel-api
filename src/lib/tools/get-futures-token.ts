import z from "zod";
import { getFuturesTokens } from "../binance/get-futures-token";

interface FundingRate {
    symbol: string;
    markPrice: number;
    lastFundingRate: number;
    time: string;
}

const description = "获取交易所USDT交易对永续合约交易对的数据";

const getPrompt = (
    result: FundingRate[],
) => `你是专业的加密货币交易员, 擅长分析加密货币市场的数据

数据如下：
${JSON.stringify(result, null, 2)}

回复格式要求：中文,使用markdown格式,重点突出,对数据进行可读性处理,适当使用表格对比分析。
`;

const parameters = z.object({
    limit: z.number().optional().describe("The number of results to return"),
    sort: z
        .enum(["asc", "desc"])
        .optional()
        .describe("The sort order of the results"),
});

const execute = async ({
    limit = 10,
    sort = "desc",
}: z.infer<typeof parameters>) => {
    const result = await getFuturesTokens({ limit, sort });

    return getPrompt(result);
};

export const getFundingRate = {
    description,
    parameters,
    execute,
};
