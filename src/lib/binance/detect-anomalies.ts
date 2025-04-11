import currency from "currency.js";
import nj from "numjs";
import type { AnomaliesResult, KlinesData } from "./types";

export const detectAnomalies = (
    klinesData: KlinesData[],
): AnomaliesResult[] => {
    if (klinesData.length < 5) return [];

    const sortedData = klinesData.sort((a, b) => a.timestamp - b.timestamp);

    const volumes = sortedData.map((item) => item.volume);
    const priceChanges = sortedData.map(
        (_, i) =>
            Math.abs(sortedData[i].close - sortedData[i].open) /
            sortedData[i].open,
    );

    const volMean = nj.mean(volumes);
    const volStd = nj.std(volumes);
    const priceChangeMean = nj.mean(priceChanges);
    const priceChangeStd = nj.std(priceChanges);

    const anomalies: AnomaliesResult[] = [];
    for (let i = 0; i < sortedData.length; i++) {
        const { symbol, net_inflow, quote_volume, open_time } = sortedData[i];

        if (
            quote_volume > volMean + 2 * volStd &&
            priceChanges[i] > priceChangeMean + 0.5 * priceChangeStd
        ) {
            anomalies.push({
                timestamp: open_time,
                type: "high_volume_low_price_change",
                symbol,
                volume: quote_volume,
                price_change: priceChanges[i],
                net_inflow,
            });
        }

        if (
            priceChanges[i] < priceChangeMean - 2 * priceChangeStd &&
            quote_volume < volMean + 0.5 * volStd
        ) {
            anomalies.push({
                timestamp: open_time,
                type: "high_price_change_low_volume",
                symbol,
                volume: quote_volume,
                price_change: priceChanges[i],
                net_inflow,
            });
        }

        if (net_inflow > 0 && net_inflow > 0.7 * quote_volume) {
            anomalies.push({
                timestamp: open_time,
                type: "extreme_net_inflow",
                symbol,
                volume: quote_volume,
                price_change: priceChanges[i],
                net_inflow,
                inflow_ratio:
                    quote_volume > 0
                        ? Number.parseFloat(
                              currency(net_inflow)
                                  .divide(quote_volume)
                                  .toString(),
                          )
                        : 0,
            });
        }

        if (net_inflow < 0 && Math.abs(net_inflow) > 0.7 * quote_volume) {
            anomalies.push({
                timestamp: open_time,
                type: "extreme_net_outflow",
                symbol,
                volume: quote_volume,
                price_change: priceChanges[i],
                net_inflow,
                outflow_ratio:
                    quote_volume > 0
                        ? Number.parseFloat(
                              currency(net_inflow)
                                  .divide(quote_volume)
                                  .toString(),
                          )
                        : 0,
            });
        }
    }

    return anomalies;
};
