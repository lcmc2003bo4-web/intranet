import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { FinanceModule } from './modules/finance/finance.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { PrismaModule } from './prisma/prisma.module';
import { AcademicModule } from './modules/academic/academic.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [PrismaModule, FinanceModule, CommunicationModule, AcademicModule, AttendanceModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
