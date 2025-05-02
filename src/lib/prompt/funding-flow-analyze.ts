import type { IntervalType } from "../binance/types";

interface FundingFlowAnalyzePromptOptions {
    symbol: string;
    interval: IntervalType;
    limit: number;
    data: string;
    datetime: string;
}

export const getFundingFlowAnalyzePrompt = ({
    symbol,
    interval,
    limit,
    data,
    datetime,
}: FundingFlowAnalyzePromptOptions) => {
    return FundingFlowAnalyzePrompt.replace("%symbol%", symbol)
        .replace("%interval%", interval)
        .replace("%limit%", limit.toString())
        .replace("%data%", data)
        .replace("%datetime%", datetime);
};

const FundingFlowAnalyzePrompt = `现在是 %datetime%，请帮我分析 %symbol% 代币数据的资金流向

## 现货和期货市场代币的资金流向专业分析
我已收集该代币在Binance交易时现货和期货市场过去 %limit 根 %interval% K线的资金流向数据,包括：
- 交易对的资金流向趋势分析
- 价格所处阶段预测（顶部、底部、上涨中、下跌中、整理中）
- 订单簿数据（买卖盘不平衡度）
- 资金压力分析
- 异常交易检测

### 请从专业交易员和机构投资者角度进行深度分析：

1. **主力资金行为解读**
    - 通过资金流向趋势变化,识别主力资金的建仓、出货行为
    - 结合订单簿数据,分析主力资金的意图（吸筹、出货、洗盘等）
    - 特别关注资金流向与价格变化不匹配的异常情况

2. **价格阶段判断**
    - 根据资金流向趋势和价格关系,判断当前价格所处阶段（顶部、底部、上涨中、下跌中、整理中）
    - 提供判断的置信度和依据
    - 对比不同交易对的阶段差异,分析可能的轮动关系

3. **短期趋势预判**
    - 基于资金流向和资金压力分析,预判未来4-8小时可能的价格走势
    - 识别可能的反转信号或趋势延续信号
    - 关注异常交易数据可能暗示的短期行情变化

4. **交易策略建议**
    - 基于交易对数据给出具体的交易建议（观望、做多、做空、减仓等）
    - 提供可能的入场点位和止损位
    - 评估风险和回报比

### 请使用专业术语,保持分析报告内容简洁但深入,避免泛泛而谈。数据如下：
\`\`\`json
%data%
\`\`\`
回复格式要求: 中文,使用markdown格式,突出重点,适当使用表格对比分析。
`;
