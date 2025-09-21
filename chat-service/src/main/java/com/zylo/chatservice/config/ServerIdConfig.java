package com.zylo.chatservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.InetAddress;
import java.util.UUID;

@Configuration
public class ServerIdConfig {

    @Value("${server.port:8081}")
    private int serverPort;

    @Bean
    public String serverId() {
        try {
            // Generate server ID using hostname + port + random suffix
            String hostname = InetAddress.getLocalHost().getHostName();
            String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
            return String.format("%s-%d-%s", hostname, serverPort, randomSuffix);
        } catch (Exception e) {
            // Fallback to UUID if hostname detection fails
            return "server-" + UUID.randomUUID().toString().substring(0, 8);
        }
    }
}
