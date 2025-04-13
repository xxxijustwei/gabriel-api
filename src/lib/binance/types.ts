const Interval = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "4h",
    "6h",
    "12h",
    "1d",
] as const;
type IntervalType = (typeof Interval)[number];

interface FuturesData {
    symbol: string;
    markPrice: number | string;
    indexPrice: number | string;
    estimatedSettlePrice: number | string;
    lastFundingRate: number | string;
    interestRate: number | string;
    nextFundingTime: number;
    time: number;
}

interface KlinesData {
    symbol: string;
    open_time: string;
    close_time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quote_volume: number;
    trades: number;
    taker_buy_base_volume: number;
    taker_buy_quote_volume: number;
    net_inflow: number;
    timestamp: number;
}

interface OrderbookSatus {
    symbol: string;
    price: number;
    bids_count: number;
    asks_count: number;
    bids_volume: number;
    asks_volume: number;
    bids_value: number;
    asks_value: number;
    volume_imbalance: number;
    value_imbalance: number;
    near_volume_imbalance: number;
}

interface TrendAnalysisResult {
    trend:
        | "top"
        | "bottom"
        | "rising"
        | "falling"
        | "consolidation"
        | "weakening_rise"
        | "weakening_fall"
        | "unknown";
    confidence: number;
    description: string;
    reasons?: string[];
    metrics?: {
        price_trend: number;
        price_trend_direction: "up" | "down";
        price_trend_strength: number;
        price_trend_p_value: number;
        inflow_trend: number;
        inflow_trend_direction: "increasing" | "decreasing";
        inflow_trend_strength: number;
        inflow_trend_p_value: number;
        correlation: number;
        inflow_volume_correlation: number;
        price_volatility: number;
        recent_inflow_trend: number;
    };
}

interface AnomaliesResult {
    timestamp: string;
    type:
        | "high_volume_low_price_change"
        | "high_price_change_low_volume"
        | "extreme_net_inflow"
        | "extreme_net_outflow";
    symbol: string;
    volume: number;
    price_change: number;
    net_inflow: number;
    inflow_ratio?: number;
    outflow_ratio?: number;
}

interface FundingPressureResult {
    pressure: "buying" | "selling" | "balanced";
    direction: "bullish" | "bearish" | "neutral";
    strength: number;
    metrics?: {
        avg_inflow_ratio: number;
        volume_imbalance: number;
        value_imbalance: number;
        near_volume_imbalance: number;
        pressure_score: number;
    };
}

interface AnalysisRundingFlowResult {
    symbol: string;
    limit: number;
    interval: IntervalType;
    spot_klines_summary: {
        count: number;
        time_range: string;
        latest_price?: string;
        price_change_pct?: number;
    };
    futures_klines_summary: {
        count: number;
        time_range: string;
        latest_price?: string;
        price_change_pct?: number;
    };
    funding_flow_comparison: {
        spot_total_inflows: number;
        futures_total_inflows: number;
        flow_difference: number;
        correlation?: number;
        dominant_market: "spot" | "futures";
        flow_ratio: number;
    };
    spot_trend_analysis: TrendAnalysisResult;
    futures_trend_analysis: TrendAnalysisResult;
    spot_anomalies: AnomaliesResult[];
    futures_anomalies: AnomaliesResult[];
    spot_pressure: FundingPressureResult;
    futures_pressure: FundingPressureResult;
    spot_orderbook: OrderbookSatus;
    futures_orderbook: OrderbookSatus;
    lead_lag_analysis?: {
        max_correlation: number;
        max_correlation_lag: number;
        relationship: string;
        all_correlations: [number, number][];
    };
}

export type {
    IntervalType,
    FuturesData,
    KlinesData,
    OrderbookSatus,
    TrendAnalysisResult,
    AnomaliesResult,
    FundingPressureResult,
    AnalysisRundingFlowResult,
};
export { Interval };
