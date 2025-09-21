package com.zylo.chatservice.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zylo.chatservice.websocket.SessionManager;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final RabbitTemplate rabbitTemplate;
    private final SessionManager sessionManager;

    public ChatWebSocketHandler(RabbitTemplate rabbitTemplate, SessionManager sessionManager) {
        this.rabbitTemplate = rabbitTemplate;
        this.sessionManager = sessionManager;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        System.out.println("User connected: " + userId);
        
        // Register session in SessionManager
        if (userId != null) {
            sessionManager.addSession(userId, session);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        System.out.println("User disconnected: " + userId);
        
        // Remove session from SessionManager
        if (userId != null) {
            sessionManager.removeSession(userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws JsonProcessingException {
        String userId = (String) session.getAttributes().get("userId");
        
        try {
            // Parse the simple message format from frontend
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> messageData = mapper.readValue(message.getPayload(), Map.class);
            
            // Create a simplified message object for RabbitMQ
            ChatMessageDTO chatMessage = new ChatMessageDTO();
            chatMessage.setContent((String) messageData.get("content"));
            chatMessage.setSenderId((String) messageData.get("senderId"));
            chatMessage.setSenderName((String) messageData.get("senderName"));
            chatMessage.setReceiverId((String) messageData.get("targetUserId"));
            chatMessage.setTimestamp((String) messageData.get("timestamp"));
            chatMessage.setType((String) messageData.getOrDefault("type", "text"));
            
            // Send to RabbitMQ for processing
            rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, RabbitMQConfig.CHAT_ROUTING_KEY, chatMessage);
            
        } catch (Exception e) {
            System.err.println("Error processing message from user " + userId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Simple DTO for chat messages
    public static class ChatMessageDTO {
        private String content;
        private String senderId;
        private String senderName;
        private String receiverId;
        private String timestamp;
        private String type;
        
        // Getters and setters
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }
        
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        
        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
