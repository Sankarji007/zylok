package com.zylo.chatservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private ChatWebSocketHandler chatWebSocketHandler;

    @Autowired
    private AuthHandshakeInterceptor authInterceptor;

    public WebSocketConfig(AuthHandshakeInterceptor authInterceptor,
                           ChatWebSocketHandler chatHandler) {
        this.authInterceptor = authInterceptor;
        this.chatWebSocketHandler = chatHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        System.out.println("Registering Chat WebSocket handlers...");
        
        // Primary chat endpoint with authentication
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .addInterceptors(authInterceptor)
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:8080", "*");
        
        System.out.println("Chat WebSocket handler registered at /ws/chat");
    }
}
