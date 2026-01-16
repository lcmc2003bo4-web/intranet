import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

@Controller('communication/news')
export class NewsController {
    @Get()
    async getFeed() {
        return await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post()
    async createPost(@Body() body: { title: string; content: string; authorId: string }) {
        return await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: body.authorId,
            },
        });
    }
}
