
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get('report-card/:studentId')
    async downloadReportCard(@Param('studentId') studentId: string, @Res() res: Response) {
        try {
            const pdfBuffer = await this.documentsService.generateReportCard(studentId);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=libreta_${studentId}.pdf`,
                'Content-Length': pdfBuffer.length,
            });

            res.end(pdfBuffer);
        } catch (error) {
            res.status(404).send(error.message);
        }
    }
}
