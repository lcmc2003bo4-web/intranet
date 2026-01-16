
import { Controller, Post, Body } from '@nestjs/common';
import { AttendanceService, CreateAttendanceDto } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('bulk')
    async markBulkAttendance(@Body() data: CreateAttendanceDto[]) {
        return this.attendanceService.markAttendance(data);
    }
}
