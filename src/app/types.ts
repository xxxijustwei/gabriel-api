import { createZodDto } from "@anatine/zod-nestjs";
import type { UIMessage } from "ai";
import z from "zod";

export class ChatBody extends createZodDto(
    z.object({
        id: z.string(),
        messages: z.array(z.custom<UIMessage>()),
    }),
) {}

export class ChatStreamResponseDto extends createZodDto(
    z.object({
        data: z.string().describe("Chunk of streaming data from the assistant"),
        done: z
            .boolean()
            .describe("Indicates if this is the final chunk of the stream"),
    }),
) {}

export class TaskCronJobResponse extends createZodDto(
    z.object({
        ok: z.boolean().describe("Whether the task was executed successfully"),
    }),
) {}
