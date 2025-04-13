import dayjs from "dayjs";
import { getTaskConfigStorage } from "src/db/provider";
import z from "zod";

const description = "获取当前定时分析任务的配置";

const parameters = z.object({});

const execute = async () => {
    const storage = getTaskConfigStorage();
    const config = await storage.find();
    if (!config) {
        return "当前没有任何任务配置";
    }

    const { symbol, interval, limit, updatedAt } = config;
    const result = {
        symbol: symbol.replace("USDT", "/USDT"),
        interval,
        limit,
        updatedAt: dayjs(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };
    return `我已经查询到了定时分析任务的配置数据，包括:
- 代币符号
- 分析周期
- K线数量
- 上次更新时间
    
### 配置的数据为: 
${JSON.stringify(result, null, 2)}
回复格式要求: 中文,使用Markdown表格展示数据。
`;
};

export const getTaskConfig = {
    description,
    parameters,
    execute,
};
