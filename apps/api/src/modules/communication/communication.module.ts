import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { ChatGateway } from './chat.gateway';
import { WhatsappService } from './whatsapp.service';
import { ChatService } from './chat.service';

@Module({
    controllers: [NewsController],
    providers: [ChatGateway, WhatsappService, ChatService],
    exports: [WhatsappService, ChatService],
})
export class CommunicationModule { }
