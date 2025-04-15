import axios from "axios";
import currency from "currency.js";
import dayjs from "dayjs";
import { FUTURES_BASE_URL } from "./constants";
import type { FuturesData } from "./types";

interface GetFuturesTokensOptions {
    limit?: number;
    sort?: "asc" | "desc";
}

export const getFuturesTokens = async ({
    limit = 10,
    sort = "desc",
}: GetFuturesTokensOptions) => {
    try {
        const { data } = await axios.get<FuturesData[]>(
            `${FUTURES_BASE_URL}/premiumIndex`,
        );

        const result = data
            .filter((item) => item.symbol.endsWith("USDT"))
            .sort((a, b) =>
                sort === "asc"
                    ? Number(a.lastFundingRate) - Number(b.lastFundingRate)
                    : Number(b.lastFundingRate) - Number(a.lastFundingRate),
            )
            .slice(0, limit)
            .map((item) => ({
                symbol: item.symbol.replace("USDT", "/USDT"),
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
        console.error(`获取 USDT交易对 ${limit} | ${sort} 数据失败: ${error}`);
        return [];
    }
};
