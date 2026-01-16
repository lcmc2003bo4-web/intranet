
import { Controller, Get } from '@nestjs/common';
import { AcademicService } from './academic.service';

@Controller('academic')
export class AcademicController {
    constructor(private readonly academicService: AcademicService) { }

    @Get('risk-report')
    async getRiskReport() {
        return this.academicService.getRiskReport();
    }
}
