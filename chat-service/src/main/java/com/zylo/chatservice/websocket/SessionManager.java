package com.zylo.chatservice.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionManager {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private String serverId;

    // Local in-memory storage for actual WebSocket sessions
    private final ConcurrentHashMap<String, WebSocketSession> localSessions = new ConcurrentHashMap<>();

    private static final String SESSION_PREFIX = "user_session:";

    // Store both locally and in Redis
    public void addSession(String userId, WebSocketSession session) {
        // Store session locally
        localSessions.put(userId, session);
        // Store server mapping in Redis
        redisTemplate.opsForValue().set(SESSION_PREFIX + userId, serverId);
    }

    // Get session from local storage
    public WebSocketSession getSession(String userId) {
        return localSessions.get(userId);
    }

    // Get server ID from Redis
    public String getSessionServerId(String userId) {
        Object serverIdObj = redisTemplate.opsForValue().get(SESSION_PREFIX + userId);
        return serverIdObj != null ? serverIdObj.toString() : null;
    }

    // Remove from both local and Redis
    public void removeSession(String userId) {
        localSessions.remove(userId);
        redisTemplate.delete(SESSION_PREFIX + userId);
    }

    // Check if user is on this server
    public boolean isUserOnThisServer(String userId) {
        String userServerId = getSessionServerId(userId);
        return serverId.equals(userServerId);
    }
}
