import { Injectable } from "@nestjs/common";
import { getTaskResultStorage } from "../../db/provider";

@Injectable()
export class ReportService {
    private readonly db = getTaskResultStorage();

    async getAllReport() {
        const result = await this.db.findAll();

        return result.map(({ data, ...rest }) => rest);
    }
}
