
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../communication/whatsapp.service';
import { AttendanceStatus } from '@repo/database';

@Injectable()
export class AttendanceScheduler {
    private readonly logger = new Logger(AttendanceScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsappService: WhatsappService
    ) { }

    // Run at 8:15 AM every day
    @Cron('0 15 8 * * *')
    async handleAbsentAlerts() {
        this.logger.log('Running Security Check: Absent Students...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all students
        const students = await this.prisma.student.findMany({
            include: {
                user: true, // student name
                parent: true // parent phone
            }
        });

        for (const student of students) {
            // Check if they have an attendance record for today
            const attendance = await this.prisma.attendance.findFirst({
                where: {
                    studentId: student.id,
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            });

            // Trigger Alert if:
            // 1. No record found (implied absent if check-in process is strict) OR
            // 2. Explicitly marked ABSENT
            const isAbsent = !attendance || attendance.status === AttendanceStatus.ABSENT;

            if (isAbsent && student.parent?.phone) {
                const message = `ALERTA DE SEGURIDAD: Su hijo(a) ${student.user.name} no ha registrado ingreso al aula (8:15 AM). Por favor contacte al colegio.`;

                this.logger.warn(`[SECURITY ALERT] Student ${student.user.name} is ABSENT. Notifying parent.`);
                await this.whatsappService.sendMessage(student.parent.phone, message);
            }
        }
    }
}
