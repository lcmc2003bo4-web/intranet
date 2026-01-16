
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    async sendMessage(to: string, message: string): Promise<void> {
        // In a real implementation, this would call the WhatsApp Business API
        // For now, we just log the message to the console
        this.logger.log(`[WhatsApp Stub] Sending to ${to}: ${message}`);

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
