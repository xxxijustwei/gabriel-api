import currency from "currency.js";
import { SimpleLinearRegression } from "ml-regression-simple-linear";
import nj from "numjs";
import { sampleCorrelation } from "simple-statistics";
import type { KlinesData } from "./types";
import type { TrendAnalysisResult } from "./types";

export const analyzeFundingFlowTrend = (
    klinesData: KlinesData[],
): TrendAnalysisResult => {
    if (klinesData.length < 2) {
        return {
            trend: "unknown",
            confidence: 0,
            description: "数据不足, 无法进行分析",
        };
    }

    const sortedData = klinesData.sort((a, b) => a.timestamp - b.timestamp);

    const prices = sortedData.map((item) => item.close);
    const netInflows = sortedData.map((item) => item.net_inflow);
    const volumes = sortedData.map((item) => item.volume);

    const priceChanges = prices.slice(1).map((price, i) => price - prices[i]);
    const priceTrend =
        priceChanges.filter((change) => change > 0).length /
        priceChanges.length;
    const inflowChanges: number[] = netInflows
        .slice(1)
        .map((value, i) => value - netInflows[i]);
    const inflowTrend: number =
        inflowChanges.filter((change) => change > 0).length /
        inflowChanges.length;

    const correlation: number = sampleCorrelation(prices, netInflows);
    const inflowVolumeCorr: number = sampleCorrelation(netInflows, volumes);

    const priceVolatility =
        nj.mean(prices) !== 0 ? nj.std(priceChanges) / nj.mean(prices) : 0;

    const x = nj.arange(prices.length).tolist();
    const priceRegression = new SimpleLinearRegression(x, prices);
    const priceTrendStrength = Math.abs(priceRegression.coefficients[0]);
    const priceTrendDirection = priceRegression.slope > 0 ? "up" : "down";

    const inflowRegression = new SimpleLinearRegression(x, netInflows);
    const inflowTrendStrength = Math.abs(inflowRegression.coefficients[0]);
    const inflowTrendDirection =
        inflowRegression.slope > 0 ? "increasing" : "decreasing";

    const recentInflows = netInflows.slice(-10);
    const recentInflowTrend =
        recentInflows
            .slice(1)
            .filter((value, index) => value > recentInflows[index]).length /
        (recentInflows.length - 1);

    let stage = "unknown";
    let confidence = 0;
    let reasons = [];

    if (priceTrend > 0.7 && inflowTrend < 0.3 && correlation < -0.3) {
        stage = "top";
        confidence = Math.min(
            0.7 + priceTrend - inflowTrend - correlation,
            0.95,
        );
        reasons = [
            "价格持续上涨但资金流入减少",
            "价格与资金流向呈负相关",
            `价格趋势强度: ${currency(priceTrendStrength, { precision: 2 }).toString()}, 资金流向趋势强度: ${currency(inflowTrendStrength, { precision: 2 }).toString()}`,
        ];
    } else if (priceTrend < 0.3 && inflowTrend > 0.7 && correlation > 0.3) {
        stage = "bottom";
        confidence = Math.min(
            0.7 - priceTrend + inflowTrend - correlation,
            0.95,
        );
        reasons = [
            "价格持续下跌但资金流入增加",
            "价格与资金流向呈正相关",
            `价格趋势强度: ${currency(priceTrendStrength, { precision: 2 }).toString()}, 资金流向趋势强度: ${currency(inflowTrendStrength, { precision: 2 }).toString()}`,
        ];
    } else if (priceTrend > 0.6 && inflowTrend > 0.6 && correlation > 0.3) {
        stage = "rising";
        confidence = Math.min(priceTrend + inflowTrend + correlation - 1, 0.95);
        reasons = [
            "价格与资金流入同步增加",
            "价格与资金流入呈正相关",
            `价格趋势强度: ${currency(priceTrendStrength, { precision: 2 }).toString()}, 资金流向趋势强度: ${currency(inflowTrendStrength, { precision: 2 }).toString()}`,
        ];
    } else if (Math.abs(priceTrend - 0.5) < 0.15 && priceVolatility < 0.01) {
        stage = "consolidation";
        confidence = 0.5 + (0.15 - Math.abs(priceTrend - 0.5)) * 3;
        reasons = [
            "价格波动率低",
            "无明显趋势",
            `价格波动率: ${currency(priceVolatility, { precision: 4 }).toString()}`,
        ];
    } else {
        if (priceTrend > 0.5) {
            if (inflowTrend > 0.5) {
                stage = "rising";
                confidence = (priceTrend + inflowTrend) / 2;
                reasons = ["价格和资金流向均呈上升趋势"];
            } else {
                stage = "weakening_rise";
                confidence = priceTrend * (1 - inflowTrend);
                reasons = ["价格上升但资金流向减弱"];
            }
        } else {
            if (inflowTrend < 0.5) {
                stage = "falling";
                confidence = (1 - priceTrend + 1 - inflowTrend) / 2;
                reasons = ["价格和资金流向均呈下降趋势"];
            } else {
                stage = "weakening_fall";
                confidence = (1 - priceTrend) * inflowTrend;
                reasons = ["价格下降但资金流向增加"];
            }
        }
    }

    return {
        trend: stage as TrendAnalysisResult["trend"],
        confidence: Number.parseFloat(
            currency(confidence, { precision: 4 }).toString(),
        ),
        description: `价格可能处于${stage}阶段，置信度${currency(confidence, { precision: 2 }).toString()}`,
        reasons,
        metrics: {
            price_trend: priceTrend,
            price_trend_direction: priceTrendDirection,
            price_trend_strength: priceTrendStrength,
            price_trend_p_value: priceRegression.coefficients[1],
            inflow_trend: inflowTrend,
            inflow_trend_direction: inflowTrendDirection,
            inflow_trend_strength: inflowTrendStrength,
            inflow_trend_p_value: inflowRegression.coefficients[1],
            correlation,
            inflow_volume_correlation: inflowVolumeCorr,
            price_volatility: priceVolatility,
            recent_inflow_trend: recentInflowTrend,
        },
    };
};
