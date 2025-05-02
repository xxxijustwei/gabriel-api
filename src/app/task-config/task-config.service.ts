import { Injectable } from "@nestjs/common";
import { getTaskConfigStorage } from "../../db/provider";
import type { TaskConfigDto } from "./dto";

@Injectable()
export class TaskConfigService {
    private readonly db = getTaskConfigStorage();

    async getConfig() {
        return await this.db.find();
    }

    async updateConfig(config: TaskConfigDto) {
        const updated = await this.db.update(config);

        return updated;
    }
}
