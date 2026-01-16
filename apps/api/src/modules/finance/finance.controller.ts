
import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentStatus } from '@repo/database';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('finance')
export class FinanceController {
    constructor(private readonly prisma: PrismaService) { }

    @Patch('payments/:id/upload-proof')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPaymentProof(
        @Param('id') paymentId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000000 }), // 5MB
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        // In a real app, upload 'file.buffer' to S3/Firebase Storage and get URL.
        // For this MVP, we simulate it.
        const mockUrl = `/uploads/${paymentId}_${Date.now()}_${file.originalname}`;

        // Update Payment
        const updatedPayment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: PaymentStatus.IN_REVIEW,
                receiptImageUrl: mockUrl,
                paymentDate: new Date(), // Set to upload time
            },
        });

        return {
            message: 'Payment proof uploaded successfully',
            payment: updatedPayment,
        };
    }

    @Get('pensions/:studentId')
    async getStudentPensions(@Param('studentId') studentId: string) {
        return await this.prisma.pensionPlan.findMany({
            where: { studentId },
            orderBy: { dueDate: 'asc' },
            include: {
                payments: true // Include payment history if needed
            }
        });
    }
}
