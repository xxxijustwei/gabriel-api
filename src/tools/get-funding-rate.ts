import axios from "axios";
import z from "zod";

interface FundingRate {
    symbol: string;
    lastFundingRate: number;
}

const description =
    "Get the funding rate of a perpetual contract trading pair on Binance";

const getPrompt = (
    result: FundingRate[],
) => `你是专业的加密货币交易员, 擅长分析加密货币市场的数据

1. 你需要将数据的symbol格式化, 例如BTCUSDT -> BTC/USDT
2. 你需要将数据的lastFundingRate符号格式化, 例如0.0001 -> 0.01%, -0.0001 -> -0.01%
                        
数据如下：
${JSON.stringify(result, null, 2)}

回复格式要求：中文，使用markdown格式。
`;

const parameters = z.object({
    symbol: z
        .string()
        .describe("The symbol of the perpetual contract trading pair")
        .optional(),
    resultCount: z
        .number()
        .describe("The number of results to return")
        .optional(),
    sort: z
        .enum(["asc", "desc"])
        .describe("The sort order of the results")
        .optional(),
});

const execute = async ({
    symbol = "USDT",
    resultCount = 10,
    sort = "desc",
}) => {
    const { data } = await axios.get(
        "https://fapi.binance.com/fapi/v1/premiumIndex",
    );
    const result = data
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .filter((item: any) => item.symbol.endsWith(symbol.toUpperCase()))
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .sort((a: any, b: any) =>
            sort === "asc"
                ? Number(a.lastFundingRate) - Number(b.lastFundingRate)
                : Number(b.lastFundingRate) - Number(a.lastFundingRate),
        )
        .slice(0, resultCount)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .map((item: any) => ({
            symbol: item.symbol,
            lastFundingRate: Number(item.lastFundingRate),
        }));

    return getPrompt(result);
};

export const getFundingRate = {
    description,
    parameters,
    execute,
};
