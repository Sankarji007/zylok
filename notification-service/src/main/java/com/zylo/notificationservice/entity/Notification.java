package com.zylo.notificationservice.entity;

import com.zylo.authservice.entity.Tenant;
import com.zylo.authservice.entity.User;
import com.zylo.chatservice.entity.Message;
import com.zylo.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
}
