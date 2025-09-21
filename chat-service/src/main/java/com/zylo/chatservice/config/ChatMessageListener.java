package com.zylo.chatservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zylo.chatservice.websocket.SessionManager;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

@Component
public class ChatMessageListener {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SessionManager sessionManager;

    @Autowired
    private String serverId;

    @RabbitListener(queues = "chat.queue")
    public void handleMessage(ChatWebSocketHandler.ChatMessageDTO message) throws IOException {
        System.out.println("Received message from " + message.getSenderId() + " to " + message.getReceiverId());
        
        if (sessionManager.isUserOnThisServer(message.getReceiverId())) {
            WebSocketSession session = sessionManager.getSession(message.getReceiverId());
            if (session != null && session.isOpen()) {
                // Send the message to the WebSocket client
                session.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(message)));
                System.out.println("Message delivered to user " + message.getReceiverId() + " on this server");
            } else {
                System.out.println("Session not found or closed for user " + message.getReceiverId());
            }
        } else {
            // User is on a different server, forward via Redis
            redisTemplate.convertAndSend("chat_channel", message);
            System.out.println("Message forwarded to Redis for user " + message.getReceiverId());
        }
    }
}
