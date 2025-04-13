import currency from "currency.js";
import dayjs from "dayjs";
import { sampleCorrelation } from "simple-statistics";
import { analyzeFundingFlowTrend } from "./analyze-funding-flow-trend";
import { analyzeFundingPressure } from "./analyze-funding-pressure";
import { detectAnomalies } from "./detect-anomalies";
import { getKlinesData } from "./get-klines-data";
import { getOrderbookStatus } from "./get-orderbook-status";
import type { AnalysisRundingFlowResult, IntervalType } from "./types";

interface AnalyzeFundingFlowOptions {
    symbol: string;
    interval: IntervalType;
    limit: number;
}

export const analyzeFundingFlow = async ({
    symbol = "ETHUSDT",
    interval = "15m",
    limit = 48,
}: AnalyzeFundingFlowOptions): Promise<AnalysisRundingFlowResult | null> => {
    symbol = symbol.endsWith("USDT")
        ? symbol.toUpperCase()
        : `${symbol.toUpperCase()}USDT`;

    const spotKlinesData = await getKlinesData({
        symbol,
        interval,
        limit,
    });
    const futuresKlinesData = await getKlinesData({
        symbol,
        interval,
        limit,
        isFutures: true,
    });
    const spotOrderbook = await getOrderbookStatus({
        symbol,
    });
    const futuresOrderbook = await getOrderbookStatus({
        symbol,
        isFutures: true,
    });

    if (
        spotKlinesData.length === 0 ||
        futuresKlinesData.length === 0 ||
        !spotOrderbook ||
        !futuresOrderbook
    ) {
        return null;
    }

    const spotTrend = analyzeFundingFlowTrend(spotKlinesData);
    const futuresTrend = analyzeFundingFlowTrend(futuresKlinesData);
    const spotAnomalies = detectAnomalies(spotKlinesData);
    const futuresAnomalies = detectAnomalies(futuresKlinesData);
    const spotPressure = analyzeFundingPressure(spotKlinesData, spotOrderbook);
    const futuresPressure = analyzeFundingPressure(
        futuresKlinesData,
        futuresOrderbook,
    );

    const recentSpotInflows = spotKlinesData
        .slice(-10)
        .map((item) => item.net_inflow);
    const recentFuturesInflows = futuresKlinesData
        .slice(-10)
        .map((item) => item.net_inflow);
    const spotTotalInflows = Number.parseFloat(
        recentSpotInflows
            .reduce((acc, curr) => acc.add(curr), currency(0, { precision: 4 }))
            .toString(),
    );
    const futuresTotalInflows = Number.parseFloat(
        recentFuturesInflows
            .reduce((acc, curr) => acc.add(curr), currency(0, { precision: 4 }))
            .toString(),
    );
    const flowDifference = spotTotalInflows - futuresTotalInflows;

    const correlation =
        recentSpotInflows.length === recentFuturesInflows.length &&
        recentSpotInflows.length > 1
            ? sampleCorrelation(recentSpotInflows, recentFuturesInflows)
            : undefined;

    let leadLagAnalysos = undefined;
    if (spotKlinesData.length > 10) {
        const prices = spotKlinesData.map((item) => item.close);
        const inflows = spotKlinesData.map((item) => item.net_inflow);

        const correlations: [number, number][] = [];
        for (let lag = -5; lag <= 5; lag++) {
            let corr = 0;
            if (lag < 0) {
                corr = sampleCorrelation(
                    inflows.slice(0, lag),
                    prices.slice(-lag),
                );
            }

            if (lag > 0) {
                corr = sampleCorrelation(
                    inflows.slice(lag),
                    prices.slice(0, -lag),
                );
            }

            corr = sampleCorrelation(inflows, prices);
            correlations.push([lag, corr]);
        }

        const maxCorrLag = correlations.reduce(
            (max, current) =>
                Math.abs(current[1]) > Math.abs(max[1]) ? current : max,
            correlations[0],
        );

        leadLagAnalysos = {
            max_correlation: maxCorrLag[1],
            max_correlation_lag: maxCorrLag[0],
            relationship:
                maxCorrLag[0] < 0
                    ? "资金流向领先于价格"
                    : maxCorrLag[0] > 0
                      ? "价格领先于资金流向"
                      : "同步变化",
            all_correlations: correlations,
        };
    }

    return {
        symbol,
        interval,
        limit,
        spot_klines_summary: {
            count: spotKlinesData.length,
            time_range:
                spotKlinesData.length < 2
                    ? "数据不足"
                    : `${dayjs(spotKlinesData[0].open_time).format("YYYY-MM-DD HH:mm:ss")} - ${dayjs(spotKlinesData[spotKlinesData.length - 1].close_time).format("YYYY-MM-DD HH:mm:ss")}`,
            latest_price:
                spotKlinesData.length > 0
                    ? formatAmount(
                          spotKlinesData[spotKlinesData.length - 1].close,
                      )
                    : undefined,
            price_change_pct:
                spotKlinesData.length > 1
                    ? ((spotKlinesData[spotKlinesData.length - 1].close -
                          spotKlinesData[0].open) /
                          spotKlinesData[0].open) *
                      100
                    : undefined,
        },
        futures_klines_summary: {
            count: futuresKlinesData.length,
            time_range:
                futuresKlinesData.length < 2
                    ? "数据不足"
                    : `${dayjs(futuresKlinesData[0].open_time).format("YYYY-MM-DD HH:mm:ss")} - ${dayjs(futuresKlinesData[futuresKlinesData.length - 1].close_time).format("YYYY-MM-DD HH:mm:ss")}`,
            latest_price:
                futuresKlinesData.length > 0
                    ? formatAmount(
                          futuresKlinesData[futuresKlinesData.length - 1].close,
                      )
                    : undefined,
            price_change_pct:
                futuresKlinesData.length > 1
                    ? ((futuresKlinesData[futuresKlinesData.length - 1].close -
                          futuresKlinesData[0].open) /
                          futuresKlinesData[0].open) *
                      100
                    : undefined,
        },
        funding_flow_comparison: {
            spot_total_inflows: spotTotalInflows,
            futures_total_inflows: futuresTotalInflows,
            flow_difference: flowDifference,
            correlation: correlation,
            dominant_market:
                spotTotalInflows > futuresTotalInflows ? "spot" : "futures",
            flow_ratio:
                futuresTotalInflows !== 0
                    ? Math.abs(spotTotalInflows / futuresTotalInflows)
                    : Number.POSITIVE_INFINITY,
        },
        spot_trend_analysis: spotTrend,
        futures_trend_analysis: futuresTrend,
        spot_anomalies: spotAnomalies,
        futures_anomalies: futuresAnomalies,
        spot_pressure: spotPressure,
        futures_pressure: futuresPressure,
        spot_orderbook: spotOrderbook,
        futures_orderbook: futuresOrderbook,
        lead_lag_analysis: leadLagAnalysos,
    };
};

const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
        return `${currency(amount, { precision: 2 }).divide(1000000)}M`;
    }

    if (absAmount >= 1000) {
        return `${currency(amount, { precision: 2 }).divide(1000)}K`;
    }

    return `${currency(amount, { precision: 2 })}`;
};
