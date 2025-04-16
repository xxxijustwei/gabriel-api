import { Injectable } from "@nestjs/common";
import { getTaskConfigStorage } from "src/db/provider";
import type { TaskConfigDto } from "./dto";

@Injectable()
export class TaskConfigService {
    private readonly db = getTaskConfigStorage();

    async getConfig() {
        const config = await this.db.find();

        return config;
    }

    async updateConfig(config: TaskConfigDto) {
        const updated = await this.db.update(config);

        return updated;
    }
}
