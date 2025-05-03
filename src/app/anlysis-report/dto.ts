import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

export class AnalysisReportQueryDto extends createZodDto(
    z.object({
        id: z.string(),
        category: z.enum(["task", "chat"]),
    }),
) {}
