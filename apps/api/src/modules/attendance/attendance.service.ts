
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceStatus } from '@repo/database';

export interface CreateAttendanceDto {
    studentId: string;
    status: AttendanceStatus;
    date: Date;
}

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async markAttendance(data: CreateAttendanceDto[]) {
        const results = [];
        for (const record of data) {
            // Upsert attendance for the student on that specific date
            // Note: This logic assumes 'date' is normalized to midnight or specific enough to distinguish days
            // For MVP simplicity, we might delete existing for date+student and create new, or use findFirst

            // Simplified upsert logic:
            const startOfDay = new Date(record.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);

            const existing = await this.prisma.attendance.findFirst({
                where: {
                    studentId: record.studentId,
                    date: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });

            let result;
            if (existing) {
                result = await this.prisma.attendance.update({
                    where: { id: existing.id },
                    data: { status: record.status, checkInTime: new Date() }
                });
            } else {
                result = await this.prisma.attendance.create({
                    data: {
                        studentId: record.studentId,
                        date: new Date(), // Use current exact time or record.date
                        status: record.status,
                        checkInTime: new Date()
                    }
                });
            }
            results.push(result);
        }
        return results;
    }
}
