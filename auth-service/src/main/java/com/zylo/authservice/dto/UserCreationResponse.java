package com.zylo.authservice.dto;

import com.zylo.authservice.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
@Getter
@Builder
public class UserCreationResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private UUID organizationId;
    private String organizationName;
    private String role;

    public static UserCreationResponse getUserResponse( User rootUser) {
        return UserCreationResponse.builder()
                .id(rootUser.getId())
                .email(rootUser.getEmail())
                .role(rootUser.getRole())
                .firstName(rootUser.getFirstName())
                .lastName(rootUser.getLastName())
                .username(rootUser.getUsername())
                .organizationId(rootUser.getTenant().getId())
                .organizationName(rootUser.getTenant().getName())
                .build();
    }
}
