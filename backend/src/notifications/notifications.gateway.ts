import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://smartshop.local:3000'],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Khách hàng có thể tham gia vào phòng (room) theo userId để nhận thông báo cá nhân
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client ${client.id} joined room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Phát thông báo cho tất cả Admin
  notifyAdmins(event: string, payload: any) {
    this.server.emit(`admin_${event}`, payload);
  }

  // Phát thông báo cho 1 người dùng cụ thể
  notifyUser(userId: number, event: string, payload: any) {
    this.server.to(`user_${userId}`).emit(event, payload);
  }
}
