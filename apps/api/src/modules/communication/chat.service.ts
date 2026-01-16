
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async saveMessage(senderId: string, receiverId: string, content: string) {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });
    }
}
