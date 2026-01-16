
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() data: { senderId: string; receiverId: string; content: string }, @ConnectedSocket() client: Socket) {
        const now = new Date();
        const currentHour = now.getHours();

        // Force "Quiet Hours" rule: If > 18:00 (6 PM) or < 7:00 AM
        const isQuietHours = currentHour >= 18 || currentHour < 7;

        // Save to DB via Service
        const message = await this.chatService.saveMessage(data.senderId, data.receiverId, data.content);

        if (isQuietHours) {
            // Auto-reply to sender
            client.emit('autoReply', {
                content: 'El profesor está en horario de descanso. Responderá mañana a primera hora.',
                isSystem: true,
            });
            // DO NOT emit to receiver (Teacher)
            // In a real app we might emit a "silent" notification or just nothing
        } else {
            // Real-time emit to receiver
            this.server.emit('newMessage', message);
        }

        return message;
    }
}
