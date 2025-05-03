import { xai } from "@ai-sdk/xai";
import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import dayjs from "dayjs";
import { analyzeFundingFlow } from "../lib/binance/analyze-funding-flow";
import type {
    AnalysisRundingFlowResult,
    IntervalType,
} from "../lib/binance/types";
import { getFundingFlowAnalyzePrompt } from "../lib/prompt/funding-flow-analyze";
import { AnalysisReportService } from "./anlysis-report/report.service";
import { TaskConfigService } from "./task-config/task-config.service";

@Injectable()
export class AppService {
    constructor(
        private readonly taskConfigService: TaskConfigService,
        private readonly analysisReportService: AnalysisReportService,
    ) {}

    async executeTask() {
        const config = await this.taskConfigService.getConfig();

        if (!config) {
            return null;
        }

        const analysisResult = await analyzeFundingFlow({
            symbol: config.symbol,
            interval: config.interval as IntervalType,
            limit: config.limit,
        });

        if (!analysisResult) {
            return null;
        }

        const latest = await this.analysisReportService.getLatestTaskReport();
        const latestMessages = latest
            ? [
                  {
                      role: "user" as const,
                      content: getUserPrompt(
                          latest.symbol,
                          latest.interval as IntervalType,
                          latest.limit,
                          latest.data as AnalysisRundingFlowResult,
                      ),
                  },
                  {
                      role: "assistant" as const,
                      content: latest?.content ?? "",
                  },
              ]
            : [];

        const { text } = await generateText({
            model: xai("grok-3-fast"),
            system: "你是一个非常专业的加密货币交易员，擅长分析加密货币市场的数据。",
            messages: [
                ...latestMessages,
                {
                    role: "user",
                    content: getUserPrompt(
                        config.symbol,
                        config.interval as IntervalType,
                        config.limit,
                        analysisResult,
                    ),
                },
            ],
        });

        await this.analysisReportService.addNew({
            category: "task",
            symbol: config.symbol,
            interval: config.interval,
            limit: config.limit,
            data: analysisResult,
            content: text,
        });

        return true;
    }
}

const getUserPrompt = (
    symbol: string,
    interval: IntervalType,
    limit: number,
    result: AnalysisRundingFlowResult,
    pormat?: string,
) => {
    return getFundingFlowAnalyzePrompt({
        symbol,
        interval,
        limit,
        data: JSON.stringify(result, null, 2),
        datetime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
};
