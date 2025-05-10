import { createZodDto } from "@anatine/zod-nestjs";
import z from "zod";
import { Interval } from "../../lib/binance/types";

const taskConfigSchema = z.object({
    symbol: z
        .string()
        .min(1, { message: "symbol is required" })
        .describe("The symbol of the token"),
    interval: z
        .enum(Interval, {
            message:
                "interval must be one of the following: 1m, 5m, 15m, 30m, 1h, 4h, 6h, 12h, 1d",
        })
        .describe("The interval of the token"),
    limit: z
        .number()
        .min(4, { message: "limit must be greater than 4" })
        .describe("The limit of k lines"),
});

export class TaskConfigDataResponse extends createZodDto(
    taskConfigSchema.extend({
        updatedAt: z.string().describe("The updated at of the task config"),
    }),
) {}

export class TaskConfigUpdateBoday extends createZodDto(taskConfigSchema) {}

export class TaskConfigUpdateResponse extends createZodDto(
    z.object({
        success: z.boolean().describe("The success of the task config update"),
    }),
) {}
