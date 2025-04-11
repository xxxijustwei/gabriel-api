const Interval = ["5m", "15m", "30m", "1h", "2h", "4h"] as const;
type IntervalType = (typeof Interval)[number];

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

export type {
    IntervalType,
    KlinesData,
    OrderbookSatus,
    TrendAnalysisResult,
    AnomaliesResult,
    FundingPressureResult,
};
export { Interval };
