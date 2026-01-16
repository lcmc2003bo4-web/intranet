import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FinanceController } from './finance.controller';
import { FinanceScheduler } from './finance.scheduler';
import { CommunicationModule } from '../communication/communication.module';

@Module({
    imports: [ScheduleModule.forRoot(), CommunicationModule],
    controllers: [FinanceController],
    providers: [FinanceScheduler],
})
export class FinanceModule { }
