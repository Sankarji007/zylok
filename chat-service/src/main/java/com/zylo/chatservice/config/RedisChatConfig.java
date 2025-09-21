package com.zylo.chatservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisChatConfig {

    @Bean
    public ChannelTopic chatChannelTopic() {
        return new ChannelTopic("chat_channel");
    }

    @Bean
    public MessageListenerAdapter chatMessageListenerAdapter(RedisChatSubscriber redisChatSubscriber) {
        return new MessageListenerAdapter(redisChatSubscriber, "onMessage");
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter chatMessageListenerAdapter,
            ChannelTopic chatChannelTopic) {
        
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(chatMessageListenerAdapter, chatChannelTopic);
        return container;
    }
}
