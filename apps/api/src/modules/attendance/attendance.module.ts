
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceScheduler } from './attendance.scheduler';
import { CommunicationModule } from '../communication/communication.module';

@Module({
    imports: [ScheduleModule.forRoot(), CommunicationModule],
    controllers: [AttendanceController],
    providers: [AttendanceService, AttendanceScheduler],
})
export class AttendanceModule { }
