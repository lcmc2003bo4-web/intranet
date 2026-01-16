
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus } from '@repo/database';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../communication/whatsapp.service';

@Injectable()
export class FinanceScheduler {
    private readonly logger = new Logger(FinanceScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsappService: WhatsappService
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handlePaymentReminders() {
        this.logger.log('Starting daily payment reminder check...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        // Find pending pension plans due today or in 3 days
        const pendingPensions = await this.prisma.pensionPlan.findMany({
            where: {
                status: PaymentStatus.PENDING,
                OR: [
                    // Due Today (Exact date match might need range, but simplified for now)
                    { dueDate: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
                    // Due in 3 days
                    { dueDate: { gte: threeDaysFromNow, lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000) } }
                ]
            },
            include: {
                student: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        this.logger.log(`Found ${pendingPensions.length} pensions to alert.`);

        for (const pension of pendingPensions) {
            if (!pension.student.parent?.phone) continue;

            const isDueToday = pension.dueDate.getTime() >= today.getTime() && pension.dueDate.getTime() < today.getTime() + 86400000;

            let message = '';
            if (isDueToday) {
                message = `URGENTE: La pensión del estudiante ${pension.student.gradeLevel} vence HOY.`;
            } else {
                message = `RECORDATORIO: La pensión vence el ${pension.dueDate.toISOString().split('T')[0]}.`;
            }

            // Send WhatsApp
            await this.whatsappService.sendMessage(pension.student.parent.phone, message);
        }
    }
}
