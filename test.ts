import { analyzeFundingFlowTrend } from "src/lib/binance/analyze-funding-flow-trend";
import { analyzeFundingPressure } from "src/lib/binance/analyze-funding-pressure";
import { detectAnomalies } from "src/lib/binance/detect-anomalies";
import { getKlinesData } from "src/lib/binance/get-klines-data";
import { getOrderbookStatus } from "src/lib/binance/get-orderbook-status";

const main = async () => {
    const result = await getKlinesData({
        symbol: "1000CHEEMSUSDT",
        interval: "15m",
        limit: 50,
        isFutures: false,
    });
    const orderbookStatus = await getOrderbookStatus({
        symbol: "1000CHEEMSUSDT",
        isFutures: false,
    });
    if (!orderbookStatus) {
        console.error("获取 orderbook 失败");
        return;
    }

    const analysis = analyzeFundingFlowTrend(result);
    const anomalies = detectAnomalies(result);
    const fundingPressure = analyzeFundingPressure(result, orderbookStatus);

    console.log(analysis);
    console.log(anomalies);
    console.log(fundingPressure);
};

main();
