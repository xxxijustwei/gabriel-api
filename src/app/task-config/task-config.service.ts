import { Injectable, Logger } from "@nestjs/common";
import { getTaskConfigStorage } from "../../db/provider";
import type { TaskConfigUpdateBoday } from "./types";

@Injectable()
export class TaskConfigService {
    private readonly logger = new Logger(TaskConfigService.name);
    private readonly db = getTaskConfigStorage();

    async getConfig() {
        return await this.db.find();
    }

    async updateConfig(config: TaskConfigUpdateBoday) {
        try {
            await this.db.update(config);
            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }
}
