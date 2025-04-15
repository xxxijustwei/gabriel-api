import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { ReportService } from "./report.service";

@Controller("api/report")
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get("list")
    async getAllReport() {
        return this.reportService.getAllReport();
    }
}
