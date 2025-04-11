import type { UIMessage } from "ai";

interface ChatBody {
    id: string;
    messages: UIMessage[];
}

export type { ChatBody };
