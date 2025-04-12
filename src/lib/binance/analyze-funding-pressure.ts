import currency from "currency.js";
import { mean } from "../math";
import type {
    FundingPressureResult,
    KlinesData,
    OrderbookSatus,
} from "./types";

export const analyzeFundingPressure = (
    klinesData: KlinesData[],
    orderbookStatus: OrderbookSatus,
): FundingPressureResult => {
    const sortedData = klinesData.sort((a, b) => a.timestamp - b.timestamp);

    const recentInflows = sortedData.map((item) => item.net_inflow).slice(-10);
    const recentVolumes = sortedData
        .map((item) => item.quote_volume)
        .slice(-10);

    const inflowRatios = recentInflows.map((inflow, index) => {
        const volume = recentVolumes[index];
        return volume > 0
            ? Number.parseFloat(
                  currency(inflow, { precision: 4 }).divide(volume).toString(),
              )
            : 0;
    });
    const avgInflowRatio = mean(inflowRatios);

    const volumeImbalance = orderbookStatus.volume_imbalance;
    const valueImbalance = orderbookStatus.value_imbalance;
    const nearVolumeImbalance = orderbookStatus.near_volume_imbalance;

    const pressureScore = Number.parseFloat(
        currency(avgInflowRatio, { precision: 4 })
            .multiply(0.4)
            .add(currency(volumeImbalance, { precision: 4 }).multiply(0.2))
            .add(currency(valueImbalance, { precision: 4 }).multiply(0.2))
            .add(currency(nearVolumeImbalance, { precision: 4 }).multiply(0.2))
            .toString(),
    );

    const metrics = {
        avg_inflow_ratio: avgInflowRatio,
        volume_imbalance: volumeImbalance,
        value_imbalance: valueImbalance,
        near_volume_imbalance: nearVolumeImbalance,
        pressure_score: pressureScore,
    };

    if (pressureScore > 0.1) {
        return {
            pressure: "buying",
            direction: "bullish",
            strength: Math.min(pressureScore * 5, 1),
            metrics,
        };
    }

    if (pressureScore < -0.1) {
        return {
            pressure: "selling",
            direction: "bearish",
            strength: Math.min(Math.abs(pressureScore) * 5, 1),
        };
    }

    return {
        pressure: "balanced",
        direction: "neutral",
        strength: Math.abs(pressureScore) * 5,
        metrics,
    };
};
