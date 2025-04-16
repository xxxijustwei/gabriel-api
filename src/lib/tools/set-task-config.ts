import dayjs from "dayjs";
import z from "zod";
import { getTaskConfigStorage } from "../../db/provider";
import { Interval, type IntervalType } from "../binance/types";

const description =
    "设置定时分析任务的symbol/interval/limit参数, interval和limit参数为可选参数, 默认值为15m和48";

const parameters = z.object({
    symbol: z.string().optional().describe("The symbol of token"),
    interval: z
        .enum(Interval)
        .optional()
        .describe("The interval of the data (optional)"),
    klinesLimit: z
        .number()
        .optional()
        .describe("Limit on the number of K lines (optional)"),
});

const execute = async ({
    symbol,
    interval,
    klinesLimit,
}: z.infer<typeof parameters>) => {
    const storage = getTaskConfigStorage();
    const config = await storage.find();

    const updated = await storage.update({
        symbol: symbol ? symbol.toUpperCase() : config ? config.symbol : "BTC",
        interval: interval
            ? interval
            : config
              ? (config.interval as IntervalType)
              : "15m",
        limit: klinesLimit ? klinesLimit : config ? config.limit : 32,
    });

    const result = {
        symbol: updated.symbol,
        interval: updated.interval,
        limit: updated.limit,
        updatedAt: dayjs(updated.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };

    return `我已经更新了定时分析任务的配置数据
    
更新后的配置数据为:
${JSON.stringify(result, null, 2)}
回复格式要求: 中文,使用Markdown表格展示数据。
`;
};

export const setTaskConfig = {
    description,
    parameters,
    execute,
};
