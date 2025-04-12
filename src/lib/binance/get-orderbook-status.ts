import { MainClient, type SymbolPrice, USDMClient } from "binance";
import currency from "currency.js";
import "dotenv/config";
import type { OrderbookSatus } from "./types";

interface GetOrderbookStatusOptions {
    symbol: string;
    isFutures?: boolean;
    retry?: number;
}

const client = new MainClient({
    api_key: process.env.BINANCE_API_KEY ?? "",
    api_secret: process.env.BINANCE_API_SECRET ?? "",
});

const futuresClient = new USDMClient({
    api_key: process.env.BINANCE_API_KEY ?? "",
    api_secret: process.env.BINANCE_API_SECRET ?? "",
});

const getOrderbook = async (symbol: string, isFutures: boolean) => {
    const limit = isFutures ? 1000 : 5000;
    if (isFutures) {
        return {
            orderbook: await futuresClient.getOrderBook({
                symbol,
                limit,
            }),
            currentPrice: Number.parseFloat(
                (
                    (await futuresClient.getSymbolPriceTicker({
                        symbol,
                    })) as SymbolPrice
                ).price.toString(),
            ),
        };
    }

    return {
        orderbook: await client.getOrderBook({
            symbol,
            limit,
        }),
        currentPrice: Number.parseFloat(
            (
                (await client.getSymbolPriceTicker({ symbol })) as SymbolPrice
            ).price.toString(),
        ),
    };
};

export const getOrderbookStatus = async ({
    symbol,
    isFutures = false,
    retry = 3,
}: GetOrderbookStatusOptions): Promise<OrderbookSatus | null> => {
    for (let i = 0; i < retry; i++) {
        try {
            const { orderbook, currentPrice } = await getOrderbook(
                symbol,
                isFutures,
            );

            const bids = orderbook.bids.map(
                (bid) =>
                    [
                        Number.parseFloat(bid[0].toString()),
                        Number.parseFloat(bid[1].toString()),
                    ] as [number, number],
            );
            const asks = orderbook.asks.map(
                (ask) =>
                    [
                        Number.parseFloat(ask[0].toString()),
                        Number.parseFloat(ask[1].toString()),
                    ] as [number, number],
            );

            const bidsVol = Number.parseFloat(
                bids
                    .reduce(
                        (acc, [_, volume]) => acc.add(volume),
                        currency(0, { precision: 4 }),
                    )
                    .toString(),
            );
            const asksVol = Number.parseFloat(
                asks
                    .reduce(
                        (acc, [_, volume]) => acc.add(volume),
                        currency(0, { precision: 4 }),
                    )
                    .toString(),
            );
            const bidsVal = Number.parseFloat(
                bids
                    .reduce(
                        (acc, [price, volume]) =>
                            acc.add(
                                currency(price, { precision: 4 }).multiply(
                                    volume,
                                ),
                            ),
                        currency(0, { precision: 4 }),
                    )
                    .toString(),
            );
            const asksVal = Number.parseFloat(
                asks
                    .reduce(
                        (acc, [price, volume]) =>
                            acc.add(
                                currency(price, { precision: 4 }).multiply(
                                    volume,
                                ),
                            ),
                        currency(0, { precision: 4 }),
                    )
                    .toString(),
            );

            // 计算买卖盘不平衡度
            const volumeImbalance =
                bidsVol + asksVol > 0
                    ? (bidsVol - asksVol) / (bidsVol + asksVol)
                    : 0;

            const valueImbalance =
                bidsVal + asksVal > 0
                    ? (bidsVal - asksVal) / (bidsVal + asksVal)
                    : 0;

            // 计算关键价格区间内的买卖盘量
            const priceRangePct = 0.005; // 当前价格上下0.5%范围
            const lowerBound = currentPrice * (1 - priceRangePct);
            const upperBound = currentPrice * (1 + priceRangePct);

            const nearBidsVolume = bids
                .filter(([price]) => price >= lowerBound)
                .reduce((sum, [_, amount]) => sum + amount, 0);

            const nearAsksVolume = asks
                .filter(([price]) => price <= upperBound)
                .reduce((sum, [_, amount]) => sum + amount, 0);

            const nearVolumeImbalance =
                nearBidsVolume + nearAsksVolume > 0
                    ? (nearBidsVolume - nearAsksVolume) /
                      (nearBidsVolume + nearAsksVolume)
                    : 0;

            return {
                symbol,
                price: currentPrice,
                bids_count: bids.length,
                asks_count: asks.length,
                bids_volume: bidsVol,
                asks_volume: asksVol,
                bids_value: bidsVal,
                asks_value: asksVal,
                volume_imbalance: volumeImbalance,
                value_imbalance: valueImbalance,
                near_volume_imbalance: nearVolumeImbalance,
            };
        } catch (error) {
            console.error(
                `获取 ${symbol} orderbook 失败 (尝试 ${i + 1}/${retry}): ${error}`,
            );
            if (i === retry - 1) return null;
        }
    }
    return null;
};
