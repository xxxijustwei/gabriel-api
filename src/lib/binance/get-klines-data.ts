import axios from "axios";
import type { IntervalType, KlinesData } from "./types";
import "dotenv/config";
import currency from "currency.js";
import dayjs from "dayjs";

interface GetKlinesDataOptions {
    symbol: string;
    interval: IntervalType;
    limit?: number;
    isFutures?: boolean;
}

export const getKlinesData = async ({
    symbol,
    interval = "5m",
    limit = 50,
    isFutures = false,
}: GetKlinesDataOptions): Promise<KlinesData[]> => {
    try {
        const baseUrl = isFutures
            ? process.env.BINANCE_FUTURES_BASE_URL
            : process.env.BINANCE_SPOT_BASE_URL;
        const { data } = await axios.get(`${baseUrl}/klines`, {
            params: {
                symbol,
                interval,
                limit,
            },
        });

        if (data.length < 2) return [];

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const result = data.slice(0, data.length - 1).map((item: any) => {
            const openTime = dayjs(item[0]).format("YYYY-MM-DD HH:mm:ss");
            const closeTime = dayjs(item[6]).format("YYYY-MM-DD HH:mm:ss");

            return {
                symbol,
                open_time: openTime,
                close_time: closeTime,
                open: Number.parseFloat(item[1]),
                high: Number.parseFloat(item[2]),
                low: Number.parseFloat(item[3]),
                close: Number.parseFloat(item[4]),
                volume: Number.parseFloat(item[5]),
                quote_volume: Number.parseFloat(item[7]),
                trades: Number.parseInt(item[8]),
                taker_buy_base_volume: Number.parseFloat(item[9]),
                taker_buy_quote_volume: Number.parseFloat(item[10]),
                net_inflow: Number.parseFloat(
                    currency(item[10])
                        .subtract(item[7])
                        .subtract(item[10])
                        .toString(),
                ),
                timestamp: item[0],
            };
        });

        return result;
    } catch (error) {
        console.error(
            `获取 ${symbol} | ${interval} | ${limit} 数据失败: ${error}`,
        );
        return [];
    }
};
