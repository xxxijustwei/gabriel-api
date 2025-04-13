import axios from "axios";
import currency from "currency.js";
import dayjs from "dayjs";
import type { FuturesData } from "./types";
interface GetFuturesTokensOptions {
    symbol: string;
    limit?: number;
    sort?: "asc" | "desc";
}

export const getFuturesTokens = async ({
    symbol,
    limit = 10,
    sort = "desc",
}: GetFuturesTokensOptions) => {
    try {
        const { data } = await axios.get<FuturesData[]>(
            "https://fapi.binance.com/fapi/v1/premiumIndex",
        );

        const result = data
            .filter((item) => item.symbol.endsWith(symbol.toUpperCase()))
            .sort((a, b) =>
                sort === "asc"
                    ? Number(a.lastFundingRate) - Number(b.lastFundingRate)
                    : Number(b.lastFundingRate) - Number(a.lastFundingRate),
            )
            .slice(0, limit)
            .map((item) => ({
                symbol: item.symbol.replace(
                    symbol.toUpperCase(),
                    `/${symbol.toUpperCase()}`,
                ),
                markPrice: Number.parseFloat(
                    currency(item.markPrice, { precision: 4 }).toString(),
                ),
                lastFundingRate: Number.parseFloat(
                    currency(item.lastFundingRate, { precision: 4 })
                        .multiply(100)
                        .toString(),
                ),
                time: dayjs(item.time).format("YYYY-MM-DD HH:mm:ss"),
            }));

        return result;
    } catch (error) {
        console.error(`获取 ${symbol} | ${limit} | ${sort} 数据失败: ${error}`);
        return [];
    }
};
