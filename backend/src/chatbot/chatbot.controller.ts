import { Controller, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Chat with the AI assistant' })
  async chat(@Body('message') message: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.chatbotService.chat(message, userId);
  }

  @Post('stream')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Chat with the AI assistant (Streaming)' })
  async chatStream(@Body('message') message: string, @Request() req: any, @Res() res: any) {
    const userId = req.user?.userId;
    return this.chatbotService.chatStream(message, userId, res);
  }
}
