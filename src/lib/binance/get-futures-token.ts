import axios from "axios";
import currency from "currency.js";
import dayjs from "dayjs";
import { FUTURES_BASE_URL } from "./constants";
import type { FundingRate, FuturesData } from "./types";

export const getFuturesTokens = async (): Promise<FundingRate[]> => {
    try {
        const { data } = await axios.get<FuturesData[]>(
            `${FUTURES_BASE_URL}/premiumIndex`,
        );

        const result = data
            .filter((item) => item.symbol.endsWith("USDT"))
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
        console.error(`获取永续合约交易对资金费率数据失败: ${error}`);
        return [];
    }
};
