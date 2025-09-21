package com.zylo.chatservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zylo.chatservice.websocket.SessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

@Component
public class RedisChatSubscriber implements MessageListener {
    
    @Autowired
    private SessionManager sessionManager;
    
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // Parse the chat message from Redis
            ChatWebSocketHandler.ChatMessageDTO chatMessage = 
                new ObjectMapper().readValue(message.getBody(), ChatWebSocketHandler.ChatMessageDTO.class);
            
            System.out.println("Received message from Redis for user: " + chatMessage.getReceiverId());
            
            // Check if the target user is on this server
            if (sessionManager.isUserOnThisServer(chatMessage.getReceiverId())) {
                WebSocketSession session = sessionManager.getSession(chatMessage.getReceiverId());
                if (session != null && session.isOpen()) {
                    // Forward the message to the WebSocket client
                    session.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(chatMessage)));
                    System.out.println("Message delivered from Redis to user " + chatMessage.getReceiverId());
                } else {
                    System.out.println("Session not found or closed for user from Redis: " + chatMessage.getReceiverId());
                }
            }
        } catch (IOException e) {
            System.err.println("Error processing Redis message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
