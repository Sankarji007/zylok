package com.zylo.chatservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
@Getter
@Setter
public class ChannelMemberId implements Serializable {

    @Column(name = "channel_id")
    private UUID channelId;

    @Column(name = "user_id")
    private UUID userId;

    public ChannelMemberId() {}

    public ChannelMemberId(UUID channelId, UUID userId) {
        this.channelId = channelId;
        this.userId = userId;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChannelMemberId that = (ChannelMemberId) o;
        return Objects.equals(channelId, that.channelId) && 
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(channelId, userId);
    }
}