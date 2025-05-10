import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

const categorySchema = z
    .enum(["task", "chat"], {
        message: "Invalid category",
    })
    .describe("The category of the analysis report");

const reportSchema = z.object({
    id: z.string().describe("The id of the analysis report"),
    symbol: z.string().describe("The symbol of the analysis report"),
    interval: z.string().describe("The interval of the analysis report"),
    limit: z.number().describe("The limit of the analysis report"),
    content: z.string().describe("The content of the analysis report"),
    createdAt: z.string().describe("The created at of the analysis report"),
});

export class AnalysisReportQuery extends createZodDto(
    z.object({
        id: z
            .string({
                message: "Invalid id",
            })
            .describe("The id of the analysis report"),
        category: categorySchema,
    }),
) {}

export class AnalysisReportListQuery extends createZodDto(
    z.object({
        category: categorySchema,
        page_no: z.coerce
            .number({
                required_error: "Invalid page number",
            })
            .int({
                message: "Page number must be an integer",
            })
            .min(0, {
                message: "Page number must be greater than or equal to 0",
            })
            .optional()
            .describe("The page number of the analysis report"),
        page_size: z.coerce
            .number({
                required_error: "Invalid page size",
            })
            .int({
                message: "Page size must be an integer",
            })
            .positive({
                message: "Page size must be positive",
            })
            .optional()
            .describe("The page size of the analysis report"),
    }),
) {}

export class AnalysisReportResponse extends createZodDto(
    z.union([reportSchema, z.null()]),
) {}

export class AnalysisReportListResponse extends createZodDto(
    z.object({
        list: z.array(reportSchema).describe("The list of analysis reports"),
        total: z.number().describe("The total number of analysis reports"),
    }),
) {}
