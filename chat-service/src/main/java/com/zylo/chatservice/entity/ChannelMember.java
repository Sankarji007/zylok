package com.zylo.chatservice.entity;

import com.zylo.authservice.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "channel_members")
@Getter
@Setter
public class ChannelMember {

    @EmbeddedId
    private ChannelMemberId id;

    @ManyToOne
    @MapsId("channelId")
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    private String role;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
